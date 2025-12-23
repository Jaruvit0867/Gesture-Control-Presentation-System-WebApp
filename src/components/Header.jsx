import React from 'react';
import { Presentation, Github } from 'lucide-react';

export function Header() {
  return (
    <header className="relative z-10 py-6 px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-accent-primary/20">
              <Presentation className="w-7 h-7 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white tracking-tight">
              Smart<span className="text-accent-primary">Presentation</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Gesture Intelligence</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-4 md:gap-8">
          <a
            href="#how-it-works"
            className="hidden md:block text-sm font-medium text-slate-400 hover:text-accent-primary transition-colors"
          >
            Capabilities
          </a>
          <a
            href="https://github.com/Jaruvit0867/Gesture-Control-Presentation-System-WebApp/tree/v2-cursor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-dark-800 hover:bg-dark-700 border border-white/5 transition-all text-sm font-medium text-white shadow-xl"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">Repository</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
