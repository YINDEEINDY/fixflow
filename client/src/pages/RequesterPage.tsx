import React from 'react';
import { Header } from '../components/shared/Header';
import { RequestForm } from '../components/requester/RequestForm';
import { StatusTracker } from '../components/requester/StatusTracker';

export const RequesterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 relative">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-[600px] h-[600px] bg-gradient-to-br from-primary-300/30 to-secondary-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-accent-300/25 to-primary-300/25 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-20 left-1/3 w-[550px] h-[550px] bg-gradient-to-br from-secondary-300/20 to-accent-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Mesh Pattern Overlay */}
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none"></div>

      <Header />
      <main className="container mx-auto px-6 py-16 space-y-16 relative z-10">
        <RequestForm />
        <StatusTracker />
      </main>
    </div>
  );
};
