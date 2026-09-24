import React, {useMemo} from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../lib/anim';
import {C, F} from '../lib/theme';
import type {Word} from '../lib/timing';

const MAX_CHARS = 46;

/** Split narration into caption chunks at sentence/clause ends, never longer than MAX_CHARS. */
const chunk = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  let len = 0;
  words.forEach((w, i) => {
    cur.push(w);
    len += w.w.length + 1;
    const next = words[i + 1];
    const clauseEnd = /[.?!]$/.test(w.w) || (/[,;:]$/.test(w.w) && len > 22);
    const tooLong = next && len + next.w.length > MAX_CHARS;
    if (!next || clauseEnd || tooLong || w.para_end) {
      out.push(cur);
      cur = [];
      len = 0;
    }
  });
  return out;
};

/**
 * Burned-in captions. Words light up as they are spoken; key ideas print in red, vocabulary is
 * red and underlined, so the emphasis students hear is the emphasis they read.
 */
export const Captions: React.FC<{words: Word[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunks = useMemo(() => chunk(words), [words]);
  // show the latest chunk that has started; hold it through short pauses
  let ci = -1;
  chunks.forEach((c, i) => {
    if (t >= c[0].s - 0.05) ci = i;
  });
  if (ci < 0) return null;
  const c = chunks[ci];
  const last = c[c.length - 1];
  const nextStart = chunks[ci + 1]?.[0].s ?? Infinity;
  if (t > last.e + 0.9 && t < nextStart) return null;
  const fadeIn = interpolate(t, [c[0].s - 0.05, c[0].s + 0.08], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 46,
        transform: 'translateX(-50%)',
        maxWidth: 1500,
        padding: '14px 40px 18px',
        background: 'rgba(247,241,226,0.94)',
        borderTop: `3px solid ${C.ink}`,
        borderBottom: `3px solid ${C.ink}`,
        boxShadow: '0 6px 16px rgba(40,25,10,0.25)',
        textAlign: 'center',
        fontFamily: F.body,
        fontSize: 50,
        lineHeight: 1.2,
        color: C.ink,
        whiteSpace: 'nowrap',
        opacity: fadeIn,
      }}
    >
      {c.map((w, i) => {
        const spoken = t >= w.s - 0.03;
        const style: React.CSSProperties = {opacity: spoken ? 1 : 0.42};
        if (w.k) {
          style.color = C.red;
          style.fontWeight = 700;
        }
        if (w.k === 'vocab') {
          style.textDecoration = 'underline';
          style.textDecorationThickness = 4;
          style.textUnderlineOffset = 8;
        }
        return (
          <span key={i} style={style}>
            {w.w}
            {i < c.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
};
