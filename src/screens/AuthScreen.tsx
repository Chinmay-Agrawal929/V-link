import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, ShieldAlert, GraduationCap, ChevronLeft, Link, Mail, CheckCircle2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function AuthScreen() {
  const [step, setStep] = useState<'role' | 'email' | 'otp'>('role');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const otp = otpValues.join('');

  const handleRoleSelect = (selectedRole: 'student' | 'faculty' | 'admin') => {
    setRole(selectedRole);
    setStep('email');
    setError('');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Ensure user document is created/persisted in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        const newUserDoc = {
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'VIT Student',
          email: firebaseUser.email || '',
          avatarUrl: firebaseUser.photoURL || null,
          bannerUrl: null,
          coverUrl: null,
          regNo: '',
          branch: 'Computer Science & Engineering',
          role: role || 'student',
          isProfileComplete: false,
          connections: 0,
          about: '',
          skills: ['React', 'Python', 'UI Design'],
          interests: ['Hackathons & DevJams', 'Open Source Contributing'],
          collaborationStatus: 'Open to Collab',
          certifications: [],
          dailyHabits: [],
          featuredProjects: [],
          githubConnected: false,
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newUserDoc, { merge: true });
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError(err.message || 'Google Sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Domain validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const domain = email.split('@')[1]?.toLowerCase();
    const isVit = domain === 'vitstudent.ac.in' || domain === 'vit.ac.in';
    const isAllowedEmail = isVit || domain === 'gmail.com' || domain?.endsWith('.edu') || domain?.endsWith('.ac.in');

    if (!isAllowedEmail) {
      setError('Access Restricted: Valid VIT email required (@vitstudent.ac.in or @vit.ac.in).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setStep('otp');
      setCountdown(30);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      // Secure simulated login via Firebase
      const secureMockPassword = `vlink_otp_${email}`;
      
      try {
        const cred = await signInWithEmailAndPassword(auth, email, secureMockPassword);
        
// Proceed to app, Onboarding will handle profile creation if it doesn't exist.
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          const cred = await createUserWithEmailAndPassword(auth, email, secureMockPassword);
          
// Proceed to app, Onboarding will handle profile creation if it doesn't exist.
        } else {
          throw signInErr;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-brand-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-green/10 rounded-full blur-[100px] pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {step === 'role' ? (
          <motion.div 
            key="role"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm z-10"
          >
            <div className="flex items-center gap-2 mb-8 justify-center text-white">
              <Link size={40} color="#0084FF" strokeWidth={3} />
              <h1 className="text-3xl font-bold tracking-tight">v-link</h1>
            </div>
            
            {/* Quick Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full glass-panel py-3.5 px-5 rounded-2xl flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 transition-all font-semibold text-sm shadow-lg active:scale-[0.98] disabled:opacity-70 mb-4"
            >
              <GoogleIcon className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Or choose your role</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="space-y-3">
              <button onClick={() => handleRoleSelect('student')} className="w-full glass-panel p-5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors border border-white/10">
                <div className="w-12 h-12 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue border border-brand-blue/30">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-white">Student</h3>
                  <p className="text-xs text-gray-400">VIT Chennai Scholars</p>
                </div>
              </button>
              
              <button onClick={() => handleRoleSelect('faculty')} className="w-full glass-panel p-5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors border border-white/10">
                <div className="w-12 h-12 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green border border-brand-green/30">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-white">Faculty</h3>
                  <p className="text-xs text-gray-400">Mentors & Professors</p>
                </div>
              </button>

              <button onClick={() => handleRoleSelect('admin')} className="w-full glass-panel p-5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors border border-white/10">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-white">Admin</h3>
                  <p className="text-xs text-gray-400">v-link Platform Staff</p>
                </div>
              </button>
            </div>
          </motion.div>
        ) : step === 'email' ? (
          <motion.div 
            key="email"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm glass-panel rounded-3xl shadow-lg p-8 z-10"
          >
            <button 
              onClick={() => setStep('role')} 
              className="text-gray-400 hover:text-white mb-6 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            
            <div className="flex flex-col mb-6">
              <div className="flex items-center gap-2 mb-2 text-white">
                <Link size={32} color="#0084FF" strokeWidth={3} />
                <h1 className="text-2xl font-bold tracking-tight">v-link</h1>
              </div>
              <h2 className="text-xl font-semibold text-white mb-1">
                {role === 'student' ? 'Student Sign in' : role === 'faculty' ? 'Faculty Sign in' : 'Admin Sign in'}
              </h2>
              <p className="text-sm text-gray-400">Secure OTP Verification</p>
            </div>

            {/* Quick Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full glass-panel py-3.5 px-5 rounded-2xl flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 transition-all font-semibold text-sm shadow-md active:scale-[0.98] disabled:opacity-70 mb-4"
            >
              <GoogleIcon className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Or use email OTP</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`@${role === 'student' ? 'vitstudent.ac.in' : 'vit.ac.in'}`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors font-sans"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm py-1 font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full mt-6 bg-brand-blue hover:bg-brand-blue/80 text-white font-semibold rounded-xl py-3.5 flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-70 gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Send Magic Code'
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm glass-panel rounded-3xl shadow-lg p-8 z-10"
          >
            <button 
              onClick={() => {
                setStep('email');
                setOtpValues(['', '', '', '', '', '']);
              }} 
              className="text-gray-400 hover:text-white mb-6 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            
            <div className="flex flex-col mb-6 text-center">
              <div className="w-12 h-12 bg-brand-green/20 text-brand-green rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-green/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-1">Enter Verification Code</h2>
              <p className="text-sm text-gray-400">Enter the 6-digit code sent to<br/><span className="text-white font-medium">{email}</span></p>
              <p className="text-xs text-gray-500 mt-2">Please check your email inbox and spam folder for the code.</p>
              
              {countdown > 0 ? (
                <p className="text-xs text-brand-green mt-3 px-2 py-1 bg-brand-green/10 rounded-lg border border-brand-green/20">Resend available in {countdown}s</p>
              ) : (
                <button type="button" onClick={handleSendOtp} className="text-xs text-brand-blue mt-3 px-2 py-1 bg-brand-blue/10 hover:bg-brand-blue/20 rounded-lg border border-brand-blue/20 transition-colors">Resend Code</button>
              )}
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex justify-between gap-2 mb-6">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    ref={otpRefs[index]}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpValues[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-mono text-white placeholder-gray-600 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all shadow-inner"
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-400 text-sm py-1 font-medium text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-brand-green hover:bg-brand-green/80 text-white font-semibold rounded-xl py-3.5 flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Verify Code'
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
