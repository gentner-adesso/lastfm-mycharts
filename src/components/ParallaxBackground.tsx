import React from 'react';
import { useScrollY } from '../hooks/useParallax';

export const ParallaxBackground: React.FC = () => {
  const scrollY = useScrollY();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep Layer 1: Top-Right Crimson Glow Orb (Slowest) */}
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-lastfm-red/15 blur-[140px] will-change-transform"
        style={{
          transform: `translate3d(0, ${scrollY * 0.18}px, 0)`,
        }}
      />

      {/* Deep Layer 2: Mid-Left Crimson Nebula (Reverse drift) */}
      <div
        className="absolute top-[45vh] -left-40 w-[550px] h-[550px] rounded-full bg-[#b30008]/12 blur-[130px] will-change-transform"
        style={{
          transform: `translate3d(0, ${scrollY * -0.12}px, 0)`,
        }}
      />

      {/* Deep Layer 3: Bottom-Right Glow */}
      <div
        className="absolute top-[90vh] right-[10%] w-[500px] h-[500px] rounded-full bg-lastfm-red/10 blur-[150px] will-change-transform"
        style={{
          transform: `translate3d(0, ${scrollY * 0.25}px, 0)`,
        }}
      />

      {/* Mid Layer: Floating Neumorphic Vinyl Record Grooves (Parallax Rotation & Drift) */}
      <div
        className="absolute top-[20vh] right-[-80px] w-[380px] h-[380px] rounded-full border border-white/[0.05] shadow-[inset_0_0_50px_rgba(0,0,0,0.9)] opacity-40 will-change-transform flex items-center justify-center"
        style={{
          transform: `translate3d(0, ${scrollY * 0.3}px, 0) rotate(${scrollY * 0.04}deg)`,
        }}
      >
        <div className="w-[300px] h-[300px] rounded-full border border-white/[0.04] flex items-center justify-center">
          <div className="w-[220px] h-[220px] rounded-full border border-white/[0.04] flex items-center justify-center">
            <div className="w-[140px] h-[140px] rounded-full border border-lastfm-red/20 flex items-center justify-center">
              <div className="w-[50px] h-[50px] rounded-full bg-[#111216] border border-white/10 shadow-neu-flat-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Accent Ring Left */}
      <div
        className="absolute top-[65vh] left-[5%] w-[260px] h-[260px] rounded-full border border-lastfm-red/15 opacity-50 will-change-transform flex items-center justify-center shadow-[0_0_30px_rgba(255,23,33,0.06)]"
        style={{
          transform: `translate3d(0, ${scrollY * -0.22}px, 0) rotate(${scrollY * -0.06}deg)`,
        }}
      >
        <div className="w-[180px] h-[180px] rounded-full border border-white/[0.06]" />
      </div>

      {/* Subtle Depth Particles / Crosshairs */}
      <div
        className="absolute top-[35vh] left-[15%] text-white/[0.08] text-2xl font-mono select-none will-change-transform"
        style={{
          transform: `translate3d(0, ${scrollY * 0.4}px, 0)`,
        }}
      >
        +
      </div>
      <div
        className="absolute top-[80vh] right-[25%] text-lastfm-red/20 text-3xl font-mono select-none will-change-transform"
        style={{
          transform: `translate3d(0, ${scrollY * -0.28}px, 0)`,
        }}
      >
        +
      </div>
    </div>
  );
};
