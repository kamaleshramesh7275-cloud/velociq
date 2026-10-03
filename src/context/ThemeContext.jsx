import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  'hyper-cyan': {
    id: 'hyper-cyan',
    name: 'Hyper Cyan',
    tagline: 'Aero Cyber & Telematics',
    primary: '#00D4FF',
    secondary: '#0B3D91',
    glow: 'rgba(0, 212, 255, 0.45)',
    accent: '#38BDF8',
    cardBorder: 'rgba(0, 212, 255, 0.25)',
    badgeBg: 'rgba(0, 212, 255, 0.12)',
    badgeText: '#00D4FF',
    swatches: ['#00D4FF', '#0B3D91', '#38BDF8'],
    bgGradient: 'from-slate-900 via-[#0B1528] to-slate-950',
    carColor: 0x1D4ED8, // Performance Blue
  },
  'obsidian-gold': {
    id: 'obsidian-gold',
    name: 'Obsidian Gold',
    tagline: 'Grand Touring & Luxury Supercar',
    primary: '#F59E0B',
    secondary: '#D97706',
    glow: 'rgba(245, 158, 11, 0.45)',
    accent: '#FBBF24',
    cardBorder: 'rgba(245, 158, 11, 0.28)',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    badgeText: '#F59E0B',
    swatches: ['#F59E0B', '#B45309', '#FBBF24'],
    bgGradient: 'from-amber-950/40 via-stone-950 to-slate-950',
    carColor: 0xD97706, // Metallic Gold Amber
  },
  'emerald-velocity': {
    id: 'emerald-velocity',
    name: 'Emerald Velocity',
    tagline: 'Eco-Hybrid & British Racing',
    primary: '#10B981',
    secondary: '#047857',
    glow: 'rgba(16, 185, 129, 0.45)',
    accent: '#34D399',
    cardBorder: 'rgba(16, 185, 129, 0.25)',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    badgeText: '#10B981',
    swatches: ['#10B981', '#065F46', '#34D399'],
    bgGradient: 'from-emerald-950/40 via-slate-950 to-slate-950',
    carColor: 0x059669, // British Racing Green
  },
  'redline-crimson': {
    id: 'redline-crimson',
    name: 'Redline Crimson',
    tagline: 'Motorsport & Track Apex',
    primary: '#EF4444',
    secondary: '#B91C1C',
    glow: 'rgba(239, 68, 68, 0.45)',
    accent: '#F87171',
    cardBorder: 'rgba(239, 68, 68, 0.28)',
    badgeBg: 'rgba(239, 68, 68, 0.12)',
    badgeText: '#EF4444',
    swatches: ['#EF4444', '#991B1B', '#FB923C'],
    bgGradient: 'from-red-950/40 via-slate-950 to-slate-950',
    carColor: 0xDC2626, // Crimson Red
  },
  'synthwave-neon': {
    id: 'synthwave-neon',
    name: 'Synthwave Neon',
    tagline: 'Cyberpunk & Night Runner',
    primary: '#EC4899',
    secondary: '#8B5CF6',
    glow: 'rgba(236, 72, 153, 0.45)',
    accent: '#A855F7',
    cardBorder: 'rgba(236, 72, 153, 0.28)',
    badgeBg: 'rgba(236, 72, 153, 0.14)',
    badgeText: '#EC4899',
    swatches: ['#EC4899', '#8B5CF6', '#06B6D4'],
    bgGradient: 'from-pink-950/40 via-purple-950 to-slate-950',
    carColor: 0x8B5CF6, // Cyber Purple
  },
  'luminous-titanium': {
    id: 'luminous-titanium',
    name: 'Luminous Titanium',
    tagline: 'Minimal Aerospace & Steel',
    primary: '#38BDF8',
    secondary: '#475569',
    glow: 'rgba(56, 189, 248, 0.35)',
    accent: '#94A3B8',
    cardBorder: 'rgba(148, 163, 184, 0.25)',
    badgeBg: 'rgba(56, 189, 248, 0.10)',
    badgeText: '#0284C7',
    swatches: ['#38BDF8', '#475569', '#CBD5E1'],
    bgGradient: 'from-slate-900 via-slate-900 to-slate-950',
    carColor: 0x475569, // Titanium Slate
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    try {
      return localStorage.getItem('velociq_theme_preset') || 'hyper-cyan';
    } catch {
      return 'hyper-cyan';
    }
  });

  const currentTheme = THEMES[themeId] || THEMES['hyper-cyan'];

  useEffect(() => {
    try {
      localStorage.setItem('velociq_theme_preset', themeId);
      document.documentElement.setAttribute('data-theme', themeId);
      
      // Update global CSS custom properties
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', currentTheme.primary);
      root.style.setProperty('--theme-secondary', currentTheme.secondary);
      root.style.setProperty('--theme-glow', currentTheme.glow);
      root.style.setProperty('--theme-accent', currentTheme.accent);
      root.style.setProperty('--theme-card-border', currentTheme.cardBorder);
      root.style.setProperty('--theme-badge-bg', currentTheme.badgeBg);
      root.style.setProperty('--theme-badge-text', currentTheme.badgeText);
    } catch (err) {
      console.warn('Failed to persist theme:', err);
    }
  }, [themeId, currentTheme]);

  return (
    <ThemeContext.Provider value={{
      themeId,
      setTheme: setThemeId,
      theme: currentTheme,
      allThemes: Object.values(THEMES),
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      themeId: 'hyper-cyan',
      setTheme: () => {},
      theme: THEMES['hyper-cyan'],
      allThemes: Object.values(THEMES),
    };
  }
  return context;
}
