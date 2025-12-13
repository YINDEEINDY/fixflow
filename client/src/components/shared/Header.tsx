import React from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { THAI_TEXT } from '../../constants';

export const Header: React.FC = () => {
  return (
    <header className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-accent-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Mesh Pattern */}
      <div className="absolute inset-0 bg-mesh opacity-20"></div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-6 animate-slide-right">
            {/* Logo */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary-400 to-accent-400 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-glow"></div>
              <div className="relative bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/20 shadow-glass group-hover:shadow-glass-hover transition-all duration-300">
                <Zap className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-2xl">
                  {THAI_TEXT.company.name}
                </h1>
                <Sparkles className="w-7 h-7 text-yellow-300 animate-bounce-subtle" />
              </div>
              <p className="text-lg text-white/90 font-medium drop-shadow-lg">
                {THAI_TEXT.company.subtitle}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/20 shadow-glass animate-slide-left">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-3 h-3 bg-success-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-success-400 rounded-full animate-ping"></div>
              </div>
              <span className="text-white font-semibold">ระบบออนไลน์</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decoration Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M0,0 Q300,80 600,40 T1200,0 L1200,120 L0,120 Z"
            fill="rgb(249, 250, 251)"
          />
        </svg>
      </div>
    </header>
  );
};
