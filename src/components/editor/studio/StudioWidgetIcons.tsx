'use client';

import React from 'react';

// =========================================================================
// VECTOR ICONS FOR UTILITIES / TIỆN ÍCH (EXACT MATCH TO USER SCREENSHOT 4)
// =========================================================================

export const CalendarWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="10" width="32" height="32" rx="8" fill="#FFF5F7" stroke="#1E293B" strokeWidth="2.5" />
    <path d="M8 19 H40" stroke="#1E293B" strokeWidth="2.5" />
    <rect x="14" y="6" width="4" height="8" rx="2" fill="#E11D48" />
    <rect x="30" y="6" width="4" height="8" rx="2" fill="#E11D48" />
    {/* Heart in calendar body */}
    <path
      d="M24 34 C24 34 16 29 16 24 C16 21.2 18 19.5 20.8 19.5 C22.4 19.5 23.4 20.3 24 21.2 C24.6 20.3 25.6 19.5 27.2 19.5 C30 19.5 32 21.2 32 24 C32 29 24 34 24 34 Z"
      fill="#FB7185"
      stroke="#E11D48"
      strokeWidth="1.5"
    />
  </svg>
);

export const CountdownWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <rect x="6" y="12" width="36" height="24" rx="6" fill="#FFF1F2" stroke="#1E293B" strokeWidth="2.5" />
    <rect x="10" y="16" width="8" height="16" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
    <rect x="20" y="16" width="8" height="16" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
    <rect x="30" y="16" width="8" height="16" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
    <text x="14" y="28" fontSize="11" fontWeight="bold" fill="#E11D48" textAnchor="middle" fontFamily="monospace">
      0
    </text>
    <text x="24" y="28" fontSize="11" fontWeight="bold" fill="#E11D48" textAnchor="middle" fontFamily="monospace">
      0
    </text>
    <text x="34" y="28" fontSize="11" fontWeight="bold" fill="#E11D48" textAnchor="middle" fontFamily="monospace">
      3
    </text>
  </svg>
);

export const MapWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <polygon
      points="8,12 18,8 30,12 40,8 40,36 30,40 18,36 8,40"
      fill="#ECFDF5"
      stroke="#1E293B"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <line x1="18" y1="8" x2="18" y2="36" stroke="#1E293B" strokeWidth="2" strokeDasharray="2,2" />
    <line x1="30" y1="12" x2="30" y2="40" stroke="#1E293B" strokeWidth="2" strokeDasharray="2,2" />
    <path
      d="M24 14 C20 14 18 17 18 20 C18 25 24 30 24 30 C24 30 30 25 30 20 C30 17 28 14 24 14 Z"
      fill="#FB7185"
      stroke="#E11D48"
      strokeWidth="2"
    />
    <circle cx="24" cy="20" r="2.5" fill="#FFFFFF" />
  </svg>
);

export const ReminderWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="12" width="32" height="28" rx="6" fill="#F8FAFC" stroke="#1E293B" strokeWidth="2.5" />
    <path d="M8 18 H40" stroke="#1E293B" strokeWidth="2" />
    <circle cx="14" cy="10" r="2" fill="#E11D48" />
    <circle cx="24" cy="10" r="2" fill="#E11D48" />
    <circle cx="34" cy="10" r="2" fill="#E11D48" />
    {/* Ringing Bell */}
    <path d="M24 22 C21 22 19 24 19 27 L17 31 H31 L29 27 C29 24 27 22 24 22 Z" fill="#FEE2E2" stroke="#E11D48" strokeWidth="2" />
    <circle cx="24" cy="33" r="2" fill="#E11D48" />
  </svg>
);

export const CallWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <rect x="6" y="6" width="36" height="36" rx="10" fill="#FFF1F2" />
    <path
      d="M17 15 C17 28 20 33 33 33 L29 28 L26 29 C24 28 21.5 25.5 20.5 23.5 L21.5 20.5 L17 15 Z"
      fill="#FB7185"
      stroke="#E11D48"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const RsvpWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <rect x="10" y="8" width="28" height="34" rx="5" fill="#F8FAFC" stroke="#1E293B" strokeWidth="2.5" />
    <rect x="18" y="5" width="12" height="6" rx="2" fill="#E11D48" />
    <circle cx="16" cy="19" r="2" fill="#059669" />
    <line x1="22" y1="19" x2="32" y2="19" stroke="#1E293B" strokeWidth="2" />
    <circle cx="16" cy="27" r="2" fill="#059669" />
    <line x1="22" y1="27" x2="32" y2="27" stroke="#1E293B" strokeWidth="2" />
    <path d="M28 36 L36 26 L40 30 L32 40 L27 41 Z" fill="#FB7185" stroke="#1E293B" strokeWidth="1.5" />
  </svg>
);

export const CustomFormWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <rect x="10" y="8" width="28" height="34" rx="5" fill="#F8FAFC" stroke="#1E293B" strokeWidth="2.5" />
    <rect x="18" y="5" width="12" height="6" rx="2" fill="#3B82F6" />
    <line x1="16" y1="18" x2="32" y2="18" stroke="#64748B" strokeWidth="2" />
    <line x1="16" y1="24" x2="32" y2="24" stroke="#64748B" strokeWidth="2" />
    <line x1="16" y1="30" x2="26" y2="30" stroke="#64748B" strokeWidth="2" />
    <path d="M30 38 L38 25 L42 29 L34 42 L29 43 Z" fill="#60A5FA" stroke="#1E293B" strokeWidth="1.5" />
  </svg>
);

export const GuestNameWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="12" width="32" height="24" rx="6" fill="#FFF1F2" stroke="#E11D48" strokeWidth="2.5" />
    <rect x="4" y="18" width="6" height="12" rx="2" fill="#1E293B" />
    <rect x="38" y="18" width="6" height="12" rx="2" fill="#1E293B" />
    <text x="24" y="29" fontSize="16" fontWeight="bold" fill="#E11D48" textAnchor="middle" fontFamily="sans-serif">
      T
    </text>
  </svg>
);

export const GiftboxWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <rect x="10" y="20" width="28" height="22" rx="4" fill="#F8FAFC" stroke="#1E293B" strokeWidth="2.5" />
    <rect x="7" y="14" width="34" height="8" rx="3" fill="#F8FAFC" stroke="#1E293B" strokeWidth="2.5" />
    <rect x="22" y="14" width="4" height="28" fill="#E11D48" />
    <path d="M22 14 C16 8 12 14 22 14 Z" fill="#FB7185" stroke="#E11D48" strokeWidth="1.5" />
    <path d="M26 14 C32 8 36 14 26 14 Z" fill="#FB7185" stroke="#E11D48" strokeWidth="1.5" />
    <circle cx="34" cy="34" r="6" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="1.5" />
    <text x="34" y="38" fontSize="8" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">
      $
    </text>
  </svg>
);

export const AlbumWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <rect x="13" y="8" width="27" height="27" rx="5" fill="#FFF1F2" stroke="#1E293B" strokeWidth="2.5" />
    <rect x="8" y="14" width="28" height="28" rx="5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
    <path d="M12 36 L18 28 L24 36 L28 32 L34 38 Z" fill="#FB7185" />
    <circle cx="28" cy="22" r="3" fill="#F43F5E" />
  </svg>
);

export const SlideshowWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="10" width="32" height="26" rx="5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
    <path d="M12 30 L18 22 L24 30 L28 26 L34 32 Z" fill="#FB7185" />
    <circle cx="28" cy="18" r="3" fill="#F43F5E" />
    <circle cx="16" cy="42" r="2" fill="#E11D48" />
    <circle cx="24" cy="42" r="2" fill="#CBD5E1" />
    <circle cx="32" cy="42" r="2" fill="#CBD5E1" />
  </svg>
);

export const WishesWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="12" width="32" height="26" rx="6" fill="#FFF5F7" stroke="#1E293B" strokeWidth="2.5" />
    <path d="M8 15 L24 27 L40 15" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M24 25 C24 25 19 21.5 19 18 C19 16 20.5 14.5 22.5 14.5 C23.5 14.5 24 15 24 15 C24 15 24.5 14.5 25.5 14.5 C27.5 14.5 29 16 29 18 C29 21.5 24 25 24 25 Z"
      fill="#FB7185"
      stroke="#E11D48"
      strokeWidth="1.2"
    />
    <circle cx="34" cy="30" r="1.5" fill="#F43F5E" />
    <circle cx="38" cy="30" r="1.5" fill="#F43F5E" />
  </svg>
);

export const MusicPlayerWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    {/* Vinyl Disc Outer */}
    <circle cx="22" cy="24" r="16" fill="#1E293B" />
    <circle cx="22" cy="24" r="12" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 2" />
    <circle cx="22" cy="24" r="6" fill="#E11D48" />
    <circle cx="22" cy="24" r="2" fill="#FFFFFF" />
    {/* Needle Arm */}
    <path d="M38 12 L32 20 L30 19" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="38" cy="12" r="3" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.5" />
    {/* Music Note */}
    <path d="M38 26 L42 24 V34" stroke="#FB7185" strokeWidth="2" strokeLinecap="round" />
    <circle cx="40" cy="34" r="2" fill="#FB7185" />
  </svg>
);

export const StoryTimelineWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    {/* Timeline vertical bar */}
    <line x1="16" y1="8" x2="16" y2="40" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="3 3" />
    {/* Node 1 */}
    <circle cx="16" cy="14" r="5" fill="#FFF1F2" stroke="#E11D48" strokeWidth="2" />
    <line x1="24" y1="14" x2="40" y2="14" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
    {/* Node 2 - Heart */}
    <circle cx="16" cy="24" r="6" fill="#E11D48" />
    <path d="M16 27 C16 27 13 25 13 23 C13 21.8 14 21 15 21 C15.6 21 16 21.4 16 21.4 C16 21.4 16.4 21 17 21 C18 21 19 21.8 19 23 C19 25 16 27 16 27 Z" fill="#FFFFFF" />
    <line x1="25" y1="24" x2="38" y2="24" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" />
    {/* Node 3 */}
    <circle cx="16" cy="34" r="5" fill="#FFF1F2" stroke="#E11D48" strokeWidth="2" />
    <line x1="24" y1="34" x2="36" y2="34" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const DressCodeWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    {/* Hanger Hook */}
    <path d="M24 10 C24 8 26 7 27 9 C28 11 26 13 24 14" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 22 L24 14 L36 22 H12 Z" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" strokeLinejoin="round" />
    {/* Color Palette Swatches */}
    <circle cx="14" cy="33" r="5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
    <circle cx="24" cy="33" r="5" fill="#FBCFE8" stroke="#F472B6" strokeWidth="1.5" />
    <circle cx="34" cy="33" r="5" fill="#881337" stroke="#4C0519" strokeWidth="1.5" />
  </svg>
);

export const FamilyInfoWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    {/* Two pillars / Family card */}
    <rect x="8" y="10" width="14" height="28" rx="4" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
    <rect x="26" y="10" width="14" height="28" rx="4" fill="#FFF1F2" stroke="#E11D48" strokeWidth="2" />
    {/* Groom symbol */}
    <circle cx="15" cy="18" r="3" fill="#3B82F6" />
    <path d="M11 28 C11 24 19 24 19 28" stroke="#3B82F6" strokeWidth="2" />
    {/* Bride symbol */}
    <circle cx="33" cy="18" r="3" fill="#E11D48" />
    <path d="M29 28 C29 24 37 24 37 28" stroke="#E11D48" strokeWidth="2" />
    {/* Wedding knot center */}
    <circle cx="24" cy="24" r="3" fill="#F59E0B" />
  </svg>
);

export const VideoWidgetIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <rect x="6" y="10" width="36" height="28" rx="6" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
    {/* Clapper dashes top */}
    <rect x="10" y="13" width="6" height="4" fill="#EF4444" rx="1" />
    <rect x="20" y="13" width="6" height="4" fill="#FFFFFF" rx="1" />
    <rect x="30" y="13" width="6" height="4" fill="#EF4444" rx="1" />
    {/* Play triangle */}
    <polygon points="21,21 31,26 21,31" fill="#F43F5E" />
  </svg>
);
