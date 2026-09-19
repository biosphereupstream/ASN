<div class="light-sweep absolute inset-0 overflow-hidden rounded-3xl glossy">
  <svg viewBox="0 0 640 480" preserveAspectRatio="xMidYMid slice" class="h-full w-full" role="img" aria-label="Ilustrasi jaringan fiber optik ASN.NET">
    <defs>
      <linearGradient id="strandBlue" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stop-color="#0369a1" />
        <stop offset="0.55" stop-color="#38bdf8" />
        <stop offset="1" stop-color="#7dd3fc" />
      </linearGradient>
      <linearGradient id="strandSilver" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stop-color="#94a3b3" />
        <stop offset="0.5" stop-color="#e8ecf1" />
        <stop offset="1" stop-color="#c3cbd6" />
      </linearGradient>
      <radialGradient id="orb" cx="0.35" cy="0.3" r="0.9">
        <stop offset="0" stop-color="#ffffff" />
        <stop offset="0.45" stop-color="#dfe7f0" />
        <stop offset="1" stop-color="#9fb0c2" />
      </radialGradient>
      <radialGradient id="pulse" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffffff" />
        <stop offset="0.4" stop-color="#bae6fd" />
        <stop offset="1" stop-color="#bae6fd" stop-opacity="0" />
      </radialGradient>
      <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
    </defs>

    <!-- Ambient glows -->
    <ellipse cx="150" cy="380" rx="240" ry="150" fill="#7dd3fc" opacity="0.18" filter="url(#soft)" />
    <ellipse cx="520" cy="120" rx="180" ry="130" fill="#38bdf8" opacity="0.16" filter="url(#soft)" />

    <!-- Silver floor grid -->
    <g stroke="#c3cbd6" stroke-width="1" opacity="0.5">
      <line x1="0" y1="436" x2="640" y2="420" />
      <line x1="0" y1="458" x2="640" y2="446" />
      <line x1="0" y1="478" x2="640" y2="470" />
      <line x1="90" y1="430" x2="80" y2="480" />
      <line x1="210" y1="428" x2="205" y2="480" />
      <line x1="330" y1="426" x2="330" y2="480" />
      <line x1="450" y1="424" x2="455" y2="480" />
      <line x1="570" y1="422" x2="578" y2="480" />
    </g>

    <!-- Fiber strands toward the orb -->
    <g fill="none" stroke-linecap="round">
      <path d="M-20,470 C240,465 420,440 660,330" stroke="url(#strandSilver)" stroke-width="2.4" opacity="0.65" />
      <path d="M-20,350 C140,300 220,200 660,40" stroke="url(#strandSilver)" stroke-width="2" opacity="0.5" />
      <path d="M-20,440 C180,420 300,360 660,200" stroke="url(#strandBlue)" stroke-width="4.5" opacity="0.9" />
      <path d="M-20,420 C160,400 260,320 660,140" stroke="url(#strandBlue)" stroke-width="3.6" opacity="0.8" />
      <path d="M-20,460 C200,450 340,410 660,260" stroke="url(#strandBlue)" stroke-width="3" opacity="0.7" />
      <path d="M-20,380 C150,350 240,260 660,90" stroke="url(#strandBlue)" stroke-width="2.6" opacity="0.6" />
      <!-- Branches -->
      <path d="M230,352 C280,380 320,410 350,445" stroke="url(#strandBlue)" stroke-width="2" opacity="0.5" />
      <path d="M330,300 C380,330 420,360 470,392" stroke="url(#strandSilver)" stroke-width="1.8" opacity="0.45" />
    </g>

    <!-- Light pulses -->
    <g>
      <circle cx="150" cy="415" r="10" fill="url(#pulse)" />
      <circle cx="260" cy="345" r="12" fill="url(#pulse)" />
      <circle cx="380" cy="252" r="9" fill="url(#pulse)" />
      <circle cx="90" cy="432" r="8" fill="url(#pulse)" />
      <circle cx="330" cy="300" r="10" fill="url(#pulse)" opacity="0.8" />
    </g>

    <!-- Chrome orb + ring -->
    <ellipse cx="523" cy="122" rx="80" ry="22" fill="none" stroke="#c3cbd6" stroke-width="3" opacity="0.6" transform="rotate(-12 523 122)" />
    <circle cx="523" cy="122" r="54" fill="url(#orb)" />
    <ellipse cx="505" cy="100" rx="20" ry="12" fill="#ffffff" opacity="0.75" />
  </svg>
</div>
