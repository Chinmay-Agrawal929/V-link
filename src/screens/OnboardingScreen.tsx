import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store';
import { GraduationCap, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function OnboardingScreen() {
  const { completeSetup, showGlobalToast } = useAppStore();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [branch, setBranch] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const nextStep = () => setStep(prev => prev + 1);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleCompleteProfile = async () => {
    if (!name.trim() || !regNo.trim() || !branch.trim()) return;
    
    setIsSaving(true);
    try {
      if (auth.currentUser) {
        const userData = {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          name: name.trim(),
          fullName: name.trim(),
          regNo: regNo.trim(),
          branch,
          skills,
          isProfileComplete: true,
          createdAt: serverTimestamp(),
          avatarUrl: null
        };
        await setDoc(doc(db, 'users', auth.currentUser.uid), userData);
        completeSetup(userData as any);
        showGlobalToast("Profile successfully configured!");
      }
    } catch (err) {
      console.error("Error saving setup:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] min-h-[100dvh] overflow-y-auto">
      <div className="w-full max-w-sm relative flex flex-col flex-1 max-h-full justify-center">
        {/* Progress */}
        <div className="absolute -top-12 left-0 right-0 flex justify-center gap-2">
          {[1, 2].map(i => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === step ? "w-8 bg-brand-blue" : i < step ? "w-8 bg-brand-green" : "w-2 bg-white/20"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full glass-panel rounded-3xl p-6 md:p-8 flex flex-col overflow-y-auto max-h-full"
            >
              <div className="w-14 h-14 rounded-full bg-brand-blue/20 flex items-center justify-center mb-6 border border-brand-blue/30 text-brand-blue">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to v-link! What's your name?</h2>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Let's set up your profile to connect with peers.
              </p>
              
              <div className="space-y-4 mb-4">
                <input 
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                />
                <input 
                  type="text"
                  value={regNo}
                  onChange={e => setRegNo(e.target.value)}
                  placeholder="Registration Number (e.g. 26BCE1234)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                />
                <select 
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue appearance-none"
                >
                  <option value="" disabled className="bg-brand-dark">Select Department</option>
                  <option value="CSE Core" className="bg-brand-dark">CSE Core</option>
                  <option value="CSE AI/ML" className="bg-brand-dark">CSE AI/ML</option>
                  <option value="ECE" className="bg-brand-dark">ECE</option>
                  <option value="Mechanical" className="bg-brand-dark">Mechanical</option>
                  <option value="Civil" className="bg-brand-dark">Civil</option>
                  <option value="Other" className="bg-brand-dark">Other</option>
                </select>
              </div>

              <div className="mt-auto flex justify-end">
                <button 
                  onClick={nextStep}
                  disabled={!name.trim() || !regNo.trim() || !branch}
                  className="w-full bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full glass-panel rounded-3xl p-6 md:p-8 flex flex-col overflow-y-auto max-h-full"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Technical Stack</h2>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Add skills to help others find you for projects and collaborations.
              </p>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="Type a skill and press Enter"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="bg-brand-blue/20 border border-brand-blue/30 text-brand-blue px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5"
                    >
                      {skill}
                      <button 
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:bg-brand-blue/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <span className="text-sm text-gray-500">No skills added yet</span>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-6 flex justify-between gap-3">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handleCompleteProfile}
                  disabled={isSaving}
                  className="flex-1 bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? "Saving..." : (
                    <>
                      <Check className="w-5 h-5" />
                      Complete Profile
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
