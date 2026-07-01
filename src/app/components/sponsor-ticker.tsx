'use client';

import { useEffect, useRef, useState } from 'react';

// Placeholder sponsor data - replace with actual sponsor logos
// To add real logos: place .png files in /public/sponsors/ and update the logo paths
const sponsors = [
  { name: 'TechCorp', logo: '/sponsors/techcorp.png' },
  { name: 'InnovateLabs', logo: '/sponsors/innovatelabs.png' },
  { name: 'FutureVC', logo: '/sponsors/futurevc.png' },
  { name: 'CloudSystems', logo: '/sponsors/cloudsystems.png' },
  { name: 'DataDrive', logo: '/sponsors/datadrive.png' },
  { name: 'NextGen Capital', logo: '/sponsors/nextgencapital.png' },
];

function SponsorLogo({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="flex items-center gap-3 px-6 shrink-0">
      <div className="w-8 h-8 flex-shrink-0 bg-muted/50 border border-border/50 flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- hidden placeholder
            component (rule #10) with fake logo paths + onError fallback; not worth
            an Image loader until real sponsors ship. */}
        <img
          src={logo}
          alt={`${name} logo`}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <span className="text-xs font-bold text-muted-foreground">
          {name.charAt(0)}
        </span>
      </div>
      <span className="text-sm font-medium text-foreground/80 whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

export function SponsorTicker() {
  const measureRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);
  const [singleSetWidth, setSingleSetWidth] = useState(0);

  useEffect(() => {
    const calculate = () => {
      if (measureRef.current) {
        const setWidth = measureRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        // Need enough copies to fill screen + 1 extra for seamless scroll, then double it for the loop
        const copiesNeeded = Math.ceil(viewportWidth / setWidth) + 1;
        setCopies(copiesNeeded * 2);
        setSingleSetWidth(setWidth);
      }
    };

    calculate();
    window.addEventListener('resize', calculate);
    return () => window.removeEventListener('resize', calculate);
  }, []);

  // Create array with calculated number of copies
  const repeatedSponsors = Array(copies).fill(sponsors).flat();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="flex items-center h-12 overflow-hidden">
        {/* Label */}
        <div className="flex-shrink-0 px-4 border-r border-border bg-muted/50 h-full flex items-center z-10">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Sponsors
          </span>
        </div>

        {/* Hidden element to measure single set width */}
        <div ref={measureRef} className="flex items-center absolute opacity-0 pointer-events-none">
          {sponsors.map((sponsor, index) => (
            <SponsorLogo key={`measure-${index}`} name={sponsor.name} logo={sponsor.logo} />
          ))}
        </div>

        {/* Scrolling container */}
        <div className="flex-1 overflow-hidden ticker-container">
          <div
            className="flex items-center ticker-track"
            style={{
              '--track-width': `${singleSetWidth * (copies / 2)}px`,
            } as React.CSSProperties}
          >
            {repeatedSponsors.map((sponsor, index) => (
              <SponsorLogo
                key={`${sponsor.name}-${index}`}
                name={sponsor.name}
                logo={sponsor.logo}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
