const fs = require('fs');

// 1. App.tsx: Add safe area environment variables and make it min-h-[100dvh] (already did 100dvh)
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace('className="w-full min-h-[100dvh] text-[var(--color-brand-text)] font-sans overflow-hidden"', 'className="w-full min-h-[100dvh] text-[var(--color-brand-text)] font-sans overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"');
fs.writeFileSync('src/App.tsx', appCode);

// 2. ProfileTab.tsx: flex-wrap on skills
let profileCode = fs.readFileSync('src/tabs/ProfileTab.tsx', 'utf8');
// Find overflow-x-auto and replace with flex-wrap if it's the skills section
profileCode = profileCode.replace(/<div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">/g, '<div className="flex gap-2 flex-wrap pb-1">');
profileCode = profileCode.replace(/<div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">/g, '<div className="flex gap-2 flex-wrap pb-2">');
// Profile chips container:
profileCode = profileCode.replace(/overflow-x-auto no-scrollbar/g, 'flex-wrap');
fs.writeFileSync('src/tabs/ProfileTab.tsx', profileCode);

// 3. OnboardingScreen.tsx: Keyboard behavior / scroll / wrap
let onboardingCode = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');
// It already has flex-wrap: <div className="flex flex-wrap gap-2">
fs.writeFileSync('src/screens/OnboardingScreen.tsx', onboardingCode);

