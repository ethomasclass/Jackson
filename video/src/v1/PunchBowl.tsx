import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {PunchTub} from '../components/Drawn';
import {Handwriting} from '../components/Props';
import {CHAPTER_SECONDS, Cue, SceneShell, Sfx} from '../components/Scene';
import {Label, Scrap, Source} from '../components/Scrap';
import {DateTag, Rise, Stamp, VocabCard} from '../components/Type';
import {clamp, pop, prog} from '../lib/anim';
import {C, F} from '../lib/theme';
import {makeTimeline, Narration, Timeline} from '../lib/timing';
import narration from '../../public/audio/v1_s5_punch_bowl.words.json';

const N = narration as Narration;
export const PUNCH_BOWL_SECONDS = CHAPTER_SECONDS + N.duration + 0.5;

/** Chapter 4: The Punch Bowl Presidency (1829). */
export const PunchBowl: React.FC<{captions: boolean}> = ({captions}) => {
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const lead = Math.round(CHAPTER_SECONDS * fps);
  const home = lead + tl.at('Once the crowd');
  const musicVolume = (f: number) => interpolate(f, [0, 10, home - 20, home + 10], [0, 0.16, 0.16, 0], clamp);
  return (
    <SceneShell
      narration={N}
      audio="audio/v1_s5_punch_bowl.wav"
      music="music/campaign.mp3"
      musicVolume={musicVolume}
      captions={captions}
      chapter={{number: 'Four', title: 'The Punch Bowl Presidency', year: '1829'}}
    >
      <Body tl={tl} />
    </SceneShell>
  );
};

const Body: React.FC<{tl: Timeline}> = ({tl}) => {
  const at = tl.at;
  const A2 = at('Staff finally');
  const A3 = at('Jackson reportedly');
  const B = at('Once the crowd');
  const B2 = at('A senator named');
  const B3 = at('Imagine your best');
  const Cb = at('Jackson also had');

  return (
    <>
      <Cue src="music/intrigue.mp3" at={B - 10} until={at('weird') - 4} level={0.12} fadeOut={8} />

      {/* ============ A: the party ============ */}
      <Scrap src="cut/presidents_levee.png" x={100} y={110} w={1250} rot={-1.5} in={0} out={A2} from="drop" zoom={{to: 1.18, origin: '55% 70%', until: A2}}>
        <Source text="Robert Cruikshank's 1841 print of the 1829 inauguration party" at={10} />
      </Scrap>
      <Sfx src="rowdy_crowd" at={at('thousands of his fans')} volume={0.4} />
      <Stamp text="THOUSANDS" at={at('thousands')} out={A2} x={1590} y={260} size={90} color={C.red} rot={-4} />
      <Rise at={at('open to the public')} out={A2} x={1440} y={350} w={420} size={40} font={F.italic} color={C.inkSoft}>
        <i>The White House was open to the public.</i>
      </Rise>
      <Stamp text="MUDDY BOOTS" at={at('muddy boots')} out={A2} x={1600} y={560} size={60} rot={3} />
      <Stamp text="SMASH!" at={at('broke glasses')} out={A2} x={1600} y={700} size={90} color={C.paperLight} rot={-6}
        style={{background: C.red, padding: '6px 26px 12px'}} sfx={false} />
      <Sfx src="smash" at={at('broke glasses') + 2} volume={0.55} />

      <PunchTub at={A2 + 2} walk={at('out onto the lawn')} out={A3} x={300} y={420} s={1.1} />
      <PunchTub at={A2 + 8} walk={at('out onto the lawn') + 6} out={A3} x={700} y={470} s={0.95} tilt={-4} />
      <PunchTub at={A2 + 14} walk={at('out onto the lawn') + 12} out={A3} x={1060} y={430} s={1.05} tilt={3} />
      <Stamp text="TUBS OF PUNCH" at={at('tubs of punch')} out={A3} x={620} y={200} size={80} rot={-2} />
      <Rise at={at('onto the lawn')} out={A3} x={1380} y={480} size={64} font={F.slab} color={C.red} style={{whiteSpace: 'nowrap'}}>
        ➜ THE LAWN
      </Rise>
      <Stamp text="CRISIS SOLVED:" at={at('a crisis was solved')} out={A3} x={960} y={760} size={52} rot={-1} />
      <Stamp text="RELOCATE THE PUNCH" at={at('relocating the punch')} out={A3} x={960} y={850} size={66} color={C.paperLight} rot={-2}
        style={{background: C.red, padding: '10px 28px 16px'}} />

      <Scrap src="cut/jackson_sully.png" x={640} y={150} w={520} rot={-4} in={A3} out={B} from="left" to="right">
        <Label name="JACKSON" sub="slipped out to a hotel" at={A3 + 6} y="100%" />
      </Scrap>
      <Rise at={at('reportedly')} out={B} x={1230} y={240} size={46} font={F.italic} color={C.inkSoft}>
        <i>(reportedly)</i>
      </Rise>
      <Stamp text="AT HIS OWN PARTY." at={at('At his own party')} out={B} x={960} y={820} size={80} color={C.red} rot={-3} />

      {/* ============ B: the spoils system ============ */}
      <JobBoard tl={tl} at={B} out={B2} />
      <Scrap src="cut/marcy.png" x={130} y={150} w={520} rot={-2} in={B2} out={B3} from="left">
        <Source text="Samuel Waldo, portrait of William L. Marcy" at={B2 + 8} />
        <Label name="WILLIAM MARCY" sub="senator from New York" at={at('William Marcy')} y="100%" />
      </Scrap>
      <Quote at={at('To the victor')} out={at('Spoils means')} />
      <VocabCard
        term="spoils"
        say="SPOYLZ"
        pos="noun"
        defFrom="the prizes you take after winning"
        defWords={6}
        at={at('Spoils means') - 2}
        out={at('So it became')}
        tl={tl}
        x={800}
        y={200}
        w={820}
        termSize={120}
      />
      <VocabCard
        term="spoils system"
        say="SPOYLZ SIS-tum"
        pos="noun"
        def="giving government jobs to the people who helped the winner win."
        at={at('spoils system') - 4}
        out={B3}
        tl={tl}
        x={800}
        y={200}
        w={820}
        termSize={104}
      />
      <PromBudget tl={tl} at={B3} out={Cb} />

      {/* ============ C: the cabinet ============ */}
      <VocabCard
        term="cabinet"
        say="KAB-uh-nit"
        pos="noun"
        defFrom="the top advisers who run departments"
        defWords={6}
        at={at('cabinet') - 3}
        tl={tl}
        x={1150}
        y={140}
        w={700}
        termSize={120}
      />
      <CabinetTable at={Cb} weirdAt={at('weird')} />
      <DateTag years={[[0, '1829']]} out={Cb} />
    </>
  );
};

/** Office signs for government jobs; they flip to "Jackson supporter". */
const JobBoard: React.FC<{tl: Timeline; at: number; out: number}> = ({tl, at, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const flip = tl.at('people who had supported');
  const jobs = ['POSTMASTER', 'TAX COLLECTOR', 'CUSTOMS OFFICER', 'CLERK', 'LAND OFFICE AGENT', 'MARSHAL'];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <Stamp text="GOVERNMENT JOBS" at={at + 4} x={960} y={110} size={70} rot={-1} />
      {jobs.map((j, i) => {
        const s = pop(frame, tl.at('government jobs') + i * 4, fps, 200, 15);
        const f = prog(frame, flip + i * 3, flip + i * 3 + 10);
        const x = 180 + (i % 3) * 540;
        const y = 220 + Math.floor(i / 3) * 190;
        const back = f > 0.5;
        return (
          <div
            key={j}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 480,
              height: 130,
              transform: `scale(${s}) rotateX(${f * 180}deg)`,
              background: back ? C.red : C.paperLight,
              border: `4px solid ${C.ink}`,
              boxShadow: '6px 10px 18px rgba(45,28,10,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <div style={{transform: back ? 'rotateX(180deg)' : 'none', textAlign: 'center'}}>
              <div style={{fontFamily: F.slab, fontSize: back ? 34 : 38, color: back ? C.paperLight : C.ink}}>{back ? 'JACKSON SUPPORTER' : j}</div>
              {!back && <div style={{fontFamily: F.italic, fontStyle: 'italic', fontSize: 26, color: C.inkSoft}}>held for years</div>}
            </div>
          </div>
        );
      })}
      <Rise at={tl.at('nobody should own')} x={960} y={640} align="center" size={50} font={F.body} style={{whiteSpace: 'nowrap'}}>
        Jackson: <b>nobody should own a government job forever.</b>
      </Rise>
      <Rise at={tl.at('any ordinary citizen')} x={960} y={720} align="center" size={44} font={F.italic} color={C.inkSoft} style={{whiteSpace: 'nowrap'}}>
        <i>Any ordinary citizen is smart enough to do one.</i>
      </Rise>
      <Stamp text="IN PRACTICE…" at={tl.at('In practice')} x={960} y={830} size={60} color={C.red} rot={-2} />
    </div>
  );
};

/** Marcy's line, as printed. */
const Quote: React.FC<{at: number; out: number}> = ({at, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const s = pop(frame, at, fps, 200, 16);
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 780, top: 260, width: 1020, opacity: o * Math.min(1, s * 2), transform: `scale(${0.9 + 0.1 * s}) rotate(-1deg)`}}>
      <div style={{fontFamily: F.fat, fontSize: 104, lineHeight: 1.05, color: C.ink, filter: 'url(#ink)'}}>
        “To the victor belong the <span style={{color: C.red}}>spoils.</span>”
      </div>
      <div style={{fontFamily: F.sc, fontSize: 32, color: C.inkSoft, marginTop: 20}}>— Senator William L. Marcy, 1832</div>
    </div>
  );
};

/** A modern ledger with very bad math. */
const PromBudget: React.FC<{tl: Timeline; at: number; out: number}> = ({tl, at, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const s = pop(frame, tl.at('prom budget'), fps, 160, 16);
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const bad = tl.at('bad at math');
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <Rise at={at} x={140} y={150} w={700} size={52}>
        Your best friend wins <b>class president</b>…
      </Rise>
      <Rise at={tl.at('puts you in charge')} x={140} y={300} w={700} size={52}>
        …and puts <b>you</b> in charge of the <Em2>prom budget.</Em2>
      </Rise>
      {frame >= tl.at('prom budget') && (
        <div style={{position: 'absolute', left: 980, top: 170, transform: `rotate(2deg) scale(${s})`, width: 720, height: 560, background: '#FBFAF4', boxShadow: '8px 14px 24px rgba(45,28,10,0.35)', backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 69px, #9CB6D6 69px, #9CB6D6 71px)', backgroundPosition: '0 110px', padding: '30px 40px 0 90px'}}>
          <div style={{position: 'absolute', left: 70, top: 0, bottom: 0, width: 3, background: '#D98C8C'}} />
          <div style={{fontFamily: F.slab, fontSize: 46, color: C.ink}}>PROM BUDGET</div>
          <div style={{marginTop: 34, lineHeight: '71px'}}>
            <div><Handwriting text="DJ .......... $300" at={tl.at('prom budget') + 4} dur={14} size={52} color="#2B3E73" /></div>
            <div><Handwriting text="Snacks ...... $200" at={tl.at('prom budget') + 18} dur={14} size={52} color="#2B3E73" /></div>
            <div><Handwriting text="Total ....... $5,000" at={tl.at('Less great') - 4} dur={16} size={52} color="#2B3E73" /></div>
          </div>
          {frame >= bad && (
            <div style={{position: 'absolute', right: 40, bottom: 110, transform: `rotate(-10deg) scale(${pop(frame, bad, fps, 400, 14)})`, color: C.red, fontFamily: F.slab, fontSize: 70, border: `6px solid ${C.red}`, padding: '0 20px', filter: 'url(#ink)'}}>
              ✗
            </div>
          )}
        </div>
      )}
      <Stamp text="GREAT FOR YOU." at={tl.at('Great for you')} x={440} y={560} size={64} rot={-3} />
      <Stamp text="LESS GREAT FOR PROM." at={tl.at('Less great')} x={470} y={680} size={56} color={C.red} rot={2} />
    </div>
  );
};

const Em2: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: C.red, fontWeight: 700}}>{children}</span>;

/** Top-down cabinet table, departments at their seats. */
const CabinetTable: React.FC<{at: number; weirdAt: number}> = ({at, weirdAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const s = pop(frame, at, fps, 120, 17);
  const seats: [string, number, number][] = [
    ['STATE', 180, 180],
    ['TREASURY', 480, 180],
    ['WAR', 780, 180],
    ['NAVY', 180, 640],
    ['ATTORNEY GENERAL', 480, 640],
    ['POSTMASTER GENERAL', 780, 640],
  ];
  const wobble = frame > weirdAt ? Math.sin((frame - weirdAt) / 2.5) * 3 * Math.exp(-(frame - weirdAt) / 30) : 0;
  return (
    <div style={{position: 'absolute', left: 80, top: 40, opacity: s, transform: `scale(${0.9 + 0.1 * s}) rotate(${wobble}deg)`}}>
      <div style={{position: 'absolute', left: 120, top: 260, width: 820, height: 320, background: '#8C5A34', border: `6px solid ${C.ink}`, borderRadius: 160, boxShadow: '10px 16px 28px rgba(45,28,10,0.4)', backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 3px, transparent 3px 30px)'}} />
      <div style={{position: 'absolute', left: 530 - 120, top: 380, width: 240, textAlign: 'center', fontFamily: F.sc, fontSize: 36, color: C.paperLight}}>the President</div>
      {seats.map(([name, x, y], i) => {
        const p = pop(frame, at + 6 + i * 3, fps, 220, 14);
        return (
          <div key={name} style={{position: 'absolute', left: x, top: y, width: 280, transform: `scale(${p})`, textAlign: 'center'}}>
            <div style={{background: C.paperLight, border: `3px solid ${C.ink}`, fontFamily: F.slab, fontSize: 26, padding: '14px 8px', boxShadow: '4px 6px 10px rgba(0,0,0,0.25)'}}>{name}</div>
          </div>
        );
      })}
      {frame >= weirdAt && (
        <div style={{position: 'absolute', left: 880, top: 800, transform: `translate(-50%, -50%) rotate(-4deg) scale(${pop(frame, weirdAt, fps, 400, 14)})`, fontFamily: F.slab, fontSize: 90, color: C.red, whiteSpace: 'nowrap'}}>
          …AND THEN IT GOT WEIRD.
        </div>
      )}
      <Sfx src="page_turn" at={weirdAt + 20} volume={0.4} />
    </div>
  );
};
