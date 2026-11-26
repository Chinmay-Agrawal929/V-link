const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace('className="w-full min-h-[100dvh] text-[var(--color-brand-text)] font-sans overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"', 'className="w-full min-h-[100dvh] text-[var(--color-brand-text)] font-sans overflow-hidden"');
fs.writeFileSync('src/App.tsx', appCode);

let profileCode = fs.readFileSync('src/tabs/ProfileTab.tsx', 'utf8');
profileCode = profileCode.replace(/<div className="flex gap-2 flex-wrap pb-1">/g, '<div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">');
profileCode = profileCode.replace(/<div className="flex gap-2 flex-wrap pb-2">/g, '<div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">');
profileCode = profileCode.replace(/flex-wrap/g, 'overflow-x-auto no-scrollbar'); // this might replace existing flex-wrap that were there before, but let's check
fs.writeFileSync('src/tabs/ProfileTab.tsx', profileCode);

