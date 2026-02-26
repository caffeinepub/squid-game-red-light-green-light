interface IdleScreenProps {
  onStart: () => void;
}

export function IdleScreen({ onStart }: IdleScreenProps) {
  return (
    <div className="flex flex-col items-center gap-8 max-w-md mx-auto text-center px-4">
      {/* Title */}
      <div>
        <div className="text-white/40 font-mono text-xs tracking-[0.4em] mb-2">SQUID GAME</div>
        <h1
          className="font-display text-5xl md:text-7xl text-white"
          style={{ textShadow: '0 0 30px rgba(255,45,120,0.6)' }}
        >
          RED LIGHT
          <br />
          GREEN LIGHT
        </h1>
        <div className="text-white/40 font-mono text-xs tracking-[0.4em] mt-2">3D EDITION</div>
      </div>

      {/* Instructions */}
      <div
        className="border border-white/10 rounded-lg p-4 text-left w-full"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <div className="text-white/60 font-mono text-xs tracking-widest mb-3">HOW TO PLAY</div>
        <ul className="space-y-2">
          {[
            '🟢 GREEN LIGHT — Move your body to advance',
            '🔴 RED LIGHT — Freeze completely or be eliminated',
            '🎯 Reach the finish line to win',
            '📷 Allow camera access for body tracking',
          ].map((instruction, i) => (
            <li key={i} className="text-white/70 font-mono text-xs flex items-start gap-2">
              <span>{instruction}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="w-full py-4 font-display text-2xl tracking-widest text-black rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #ff2d78, #ff6b9d)',
          boxShadow: '0 0 30px rgba(255,45,120,0.5)',
        }}
      >
        START GAME
      </button>
    </div>
  );
}
