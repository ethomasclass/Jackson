import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import {C} from '../lib/theme';

/** Aged paper with a warm vignette. */
export const Paper: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: C.paper}}>
      <Img src={staticFile('cut/paper_bg.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(70,45,20,0.38) 100%)'}}
      />
    </AbsoluteFill>
  );
};

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const g = Math.floor(frame / 2);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('cut/grain.png')})`,
        backgroundPosition: `${Math.floor(random(`gx${g}`) * 512)}px ${Math.floor(random(`gy${g}`) * 512)}px`,
        opacity: 0.09,
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
      }}
    />
  );
};

/** SVG filters used across scenes: rough letterpress ink edges. */
export const InkDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={3.2} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="inkHeavy" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={3} seed={8} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={5} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves={1} seed={2} result="speck" />
        <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.35" result="holes" />
        <feComposite in="d" in2="holes" operator="in" />
      </filter>
    </defs>
  </svg>
);
