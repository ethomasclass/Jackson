import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {IllustrationTag, Invitation, LunchTable} from '../components/Drawn';
import {Grain, InkDefs, Paper} from '../components/Paper';
import {Handwriting} from '../components/Props';
import {CHAPTER_SECONDS, SceneShell} from '../components/Scene';
import {Label, Scrap, Source} from '../components/Scrap';
import {DateTag, Rise, Stamp} from '../components/Type';
import {clamp, pop} from '../lib/anim';
import {C, F} from '../lib/theme';
import {makeTimeline, Narration, Timeline} from '../lib/timing';
import narration from '../../public/audio/v1_s6_petticoat.words.json';

const N = narration as Narration;
export const PETTICOAT_SECONDS = CHAPTER_SECONDS + N.duration + 0.5;
export const END_CARD_SECONDS = 9;

/** Chapter 5: The Petticoat Affair (1829-1831). */
export const Petticoat: React.FC<{captions: boolean}> = ({captions}) => {
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const lead = Math.round(CHAPTER_SECONDS * fps);
  const end = lead + tl.frames;
  const musicVolume = (f: number) => interpolate(f, [0, 10, end - 30, end + 15], [0, 0.17, 0.2, 0], clamp);
  return (
    <SceneShell
      narration={N}
      audio="audio/v1_s6_petticoat.wav"
      music="music/gossip.mp3"
      musicVolume={musicVolume}
      captions={captions}
      chapter={{number: 'Five', title: 'The Petticoat Affair', year: '1829–1831'}}
    >
      <Body tl={tl} />
    </SceneShell>
  );
};

const Body: React.FC<{tl: Timeline}> = ({tl}) => {
  const at = tl.at;
  const B = at('Jackson made his');
  const B2 = at('Her first husband');
  const Cb = at('The wives of');
  const C2 = at('The leader of');
  const C3 = at('Picture the worst');
  const D = at('Jackson took it');
  const D2 = at('He investigated');
  const E = at('Only one cabinet');
  const E2 = at('In 1831');
  const F2 = at('Van Buren became');
  const F3 = at('A fight over');

  return (
    <>
      {/* ============ A: gossip ============ */}
      <Rise at={at("wasn't a war")} out={B} x={960} y={300} align="center" size={60} font={F.italic} color={C.inkSoft} style={{whiteSpace: 'nowrap'}}>
        <i>Not a war. Not a money problem.</i>
      </Rise>
      <Stamp text="GOSSIP." at={at('gossip')} out={B} x={960} y={500} size={220} font={F.fat} color={C.red} rot={-4} />
      <Whispers at={at('gossip') + 6} out={B} />

      {/* ============ B: the Eatons ============ */}
      <Scrap src="cut/john_eaton.png" x={140} y={140} w={430} rot={-3} in={B} out={Cb} from="left">
        <Label name="JOHN EATON" sub="Jackson's friend · Secretary of War" at={at('John Eaton')} y="100%" size={34} />
      </Scrap>
      <Scrap src="cut/peggy_eaton.png" x={650} y={130} w={470} rot={2} in={at('Peggy Timberlake')} out={Cb} from="top">
        <Source text="Peggy Eaton, photographed decades later" at={at('Peggy Timberlake') + 8} />
        <Label name="PEGGY EATON" sub="daughter of a Washington innkeeper" at={at('Peggy Timberlake') + 6} y="100%" size={34} />
      </Scrap>
      <Stamp text="SMART" at={at('smart')} out={B2} x={1510} y={220} size={80} rot={-3} />
      <Stamp text="OUTSPOKEN" at={at('outspoken')} out={B2} x={1510} y={330} size={70} rot={2} />
      <Stamp text="“NOT RESPECTABLE”" at={at('not respectable')} out={B2} x={1510} y={480} size={50} color={C.paperLight} rot={-3}
        style={{background: C.red, padding: '10px 22px 14px'}} />
      <Rise at={at('fancy families')} out={B2} x={1510} y={560} align="center" size={34} font={F.italic} color={C.inkSoft} style={{whiteSpace: 'nowrap'}}>
        <i>— Washington's fancy families</i>
      </Rise>
      <Rise at={B2} out={Cb} x={1220} y={200} w={640} size={44}>
        Her first husband, a Navy officer, <b>died at sea.</b>
      </Rise>
      <Rise at={at('only a few months later')} out={Cb} x={1220} y={340} w={640} size={44}>
        She married Eaton <b>only a few months later.</b>
      </Rise>
      <Whispers at={at('Rumors said')} out={Cb} big />

      {/* ============ C: the snub ============ */}
      <Invitation at={Cb + 2} declineAt={at('refused to visit')} out={C2} x={120} y={170} rot={-6} to="Mrs. Eaton" />
      <Invitation at={Cb + 8} declineAt={at('refused to visit') + 8} out={C2} x={700} y={240} rot={3} to="Mrs. Eaton" />
      <Invitation at={Cb + 14} declineAt={at('invite her') + 2} out={C2} x={1280} y={160} rot={-2} to="Mrs. Eaton" />
      <IllustrationTag x={120} y={110} at={Cb + 2} out={C2} text="invitations drawn for this video" />
      <Scrap src="cut/floride.png" x={260} y={200} w={300} rot={-3} in={C2} out={C3} from="left">
        <Label name="FLORIDE CALHOUN" sub="led the snub" at={at('Floride Calhoun')} y="100%" size={30} red />
      </Scrap>
      <Scrap src="cut/calhoun.png" x={1150} y={150} w={470} rot={3} in={at('John C. Calhoun')} out={C3} from="right">
        <Label name="JOHN C. CALHOUN" sub="Jackson's vice president" at={at('John C. Calhoun') + 4} y="100%" size={34} />
      </Scrap>
      <Rise at={at('whose husband')} out={C3} x={620} y={420} size={46} font={F.italic} color={C.inkSoft}>
        <i>her husband ➜</i>
      </Rise>
      <LunchTable
        at={C3}
        aloneAt={at('except the lunch')}
        out={D}
        x={330}
        y={200}
        names={['MRS. CALHOUN', 'CABINET WIFE', 'CABINET WIFE', 'CABINET WIFE', 'CABINET WIFE', 'CABINET WIFE']}
        alone="PEGGY EATON"
      />
      <Stamp text="THE UNITED STATES GOVERNMENT" at={at('the United States government')} out={D} x={710} y={820} size={52} color={C.paperLight} rot={-1.5}
        style={{background: C.ink, padding: '10px 24px 14px'}} />
      <IllustrationTag x={340} y={160} at={C3} out={D} text="cafeteria drawn for this video" />

      {/* ============ D: Jackson takes it personally ============ */}
      <Scrap src="cut/jackson_sully.png" x={120} y={150} w={480} rot={-3} in={D} out={D2} from="left">
        <Label name="JACKSON" sub="took it personally" at={D + 4} y="100%" red />
      </Scrap>
      <Scrap src="cut/peggy_eaton.png" x={730} y={170} w={400} rot={2} in={at('Peggy reminded')} out={D2} from="bottom">
        <Label name="PEGGY" at={at('Peggy reminded') + 4} y="100%" />
      </Scrap>
      <Scrap src="cut/rachel_mourning.png" x={1290} y={170} w={480} rot={-2} in={at('of Rachel')} out={D2} from="right">
        <Label name="RACHEL" sub="died after the 1828 campaign" at={at('of Rachel') + 4} y="100%" />
      </Scrap>
      <Rise at={at('gossip had destroyed')} out={D2} x={960} y={740} align="center" size={46} font={F.italic} color={C.red} style={{whiteSpace: 'nowrap'}}>
        <i>two women he believed gossip had destroyed</i>
      </Rise>
      <Agenda tl={tl} at={D2} out={E} />

      {/* ============ E: Van Buren, the Little Magician; everyone resigns ============ */}
      <Scrap src="cut/van_buren.png" x={140} y={150} w={480} rot={-2} in={E} out={E2} from="left">
        <Source text="Henry Inman, Martin Van Buren, c. 1837" at={E + 10} />
        <Label name="MARTIN VAN BUREN" sub="Secretary of State" at={at('Martin Van Buren')} y="100%" size={34} />
      </Scrap>
      <Rise at={at('kind to the Eatons')} out={E2} x={720} y={150} w={1100} size={46}>
        The one cabinet member who was <b>kind to the Eatons.</b>
      </Rise>
      <Rise at={at('widower')} out={E2} x={720} y={290} w={1100} size={44} font={F.body} color={C.inkSoft}>
        A widower: <b>no wife to object.</b>
      </Rise>
      <Scrap src="cut/little_magician.png" x={760} y={400} w={620} rot={2} in={at('clever politician')} out={E2} from="bottom">
        <Source text="“The Little Magician,” an 1840 cartoon of Van Buren" at={at('clever politician') + 8} />
      </Scrap>
      <Stamp text="“THE LITTLE MAGICIAN”" at={at('Little Magician')} out={E2} x={1560} y={880} size={46} color={C.paperLight} rot={-3}
        style={{background: C.red, padding: '10px 20px 14px'}} />

      <Scrap src="cut/rats_leaving.png" x={140} y={100} w={560} rot={-2} in={E2} out={F2} from="drop" zoom={{to: 1.12, origin: '50% 70%', until: F2}}>
        <Source text="“The Rats Leaving a Falling House,” 1831" at={E2 + 10} />
      </Scrap>
      <Stamp text="RESIGNED" at={at('resigned')} out={F2} x={1250} y={260} size={120} color={C.red} rot={-5} />
      <Rise at={at('resigned') + 8} out={F2} x={1250} y={380} align="center" size={42} font={F.italic} color={C.inkSoft} style={{whiteSpace: 'nowrap'}}>
        <i>The cartoon shows the cabinet as rats fleeing Jackson.</i>
      </Rise>
      <Stamp text="A WHOLE NEW CABINET" at={at('replace almost')} out={F2} x={1250} y={560} size={62} rot={2} />

      {/* ============ F: the fallout ============ */}
      <Scrap src="cut/van_buren.png" x={220} y={160} w={440} rot={-2} in={F2} from="left" out={at("war with Calhoun") - 10}>
        <Label name="VAN BUREN" sub="Jackson's closest ally" at={F2 + 4} y="100%" />
      </Scrap>
      <Ladder at={at('later, his vice')} out={at('war with Calhoun') - 10} />
      <Scrap src="cut/calhoun.png" x={1300} y={160} w={440} rot={3} in={at('Calhoun became')} from="right">
        <Label name="CALHOUN" at={at('Calhoun became') + 4} y="100%" />
      </Scrap>
      <Stamp text="ENEMY" at={at('enemy')} x={1520} y={170} size={100} color={C.paperLight} rot={8} style={{background: C.red, padding: '4px 24px 12px'}} />
      <Rise at={F3} x={960} y={820} align="center" size={46} font={F.body} style={{whiteSpace: 'nowrap'}}>
        A fight over <b>dinner invitations</b> changed <b style={{color: C.red}}>who would be the next president.</b>
      </Rise>
      <Scrap src="cut/jackson_sully.png" x={200} y={130} w={460} rot={-3} in={at("war with Calhoun") - 4} from="left">
        <Label name="JACKSON" at={at("war with Calhoun")} y="100%" red />
      </Scrap>
      <Stamp text="VS." at={at('war with Calhoun')} x={960} y={420} size={160} font={F.fat} color={C.red} rot={-6} />

      <DateTag years={[[B, '1829'], [E2, '1831']]} />
    </>
  );
};

/** Speech bubbles of gossip popping up around the frame. */
const Whispers: React.FC<{at: number; out: number; big?: boolean}> = ({at, out, big}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const lines: [string, number, number][] = big
    ? [
        ['did you hear?', 1260, 520],
        ['…while he was alive?!', 1400, 640],
        ['scandalous!', 1240, 760],
      ]
    : [
        ['psst…', 300, 180],
        ['did you hear?', 1450, 170],
        ['scandalous!', 250, 760],
        ['!!!', 1580, 720],
      ];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      {lines.map(([t, x, y], i) => {
        const s = pop(frame, at + i * 7, fps, 300, 12);
        if (frame < at + i * 7) return null;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `scale(${s}) rotate(${(i % 2 ? 3 : -3)}deg)`, background: C.paperLight, border: `3px solid ${C.ink}`, borderRadius: 30, padding: '12px 26px', fontFamily: F.italic, fontStyle: 'italic', fontSize: 40, color: C.ink, boxShadow: '4px 6px 10px rgba(0,0,0,0.2)', whiteSpace: 'nowrap'}}>
            {t}
          </div>
        );
      })}
    </div>
  );
};

/** The cabinet meeting agenda — one item. */
const Agenda: React.FC<{tl: Timeline; at: number; out: number}> = ({tl, at, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const s = pop(frame, tl.at('cabinet meeting'), fps, 160, 16);
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <Rise at={at} x={140} y={170} w={620} size={50}>
        He <b>investigated the rumors himself</b>…
      </Rise>
      {frame >= tl.at('cabinet meeting') && (
        <div style={{position: 'absolute', left: 820, top: 150, width: 900, transform: `rotate(1.5deg) scale(${0.85 + 0.15 * s})`, opacity: Math.min(1, s * 2), background: '#F3EAD3', border: `1px solid ${C.inkSoft}`, boxShadow: '8px 14px 24px rgba(45,28,10,0.4)', padding: '34px 50px 44px'}}>
          <div style={{fontFamily: F.sc, fontSize: 30, letterSpacing: 4, color: C.inkSoft}}>Cabinet meeting · 1829</div>
          <div style={{fontFamily: F.fat, fontSize: 64, color: C.ink, margin: '6px 0 20px'}}>Agenda</div>
          <div style={{fontFamily: F.slab, fontSize: 34, color: C.ink, marginBottom: 8}}>ITEM 1:</div>
          <Handwriting text="Mrs. Eaton's reputation" at={tl.at('announce that') - 6} dur={24} size={64} />
          <div style={{fontFamily: F.slab, fontSize: 34, color: C.ink, margin: '20px 0 8px'}}>ITEM 2:</div>
          <div style={{fontFamily: F.italic, fontStyle: 'italic', fontSize: 36, color: C.fade}}>(nothing else)</div>
          <IllustrationTag x={50} y={-44} at={tl.at('cabinet meeting')} text="recreated for this video" />
        </div>
      )}
      <Stamp text="INNOCENT" at={tl.at('innocent')} x={1300} y={760} size={110} color={C.red} rot={-8} />
      <Stamp text="AN OFFICIAL MEETING. ABOUT THIS." at={tl.at('held an official')} x={600} y={560} size={44} color={C.paperLight} rot={-2}
        style={{background: C.ink, padding: '10px 22px 14px'}} />
    </div>
  );
};

/** Van Buren's climb: vice president, then president. */
const Ladder: React.FC<{at: number; out: number}> = ({at, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const rows: [string, string][] = [
    ['1833', 'Vice President'],
    ['1837', 'President'],
  ];
  return (
    <div style={{position: 'absolute', left: 720, top: 230, opacity: o}}>
      {rows.map(([y, t], i) => {
        const s = pop(frame, at + i * 10, fps, 200, 15);
        return (
          <div key={y} style={{display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 18, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * 60}px)`}}>
            <span style={{fontFamily: F.fat, fontSize: 64, color: i ? C.red : C.ink}}>{y}</span>
            <span style={{fontFamily: F.slab, fontSize: 40, color: C.ink}}>{t}</span>
          </div>
        );
      })}
    </div>
  );
};

/** End of Part One: credits in broadside style. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = pop(frame, 4, fps, 200, 18);
  const b = interpolate(frame, [30, 50], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <InkDefs />
      <Audio src={staticFile('sfx/boom.wav')} volume={0.6} />
      <Paper />
      <div style={{position: 'absolute', inset: 60, border: `6px solid ${C.ink}`}} />
      <div style={{position: 'absolute', inset: 76, border: `2px solid ${C.ink}`}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center'}}>
        <div style={{fontFamily: F.sc, fontSize: 44, letterSpacing: 14, color: C.inkSoft, opacity: a}}>THE AGE OF JACKSON</div>
        <div style={{fontFamily: F.fat, fontSize: 150, color: C.ink, transform: `scale(${1 + 0.4 * (1 - a)})`, opacity: a, filter: 'url(#ink)'}}>End of Part One</div>
        <div style={{background: C.red, color: C.paperLight, fontFamily: F.slab, fontSize: 40, letterSpacing: 8, padding: '10px 30px', margin: '10px 0 40px', opacity: a}}>
          TO BE CONTINUED IN PART TWO
        </div>
        <div style={{fontFamily: F.body, fontSize: 28, lineHeight: 1.5, color: C.inkSoft, maxWidth: 1400, opacity: b}}>
          Images: Library of Congress · National Gallery of Art · The Metropolitan Museum of Art · Art Institute of Chicago ·
          Saint Louis Art Museum · Tennessee State Library and Archives · Internet Archive · Wikimedia Commons
          <br />
          Items marked <b>ILLUSTRATION</b> or <b>RECREATION</b> were made for this video. Narration, music and sound effects made with ElevenLabs.
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};
