import React from 'react';
import { Presentation, Github, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="relative z-10 py-6 px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
              <Presentation className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-pink flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-white">
              Gesture<span className="gradient-text">Presenter</span>
            </h1>
            <p className="text-xs text-gray-500">Control slides with hand gestures</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-6">
          <a
            href="#how-it-works"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            How it works
          </a>
          <a
            href="https://github.com/Jaruvit0867"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 transition-colors text-sm"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
