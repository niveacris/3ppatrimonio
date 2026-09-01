import React, { useState } from 'react';
import logoCompleto250 from '../assets/images/logo_completo_250x250.png';
import logo250 from '../assets/images/logo_250x250.png';
import logoCompletoRect from '../assets/images/logo_completo_1024x768.png';

interface BrandLogoProps {
  variant?: 'horizontal' | 'badge_3p' | 'full_badge' | 'footer' | 'icon_only';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  imageUrl?: string;
  useImage?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  className = '',
  size = 'md',
  imageUrl,
  useImage = true
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'h-10 sm:h-12',
    md: 'h-14 sm:h-18',
    lg: 'h-20 sm:h-24',
    xl: 'h-28 sm:h-36',
  };

  // Determine image source based on variant or custom imageUrl
  const defaultImg = variant === 'horizontal' || variant === 'footer' 
    ? logoCompleto250 
    : logo250;
  
  const activeImage = imageUrl || defaultImg;

  // Render image logo if useImage is true and no loading error occurred
  if (useImage && activeImage && !imageError) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}>
        <img
          src={activeImage}
          alt="3P Patrimônio"
          className="h-full w-auto object-contain rounded-full transition-transform hover:scale-105 filter drop-shadow-md"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Common SVG gradient definitions
  const GoldGradients = () => (
    <defs>
      <linearGradient id="3p-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="25%" stopColor="#F59E0B" />
        <stop offset="65%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <linearGradient id="3p-gold-shine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <radialGradient id="3p-navy-bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>
      <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  );

  if (variant === 'icon_only') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <GoldGradients />
          <circle cx="60" cy="60" r="56" fill="url(#3p-navy-bg)" stroke="url(#3p-gold-grad)" strokeWidth="3" />
          <circle cx="60" cy="60" r="51" stroke="url(#3p-gold-grad)" strokeWidth="1" strokeOpacity="0.4" fill="none" />
          
          {/* Top Bars */}
          <g transform="translate(48, 22)" fill="url(#3p-gold-grad)">
            <rect x="0" y="10" width="6" height="10" rx="1" />
            <rect x="9" y="5" width="6" height="15" rx="1" />
            <rect x="18" y="0" width="6" height="20" rx="1" />
            <path d="M -8 22 Q 12 16 32 22" stroke="url(#3p-gold-grad)" strokeWidth="1.5" fill="none" />
          </g>

          {/* 3P text */}
          <text x="60" y="78" textAnchor="middle" fontFamily="Georgia, serif" fontSize="42" fontWeight="900" fill="url(#3p-gold-grad)" letterSpacing="-2">
            3P
          </text>
        </svg>
      </div>
    );
  }

  if (variant === 'badge_3p') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          <GoldGradients />
          
          {/* Outer circle badge */}
          <circle cx="200" cy="200" r="190" fill="url(#3p-navy-bg)" stroke="url(#3p-gold-grad)" strokeWidth="8" />
          <circle cx="200" cy="200" r="180" fill="none" stroke="url(#3p-gold-grad)" strokeWidth="2" strokeOpacity="0.4" />

          {/* Top Bar Chart Graphic */}
          <g transform="translate(160, 60)" fill="url(#3p-gold-grad)">
            <rect x="0" y="30" width="20" height="30" rx="3" />
            <rect x="30" y="15" width="20" height="45" rx="3" />
            <rect x="60" y="0" width="20" height="60" rx="3" />
            <path d="M -25 65 Q 40 45 105 65" stroke="url(#3p-gold-grad)" strokeWidth="4" fill="none" />
          </g>

          {/* Big 3P Emblem */}
          <text x="200" y="240" textAnchor="middle" fontFamily="Georgia, serif" fontSize="160" fontWeight="900" fill="url(#3p-gold-grad)" letterSpacing="-6" filter="url(#gold-glow)">
            3P
          </text>

          {/* PATRIMÔNIO Subtext */}
          <text x="200" y="305" textAnchor="middle" fontFamily="sans-serif" fontSize="34" fontWeight="900" fill="#FFFFFF" letterSpacing="12">
            PATRIMÔNIO
          </text>

          {/* Underline accent */}
          <line x1="100" y1="325" x2="300" y2="325" stroke="url(#3p-gold-grad)" strokeWidth="3" />
        </svg>
      </div>
    );
  }

  if (variant === 'full_badge') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          <GoldGradients />

          {/* Outer Ring */}
          <circle cx="250" cy="250" r="238" fill="url(#3p-navy-bg)" stroke="url(#3p-gold-grad)" strokeWidth="10" />
          <circle cx="250" cy="250" r="224" fill="none" stroke="url(#3p-gold-grad)" strokeWidth="2" strokeOpacity="0.5" />

          {/* Top Bar Chart Icon */}
          <g transform="translate(202, 65)" fill="url(#3p-gold-grad)">
            <rect x="0" y="28" width="20" height="32" rx="3" />
            <rect x="30" y="14" width="20" height="46" rx="3" />
            <rect x="60" y="0" width="20" height="60" rx="3" />
            <path d="M -25 65 Q 40 40 115 65" stroke="url(#3p-gold-grad)" strokeWidth="4" fill="none" />
          </g>

          {/* Big 3P Center */}
          <text x="250" y="245" textAnchor="middle" fontFamily="Georgia, serif" fontSize="165" fontWeight="900" fill="url(#3p-gold-grad)" letterSpacing="-8">
            3P
          </text>

          {/* PATRIMÔNIO Title */}
          <text x="250" y="300" textAnchor="middle" fontFamily="sans-serif" fontSize="38" fontWeight="900" fill="#FFFFFF" letterSpacing="14">
            PATRIMÔNIO
          </text>

          {/* Subtitles */}
          <text x="250" y="332" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="800" fill="url(#3p-gold-grad)" letterSpacing="3">
            ESTRATÉGIA • PLANEJAMENTO • RESULTADOS
          </text>
          
          <text x="250" y="358" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="700" fill="#CBD5E1" letterSpacing="2">
            CONSÓRCIO PARA INVESTIDORES
          </text>

          {/* Pillars Divider line */}
          <line x1="80" y1="378" x2="420" y2="378" stroke="url(#3p-gold-grad)" strokeWidth="1.5" opacity="0.6" />

          {/* 3 Pillars Footer Icons */}
          <g transform="translate(100, 395)">
            {/* Estratégia */}
            <g transform="translate(20, 0)">
              <circle cx="20" cy="15" r="14" stroke="url(#3p-gold-grad)" strokeWidth="2" fill="none" />
              <circle cx="20" cy="15" r="6" fill="url(#3p-gold-grad)" />
              <text x="20" y="44" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fontWeight="800" fill="#E2E8F0" letterSpacing="1">
                ESTRATÉGIA
              </text>
            </g>

            <line x1="100" y1="5" x2="100" y2="35" stroke="url(#3p-gold-grad)" strokeWidth="1.5" opacity="0.5" />

            {/* Participação */}
            <g transform="translate(130, 0)">
              <circle cx="20" cy="10" r="6" fill="url(#3p-gold-grad)" />
              <circle cx="5" cy="12" r="4.5" fill="url(#3p-gold-grad)" opacity="0.7" />
              <circle cx="35" cy="12" r="4.5" fill="url(#3p-gold-grad)" opacity="0.7" />
              <text x="20" y="44" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fontWeight="800" fill="#E2E8F0" letterSpacing="1">
                PARTICIPAÇÃO
              </text>
            </g>

            <line x1="210" y1="5" x2="210" y2="35" stroke="url(#3p-gold-grad)" strokeWidth="1.5" opacity="0.5" />

            {/* Confiança */}
            <g transform="translate(240, 0)">
              <path d="M 20 2 L 34 8 V 20 C 34 28 20 34 20 34 C 20 34 6 28 6 20 V 8 Z" stroke="url(#3p-gold-grad)" strokeWidth="2" fill="none" />
              <path d="M 13 17 L 18 22 L 27 12" stroke="url(#3p-gold-grad)" strokeWidth="2" strokeLinecap="round" />
              <text x="20" y="44" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fontWeight="800" fill="#E2E8F0" letterSpacing="1">
                CONFIANÇA
              </text>
            </g>
          </g>
        </svg>
      </div>
    );
  }

  // Footer / Large Horizontal Logo
  if (variant === 'footer') {
    return (
      <div className={`flex items-center gap-4 group ${className}`}>
        <svg viewBox="0 0 110 110" className="w-16 h-16 shrink-0 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          <GoldGradients />
          <circle cx="55" cy="55" r="52" fill="url(#3p-navy-bg)" stroke="url(#3p-gold-grad)" strokeWidth="3" />
          <g transform="translate(43, 18)" fill="url(#3p-gold-grad)">
            <rect x="0" y="8" width="6" height="10" rx="1" />
            <rect x="9" y="4" width="6" height="14" rx="1" />
            <rect x="18" y="0" width="6" height="18" rx="1" />
            <path d="M -8 20 Q 12 14 32 20" stroke="url(#3p-gold-grad)" strokeWidth="1.5" fill="none" />
          </g>
          <text x="55" y="72" textAnchor="middle" fontFamily="Georgia, serif" fontSize="44" fontWeight="900" fill="url(#3p-gold-grad)" letterSpacing="-2">
            3P
          </text>
        </svg>

        <div className="flex flex-col space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-xl tracking-tight text-white font-serif">
              3P
            </span>
            <span className="font-extrabold text-xl tracking-[0.25em] text-white">
              PATRIMÔNIO
            </span>
          </div>
          <span className="text-[10px] tracking-[0.2em] text-amber-400 font-extrabold uppercase">
            ESTRATÉGIA • PLANEJAMENTO • RESULTADOS
          </span>
          <span className="text-[9px] tracking-[0.15em] text-slate-400 font-bold uppercase">
            CONSÓRCIO PARA INVESTIDORES
          </span>
        </div>
      </div>
    );
  }

  // Horizontal variant (default header) - Exactly matching official screenshot logo!
  return (
    <div className={`flex items-center gap-3.5 group cursor-pointer ${className}`}>
      {/* 3P Gold Circle Seal Icon */}
      <svg viewBox="0 0 110 110" className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 group-hover:scale-105 transition-transform drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
        <GoldGradients />
        <circle cx="55" cy="55" r="52" fill="url(#3p-navy-bg)" stroke="url(#3p-gold-grad)" strokeWidth="3" />
        <circle cx="55" cy="55" r="47" stroke="url(#3p-gold-grad)" strokeWidth="1" strokeOpacity="0.4" fill="none" />

        {/* Top 3 Column Chart Icon */}
        <g transform="translate(43, 18)" fill="url(#3p-gold-grad)">
          <rect x="0" y="8" width="6" height="10" rx="1" />
          <rect x="9" y="4" width="6" height="14" rx="1" />
          <rect x="18" y="0" width="6" height="18" rx="1" />
          <path d="M -8 20 Q 12 14 32 20" stroke="url(#3p-gold-grad)" strokeWidth="1.5" fill="none" />
        </g>

        {/* 3P Center Serif Text */}
        <text x="55" y="72" textAnchor="middle" fontFamily="Georgia, serif" fontSize="42" fontWeight="900" fill="url(#3p-gold-grad)" letterSpacing="-2">
          3P
        </text>
      </svg>

      {/* Brand Text Column */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1 leading-none">
          <span className="font-black text-lg sm:text-xl text-amber-400 font-serif">
            3P
          </span>
          <span className="font-extrabold text-sm sm:text-base tracking-[0.2em] text-white">
            PATRIMÔNIO
          </span>
        </div>
        
        <span className="text-[8px] sm:text-[9px] tracking-[0.18em] text-amber-400 font-extrabold uppercase mt-0.5">
          ESTRATÉGIA • PLANEJAMENTO • RESULTADOS
        </span>

        <span className="text-[7.5px] sm:text-[8.5px] tracking-[0.15em] text-slate-400 font-bold uppercase">
          CONSÓRCIO PARA INVESTIDORES
        </span>
      </div>
    </div>
  );
};
