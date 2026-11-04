import React from 'react';

const paths = {
  alert: ['M12 3 2.8 19a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L12 3Z', 'M12 9v4', 'M12 17h.01'],
  arrows: ['M17 3l4 4-4 4', 'M3 7h18', 'M7 21l-4-4 4-4', 'M21 17H3'],
  arrowRight: ['M5 12h14', 'm12 5 7 7-7 7'],
  arrowLeft: ['M19 12H5', 'm12 19-7-7 7-7'],
  arrowUpRight: ['M7 17 17 7', 'M7 7h10v10'],
  chart: ['M3 3v18h18', 'm19 9-5 5-4-4-5 5', 'M19 9v5h-5'],
  check: ['m5 12 4 4L19 6'],
  coins: ['M12 8c-4.4 0-8-1.3-8-3s3.6-3 8-3 8 1.3 8 3-3.6 3-8 3Z', 'M4 5v6c0 1.7 3.6 3 8 3 1.6 0 3.1-.2 4.4-.6', 'M4 11v6c0 1.7 3.6 3 8 3 1.4 0 2.8-.2 4-.5', 'M20 12v8', 'M17 15h6', 'M20 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z'],
  file: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M8 13h8', 'M8 17h8', 'M8 9h2'],
  eye: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
  eyeOff: ['m3 3 18 18', 'M10.6 10.6a2 2 0 0 0 2.8 2.8', 'M9.9 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a15.7 15.7 0 0 1-3.1 3.8', 'M6.6 6.6C3.7 8.3 2 12 2 12s3.6 7 10 7a10.7 10.7 0 0 0 3.3-.5'],
  grid: ['M3 3h8v8H3z', 'M13 3h8v5h-8z', 'M13 10h8v11h-8z', 'M3 13h8v8H3z'],
  info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 11v5', 'M12 7h.01'],
  landmark: ['m3 10 9-7 9 7', 'M4 10h16', 'M5 10v9', 'M9 10v9', 'M15 10v9', 'M19 10v9', 'M3 21h18'],
  lock: ['M5 11h14v10H5z', 'M8 11V7a4 4 0 1 1 8 0v4', 'M12 15v2'],
  phone: ['M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.7L7.1 10a16 16 0 0 0 6 6l1.6-1.9a2 2 0 0 1 1.7-.6l3 .5a2 2 0 0 1 1.6 1.9Z'],
  play: ['m8 5 12 7-12 7z'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'm21 21-4.4-4.4'],
  shield: ['M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z', 'm9 12 2 2 4-4'],
  sparkles: ['m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z', 'm19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z', 'm5 2 .8 2.2L8 5l-2.2.8L5 8l-.8-2.2L2 5l2.2-.8L5 2Z'],
  trendingUp: ['M3 17 9 11l4 4 8-8', 'M15 7h6v6'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M20 21v-2a4 4 0 0 0-3-3.9', 'M16 3.1a4 4 0 0 1 0 7.8'],
  wallet: ['M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6', 'M20 12h-5a2 2 0 0 0 0 4h5', 'M15 14h.01'],
};

export default function Icon({ name, size = 20, strokeWidth = 1.8, className, ...props }) {
  const iconPaths = paths[name];
  if (!iconPaths) throw new Error(`Unknown icon: ${name}`);

  return (
    <svg
      aria-hidden="true"
      className={className ? `app-icon ${className}` : 'app-icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...props}
    >
      {iconPaths.map((path) => <path key={path} d={path} />)}
    </svg>
  );
}
