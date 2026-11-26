import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Sparkles, 
  Send, 
  MessageSquare, 
  Heart, 
  Share2, 
  Code2, 
  Rocket, 
  Users, 
  Check, 
  Copy, 
  Plus, 
  X, 
  Search, 
  Filter, 
  ExternalLink, 
  Github, 
  Eye, 
  Edit3, 
  Bold, 
  Italic, 
  List, 
  Quote, 
  Bookmark, 
  TrendingUp, 
  Terminal, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CornerDownRight, 
  Tag, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  increment, 
  arrayUnion, 
  arrayRemove, 
  limit 
} from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';

export type FeedPostType = 'update' | 'milestone' | 'collaboration';

export interface FeedComment {
  id: string;
  authorName: string;
  authorBranch?: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface CampusFeedPost {
  id: string;
  type: FeedPostType;
  title?: string;
  content: string;
  authorName: string;
  authorBranch: string;
  authorRole?: string;
  authorAvatar?: string;
  authorEmail?: string;
  createdAt: any;
  likes: number;
  likedBy: string[];
  commentsCount: number;
  comments?: FeedComment[];
  // Milestone specific
  milestoneStage?: string;
  projectName?: string;
  repoUrl?: string;
  techStack?: string[];
  // Collaboration specific
  rolesNeeded?: string[];
  urgency?: string;
  tags?: string[];
  isPinned?: boolean;
}

// Initial rich curated posts for VIT Chennai campus feed
const INITIAL_CAMPUS_FEED_POSTS: CampusFeedPost[] = [
  {
    id: 'seed-milestone-1',
    type: 'milestone',
    title: 'Campus Copilot v1.4 Deployed with Offline Timetables & Campus Wayfinder!',
    projectName: 'campus-copilot-vit',
    milestoneStage: '🎉 v1.4 Feature Release',
    repoUrl: 'https://github.com/vit-devs/campus-copilot',
    techStack: ['React Native', 'TypeScript', 'FastAPI', 'SQLite', 'Docker'],
    authorName: 'Vikram Singh',
    authorBranch: '3rd Year B.Tech CSE Core',
    authorRole: 'Lead Maintainer',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
    authorEmail: 'vikram.singh2024@vitstudent.ac.in',
    createdAt: new Date(Date.now() - 1000 * 60 * 25), // 25 mins ago
    likes: 42,
    likedBy: [],
    commentsCount: 6,
    tags: ['MobileApp', 'VITChennai', 'OpenSource'],
    content: `### 🚀 Campus Copilot v1.4 is Officially Live!

We just pushed the latest build to testflight and campus testers. Here is the breakdown of what we shipped this sprint:

* **Offline VTOP Timetable Sync**: Instant schedule load with zero network requests during peak morning rush.
* **Smart Campus Wayfinder**: Dijkstra pathfinding between **Netaji Subhash Tech Tower (AB-3)**, **AB-1**, and **Delta Block**.
* **Attendance Risk Predictor**: Live projection of safe margin calculations before hitting the 75% threshold.

\`\`\`typescript
// Offline timetable synchronization engine
export async function syncSchedule(regNo: string): Promise<CourseSlot[]> {
  const cached = await localDb.getSlots(regNo);
  if (cached && !isStale(cached)) return cached;
  const fresh = await vtopApi.fetchTimetable(regNo);
  await localDb.persist(fresh);
  return fresh;
}
\`\`\`

> **Looking for 1 Contributor**: We are building native iOS Lock Screen widgets for lecture countdowns. Comment below or send a DM if you'd like to collaborate!`,
    comments: [
      {
        id: 'c1',
        authorName: 'Sneha Reddy',
        authorBranch: '3rd Year IT',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
        content: 'The wayfinder saved me this morning finding Lab 402 in Delta! Outstanding work team.',
        createdAt: '15m ago'
      },
      {
        id: 'c2',
        authorName: 'Aarav Patel',
        authorBranch: '4th Year EEE',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
        content: 'Sent you a DM regarding the iOS WidgetKit extension. Count me in!',
        createdAt: '5m ago'
      }
    ]
  },
  {
    id: 'seed-collab-1',
    type: 'collaboration',
    title: 'RoverX Team: Seeking 2 Perception & SLAM Engineers for University Rover Challenge 2027',
    projectName: 'RoverSLAM Autonomous Vehicle',
    rolesNeeded: ['Perception / SLAM (C++)', 'Embedded ROS2 Engineer', 'UI Dashboard Dev'],
    techStack: ['C++', 'ROS2 Humble', 'RTAB-Map', 'Gazebo', 'Python'],
    repoUrl: 'https://github.com/roverx-vit/roverslam',
    urgency: 'URC 2027 Qualifiers',
    authorName: 'Devansh Mehta',
    authorBranch: 'Team RoverX Lead (4th Year ECE)',
    authorRole: 'Systems Lead',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Devansh',
    authorEmail: 'devansh.mehta2023@vitstudent.ac.in',
    createdAt: new Date(Date.now() - 1000 * 60 * 80), // 1h 20m ago
    likes: 29,
    likedBy: [],
    commentsCount: 3,
    tags: ['Robotics', 'ComputerVision', 'ROS2', 'Hackathon'],
    content: `### 🤝 Seeking Core Collaborators for University Rover Challenge 2027!

Team **RoverX VIT Chennai** is gearing up for upcoming rover trials behind the Delta block outdoor grounds. We are opening two research & engineering slots for passionate students:

#### 🎯 Key Roles Needed:
1. **Perception & SLAM Engineer**:
   - Implementation of 3D LiDAR point cloud odometry with **RTAB-Map** and **C++**.
   - Stereo depth map fusion with Intel RealSense D435i.
2. **Embedded ROS2 Dev**:
   - CAN bus communications & brushless motor telemetry on STM32 / Jetson Orin Nano.

\`\`\`bash
# Quick start our Gazebo simulation environment:
git clone https://github.com/roverx-vit/roverslam.git
colcon build --symlink-install
ros2 launch rover_gazebo simulation.launch.py
\`\`\`

#### 🏆 What We Provide:
- Full access to the Tinkering Lab hardware (Jetson Orin, Ouster LiDAR).
- Official On-Duty (OD) recommendation letters for all testing sessions.
- Co-authorship on the technical team design paper.

*Leave a comment with your GitHub or branch below!*`,
    comments: [
      {
        id: 'c3',
        authorName: 'Karthik Raja',
        authorBranch: '3rd Year CSE Core',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik',
        content: 'I have experience with Gazebo & ROS2 Humble from our semester robotics project. Dropped a message!',
        createdAt: '45m ago'
      }
    ]
  },
  {
    id: 'seed-update-1',
    type: 'update',
    title: 'Zero-Cold-Start Redis Caching Pattern for Student Portals & Hackathons',
    authorName: 'Ananya Sharma',
    authorBranch: '2nd Year AI & Data Science',
    authorRole: 'Backend Engineer',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
    authorEmail: 'ananya.sharma2025@vitstudent.ac.in',
    createdAt: new Date(Date.now() - 1000 * 60 * 180), // 3h ago
    likes: 38,
    likedBy: [],
    commentsCount: 2,
    tags: ['Performance', 'Backend', 'Python', 'DevJams'],
    content: `### ⚡ Quick Tip: Benchmarking Redis Caching for DevJams Apps

If your hackathon app fetches timetable or syllabus data from external campus portals, **never query synchronously on every user tap**!

By wrapping our API with an asynchronous Redis cache with a sliding 15-minute TTL, we dropped our P99 latency drastically:

| Metric | Direct Scraping | With Redis Cache | Speedup |
| :--- | :--- | :--- | :--- |
| **Response Time** | \`1,240ms\` | \`16ms\` | **77x faster** |
| **Server Load** | 82% CPU | 4% CPU | **Massive savings** |

\`\`\`python
# Example FastAPI caching decorator
@app.get("/api/v1/schedule/{reg_no}")
async def get_schedule(reg_no: str):
    cached = await redis_client.get(f"schedule:{reg_no}")
    if cached:
        return json.loads(cached)
        
    data = await fetch_portal_schedule(reg_no)
    await redis_client.setex(f"schedule:{reg_no}", 900, json.dumps(data))
    return data
\`\`\`

Hope this helps anyone prepping for DevJams 2027 this weekend! 💻⚡`,
    comments: []
  },
  {
    id: 'seed-milestone-2',
    type: 'milestone',
    title: 'VIT Attendance Matrix API - 5,000 Concurrent Hits Handled with Go & Docker',
    projectName: 'attendance-matrix-api',
    milestoneStage: '🏆 Stress Test Passed',
    repoUrl: 'https://github.com/vit-devs/attendance-matrix',
    techStack: ['Go', 'Docker', 'Redis', 'Grafana', 'Prometheus'],
    authorName: 'Rohan Verma',
    authorBranch: '4th Year CSE (CyberSec)',
    authorRole: 'Infrastructure Lead',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
    authorEmail: 'rohan.verma2023@vitstudent.ac.in',
    createdAt: new Date(Date.now() - 1000 * 60 * 320), // 5h ago
    likes: 51,
    likedBy: [],
    commentsCount: 4,
    tags: ['GoLang', 'DevOps', 'Docker', 'VITC'],
    content: `### 🚀 Milestone: Attendance Matrix API Passed 5,000 Concurrent Requests!

We just wrapped up our 24-hour continuous load testing before the upcoming FAT exams.

* Rewrote the core calculation engine in **Go**.
* Memory footprint dropped from \`210MB\` (Python) down to \`18MB\` (compiled Go binary).
* **Zero 5xx errors** over 120,000 simulated student lookups!

> Check out the open-source repository for the Docker Compose & Grafana dashboard manifests.`
  }
];

// Helper component for Code Block with Copy Button
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden bg-[#0a0e17] border border-white/10 font-mono text-xs shadow-lg">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/5 border-b border-white/10 text-gray-400">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-semibold text-gray-300 ml-1">{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-gray-200 leading-relaxed">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
}

interface CampusFeedProps {
  onClose?: () => void;
  isModal?: boolean;
}

export default function CampusFeed({ onClose, isModal = false }: CampusFeedProps) {
  const { user, showGlobalToast, setTab, setNetworkTab } = useAppStore();

  // Feed State
  const [posts, setPosts] = useState<CampusFeedPost[]>(INITIAL_CAMPUS_FEED_POSTS);
  const [activeFilter, setActiveFilter] = useState<'all' | FeedPostType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Composer State
  const [composerType, setComposerType] = useState<FeedPostType>('update');
  const [composerTitle, setComposerTitle] = useState('');
  const [composerContent, setComposerContent] = useState('');
  const [composerProjectName, setComposerProjectName] = useState('');
  const [composerMilestoneStage, setComposerMilestoneStage] = useState('');
  const [composerRepoUrl, setComposerRepoUrl] = useState('');
  const [composerTechStack, setComposerTechStack] = useState('');
  const [composerRolesNeeded, setComposerRolesNeeded] = useState('');
  const [composerUrgency, setComposerUrgency] = useState('');
  const [composerTags, setComposerTags] = useState('');
  const [composerPreviewMode, setComposerPreviewMode] = useState<'write' | 'preview'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    try {
      const q = query(
        collection(db, 'campus_feed'), 
        orderBy('createdAt', 'desc'), 
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const fetchedPosts: CampusFeedPost[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              type: data.type || 'update',
              title: data.title || '',
              content: data.content || '',
              authorName: data.authorName || 'VIT Student',
              authorBranch: data.authorBranch || 'B.Tech Student',
              authorRole: data.authorRole || '',
              authorAvatar: data.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.authorName || 'Student'}`,
              authorEmail: data.authorEmail || '',
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date()),
              likes: data.likes || 0,
              likedBy: data.likedBy || [],
              commentsCount: data.commentsCount || (data.comments?.length || 0),
              comments: data.comments || [],
              milestoneStage: data.milestoneStage,
              projectName: data.projectName,
              repoUrl: data.repoUrl,
              techStack: data.techStack || [],
              rolesNeeded: data.rolesNeeded || [],
              urgency: data.urgency,
              tags: data.tags || []
            };
          });

          // Merge Firestore posts with curated initial posts so feed is always rich
          const existingIds = new Set(fetchedPosts.map(p => p.id));
          const complementaryCurated = INITIAL_CAMPUS_FEED_POSTS.filter(p => !existingIds.has(p.id));
          setPosts([...fetchedPosts, ...complementaryCurated]);
        } else {
          setPosts(INITIAL_CAMPUS_FEED_POSTS);
        }
      }, (error) => {
        console.warn('Real-time campus feed snapshot note:', error);
        // Fallback to local curated posts
        setPosts(INITIAL_CAMPUS_FEED_POSTS);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore onSnapshot init error:', e);
      setPosts(INITIAL_CAMPUS_FEED_POSTS);
    }
  }, []);

  // Format relative timestamp
  const formatTime = (time: any) => {
    if (!time) return 'Just now';
    const date = time instanceof Date ? time : new Date(time);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Helper for Markdown insertion into composer textarea
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = composerContent.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const nextContent = composerContent.substring(0, start) + replacement + composerContent.substring(end);
    setComposerContent(nextContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 50);
  };

  // Template loader based on post type
  const applyTemplate = (type: FeedPostType) => {
    if (type === 'milestone') {
      setComposerType('milestone');
      setComposerTitle('🚀 Shipped Milestone: [Feature / Version]');
      setComposerProjectName('my-campus-project');
      setComposerMilestoneStage('🎉 v1.0 Launch');
      setComposerRepoUrl('https://github.com/my-team/project');
      setComposerTechStack('React, TypeScript, Tailwind, Node.js');
      setComposerContent(`### 🚀 Project Milestone Achieved!

We just finished the implementation for our latest milestone!

#### ✨ What We Accomplished:
* **Core Feature**: Benchmarked low-latency processing.
* **Architecture**: Fully modular and documented API endpoints.
* **Tests Passed**: Verified across all edge cases.

\`\`\`typescript
// Key snippet or benchmark result
const status = await system.benchmark();
console.log("Latency:", status.latencyMs);
\`\`\`

> Feel free to test the repository demo and star the project! ⭐`);
    } else if (type === 'collaboration') {
      setComposerType('collaboration');
      setComposerTitle('🤝 Seeking 2 Collaborators for [Project Name]');
      setComposerProjectName('campus-initiative');
      setComposerRolesNeeded('Frontend Dev (React), Backend (Python), UI/UX Designer');
      setComposerTechStack('React, FastAPI, Docker, Tailwind');
      setComposerUrgency('DevJams / Hackathon');
      setComposerContent(`### 🤝 Looking for Teammates for [Project / Hackathon]!

We are building an open-source project aimed at improving campus life and are looking for enthusiastic peers to join our team!

#### 🎯 Open Roles:
1. **Frontend Engineer**: Clean UI with Tailwind CSS and responsive design.
2. **Backend / API**: Fast REST/GraphQL endpoints with database caching.

#### 💡 Project Goals:
- Build a working MVP within the next 2 weeks.
- Submit to campus hackathons and showcase on GitHub.

*Leave a comment below or connect on v-link!*`);
    } else {
      setComposerType('update');
      setComposerTitle('⚡ Quick Tech Tip / Update');
      setComposerContent(`### ⚡ Quick Update from Campus

Sharing a quick update or tech tip with the VIT Chennai community:

* **What I learned today**: ...
* **Helpful resource**: [Link to Docs or Tutorial](https://example.com)

\`\`\`javascript
// Quick code tip
const speedup = optimize();
\`\`\`

Any thoughts or suggestions?`);
    }
    setIsComposerOpen(true);
  };

  // Handle Post Creation
  const handlePublishPost = async () => {
    if (!composerContent.trim()) {
      showGlobalToast('Please write some content before publishing.');
      return;
    }

    setIsSubmitting(true);
    try {
      const techStackArray = composerTechStack
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const rolesArray = composerRolesNeeded
        .split(',')
        .map(r => r.trim())
        .filter(Boolean);

      const tagsArray = composerTags
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const newPostData = {
        type: composerType,
        title: composerTitle.trim() || undefined,
        content: composerContent.trim(),
        projectName: composerProjectName.trim() || undefined,
        milestoneStage: composerMilestoneStage.trim() || undefined,
        repoUrl: composerRepoUrl.trim() || undefined,
        techStack: techStackArray.length ? techStackArray : undefined,
        rolesNeeded: rolesArray.length ? rolesArray : undefined,
        urgency: composerUrgency.trim() || undefined,
        tags: tagsArray.length ? tagsArray : [composerType === 'milestone' ? 'Milestone' : composerType === 'collaboration' ? 'Collab' : 'Update'],
        authorName: user?.name || 'VIT Student',
        authorBranch: user?.branch || 'B.Tech Student',
        authorRole: user?.headline || 'Tech Contributor',
        authorAvatar: user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Student'}`,
        authorEmail: user?.email || '',
        likes: 0,
        likedBy: [],
        commentsCount: 0,
        comments: [],
        createdAt: serverTimestamp()
      };

      // Real-time Firestore write
      const docRef = await addDoc(collection(db, 'campus_feed'), newPostData);

      // Optimistically prepend to local view
      const optimisticPost: CampusFeedPost = {
        ...newPostData,
        id: docRef.id,
        createdAt: new Date()
      };
      setPosts(prev => [optimisticPost, ...prev]);

      // Reset Form
      setComposerTitle('');
      setComposerContent('');
      setComposerProjectName('');
      setComposerMilestoneStage('');
      setComposerRepoUrl('');
      setComposerTechStack('');
      setComposerRolesNeeded('');
      setComposerUrgency('');
      setComposerTags('');
      setIsComposerOpen(false);
      setComposerPreviewMode('write');

      showGlobalToast('🚀 Posted to Campus Feed in real-time!');
    } catch (error) {
      console.error('Error posting to campus feed:', error);
      // Fallback local update
      const fallbackPost: CampusFeedPost = {
        id: `local-${Date.now()}`,
        type: composerType,
        title: composerTitle.trim() || undefined,
        content: composerContent.trim(),
        projectName: composerProjectName.trim() || undefined,
        milestoneStage: composerMilestoneStage.trim() || undefined,
        repoUrl: composerRepoUrl.trim() || undefined,
        techStack: composerTechStack.split(',').map(s => s.trim()).filter(Boolean),
        rolesNeeded: composerRolesNeeded.split(',').map(r => r.trim()).filter(Boolean),
        urgency: composerUrgency.trim() || undefined,
        tags: ['LiveUpdate'],
        authorName: user?.name || 'VIT Student',
        authorBranch: user?.branch || 'B.Tech Student',
        authorRole: 'Contributor',
        authorAvatar: user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Student'}`,
        createdAt: new Date(),
        likes: 0,
        likedBy: [],
        commentsCount: 0,
        comments: []
      };
      setPosts(prev => [fallbackPost, ...prev]);
      setIsComposerOpen(false);
      showGlobalToast('Posted to Campus Feed (Live Session)!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Like
  const handleLike = async (post: CampusFeedPost) => {
    const isCurrentlyLiked = likedPosts[post.id];
    const newLikedState = !isCurrentlyLiked;
    
    setLikedPosts(prev => ({ ...prev, [post.id]: newLikedState }));
    
    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === post.id) {
        return {
          ...p,
          likes: Math.max(0, p.likes + (newLikedState ? 1 : -1))
        };
      }
      return p;
    }));

    try {
      if (!post.id.startsWith('seed-') && !post.id.startsWith('local-')) {
        const postRef = doc(db, 'campus_feed', post.id);
        await updateDoc(postRef, {
          likes: increment(newLikedState ? 1 : -1),
          likedBy: newLikedState ? arrayUnion(user?.email || 'student') : arrayRemove(user?.email || 'student')
        });
      }
    } catch (e) {
      console.warn('Like sync note:', e);
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (postId: string) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    const newComment: FeedComment = {
      id: `c-${Date.now()}`,
      authorName: user?.name || 'VIT Student',
      authorBranch: user?.branch || 'Student',
      authorAvatar: user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Student'}`,
      content: commentText,
      createdAt: 'Just now'
    };

    // Optimistic UI
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          commentsCount: (p.commentsCount || 0) + 1,
          comments: [...(p.comments || []), newComment]
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    try {
      if (!postId.startsWith('seed-') && !postId.startsWith('local-')) {
        const postRef = doc(db, 'campus_feed', postId);
        await updateDoc(postRef, {
          commentsCount: increment(1),
          comments: arrayUnion(newComment)
        });
      }
      showGlobalToast('Reply posted to conversation!');
    } catch (e) {
      console.warn('Comment sync note:', e);
    }
  };

  // Filter & Search Logic
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesFilter = activeFilter === 'all' || post.type === activeFilter;
      if (!matchesFilter) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchTitle = post.title?.toLowerCase().includes(q) || false;
      const matchContent = post.content?.toLowerCase().includes(q) || false;
      const matchAuthor = post.authorName?.toLowerCase().includes(q) || false;
      const matchProject = post.projectName?.toLowerCase().includes(q) || false;
      const matchTech = post.techStack?.some(t => t.toLowerCase().includes(q)) || false;
      const matchRoles = post.rolesNeeded?.some(r => r.toLowerCase().includes(q)) || false;
      const matchTags = post.tags?.some(tag => tag.toLowerCase().includes(q)) || false;

      return matchTitle || matchContent || matchAuthor || matchProject || matchTech || matchRoles || matchTags;
    });
  }, [posts, activeFilter, searchQuery]);

  return (
    <div className={cn(
      "w-full flex flex-col bg-[#0B0F17] text-white",
      isModal ? "h-full overflow-hidden" : "min-h-full pb-24"
    )}>
      {/* Feed Sticky Header */}
      <div className="shrink-0 sticky top-0 z-20 backdrop-blur-xl bg-[#0B0F17]/90 border-b border-white/10 px-4 py-3.5">
        <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue/30 via-indigo-600/30 to-purple-600/30 border border-brand-blue/40 text-brand-blue shadow-lg shadow-brand-blue/20 shrink-0">
              <Radio className="w-5 h-5 animate-pulse text-brand-blue" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0B0F17] animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0B0F17]" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  Campus Feed
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/30">
                    Real-time
                  </span>
                </h1>
              </div>
              <p className="text-xs text-gray-400 truncate hidden sm:block">
                Live short updates, project milestones & collaboration requests across VIT Chennai
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsComposerOpen(!isComposerOpen)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition-all shadow-md",
                isComposerOpen 
                  ? "bg-white/10 text-white border border-white/20" 
                  : "bg-gradient-to-r from-brand-blue to-indigo-600 text-white hover:brightness-110 shadow-brand-blue/25"
              )}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Post Update</span>
            </button>

            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="mt-3.5 max-w-4xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Post Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFilter('all')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border",
                activeFilter === 'all'
                  ? "bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20"
                  : "bg-white/5 text-gray-400 hover:text-white border-white/10 hover:bg-white/10"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              All Posts
              <span className="text-[10px] opacity-75 ml-0.5">({posts.length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('update')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border",
                activeFilter === 'update'
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20"
                  : "bg-white/5 text-gray-400 hover:text-emerald-300 border-white/10 hover:bg-white/10"
              )}
            >
              <span>⚡</span>
              Short Updates
            </button>

            <button
              onClick={() => setActiveFilter('milestone')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border",
                activeFilter === 'milestone'
                  ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20"
                  : "bg-white/5 text-gray-400 hover:text-purple-300 border-white/10 hover:bg-white/10"
              )}
            >
              <span>🚀</span>
              Milestones
            </button>

            <button
              onClick={() => setActiveFilter('collaboration')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border",
                activeFilter === 'collaboration'
                  ? "bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20"
                  : "bg-white/5 text-gray-400 hover:text-cyan-300 border-white/10 hover:bg-white/10"
              )}
            >
              <span>🤝</span>
              Collab Requests
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feed by keyword, tech, author..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue focus:bg-white/10 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 max-w-4xl mx-auto w-full px-4 py-4 space-y-4",
        isModal ? "overflow-y-auto" : ""
      )}>

        {/* Real-time Composer Banner / Accordion */}
        <AnimatePresence>
          {isComposerOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-brand-blue/30 bg-gradient-to-b from-[#131b2c] to-[#0d131f] shadow-2xl relative mb-2">
                {/* Close composer button */}
                <button
                  onClick={() => setIsComposerOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-blue flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" /> Create Campus Post
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-xs text-gray-400">Rendered with Markdown</span>
                </div>

                {/* Post Category Picker */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setComposerType('update')}
                    className={cn(
                      "p-2.5 rounded-2xl border text-left transition-all flex flex-col gap-1",
                      composerType === 'update'
                        ? "bg-emerald-500/20 border-emerald-500 text-white ring-1 ring-emerald-500/40"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span>⚡</span> Short Update
                    </div>
                    <span className="text-[10px] text-gray-400 leading-tight">Daily findings, tips, status</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComposerType('milestone')}
                    className={cn(
                      "p-2.5 rounded-2xl border text-left transition-all flex flex-col gap-1",
                      composerType === 'milestone'
                        ? "bg-purple-500/20 border-purple-500 text-white ring-1 ring-purple-500/40"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span>🚀</span> Milestone
                    </div>
                    <span className="text-[10px] text-gray-400 leading-tight">Releases, demos, benchmarks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComposerType('collaboration')}
                    className={cn(
                      "p-2.5 rounded-2xl border text-left transition-all flex flex-col gap-1",
                      composerType === 'collaboration'
                        ? "bg-cyan-500/20 border-cyan-500 text-white ring-1 ring-cyan-500/40"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span>🤝</span> Collab Request
                    </div>
                    <span className="text-[10px] text-gray-400 leading-tight">Recruiting team members</span>
                  </button>
                </div>

                {/* Quick Templates Buttons */}
                <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 text-[11px] text-gray-400">
                  <span className="shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() => applyTemplate('update')}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors shrink-0"
                  >
                    ⚡ Tech Tip Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('milestone')}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors shrink-0"
                  >
                    🚀 Shipped Release Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('collaboration')}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors shrink-0"
                  >
                    🤝 Hackathon Teammates Preset
                  </button>
                </div>

                {/* Dynamic Category Fields */}
                <div className="space-y-3 mb-3">
                  <input
                    type="text"
                    value={composerTitle}
                    onChange={(e) => setComposerTitle(e.target.value)}
                    placeholder={
                      composerType === 'milestone' 
                        ? "Milestone Title (e.g., v1.4 Released: Offline Timetables Engine)"
                        : composerType === 'collaboration'
                        ? "Collaboration Title (e.g., Seeking 2 SLAM Engineers for Rover Team)"
                        : "Update Title / Headline (optional)"
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue font-semibold"
                  />

                  {composerType === 'milestone' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={composerProjectName}
                        onChange={(e) => setComposerProjectName(e.target.value)}
                        placeholder="Project Name (e.g., campus-copilot)"
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                      />
                      <input
                        type="text"
                        value={composerMilestoneStage}
                        onChange={(e) => setComposerMilestoneStage(e.target.value)}
                        placeholder="Stage (e.g., 🎉 v1.0 Launch, 🏆 Finalist)"
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                      />
                      <input
                        type="text"
                        value={composerRepoUrl}
                        onChange={(e) => setComposerRepoUrl(e.target.value)}
                        placeholder="Repo / Demo URL (https://...)"
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  )}

                  {composerType === 'collaboration' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={composerProjectName}
                        onChange={(e) => setComposerProjectName(e.target.value)}
                        placeholder="Project / Initiative Name"
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                      />
                      <input
                        type="text"
                        value={composerRolesNeeded}
                        onChange={(e) => setComposerRolesNeeded(e.target.value)}
                        placeholder="Roles Needed (e.g., Frontend, ROS2)"
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                      />
                      <input
                        type="text"
                        value={composerUrgency}
                        onChange={(e) => setComposerUrgency(e.target.value)}
                        placeholder="Timeline (e.g., DevJams, Capstone)"
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={composerTechStack}
                      onChange={(e) => setComposerTechStack(e.target.value)}
                      placeholder="Technologies (comma separated: React, Python, Docker)"
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                    />
                    <input
                      type="text"
                      value={composerTags}
                      onChange={(e) => setComposerTags(e.target.value)}
                      placeholder="Tags (comma separated: #Hackathon, #VITChennai)"
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>

                {/* Markdown Toolbar & Write/Preview Toggle */}
                <div className="border border-white/10 rounded-2xl bg-black/30 overflow-hidden mb-4">
                  <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10">
                    {/* Markdown formatting quick buttons */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                      <button
                        type="button"
                        onClick={() => insertMarkdown('**', '**')}
                        className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs font-bold"
                        title="Bold"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('*', '*')}
                        className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs italic"
                        title="Italic"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('### ')}
                        className="px-1.5 py-1 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs font-bold"
                        title="Heading 3"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('`', '`')}
                        className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs"
                        title="Inline Code"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('\n```typescript\n', '\n```\n')}
                        className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs"
                        title="Code Block"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('\n* ')}
                        className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs"
                        title="Bullet List"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('\n> ')}
                        className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs"
                        title="Quote"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('[', '](https://url)')}
                        className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs"
                        title="Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Write vs Preview Mode Toggle */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-0.5 border border-white/5">
                      <button
                        type="button"
                        onClick={() => setComposerPreviewMode('write')}
                        className={cn(
                          "px-2.5 py-1 text-xs rounded-lg transition-all font-medium flex items-center gap-1",
                          composerPreviewMode === 'write'
                            ? "bg-brand-blue text-white shadow-sm"
                            : "text-gray-400 hover:text-white"
                        )}
                      >
                        <Edit3 className="w-3 h-3" />
                        Write
                      </button>
                      <button
                        type="button"
                        onClick={() => setComposerPreviewMode('preview')}
                        className={cn(
                          "px-2.5 py-1 text-xs rounded-lg transition-all font-medium flex items-center gap-1",
                          composerPreviewMode === 'preview'
                            ? "bg-brand-blue text-white shadow-sm"
                            : "text-gray-400 hover:text-white"
                        )}
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                    </div>
                  </div>

                  {composerPreviewMode === 'write' ? (
                    <textarea
                      ref={textareaRef}
                      value={composerContent}
                      onChange={(e) => setComposerContent(e.target.value)}
                      rows={7}
                      placeholder="Write your update or milestone in Markdown... Use `code`, ```typescript blocks, *lists*, and >quotes"
                      className="w-full bg-transparent p-3.5 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none font-mono resize-y min-h-[140px]"
                    />
                  ) : (
                    <div className="p-4 min-h-[140px] max-h-[300px] overflow-y-auto text-xs sm:text-sm text-gray-200">
                      {composerContent.trim() ? (
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              code({ inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                const codeString = String(children).replace(/\n$/, '');
                                if (!inline && (match || codeString.includes('\n'))) {
                                  return <CodeBlock code={codeString} language={match ? match[1] : 'code'} />;
                                }
                                return (
                                  <code className="px-1.5 py-0.5 rounded bg-white/10 text-emerald-300 font-mono text-xs" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              a({ href, children }) {
                                return (
                                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">
                                    {children}
                                  </a>
                                );
                              },
                              blockquote({ children }) {
                                return (
                                  <blockquote className="border-l-4 border-brand-blue/60 pl-3 py-1 my-2 italic text-gray-300 bg-brand-blue/5 rounded-r">
                                    {children}
                                  </blockquote>
                                );
                              }
                            }}
                          >
                            {composerContent}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No content written yet. Switch to Write mode to type markdown.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Composer Footer Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <img 
                      src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                      alt="Current User" 
                      className="w-6 h-6 rounded-full border border-gray-600 object-cover" 
                    />
                    <span className="text-xs text-gray-400">
                      Posting as <strong className="text-white">{user?.name || 'Student'}</strong> ({user?.branch || 'VITC'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsComposerOpen(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handlePublishPost}
                      disabled={isSubmitting || !composerContent.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white shadow-lg shadow-brand-blue/25 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Publish to Campus Feed
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Trigger Composer Prompt Bar when composer is closed */}
        {!isComposerOpen && (
          <div 
            onClick={() => setIsComposerOpen(true)}
            className="glass-panel p-3.5 rounded-2xl flex items-center justify-between gap-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 cursor-pointer transition-all hover:border-brand-blue/30 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img 
                src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border border-gray-600 object-cover shrink-0" 
              />
              <div className="truncate">
                <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
                  Share a short update, project milestone, or collaboration request...
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-brand-blue font-semibold shrink-0">
              <span>Write</span>
              <Plus className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Feed Posts Stream */}
        {filteredPosts.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center text-gray-400 border border-white/5 space-y-3">
            <Radio className="w-10 h-10 text-gray-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No updates matching your filter</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Try changing the filter or search keywords, or be the first to post a campus milestone!
            </p>
            <button
              onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isLiked = likedPosts[post.id];
            const isCommentsOpen = expandedComments[post.id];

            return (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "glass-panel rounded-3xl p-4 sm:p-5 border transition-all",
                  post.type === 'milestone' 
                    ? "border-purple-500/25 bg-gradient-to-b from-purple-950/10 via-[#0B0F17] to-[#0B0F17]"
                    : post.type === 'collaboration'
                    ? "border-cyan-500/25 bg-gradient-to-b from-cyan-950/10 via-[#0B0F17] to-[#0B0F17]"
                    : "border-white/10 bg-[#0B0F17]/80"
                )}
              >
                {/* Post Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={post.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} 
                      alt={post.authorName} 
                      className="w-10 h-10 rounded-full border border-white/10 object-cover bg-white/5 shrink-0" 
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white hover:text-brand-blue cursor-pointer transition-colors truncate">
                          {post.authorName}
                        </span>
                        {/* Post Type Badge */}
                        {post.type === 'milestone' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                            <Rocket className="w-3 h-3" /> Project Milestone
                          </span>
                        )}
                        {post.type === 'collaboration' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Collab Request
                          </span>
                        )}
                        {post.type === 'update' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <span>⚡</span> Short Update
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">
                        {post.authorBranch} {post.authorRole ? `• ${post.authorRole}` : ''} • {formatTime(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Share button */}
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: post.title || 'Campus Feed Post', text: post.content });
                      } else {
                        navigator.clipboard.writeText(post.content);
                        showGlobalToast('Post text copied to clipboard!');
                      }
                    }}
                    className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0"
                    title="Share post"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Milestone Specific Header Banner */}
                {post.type === 'milestone' && (
                  <div className="mb-3 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300">
                        <Rocket className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{post.projectName || 'Project'}</span>
                          {post.milestoneStage && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-400/20 text-purple-200 border border-purple-400/30">
                              {post.milestoneStage}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {post.repoUrl && (
                      <a
                        href={post.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>View Repo / Demo</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                    )}
                  </div>
                )}

                {/* Collaboration Specific Header Banner */}
                {post.type === 'collaboration' && (
                  <div className="mb-3 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300">
                          <Users className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {post.projectName || 'Collaborative Initiative'}
                          </span>
                          {post.urgency && (
                            <span className="text-[10px] text-cyan-300">
                              Timeline: {post.urgency}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setTab('network');
                          setNetworkTab('messages');
                          showGlobalToast(`Connecting with ${post.authorName}...`);
                        }}
                        className="px-3 py-1 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-black transition-colors shadow-md shadow-cyan-500/20"
                      >
                        I'm Interested / Connect
                      </button>
                    </div>

                    {post.rolesNeeded && post.rolesNeeded.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-cyan-500/15">
                        <span className="text-[10px] font-semibold text-cyan-200">Roles Needed:</span>
                        {post.rolesNeeded.map((role, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-cyan-400/15 text-cyan-200 border border-cyan-400/25">
                            {role}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Post Title if present */}
                {post.title && (
                  <h3 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug">
                    {post.title}
                  </h3>
                )}

                {/* Markdown Content Body */}
                <div className="text-xs sm:text-sm text-gray-200 leading-relaxed space-y-2 prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        if (!inline && (match || codeString.includes('\n'))) {
                          return <CodeBlock code={codeString} language={match ? match[1] : 'code'} />;
                        }
                        return (
                          <code className="px-1.5 py-0.5 rounded bg-white/10 text-emerald-300 font-mono text-xs border border-white/5" {...props}>
                            {children}
                          </code>
                        );
                      },
                      a({ href, children }) {
                        return (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-blue-300 underline underline-offset-2 inline-flex items-center gap-0.5">
                            {children}
                            <ExternalLink className="w-3 h-3 inline-block ml-0.5" />
                          </a>
                        );
                      },
                      blockquote({ children }) {
                        return (
                          <blockquote className="border-l-4 border-brand-blue/60 pl-3 py-1.5 my-2.5 italic text-gray-300 bg-brand-blue/5 rounded-r-xl">
                            {children}
                          </blockquote>
                        );
                      },
                      h1({ children }) {
                        return <h1 className="text-lg font-bold text-white mt-3 mb-1.5">{children}</h1>;
                      },
                      h2({ children }) {
                        return <h2 className="text-base font-bold text-white mt-3 mb-1.5">{children}</h2>;
                      },
                      h3({ children }) {
                        return <h3 className="text-sm font-bold text-white mt-2.5 mb-1">{children}</h3>;
                      },
                      ul({ children }) {
                        return <ul className="list-disc pl-5 my-2 space-y-1 text-gray-300">{children}</ul>;
                      },
                      ol({ children }) {
                        return <ol className="list-decimal pl-5 my-2 space-y-1 text-gray-300">{children}</ol>;
                      },
                      table({ children }) {
                        return (
                          <div className="overflow-x-auto my-3 rounded-xl border border-white/10 bg-black/40">
                            <table className="min-w-full text-xs text-left text-gray-300 divide-y divide-white/10">
                              {children}
                            </table>
                          </div>
                        );
                      },
                      th({ children }) {
                        return <th className="px-3 py-2 font-bold text-white bg-white/5">{children}</th>;
                      },
                      td({ children }) {
                        return <td className="px-3 py-2 border-t border-white/5">{children}</td>;
                      }
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>

                {/* Tech Stack and Tag pills */}
                {(post.techStack?.length || post.tags?.length) ? (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-white/5">
                    {post.techStack?.map((tech, idx) => (
                      <span key={`tech-${idx}`} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white/5 text-gray-300 border border-white/10 flex items-center gap-1">
                        <Code2 className="w-2.5 h-2.5 text-brand-blue" />
                        {tech}
                      </span>
                    ))}
                    {post.tags?.map((tag, idx) => (
                      <span key={`tag-${idx}`} className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* Post Footer Interactions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1 sm:gap-2">
                    {/* Like button */}
                    <button
                      onClick={() => handleLike(post)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
                        isLiked 
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Heart className={cn("w-4 h-4", isLiked && "fill-rose-400 text-rose-400")} />
                      <span>{post.likes || 0}</span>
                    </button>

                    {/* Comments toggle */}
                    <button
                      onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
                        isCommentsOpen
                          ? "bg-brand-blue/20 text-brand-blue border border-brand-blue/30"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentsCount || (post.comments?.length || 0)}</span>
                      {isCommentsOpen ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setTab('network');
                        setNetworkTab('messages');
                        showGlobalToast(`Opening chat with ${post.authorName}...`);
                      }}
                      className="px-2.5 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium flex items-center gap-1"
                    >
                      <span>DM</span>
                      <CornerDownRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expandable Comments / Discussion Section */}
                <AnimatePresence>
                  {isCommentsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-3 pt-3 border-t border-white/5"
                    >
                      {/* Existing Comments */}
                      <div className="space-y-2 mb-3 max-h-56 overflow-y-auto pr-1">
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((comment) => (
                            <div key={comment.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={comment.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorName}`} 
                                    alt={comment.authorName} 
                                    className="w-5 h-5 rounded-full object-cover" 
                                  />
                                  <span className="font-bold text-white">{comment.authorName}</span>
                                  {comment.authorBranch && (
                                    <span className="text-[10px] text-gray-500">({comment.authorBranch})</span>
                                  )}
                                </div>
                                <span className="text-[10px] text-gray-500">{comment.createdAt}</span>
                              </div>
                              <p className="text-gray-300 leading-relaxed pl-7">{comment.content}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 italic py-1">No comments yet. Start the campus conversation!</p>
                        )}
                      </div>

                      {/* Add Comment Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(post.id);
                            }
                          }}
                          placeholder="Write a response or question..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim()}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-blue hover:bg-blue-600 disabled:opacity-40 text-white transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })
        )}
      </div>
    </div>
  );
}
