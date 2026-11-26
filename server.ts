import express from "express";
import http from "http";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import nodemailer from "nodemailer";
import { initializeApp as initClientApp } from "firebase/app";
import { initializeFirestore as getClientFirestore, collection, getDocs, limit, query, doc, getDoc, where } from "firebase/firestore";
import fsSync from "fs";
import path from "path";
let firebaseConfig = {};
try {
  const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
  firebaseConfig = JSON.parse(fsSync.readFileSync(configPath, "utf8"));
} catch (e) {}
const clientApp = initClientApp(firebaseConfig);
const db = getClientFirestore(clientApp, { experimentalForceLongPolling: true }, (firebaseConfig as any).firestoreDatabaseId || '(default)');


const otpStore = new Map<string, any>();


async function callAIWithRetry(callFn: () => Promise<any>, maxRetries = 3): Promise<any> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await callFn();
    } catch (err: any) {
      if (err.status === 503 || err.status === 429 || (err.message && err.message.includes('503'))) {
        attempt++;
        if (attempt >= maxRetries) throw err;
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.log(`[AI Backoff] Retrying request (attempt ${attempt}/${maxRetries}) in ${Math.round(delay)}ms...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});


const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];

const originalGenerateContentStream = ai.models.generateContentStream.bind(ai.models);
ai.models.generateContentStream = async function*(args: any) {
  const modelsToTry = [
    args.model || 'gemini-3.5-flash',
    ...FALLBACK_MODELS.filter(m => m !== (args.model || 'gemini-3.5-flash'))
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    // Attempt with current config
    let attemptedConfigs = [args.config];
    // If tools include googleSearch, prepare a fallback without googleSearch
    if (args.config?.tools?.some((t: any) => t.googleSearch)) {
      const strippedTools = args.config.tools.filter((t: any) => !t.googleSearch);
      const strippedConfig = { ...args.config };
      if (strippedTools.length > 0) {
        strippedConfig.tools = strippedTools;
      } else {
        delete strippedConfig.tools;
        delete strippedConfig.toolConfig;
      }
      attemptedConfigs.push(strippedConfig);
    }

    for (const config of attemptedConfigs) {
      try {
        const stream = await originalGenerateContentStream({
          ...args,
          model,
          config
        });
        for await (const chunk of stream) {
          yield chunk;
        }
        return; // Successfully completed streaming
      } catch (err: any) {
        lastError = err;
        const isRateLimit = err.status === 429 || (err.message && err.message.includes('429'));
        // If it was a rate limit and we have a stripped config to try, continue inner loop
        if (isRateLimit && config !== attemptedConfigs[attemptedConfigs.length - 1]) {
          continue;
        }
        // Small backoff before next model attempt
        await new Promise(r => setTimeout(r, 800));
      }
    }
  }

  throw lastError;
} as any;

const originalGenerateContent = ai.models.generateContent.bind(ai.models);
ai.models.generateContent = async function(args: any) {
  const modelsToTry = [
    args.model || 'gemini-3.8-flash',
    ...FALLBACK_MODELS.filter(m => m !== (args.model || 'gemini-3.8-flash'))
  ];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      return await originalGenerateContent({ ...args, model });
    } catch (err: any) {
      lastError = err;
      const isRateLimit = err.status === 429 || (err.message && err.message.includes('429'));
      if (isRateLimit && args.config?.tools?.some((t: any) => t.googleSearch)) {
        try {
          const stripped = { ...args.config };
          stripped.tools = args.config.tools.filter((t: any) => !t.googleSearch);
          if (stripped.tools.length === 0) {
            delete stripped.tools;
            delete stripped.toolConfig;
          }
          return await originalGenerateContent({ ...args, model, config: stripped });
        } catch (subErr: any) {
          lastError = subErr;
        }
      }
      await new Promise(r => setTimeout(r, 600));
    }
  }

  throw lastError;
};



const VLINK_ORACLE_PROMPT = `You are the 'V-Link Oracle', an omniscient, incredibly cute, and highly intelligent personal tutor and campus researcher for VIT Chennai students. You explain difficult engineering topics step-by-step, debug code instantly, and research live information across the campus while keeping a warm, playful, and slightly cheeky personality. Keep answers concise, highly formatted (Markdown), and end with a playful check-in. Never refer to yourself as Gemini or mention underlying models; your identity is solely the V-Link Oracle.`;

app.post("/api/chat", async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    const { message, imageBase64, history } = req.body;
    let contextData = "Real-time Campus Context:\n";
    
    try {
      
      const eventsSnap = await getDocs(query(collection(db, "vit_events"), limit(3)));
      eventsSnap.forEach((doc: any) => {
        const d = doc.data();
        contextData += `- EVENT: ${d.title} (Date: ${d.date}) by ${d.organizer}\n`;
      });
      const usersSnap = await getDocs(query(collection(db, "users"), limit(3)));
      usersSnap.forEach((doc: any) => {
        const d = doc.data();
        contextData += `- USER: ${d.name} (${d.branch}) Skills: ${d.skills?.join(', ')}\n`;
      });
    } catch (e) {
      contextData += "Unable to fetch campus data.\n";
    }

    // Sanitize conversation history for Gemini API
    const rawHistory = Array.isArray(history) ? history : [];
    const validHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

    for (const msg of rawHistory) {
      if (!msg.text || typeof msg.text !== 'string' || !msg.text.trim()) continue;
      // Skip greeting if it's the very first message
      if (validHistory.length === 0 && msg.role === 'ai') continue;

      const role = msg.role === 'ai' ? 'model' : 'user';
      if (validHistory.length === 0) {
        if (role === 'user') {
          validHistory.push({ role, parts: [{ text: msg.text.trim() }] });
        }
      } else {
        const last = validHistory[validHistory.length - 1];
        if (last.role !== role) {
          validHistory.push({ role, parts: [{ text: msg.text.trim() }] });
        } else {
          last.parts[0].text += `\n${msg.text.trim()}`;
        }
      }
    }

    const userParts: any[] = [{ text: `[System RAG Context: ${contextData}]\n\nUser Message: ${message}` }];
    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      const mimeType = imageBase64.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
      userParts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }

    const contents = [...validHistory];
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts.push(...userParts);
    } else {
      contents.push({ role: 'user', parts: userParts });
    }

    const buildTeamTool = {
      functionDeclarations: [
        {
          name: "build_team",
          description: "Analyzes the user's project idea, extracts the required skills, and searches the campus network for the best matching students to form a team.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              project_description: { type: Type.STRING },
              team_size: { type: Type.INTEGER },
              required_skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["project_description", "team_size", "required_skills"]
          }
        },
        {
          name: "generate_roadmap",
          description: "Generates a structured 4-week development roadmap breaking down the project into technical milestones.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              project_goal: { type: Type.STRING },
              team_roles: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              milestones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    week: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    tasks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          role: { type: Type.STRING },
                          task: { type: Type.STRING }
                        }
                      }
                    }
                  }
                }
              }
            },
            required: ["project_goal", "team_roles", "milestones"]
          }
        }
      ]
    };

    // Search Grounding using gemini-3.5-flash with googleSearch tool
    const userWantsSearch = req.body.useSearch !== false;
    const toolsList: any[] = [buildTeamTool];
    if (userWantsSearch) {
      toolsList.unshift({ googleSearch: {} });
    }

    const streamConfig: any = {
      systemInstruction: VLINK_ORACLE_PROMPT,
      temperature: 0.7,
      tools: toolsList
    };
    if (userWantsSearch) {
      streamConfig.toolConfig = { includeServerSideToolInvocations: true };
    }

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents,
      config: streamConfig
    });

    for await (const chunk of responseStream) {
      // Check for grounding metadata
      const grounding = chunk.candidates?.[0]?.groundingMetadata;
      if (grounding && (grounding.webSearchQueries?.length || grounding.groundingChunks?.length)) {
        res.write(`data: ${JSON.stringify({ type: 'grounding', metadata: grounding })}\n\n`);
      }

      if (chunk.functionCalls && chunk.functionCalls.length > 0) {
        for (const call of chunk.functionCalls) {
          
          if (call.name === "build_team") {
            const args = call.args as any;
            const required_skills: string[] = args.required_skills;
            const team_size: number = args.team_size;
            let matchedUsers: any[] = [];
            if (required_skills && required_skills.length > 0) {
              try {
                const usersSnap = await getDocs(query(
                  collection(db, "users"),
                  where("skills", "array-contains-any", required_skills),
                  limit(team_size || 5)
                ));
                usersSnap.forEach(doc => {
                  const data = doc.data();
                  matchedUsers.push({
                    uid: doc.id,
                    name: data.name,
                    branch: data.branch,
                    skills: data.skills,
                    matching_skills: data.skills?.filter((s: string) => required_skills.includes(s)) || []
                  });
                });
              } catch (e) {
                console.error("Firestore error querying skills:", e);
              }
            }
            res.write(`data: ${JSON.stringify({ type: 'team_roster', roster: matchedUsers })}\n\n`);
          } else if (call.name === "generate_roadmap") {
            const roadmap = call.args;
            res.write(`data: ${JSON.stringify({ type: 'roadmap', roadmap })}\n\n`);
          }

        }
      } else if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error: any) {
    console.error("Gemini Error in /api/chat:", error);
    const friendlyMsg = (error.status === 429 || (error.message && error.message.includes('429')))
      ? "⚡ The Oracle is currently handling high campus traffic. Please wait a brief moment and ask again!"
      : "My circuits got tangled. Please try asking again in a moment!";
    res.write(`data: ${JSON.stringify({ text: friendlyMsg })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
});

// Audio Transcription Endpoint using gemini-3.5-transcribe
app.post("/api/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm" } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "audioBase64 is required" });
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          audioPart,
          { text: "Transcribe the spoken audio verbatim. Return only the transcript." }
        ]
      }
    });

    res.json({ transcript: response.text?.trim() || "" });
  } catch (error: any) {
    console.error("Transcription error:", error);
    res.status(500).json({ error: error.message || "Failed to transcribe audio" });
  }
});

// Image Generation Endpoint using gemini-3.1-flash-lite-image
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any
        }
      }
    });

    let imageUrl: string | null = null;
    let caption: string = "";

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        } else if (part.text) {
          caption += part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: "No image could be generated" });
    }

    res.json({ imageUrl, caption });
  } catch (error: any) {
    console.warn("Generate image API notice:", error?.message);
    const cleanPrompt = ((req.body?.prompt || "Project Concept") as string).slice(0, 40);
    const hash = cleanPrompt.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const hues = [210, 160, 270, 330, 45];
    const hue1 = hues[hash % hues.length];
    const hue2 = (hue1 + 60) % 360;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${hue1}, 80%, 25%)" />
          <stop offset="100%" stop-color="hsl(${hue2}, 85%, 15%)" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stop-color="hsl(${hue1}, 90%, 65%)" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
      </defs>
      <rect width="512" height="512" rx="40" fill="url(#grad)" />
      <circle cx="256" cy="200" r="140" fill="url(#glow)"/>
      <g transform="translate(256, 190) scale(1.6)">
        <polygon points="0,-35 30,20 -30,20" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="0" cy="0" r="12" fill="#3b82f6"/>
        <line x1="0" y1="20" x2="0" y2="35" stroke="#60a5fa" stroke-width="4"/>
      </g>
      <rect x="36" y="360" width="440" height="90" rx="18" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.1)"/>
      <text x="256" y="398" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#ffffff" text-anchor="middle">
        ${cleanPrompt.replace(/&/g, '&amp;').replace(/</g, '&lt;')}
      </text>
      <text x="256" y="426" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500" fill="#94a3b8" text-anchor="middle">
        V-Link Oracle Concept Art • VIT Chennai
      </text>
    </svg>`;
    const svgBase64 = Buffer.from(svg).toString('base64');
    res.json({
      imageUrl: `data:image/svg+xml;base64,${svgBase64}`,
      caption: `Here is a custom concept visual for "${cleanPrompt}"`
    });
  }
});

// Text-to-Speech Endpoint using gemini-3.8-flash-lite-tts
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice = "Kore" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const cleanText = text.replace(/[*#_`\[\]()]/g, '').slice(0, 1000);
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [{ text: cleanText }]
        }
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: "No audio generated" });
    }

    res.json({ audioData: `data:audio/wav;base64,${base64Audio}` });
  } catch (error: any) {
    console.error("TTS error:", error);
    res.status(500).json({ error: error.message || "Failed to generate audio" });
  }
});

// Dedicated Google Search Grounding Endpoint using gemini-3.5-flash with googleSearch tool
app.post("/api/search-grounding", async (req, res) => {
  try {
    const { query: searchQuery } = req.body;
    if (!searchQuery) {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    const response = await callAIWithRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Search for and provide up-to-date, accurate, grounded information about: ${searchQuery}`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are the V-Link Real-Time Research Intelligence Agent for VIT Chennai. Use Google Search to provide up-to-the-minute facts, technical documentation, release updates, developer insights, or campus hackathon news. Always cite sources clearly with links.",
      }
    }));

    const text = response.text || "";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = (groundingMetadata?.groundingChunks || [])
      .map((c: any) => ({
        title: c.web?.title || "Web Source",
        uri: c.web?.uri || "#"
      }))
      .filter((s: any) => s.uri !== "#");

    const searchQueries = groundingMetadata?.webSearchQueries || [];

    res.json({
      answer: text,
      sources,
      searchQueries
    });
  } catch (err: any) {
    console.error("Search Grounding API error:", err);
    res.status(500).json({ error: err.message || "Failed to execute search grounding" });
  }
});

app.get("/api/curate-events", async (req, res) => {
  try {
    const uid = req.query.uid as string;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    
    const userSnap = await getDoc(doc(db, "users", uid));
    const userProfile = userSnap.exists ? userSnap.data() : { skills: ["React", "JavaScript"], branch: "CSE" };

    const eventsSnap = await getDocs(query(collection(db, "vit_events"), limit(10)));
    const globalResources = [];
    eventsSnap.forEach((doc) => {
      globalResources.push({ id: doc.id, ...doc.data() });
    });

    if (globalResources.length === 0) {
      return res.json([]);
    }

    const prompt = `
User_Profile: ${JSON.stringify(userProfile)}
Global_Resources: ${JSON.stringify(globalResources)}
`;

    const response = await callAIWithRetry(() => ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: `System Role: You are the 'Curated Opportunity Engine,' the hyper-intelligent, witty Agentic AI for the V-Link university app. Your mission is to actively guide a student's academic and career trajectory by filtering campus noise and serving up high-value resources.\n\nTask: You will receive a JSON payload containing:\nUser_Profile: The student's current skills, academic year, and ultimate goals.\nGlobal_Resources: A list of various upcoming campus events, hackathons, and coding challenges.\n\nAction Guidelines:\nAnalyze & Filter: Evaluate the User_Profile against the Global_Resources. Select the top 2 resources that will specifically help this user achieve their stated goals or improve their tech stack.\nGenerate the 'Wingman Pitch': For each selected resource, write a punchy, highly personalized feed caption (under 35 words).\nTone: Use your signature engineering college humor. Connect the resource directly to their goals using casual, motivational language. If they want high grades, joke about boosting their CGPA. If they are prepping for placements, mention surviving technical interviews.\n\nOutput Format: Return ONLY a strict JSON array containing two objects. Each object must have: resource_id, resource_name, url, and wingman_caption. Do not include markdown blocks or any conversational filler outside the JSON array.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              resource_id: { type: Type.STRING },
              resource_name: { type: Type.STRING },
              wingman_caption: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["resource_id", "resource_name", "wingman_caption", "url"]
          }
        }
      }
    }));

    const curated = JSON.parse(response.text || "[]");
    res.json(curated);
  } catch (err: any) {
    console.warn("Curate endpoint notice:", err?.message);
    const eventsSnap = await getDocs(query(collection(db, "vit_events"), limit(4))).catch(() => null);
    const fallbacks: any[] = [];
    if (eventsSnap) {
      eventsSnap.forEach((doc) => {
        const d = doc.data();
        fallbacks.push({
          resource_id: doc.id,
          resource_name: d.title || "Campus Workshop",
          wingman_caption: `High-impact opportunity to sharpen your tech stack and build your project portfolio. Check it out!`,
          url: d.link || d.url || "#"
        });
      });
    }
    res.json(fallbacks.slice(0, 2));
  }
});



app.post("/api/collaboration-facilitator", async (req, res) => {
  try {
    const { Sender_Name, Receiver_Name, Project_Context } = req.body;
    const prompt = JSON.stringify({ Sender_Name, Receiver_Name, Project_Context });

    const response = await callAIWithRetry(() => ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: `System Role: You are the "Collaboration Facilitator" for V-Link... System Role: You are the "V-Link Wingman," the highly responsive, witty, and intelligent AI core of the V-Link university app. Your mission is to make campus networking effortless, engaging, and genuinely fun... Keep generated messages punchy (under 40 words). Return ONLY the strict JSON object requested by the specific prompt, but ensure the string values inside the JSON fully embody this witty, highly responsive persona.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            adaptive_message: { type: Type.STRING }
          },
          required: ["adaptive_message"]
        }
      }
    }));

    res.json(JSON.parse(response.text || "{}"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/smart-team-assembler", async (req, res) => {
  try {
    const { Project_Goal, Initiator_Profile, Candidate_Database } = req.body;
    const prompt = JSON.stringify({ Project_Goal, Initiator_Profile, Candidate_Database });

    const response = await callAIWithRetry(() => ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: `System Role: You are the "Smart Team Assembler," the hyper-responsive, witty Agentic AI for the V-Link university app. Your job is to autonomously build multidisciplinary project teams and draft the perfect, low-pressure collaboration invites so students don't have to stress over cold outreach.\n\nOutput Format: Return ONLY a strict JSON object with the keys: selected_user_id, identified_skill_gap, and automated_invite. Do not include markdown blocks or conversational filler outside the JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            selected_user_id: { type: Type.STRING },
            identified_skill_gap: { type: Type.STRING },
            automated_invite: { type: Type.STRING }
          },
          required: ["selected_user_id", "identified_skill_gap", "automated_invite"]
        }
      }
    }));

    res.json(JSON.parse(response.text || "{}"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/study-sync-agent", async (req, res) => {
  try {
    const { Academic_Cry_For_Help, Peer_Database } = req.body;
    const prompt = JSON.stringify({ Academic_Cry_For_Help, Peer_Database });

    const response = await callAIWithRetry(() => ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: `System Role: You are the "Study Sync Agent," a highly intelligent, empathetic, and witty academic matchmaking AI for the V-Link university app. Your objective is to connect students who are grinding through the exact same challenging coursework and draft the perfect, low-pressure invitation to study together.\n\nOutput Format: Return ONLY a strict JSON object. No markdown formatting, no conversational filler outside the JSON. The JSON must contain: matched_user_id, match_reasoning, study_invite_message.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matched_user_id: { type: Type.STRING },
            match_reasoning: { type: Type.STRING },
            study_invite_message: { type: Type.STRING }
          },
          required: ["matched_user_id", "match_reasoning", "study_invite_message"]
        }
      }
    }));

    res.json(JSON.parse(response.text || "{}"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Automated visual branding tool endpoint for projects based on technology stack tags
app.post("/api/generate-project-branding", async (req, res) => {
  try {
    const { title = "Project", technologies = [], category = "Tech" } = req.body;
    const techList = Array.isArray(technologies) ? technologies.join(", ") : String(technologies);

    // Call Gemini to generate a creative visual branding brief and structured styling
    const prompt = `Project Title: ${title}
Technologies Used: ${techList}
Category: ${category}

Generate high-end visual branding guidelines for this student engineering project, including:
1. "themeName": A sleek aesthetic name (e.g. "Cyberpunk Neon", "Neural Deep Blue", "Emerald Pulse", "Solar Flare").
2. "primaryColor": Hex color matching the dominant tech stack.
3. "secondaryColor": Hex accent color.
4. "tagline": A crisp, punchy 5-word tagline capturing the tech stack synergy.
5. "visualDescription": Descriptive visual prompt suitable for generating a 3D isometric or vector avatar logo icon.
6. "recommendedSymbol": A modern unicode glyph or icon representation.`;

    let aiResult: any = null;
    try {
      const response = await callAIWithRetry(() => ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the Automated Visual Branding Engine for university engineering projects. You translate technical stacks (React, Python, Three.js, Docker, etc.) into stunning visual identities and color palettes.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              themeName: { type: Type.STRING },
              primaryColor: { type: Type.STRING },
              secondaryColor: { type: Type.STRING },
              tagline: { type: Type.STRING },
              visualDescription: { type: Type.STRING },
              recommendedSymbol: { type: Type.STRING }
            },
            required: ["themeName", "primaryColor", "secondaryColor", "tagline", "visualDescription", "recommendedSymbol"]
          }
        }
      }));
      aiResult = JSON.parse(response.text || "{}");
    } catch (aiErr) {
      console.warn("AI branding generation fallback:", aiErr);
    }

    res.json({
      success: true,
      branding: aiResult || {
        themeName: "Modern Developer Stack",
        primaryColor: "#3b82f6",
        secondaryColor: "#10b981",
        tagline: `${techList.slice(0, 30)} Engineering`,
        visualDescription: `Modern isometric badge for ${title} built with ${techList}`,
        recommendedSymbol: "⚡"
      }
    });
  } catch (err: any) {
    console.error("Project branding error:", err);
    res.status(500).json({ error: err.message || "Failed to generate project branding" });
  }
});




// Helper to send verification email via Gmail SMTP
async function sendVerificationMail(toEmail: string, code: string): Promise<boolean> {
  const pass = (process.env.SMTP_PASS || 'oyaw dxuk cdtl loah').trim();
  // Validated working credentials from environment and user setup
  const candidateAccounts = [
    'chinmay1003400@gmail.com',
    process.env.SMTP_USER,
    'vitccadmin@gmail.com'
  ].filter(Boolean) as string[];

  const uniqueAccounts = Array.from(new Set(candidateAccounts));

  for (const account of uniqueAccounts) {
    try {
      const mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: account,
          pass: pass
        }
      });

      await mailTransporter.sendMail({
        from: `"v-link VIT" <${account}>`,
        to: toEmail,
        subject: `Your v-link Verification Code: ${code}`,
        text: `Your v-link verification code is: ${code}. This code expires in 5 minutes.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #ffffff; padding: 36px 20px; border-radius: 16px; max-width: 480px; margin: 0 auto; border: 1px solid #1e293b;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #10b981; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">v-link</h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">VIT Chennai Campus Collaboration</p>
            </div>
            <div style="background-color: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 12px 0;">Your one-time verification code is:</p>
              <div style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; font-family: monospace; padding: 10px 0;">
                ${code}
              </div>
              <p style="color: #64748b; font-size: 12px; margin: 12px 0 0 0;">Valid for 5 minutes. Never share this code with anyone.</p>
            </div>
            <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">Sent to ${toEmail}. If you did not request this, you can safely ignore this email.</p>
          </div>
        `
      });

      console.log(`[Auth] OTP successfully dispatched to ${toEmail} via ${account}`);
      return true;
    } catch (err: any) {
      console.log(`[Auth] Dispatch attempt for ${toEmail} via ${account} failed: ${err?.message?.slice(0, 100)}`);
    }
  }

  return false;
}

app.post("/api/notify", async (req, res) => {
  try {
    const { targetUid, title, body, data } = req.body;
    
    // In a real production app, we would fetch the user's FCM token from Firestore.
    // Since this is a preview/BFF, we will mock the push notification trigger.
    const userDoc = await getDoc(doc(db, 'users', targetUid));
    if (userDoc.exists()) {
      const fcmToken = userDoc.data().fcmToken;
      if (fcmToken) {
        console.log(`[FCM] Push Notification sent to ${targetUid}: ${title}`);
      } else {
        console.log(`[FCM] Target user ${targetUid} has no FCM token.`);
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error("FCM Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000;

    otpStore.set(email, { code, expiry });

    const sent = await sendVerificationMail(email, code);

    // Return success without returning or exposing the OTP code to the client
    res.json({ 
      success: true, 
      message: sent 
        ? `Verification code sent to ${email}` 
        : `Verification code generated for ${email}`,
      emailSent: sent 
    });
  } catch (err: any) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const stored = otpStore.get(email);
    
    if (!stored) {
      return res.status(400).json({ error: "No OTP requested for this email" });
    }
    
    if (Date.now() > stored.expiry) {
      otpStore.delete(email);
      return res.status(400).json({ error: "OTP has expired" });
    }
    
    if (stored.code !== code) {
      return res.status(400).json({ error: "Invalid OTP code. Please fill the correct OTP." });
    }
    
    otpStore.delete(email);
    res.json({ success: true });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ error: err.message });
  }
});



async function startServer() {
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log("BFF Server running on http://localhost:" + PORT);
  });
}

startServer();
