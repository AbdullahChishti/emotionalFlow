import React from 'react';

export const DoodleHeart = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19.5 12.572c-2.936 4.11-7.5 6.428-7.5 6.428s-4.564-2.318-7.5-6.428C1.5 8.462 4.436 4 12 4s10.5 4.462 7.5 8.572z" strokeDasharray="80" strokeDashoffset="0"></path>
  </svg>
);

export const DoodleLightbulb = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6M10 22h4M12 2a7 7 0 00-7 7c0 3.034 1.96 5.58 4.5 6.5v.5h5v-.5c2.54-.92 4.5-3.466 4.5-6.5a7 7 0 00-7-7z"></path>
    <path d="M12 16v-2.5"></path>
  </svg>
);

export const DoodleSparkle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.5 5L19 9.5l-5 2.5L12 17l-2.5-5L5 9.5l5-2.5L12 2z"></path>
    <path d="M5 15l1.5 3L8 19.5l-3 1.5L3.5 18 2 15z"></path>
    <path d="M19 15l1.5 3L22 19.5l-3 1.5L17.5 18 16 15z"></path>
  </svg>
);

export const DoodleArrow = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="M12 5l7 7-7 7"></path>
  </svg>
);
