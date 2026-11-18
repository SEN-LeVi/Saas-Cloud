/** Original illustrations for the public pages, drawn in the warm reference palette. */

export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 480" className={className} role="img" aria-label="People connecting from their desks">
      <circle cx="300" cy="250" r="210" fill="#efe8dc" />
      <circle cx="300" cy="250" r="150" fill="#f6f1e9" />
      {/* desk */}
      <rect x="150" y="320" width="300" height="14" rx="7" fill="#c7b299" />
      <rect x="175" y="334" width="10" height="90" rx="5" fill="#a88f74" />
      <rect x="415" y="334" width="10" height="90" rx="5" fill="#a88f74" />
      {/* laptop */}
      <rect x="230" y="236" width="140" height="84" rx="8" fill="#38434f" />
      <rect x="238" y="244" width="124" height="68" rx="4" fill="#dce6f1" />
      <rect x="250" y="256" width="56" height="8" rx="4" fill="#0a66c2" />
      <rect x="250" y="272" width="96" height="6" rx="3" fill="#9db3c8" />
      <rect x="250" y="284" width="80" height="6" rx="3" fill="#9db3c8" />
      <path d="M215 320h170l-12 8H227z" fill="#56687a" />
      {/* mug + plant */}
      <rect x="392" y="292" width="26" height="28" rx="5" fill="#b24020" />
      <path d="M418 299a8 8 0 0 1 0 14" stroke="#b24020" strokeWidth="4" fill="none" />
      <rect x="168" y="286" width="34" height="34" rx="6" fill="#c37d16" />
      <path d="M185 286c-14-30-2-52 0-56 4 10 18 30 0 56z" fill="#44712e" />
      <path d="M185 286c4-24 22-34 30-34-4 12-10 30-30 34z" fill="#5f9b41" />
      <path d="M185 286c-6-18-24-26-32-26 4 10 14 24 32 26z" fill="#5f9b41" />
      {/* floating connection cards */}
      <g>
        <path d="M118 150 C 180 120, 220 150, 250 200" stroke="#0a66c2" strokeWidth="2" strokeDasharray="5 6" fill="none" opacity="0.5" />
        <path d="M470 120 C 420 120, 380 160, 352 220" stroke="#0a66c2" strokeWidth="2" strokeDasharray="5 6" fill="none" opacity="0.5" />
        <path d="M486 300 C 470 260, 440 250, 372 262" stroke="#057642" strokeWidth="2" strokeDasharray="5 6" fill="none" opacity="0.5" />
      </g>
      <g filter="url(#lift)">
        <rect x="40" y="110" width="150" height="64" rx="10" fill="#fff" />
        <circle cx="70" cy="142" r="16" fill="#dfeadf" />
        <rect x="94" y="130" width="76" height="8" rx="4" fill="#38434f" />
        <rect x="94" y="146" width="56" height="6" rx="3" fill="#b0b8c1" />
        <rect x="400" y="80" width="140" height="64" rx="10" fill="#fff" />
        <circle cx="428" cy="112" r="16" fill="#efe0db" />
        <rect x="452" y="100" width="70" height="8" rx="4" fill="#38434f" />
        <rect x="452" y="116" width="50" height="6" rx="3" fill="#b0b8c1" />
        <rect x="420" y="300" width="128" height="56" rx="10" fill="#fff" />
        <rect x="436" y="316" width="24" height="24" rx="4" fill="#0a66c2" />
        <rect x="470" y="318" width="62" height="7" rx="3.5" fill="#38434f" />
        <rect x="470" y="332" width="44" height="6" rx="3" fill="#057642" />
      </g>
      <defs>
        <filter id="lift" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.12" />
        </filter>
      </defs>
    </svg>
  )
}

export function PeopleIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 260" className={className} role="img" aria-label="A group of colleagues">
      <ellipse cx="180" cy="236" rx="160" ry="14" fill="#e6ddd0" />
      {[
        { x: 80, c: "#9db3c8", s: "#0a66c2" },
        { x: 180, c: "#efe0db", s: "#b24020" },
        { x: 280, c: "#dfeadf", s: "#057642" },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={i === 1 ? 92 : 110} r={i === 1 ? 34 : 28} fill={p.c} />
          <path
            d={`M${p.x - (i === 1 ? 54 : 46)} 232 q0 -${i === 1 ? 104 : 86} ${i === 1 ? 54 : 46} -${i === 1 ? 104 : 86} q${i === 1 ? 54 : 46} 0 ${i === 1 ? 54 : 46} ${i === 1 ? 104 : 86}z`}
            fill={p.s}
          />
        </g>
      ))}
    </svg>
  )
}
