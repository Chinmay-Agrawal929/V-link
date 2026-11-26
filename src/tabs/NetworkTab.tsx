import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Users, ChevronRight, UserPlus, Clock, BadgeCheck, ChevronLeft, Send, ThumbsUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore, Message } from '@/store';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, limit, onSnapshot, where, orderBy, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import DirectMessageScreen from '@/screens/DirectMessageScreen';
import ActivityFeed from '@/components/ActivityFeed';

const MOCK_PEOPLE = [
  { id: 101, name: 'Vikram Singh', role: '1st Year CSE', skills: ['React', 'Node.js', 'Figma'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram' },
  { id: 102, name: 'Sneha Reddy', role: '3rd Year IT', skills: ['Java', 'Spring', 'MySQL'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha' },
  { id: 103, name: 'Rohan Verma', role: 'Design Lead', skills: ['Framer', 'Three.js', 'UI/UX'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan' },
  { id: 104, name: 'Aisha Khan', role: 'Cybersecurity', skills: ['Python', 'Linux', 'AWS'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha' },
];

import { useQuery , useMutation, useQueryClient} from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import SkillExchange from '@/components/SkillExchange';
import PeerDirectory from '@/components/PeerDirectory';

export default function NetworkTab() {
  const { activeNetworkTab, setNetworkTab, messages, markMessageRead, user } = useAppStore();
  const [pendingConnects, setPendingConnects] = useState<string[]>([]);
  const [openedMessage, setOpenedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [localReplies, setLocalReplies] = useState<{id: string, text: string, time: string}[]>([]);
  const { data: suggestedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const q = query(collection(db, 'users'), limit(20));
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== auth.currentUser?.uid);
    },
    staleTime: 1000 * 60 * 5,
  });

  
  const queryClient = useQueryClient();
  const connectMutation = useMutation({
    mutationFn: async (userId: string) => {
      // In a real app, this would create a connection request doc in Firestore
      // For now, we simulate a small network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return userId;
    },
    onMutate: async (userId) => {
      // Cancel any outgoing refetches
      // await queryClient.cancelQueries({ queryKey: ['network'] })
      // Optimistically update to pending state
      setPendingConnects(prev => [...prev, userId]);
      return { previousConnects: pendingConnects };
    },
    onError: (err, userId, context) => {
      if (context?.previousConnects) {
        setPendingConnects(context.previousConnects);
      }
    },
    onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: ['network'] })
    }
  });

  const handleConnect = async (userId: string) => {
    connectMutation.mutate(userId);
  };

  const endorseMutation = useMutation({
    mutationFn: async ({ userId, skill, action }: { userId: string, skill: string, action: 'add' | 'remove' }) => {
      const currentUid = auth.currentUser?.uid;
      if (!currentUid) return;
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const endorsements = data.skillEndorsements || {};
        let skillList = endorsements[skill] || [];
        
        if (action === 'add') {
          if (!skillList.includes(currentUid)) skillList.push(currentUid);
        } else {
          skillList = skillList.filter((id: string) => id !== currentUid);
        }
        
        await updateDoc(docRef, {
          [`skillEndorsements.${skill}`]: skillList
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const handleEndorse = (e: React.MouseEvent, userId: string, skill: string, isEndorsed: boolean) => {
    e.stopPropagation();
    endorseMutation.mutate({ userId, skill, action: isEndorsed ? 'remove' : 'add' });
  };

  const [firestoreChats, setFirestoreChats] = useState<any[]>([]);
  const [firestoreMessages, setFirestoreMessages] = useState<any[]>([]);

  useEffect(() => {
    if (activeNetworkTab === 'messages' && auth.currentUser) {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', auth.currentUser.uid),
        // orderBy('timestamp', 'desc') // Removed to avoid missing index error
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const chatData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        chatData.sort((a, b) => {
          const timeA = a.lastUpdated?.toMillis ? a.lastUpdated.toMillis() : 0;
          const timeB = b.lastUpdated?.toMillis ? b.lastUpdated.toMillis() : 0;
          return timeB - timeA;
        });
        setFirestoreChats(chatData);
      });
      return () => unsubscribe();
    }
  }, [activeNetworkTab]);

  useEffect(() => {
    if (openedMessage && auth.currentUser) {
      const q = query(
        collection(db, `chats/${openedMessage.id}/messages`),
        orderBy('timestamp', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFirestoreMessages(msgs);
      });
      return () => unsubscribe();
    }
  }, [openedMessage]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), limit(10));
        const snapshot = await getDocs(q);
        const users = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.id !== user?.regNo && u.id !== user?.email); // exclude self if possible
        
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [user]);



  const handleOpenMessage = (msg: Message) => {
    markMessageRead(msg.id);
    setOpenedMessage(msg);
    setLocalReplies([]);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [firestoreMessages]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !openedMessage || !auth.currentUser) return;
    
    try {
      const text = replyText;
      setReplyText('');
      await addDoc(collection(db, `chats/${openedMessage.id}/messages`), {
        senderId: auth.currentUser.uid,
        text: text,
        lastUpdated: serverTimestamp()
      });
      await updateDoc(doc(db, 'chats', openedMessage.id), {
        lastMessage: text,
        lastUpdated: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar relative">
      
      {/* Sticky Tabs */}
      <div className="sticky top-0 z-20 bg-brand-dark/95 backdrop-blur-md border-b border-white/10 px-4 pt-3 flex gap-6">
        <button 
          onClick={() => setNetworkTab('network')}
          className={cn(
            "pb-3 text-sm font-semibold transition-colors relative flex items-center gap-1.5",
            activeNetworkTab === 'network' ? "text-white" : "text-gray-500"
          )}
        >
          <Users className="w-4 h-4 text-brand-blue" />
          Peer Directory
          {activeNetworkTab === 'network' && <motion.div layoutId="net-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />}
        </button>
        <button 
          onClick={() => setNetworkTab('messages')}
          className={cn(
            "pb-3 text-sm font-semibold transition-colors relative flex items-center gap-1.5",
            activeNetworkTab === 'messages' ? "text-white" : "text-gray-500"
          )}
        >
          Messages 
          {messages.some(m => m.unread) && (
            <span className="bg-brand-blue text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {messages.filter(m => m.unread).length}
            </span>
          )}
          {activeNetworkTab === 'messages' && <motion.div layoutId="net-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />}
        </button>
        <button 
          onClick={() => setNetworkTab('activity')}
          className={cn(
            "pb-3 text-sm font-semibold transition-colors relative flex items-center gap-1.5",
            activeNetworkTab === 'activity' ? "text-white" : "text-gray-500"
          )}
        >
          <Activity className="w-4 h-4 text-brand-blue" />
          Activity Feed
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {activeNetworkTab === 'activity' && <motion.div layoutId="net-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />}
        </button>
        <button 
          onClick={() => setNetworkTab('skills')}
          className={cn(
            "pb-3 text-sm font-semibold transition-colors relative flex items-center gap-1.5",
            activeNetworkTab === 'skills' ? "text-white" : "text-gray-500"
          )}
        >
          Skill Swap
          {activeNetworkTab === 'skills' && <motion.div layoutId="net-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />}
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-4 pb-12">
        <AnimatePresence mode="wait">
          {activeNetworkTab === 'network' && (
            <motion.div key="network" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <PeerDirectory onOpenMessage={(chatData) => setOpenedMessage(chatData)} />
            </motion.div>
          )}
          {activeNetworkTab === 'messages' && (
            <motion.div key="messages" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <div className="glass-panel rounded-2xl overflow-hidden">
                {firestoreChats.length > 0 ? firestoreChats.map((chat, idx) => {
                  const otherParticipant = chat.participantNames ? chat.participantNames.find((n: string) => n !== user?.name) : 'Unknown User';
                  return (
                  <div 
                    key={chat.id} 
                    onClick={() => setOpenedMessage({ ...chat, sender: otherParticipant, lastMessage: chat.lastMessage, timestamp: 'Recently', isOfficial: false, unread: false })}
                    className={cn(
                      "p-4 flex gap-4 cursor-pointer transition-colors border-b border-white/5 last:border-0 hover:bg-white/5",
                      chat.unread ? "bg-white/[0.02]" : ""
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-dark border border-white/10 flex items-center justify-center flex-shrink-0 relative">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant}`} className="w-full h-full object-cover rounded-full" alt="avatar"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={cn("text-sm truncate flex items-center gap-1", chat.unread ? "font-bold text-white" : "font-semibold text-gray-300")}>
                          {otherParticipant}
                        </h4>
                      </div>
                      <p className={cn("text-xs line-clamp-2 pr-4", chat.unread ? "font-semibold text-gray-300" : "text-gray-400")}>
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                )}) : (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No conversations yet. Connect with someone to start chatting!
                  </div>
                )}
              </div>
            </motion.div>
          )}
          {activeNetworkTab === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <ActivityFeed isModal={false} />
              </div>
            </motion.div>
          )}
          {activeNetworkTab === 'skills' && (
            <motion.div key="skills" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <SkillExchange />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Overlay */}
      <AnimatePresence>
        {openedMessage && (
          <DirectMessageScreen 
            chatId={openedMessage.id} 
            recipientName={openedMessage.sender} 
            isOfficial={openedMessage.isOfficial}
            onClose={() => setOpenedMessage(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
