import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  Volume2, 
  VolumeX, 
  Camera, 
  Mic, 
  Square, 
  Image as ImageIcon, 
  Globe, 
  ExternalLink,
  Download,
  Trash2,
  RefreshCw,
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

import TeamRosterCard from './TeamRosterCard';
import RoadmapCard from './RoadmapCard';
import SaveTeamButton from './SaveTeamButton';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  image?: string;
  generatedImage?: string;
  roster?: any[];
  roadmap?: any;
  groundingSources?: { title?: string; uri?: string }[];
}

export default function AiOracle() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Chat History
  const [chat, setChat] = useState<ChatMessage[]>([
    { 
      role: 'ai', 
      text: "👋 Hi! I'm the **V-Link Oracle**, your personal AI tutor, campus researcher, and hackathon co-pilot for VIT Chennai.\n\nAsk me to **review your code**, **find hackathon teammates**, **generate project roadmaps**, **create project logos**, or **search live campus info**! 🚀" 
    }
  ]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Modalities & Features
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePromptMode, setImagePromptMode] = useState(false);
  const [isSearchGroundingActive, setIsSearchGroundingActive] = useState(true);

  // Audio Recording & Transcription
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Mascot eye tracking refs
  const containerRef = useRef<HTMLButtonElement>(null);
  const leftPupilRef = useRef<HTMLDivElement>(null);
  const rightPupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isTyping, isTranscribing, isGeneratingImage]);

  useEffect(() => {
    let animationFrameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !leftPupilRef.current || !rightPupilRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const angle = Math.atan2(dy, dx);
      
      const maxDistance = 4;
      const distance = Math.min(maxDistance, Math.hypot(dx, dy) / 10);
      
      const pupX = Math.cos(angle) * distance;
      const pupY = Math.sin(angle) * distance;

      leftPupilRef.current.style.transform = `translate(${pupX}px, ${pupY}px)`;
      rightPupilRef.current.style.transform = `translate(${pupX}px, ${pupY}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Stop audio on unmount or when voice is turned off
  useEffect(() => {
    if (!isVoiceEnabled) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    }
  }, [isVoiceEnabled]);

  // Voice playback using /api/tts (gemini-3.8-flash-lite-tts) with fallback
  const playVoiceResponse = async (textToSpeak: string) => {
    if (!isVoiceEnabled || !textToSpeak) return;

    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setIsPlayingAudio(true);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak, voice: 'Kore' })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioData) {
          const audio = new Audio(data.audioData);
          currentAudioRef.current = audio;
          audio.onended = () => setIsPlayingAudio(false);
          audio.onerror = () => setIsPlayingAudio(false);
          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn("Server TTS failed, falling back to browser speech synthesis:", err);
    }

    // Fallback: Web Speech API
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const cleanText = textToSpeak.replace(/[*#_`\[\]()]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
    }
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsTyping(false);
    setIsPlayingAudio(false);
  };

  // Image Generation Feature using gemini-3.1-flash-lite-image
  const handleGenerateImage = async (customPrompt?: string) => {
    const promptToUse = customPrompt || message.trim();
    if (!promptToUse) return;

    setMessage('');
    setImagePromptMode(false);
    setIsGeneratingImage(true);

    // Append user message
    setChat(prev => [...prev, { role: 'user', text: `🎨 Generate Image: ${promptToUse}` }]);
    // Placeholder AI message
    setChat(prev => [...prev, { role: 'ai', text: 'Generating visual concept...' }]);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToUse, aspectRatio: '1:1' })
      });

      const data = await res.json();
      if (!res.ok || !data.imageUrl) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setChat(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        last.text = data.caption || `Here is your generated image for: "${promptToUse}"`;
        last.generatedImage = data.imageUrl;
        return next;
      });

      if (isVoiceEnabled) {
        playVoiceResponse(`I've generated your image for ${promptToUse}`);
      }
    } catch (err: any) {
      setChat(prev => {
        const next = [...prev];
        next[next.length - 1].text = `Sorry, I couldn't generate the image: ${err.message || 'unknown error'}`;
        return next;
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Send Multi-turn Chat Message
  const handleSend = async (forcedText?: string) => {
    const textToSend = forcedText !== undefined ? forcedText : message.trim();
    if (!textToSend && !selectedImage) return;

    // Check if user specifically requested image generation
    if (imagePromptMode || textToSend.toLowerCase().startsWith('/image ')) {
      const cleanPrompt = textToSend.replace(/^\/image\s*/i, '');
      handleGenerateImage(cleanPrompt);
      return;
    }

    const userMsg: ChatMessage = { 
      role: 'user', 
      text: textToSend, 
      image: selectedImage || undefined 
    };

    setChat(prev => [...prev, userMsg]);
    const currentImage = selectedImage;
    
    setMessage('');
    setSelectedImage(null);
    setIsTyping(true);

    // Append empty AI message container for streaming
    setChat(prev => [...prev, { role: 'ai', text: '' }]);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg.text,
          imageBase64: currentImage,
          history: chat,
          useSearch: isSearchGroundingActive
        }),
        signal: controller.signal
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let aiResponseText = '';
      let groundingSources: any[] = [];

      if (reader) {
        setIsTyping(false);
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  aiResponseText += parsed.text;
                  setChat(prev => {
                    const newChat = [...prev];
                    newChat[newChat.length - 1].text = aiResponseText;
                    return newChat;
                  });
                } else if (parsed.type === 'grounding') {
                  const chunks = parsed.metadata?.groundingChunks || [];
                  const extracted = chunks.map((c: any) => ({
                    title: c.web?.title || 'Web Source',
                    uri: c.web?.uri || '#'
                  })).filter((s: any) => s.uri !== '#');
                  if (extracted.length > 0) {
                    groundingSources = extracted;
                    setChat(prev => {
                      const newChat = [...prev];
                      newChat[newChat.length - 1].groundingSources = groundingSources;
                      return newChat;
                    });
                  }
                } else if (parsed.type === 'roadmap') {
                  setChat(prev => {
                    const newChat = [...prev];
                    newChat[newChat.length - 1].roadmap = parsed.roadmap;
                    return newChat;
                  });
                } else if (parsed.type === 'team_roster') {
                  setChat(prev => {
                    const newChat = [...prev];
                    newChat[newChat.length - 1].roster = parsed.roster;
                    return newChat;
                  });
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                // Ignore chunk parse errors
              }
            }
          }
        }
      }
      
      // Trigger voice playback if enabled
      if (isVoiceEnabled && aiResponseText) {
        playVoiceResponse(aiResponseText);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setChat(prev => {
          const newChat = [...prev];
          newChat[newChat.length - 1].text = 'Whoops! My circuits got tangled. Could you please try asking again?';
          return newChat;
        });
      }
    } finally {
      setIsTyping(false);
      setAbortController(null);
    }
  };

  // Image Upload for Multimodal inspection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setSelectedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Audio Recording with MediaRecorder & Transcription via gemini-3.5-transcribe
  const startRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop audio tracks
        stream.getTracks().forEach(track => track.stop());
        clearInterval(recordingTimerRef.current);
        setRecordingDuration(0);
        setIsRecording(false);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size === 0) return;

        setIsTranscribing(true);

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                audioBase64: base64Audio,
                mimeType: 'audio/webm'
              })
            });

            const data = await res.json();
            if (res.ok && data.transcript) {
              setMessage(prev => prev ? `${prev} ${data.transcript}` : data.transcript);
            }
          } catch (err) {
            console.error("Transcription failed:", err);
          } finally {
            setIsTranscribing(false);
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn("MediaRecorder permission error, falling back to speech recognition:", err);
      // Fallback: Web Speech API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setMessage(prev => prev ? prev + ' ' + transcript : transcript);
        };
        recognition.start();
      } else {
        alert("Microphone access could not be initialized.");
      }
    }
  };

  const stopRecordingAudio = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const clearChatHistory = () => {
    setChat([
      { 
        role: 'ai', 
        text: "Conversation cleared! What would you like to explore next? 🚀" 
      }
    ]);
  };

  const toggleMascot = () => {
    if (containerRef.current) {
      containerRef.current.style.transform = 'scaleY(0.1)';
      setTimeout(() => {
        if (containerRef.current) containerRef.current.style.transform = 'scaleY(1)';
        setIsOpen(!isOpen);
      }, 150);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      {/* Floating Action Button / Interactive Mascot */}
      <motion.button
        ref={containerRef}
        onClick={toggleMascot}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-[90px] right-4 z-50 w-16 h-16 bg-[#1E293B]/85 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_0_25px_rgba(10,102,194,0.4)] flex items-center justify-center transition-transform cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Chat with V-Link Oracle"
      >
        <div className="relative w-full h-full rounded-full flex flex-col items-center justify-center overflow-hidden">
          {/* Eyes with 120fps tracking */}
          <div className="flex gap-1.5 mb-1 z-10 relative mt-1">
            <div className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden">
              <div ref={leftPupilRef} className="w-1.5 h-1.5 bg-[#0084FF] rounded-full" />
            </div>
            <div className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden">
              <div ref={rightPupilRef} className="w-1.5 h-1.5 bg-[#0084FF] rounded-full" />
            </div>
          </div>
          {/* Smile */}
          <div className="w-4 h-1.5 border-b-2 border-white/80 rounded-full z-10" />
          
          {/* Sparkles on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute top-1 right-1 text-brand-blue"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Chat Interface Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-[160px] right-4 w-[92vw] sm:w-[480px] max-h-[85dvh] h-[82dvh] bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.6)]"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-blue-600/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
                    <span>V-Link Oracle</span>
                  </h3>
                  <p className="text-[10px] text-gray-400">Campus intelligence, hackathons & code</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Search Grounding toggle */}
                <button 
                  onClick={() => setIsSearchGroundingActive(!isSearchGroundingActive)}
                  title={isSearchGroundingActive ? "Google Search Grounding active via gemini-3.5-flash (tap to disable)" : "Enable Google Search Grounding"}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all border",
                    isSearchGroundingActive 
                      ? "text-blue-300 bg-blue-600/20 border-blue-500/40 shadow-sm" 
                      : "text-gray-400 hover:text-white hover:bg-white/10 border-white/10"
                  )}
                >
                  <Globe className={cn("w-3.5 h-3.5", isSearchGroundingActive && "text-blue-400 animate-pulse")} />
                  <span className="hidden sm:inline">Search Grounding</span>
                  {isSearchGroundingActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </button>

                {/* Voice toggle */}
                <button 
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  title={isVoiceEnabled ? "Voice response enabled (tap to mute)" : "Enable voice responses"}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    isVoiceEnabled 
                      ? "text-emerald-400 bg-emerald-500/20 border border-emerald-500/30" 
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Clear chat */}
                <button 
                  onClick={clearChatHistory}
                  title="Clear chat history"
                  className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Close */}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-3 py-2 bg-white/[0.02] border-b border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <button 
                onClick={() => handleSend("What are the newest features and breaking changes in React 19?")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Globe className="w-3 h-3 text-blue-400" /> React 19 Docs
              </button>
              <button 
                onClick={() => handleSend("Search for upcoming tech symposiums and hackathons in Chennai")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Globe className="w-3 h-3 text-emerald-400" /> Search Hackathons
              </button>
              <button 
                onClick={() => handleSend("Find hackathon teammates for DevJams 2026 with React and Python skills")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 whitespace-nowrap transition-colors"
              >
                👥 Find Team for DevJams
              </button>
              <button 
                onClick={() => handleSend("Generate a 4-week project roadmap for building an AI campus app")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 whitespace-nowrap transition-colors"
              >
                🗺️ 4-Week Roadmap
              </button>
              <button 
                onClick={() => {
                  setImagePromptMode(true);
                  setMessage("Modern minimalist hackathon team logo with glowing circuits and code symbols");
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Wand2 className="w-3 h-3" /> Create Logo
              </button>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {chat.map((msg, i) => (
                <div key={i} className={cn("flex max-w-[88%]", msg.role === 'user' ? "ml-auto justify-end" : "mr-auto justify-start")}>
                  <div className={cn(
                    "p-3.5 rounded-2xl text-sm leading-relaxed", 
                    msg.role === 'user' 
                      ? "bg-blue-600/20 text-white border border-blue-500/30 rounded-br-sm break-words min-w-0" 
                      : "bg-zinc-900/90 text-gray-200 border border-white/10 rounded-bl-sm break-words min-w-0 shadow-sm"
                  )}>
                    {/* User-attached image */}
                    {msg.image && (
                      <div className="mb-2.5 rounded-xl overflow-hidden border border-white/10">
                        <img src={msg.image} alt="User Context" className="w-full max-h-48 object-cover" />
                      </div>
                    )}

                    {/* AI-generated image */}
                    {msg.generatedImage && (
                      <div className="my-2 rounded-2xl overflow-hidden border border-blue-500/30 relative group shadow-lg">
                        <img src={msg.generatedImage} alt="Generated visual concept" className="w-full h-auto object-cover" />
                        <a 
                          href={msg.generatedImage} 
                          download="oracle-generated-image.png"
                          className="absolute bottom-2 right-2 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-medium flex items-center gap-1 backdrop-blur-sm border border-white/20 transition-all opacity-90 group-hover:opacity-100"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </div>
                    )}

                    {/* Content text */}
                    {msg.role === 'ai' ? (
                      <div className="prose prose-invert prose-sm max-w-none min-w-0 break-words space-y-2">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>

                        {/* Search Grounding Sources */}
                        {msg.groundingSources && msg.groundingSources.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-white/10">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                              <Globe className="w-3 h-3 text-blue-400" /> Grounded via Google Search
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.groundingSources.slice(0, 3).map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-blue-300 hover:text-blue-200 border border-white/10 inline-flex items-center gap-1 transition-colors"
                                >
                                  <span className="truncate max-w-[160px]">{source.title || 'Source'}</span>
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Roadmap Card */}
                        {msg.roadmap && (
                          <div className="mt-3">
                            <RoadmapCard roadmap={msg.roadmap} />
                          </div>
                        )}

                        {/* Team Roster Card */}
                        {msg.roster && msg.roster.length > 0 && (
                          <div className="mt-4 flex overflow-x-auto gap-3 no-scrollbar pb-2 snap-x">
                            {msg.roster.map((rUser: any, idx: number) => (
                              <div key={idx} className="shrink-0 w-[260px] snap-start">
                                <TeamRosterCard user={rUser} />
                              </div>
                            ))}
                            <div className="shrink-0 w-[200px] flex items-stretch snap-start">
                              <SaveTeamButton roster={msg.roster} projectContext={msg.text} />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span>{msg.text}</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing / Processing Indicator */}
              {(isTyping || isGeneratingImage || isTranscribing) && (
                <div className="flex max-w-[85%] mr-auto justify-start">
                  <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/10 rounded-bl-sm flex items-center gap-2 text-xs text-gray-300">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    <span>
                      {isTranscribing 
                        ? "Transcribing your audio..." 
                        : isGeneratingImage 
                        ? "Generating visual concept..." 
                        : "Oracle is thinking..."}
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input & Modality Controls Area */}
            <div className="p-3 border-t border-white/10 bg-zinc-950 shrink-0 relative">
              {/* Selected Image Preview Thumbnail */}
              <AnimatePresence>
                {selectedImage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 left-4 w-16 h-16 rounded-xl overflow-hidden border border-white/20 shadow-lg"
                  >
                    <img src={selectedImage} alt="Upload" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setSelectedImage(null)} 
                      className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 hover:bg-black/90 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Live Audio Recording Overlay Banner */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2 p-2 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-xs text-red-300 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span>Recording voice ({recordingDuration}s)... speak your question</span>
                    </div>
                    <button
                      onClick={stopRecordingAudio}
                      className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                    >
                      Done
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Image Prompt Mode Indicator */}
              {imagePromptMode && (
                <div className="mb-2 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Image Generation Mode: Describe what to create</span>
                  </span>
                  <button onClick={() => setImagePromptMode(false)} className="text-gray-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
                
                {/* Upload Image for Vision */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach screenshot or photo for visual inspection"
                  className="p-2 text-gray-400 hover:text-blue-400 transition-colors rounded-xl hover:bg-white/5 shrink-0"
                >
                  <Camera className="w-5 h-5" />
                </button>

                {/* Image Generation Toggle */}
                <button
                  onClick={() => setImagePromptMode(!imagePromptMode)}
                  title="Generate an image / concept visual"
                  className={cn(
                    "p-2 rounded-xl transition-colors shrink-0",
                    imagePromptMode 
                      ? "text-blue-400 bg-blue-500/20 border border-blue-500/30" 
                      : "text-gray-400 hover:text-blue-300 hover:bg-white/5"
                  )}
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                
                {/* Microphone / Speech to text */}
                <button 
                  onClick={isRecording ? stopRecordingAudio : startRecordingAudio}
                  title={isRecording ? "Stop recording" : "Transcribe speech"}
                  className={cn(
                    "p-2 transition-colors rounded-xl shrink-0", 
                    isRecording 
                      ? "text-red-400 bg-red-400/20 animate-pulse border border-red-500/30" 
                      : "text-gray-400 hover:text-emerald-400 hover:bg-white/5"
                  )}
                >
                  <Mic className="w-5 h-5" />
                </button>
                
                {/* Text Input */}
                <input 
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={
                    imagePromptMode 
                      ? "Describe image to generate (e.g. hackathon team logo)..." 
                      : "Ask Oracle about code, teammates, or campus..."
                  }
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors min-w-0"
                />
                
                {abortController ? (
                  <button 
                    onClick={handleStop}
                    title="Stop generating"
                    className="p-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-2xl transition-colors shrink-0"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button 
                    onClick={() => handleSend()}
                    disabled={!message.trim() && !selectedImage}
                    title="Send message"
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-colors disabled:opacity-40 shrink-0 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
