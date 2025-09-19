'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface HeaderProps {
  userProfile?: {
    name: string;
  } | null;
  showResetButton?: boolean;
  onReset?: () => void;
  showClearProfileButton?: boolean;
  onClearProfile?: () => void;
}

export default function Header({ 
  userProfile, 
  showResetButton = false, 
  onReset,
  showClearProfileButton = false,
  onClearProfile
}: HeaderProps) {
  return (
    <header className="w-full px-4 py-4">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <Image
            src="/logo.png"
            alt="Floryn"
            width={240}
            height={100}
            className="h-20 w-auto"
            priority
          />
        </motion.div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {userProfile && (
            <div className="text-sm" style={{ color: '#EBE3CF' }}>
              Olá, {userProfile.name}!
            </div>
          )}
          
          {showResetButton && onReset && (
            <button
              onClick={onReset}
              className="text-xs px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              style={{ color: '#EBE3CF' }}
            >
              Reiniciar
            </button>
          )}
          
          {showClearProfileButton && onClearProfile && (
            <button
              onClick={onClearProfile}
              className="p-2 text-white/60 hover:text-red-300 transition-colors"
              title="Limpar perfil"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
