// Chapter 4 · The Corrupt Bargain (the election of 1824)
import React from 'react';
import {AbsoluteFill, interpolate, random} from 'remotion';
import words from '../../../public/audio/v3_ch04_corrupt_bargain.words.json';
import {clamp} from '../../lib/anim';
import {Highlight, JF, Note, Tag, useGFrame, usePal} from '../Kit';
import {DarkPaper, Sfx, WRITE} from '../common';
import {Tiles} from '../tiles';
import {ChapterShell, chapterFrames, CropCard, Definition, LEAD, makeTimeline, type Narration, Photo, Quote, Stamp, type TL, useScene} from '../shell';

const N = words as Narration;
export const CH04_FRAMES = chapterFrames(N, LEAD);

const TEAL = '#2FE0C4';
const CORAL = '#FF6F61';
const CREAM = '#EDE7DC';
const ORANGE = '#FF9F1C';

const CANDS = [
  {name: 'Andrew Jackson', src: 'img/jackson_sully_1845.jpg', size: [1920, 2288] as [number, number], fy: 950, cue: 'Jackson', nth: 2, ev: 99, color: CORAL},
  {nth: 1, name: 'John Quincy Adams', src: 'img/jqa_stuart_1818.jpg', size: [1920, 2322] as [number, number], fy: 900, cue: 'Quincy', ev: 84, color: TEAL},
  {nth: 1, name: 'William Crawford', src: 'img/crawford_bep.jpg', size: [1920, 2560] as [number, number], fy: 1100, cue: 'Crawford', ev: 41, color: CREAM},
  {nth: 1, name: 'Henry Clay', src: 'img/clay_jouett.jpg', size: [1920, 2319] as [number, number], fy: 950, cue: 'Clay', ev: 37, color: ORANGE},
];

const Four: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <AbsoluteFill>
      <DarkPaper />
      {g >= 0 && <Highlight text="1824" x={100} y={70} size={110} at={1} seed={401} rot={-2} />}
      <Note text="and it was a mess." x={430} y={100} size={60} rot={-3} at={t.at('mess')} color="#ffffff" />
      {CANDS.map((c, i) => {
        const at = t.at(c.cue, c.nth ?? 1) - 1;
        return (
          <React.Fragment key={c.name}>
            <CropCard src={c.src} size={c.size} x={120 + i * 440} y={300} w={330} h={430} fx={960} fy={c.fy} scale={0.27} rot={i % 2 ? 2 : -2} at={at} />
            {g >= at && <div style={{position: 'absolute', left: 110 + i * 440, top: 770, width: 360, textAlign: 'center', fontFamily: JF.mono, fontSize: 24, letterSpacing: 2, color: '#f4efe6', textTransform: 'uppercase'}}>{c.name}</div>}
          </React.Fragment>
        );
      })}
      <Note text="all from the same party: the Democratic-Republicans" x={220} y={880} size={48} rot={-2} at={t.at('same')} />
      <Tag text="Portraits: Sully (Jackson), Stuart (Adams), Bureau of Engraving and Printing (Crawford), Jouett (Clay)" />
    </AbsoluteFill>
  );
};

/** Electoral votes against the 131 needed. */
const Tally: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const a = t.at('electoral');
  const x0 = 520;
  const px = 5.2;
  const line = t.at('131');
  return (
    <AbsoluteFill>
      <DarkPaper />
      <Note text="electoral votes" x={110} y={80} size={58} rot={-3} at={t.at('electoral')} />
      {CANDS.map((c, i) => {
        const y = 250 + i * 150;
        const p = interpolate(g, [a + i * 3, a + i * 3 + 14], [0, 1], clamp);
        return (
          <React.Fragment key={c.name}>
            <div style={{position: 'absolute', left: 110, top: y + 20, width: 380, fontFamily: JF.display, fontSize: 44, color: '#f4efe6', textAlign: 'right'}}>{c.name.split(' ').slice(-1)[0]}</div>
            <div style={{position: 'absolute', left: x0, top: y, height: 90, width: c.ev * px * p, background: c.color, boxShadow: '0 8px 16px rgba(0,0,0,0.5)'}} />
            {p >= 1 && <div style={{position: 'absolute', left: x0 + c.ev * px + 24, top: y + 12, fontFamily: JF.display, fontSize: 60, color: '#f4efe6'}}>{c.ev}</div>}
          </React.Fragment>
        );
      })}
      {g >= line && (
        <>
          <div style={{position: 'absolute', left: x0 + 131 * px, top: 200, width: 8, height: interpolate(g, [line, line + 8], [0, 640], clamp), background: pal.mark}} />
          <Note text="131 needed" x={x0 + 131 * px + 30} y={150} size={60} rot={-3} at={line} />
        </>
      )}
      {g >= t.at('majority') && <Highlight text="NO MAJORITY" x={1250} y={560} size={90} at={t.at('majority')} seed={403} rot={-3} />}
      <Definition term="ma·jor·i·ty" def="more than half" at={t.at('meaning')} x={1250} y={730} w={600} />
    </AbsoluteFill>
  );
};

/** The Twelfth Amendment: top three only, one vote per state. */
const Twelfth: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const out = t.at('fourth');
  return (
    <AbsoluteFill>
      <DarkPaper />
      {g >= t.at('Twelfth') && <Highlight text="THE 12TH AMENDMENT" x={100} y={70} size={90} at={t.at('Twelfth')} seed={405} rot={-2} />}
      <Note text="→ the House of Representatives decides" x={120} y={210} size={52} rot={-2} at={t.at('House')} />
      {CANDS.map((c, i) => {
        const y = 360 + i * 120;
        const cross = interpolate(g, [out, out + 6], [0, 1], clamp);
        return g >= t.at('top') - 4 + i * 2 ? (
          <div key={c.name} style={{position: 'absolute', left: 180, top: y}}>
            <div style={{fontFamily: JF.display, fontSize: 64, color: i === 3 ? 'rgba(244,239,230,0.6)' : '#f4efe6'}}>{i + 1}. {c.name}</div>
            {i === 3 && <div style={{position: 'absolute', left: -10, top: 40, height: 9, width: 620 * cross, background: pal.subject, transform: 'rotate(-2deg)'}} />}
          </div>
        ) : null;
      })}
      {g >= t.at('top') && <div style={{position: 'absolute', left: 130, top: 370, width: 10, height: 330, background: pal.mark}} />}
      <Note text="top three only" x={960} y={420} size={60} rot={-3} at={t.at('top')} />
      <Note text="one vote per state" x={960} y={530} size={60} rot={-3} at={t.at('delegation')} color="#ffffff" />
      <Note text="Clay: out" x={960} y={740} size={64} rot={-3} at={out} color={pal.subject} />
    </AbsoluteFill>
  );
};

const Speaker: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const a = t.at('But he was');
  return (
    <Photo src="img/house_morse_1822.jpg" size={[1920, 1261]} fx={960} fy={640} a={a} b={t.at('And Clay')} z0={1.05} z1={1.16}>
      {() => (
        <>
          {g >= t.at('Speaker') && <Highlight text="SPEAKER OF THE HOUSE" x={100} y={90} size={84} at={t.at('Speaker')} seed={407} rot={-2} />}
          <Note text="the most powerful man in the room" x={120} y={880} size={60} rot={-3} at={t.at('powerful')} />
          <Tag text="Samuel F. B. Morse, The House of Representatives, 1822 · National Gallery of Art" />
        </>
      )}
    </Photo>
  );
};

const Chieftain: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard src="img/clay_jouett.jpg" size={[1920, 2319]} x={140} y={130} w={560} h={760} fx={960} fy={1050} scale={0.45} rot={-2} at={t.at('And Clay') - 1} />
      <Note text="Clay could not stand Jackson" x={820} y={130} size={56} rot={-3} at={t.at('stand')} color="#ffffff" />
      <Quote text="military chieftain" at={t.at('military')} x={820} y={300} w={1000} size={96} />
      <Note text="(no business being president)" x={840} y={480} size={50} rot={-2} at={t.at('business')} color="#ffffff" />
      {g >= t.at('Adams', 1) && <Highlight text="CLAY → ADAMS" x={820} y={640} size={100} at={t.at('support')} seed={409} rot={-3} />}
      <Tag text="Matthew Harris Jouett, Henry Clay, c. 1818 · Transylvania University" />
    </AbsoluteFill>
  );
};

/** The House vote, 9 February 1825: Adams 13, Jackson 7, Crawford 4. */
const HOUSE: Record<string, 'A' | 'J' | 'C'> = {
  CT: 'A', IL: 'A', KY: 'A', LA: 'A', ME: 'A', MD: 'A', MA: 'A', MO: 'A', NH: 'A', NY: 'A', OH: 'A', RI: 'A', VT: 'A',
  AL: 'J', IN: 'J', MS: 'J', NJ: 'J', PA: 'J', SC: 'J', TN: 'J',
  DE: 'C', GA: 'C', NC: 'C', VA: 'C',
};
const ORDER = ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'DE', 'MD', 'VA', 'NC', 'SC', 'GA', 'AL', 'MS', 'LA', 'TN', 'OH', 'IN', 'IL', 'MO'];

const HouseVote: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const ky = t.at('Kentucky');
  const flip = t.at('anyway');
  const b0 = t.at('first');
  const b1 = t.at('thirteen');
  const col = {A: TEAL, J: CORAL, C: CREAM};
  const adams = ORDER.filter((c) => HOUSE[c] === 'A').length;
  const shown = ORDER.filter((c, i) => g >= b0 + (i * (b1 - b0)) / ORDER.length && HOUSE[c] === 'A').length + (g >= flip ? 1 : 0);
  return (
    <AbsoluteFill>
      <DarkPaper />
      <Note text="the House votes: one vote per state" x={100} y={70} size={52} rot={-3} at={1} />
      <Tiles x={-190} y={180} size={92} gap={10} appear={0} state={(c) => ({
        fill: col[HOUSE[c]],
        at: c === 'KY' ? flip : b0 + (ORDER.indexOf(c) * (b1 - b0)) / ORDER.length,
        ring: c === 'KY' ? ky : undefined,
      })} />
      <Note text="Kentucky was told:" x={1020} y={210} size={48} rot={-3} at={ky} color="#ffffff" />
      <Note text="vote Jackson" x={1040} y={290} size={48} rot={-3} at={ky} color="#ffffff" />
      <Note text="...most voted Adams anyway" x={1060} y={380} size={48} rot={-3} at={flip} color={pal.mark} />
      {g >= b0 && <div style={{position: 'absolute', left: 1070, top: 520, fontFamily: JF.mono, fontSize: 30, letterSpacing: 3, color: '#f4efe6'}}>ADAMS</div>}
      {g >= b0 && <Stamp text={`${Math.min(adams, shown)}`} x={1060} y={560} at={b0} size={200} color={TEAL} />}
      {g >= b1 && <Note text="exactly the 13 he needed" x={1040} y={820} size={56} rot={-3} at={b1} />}
      <Tag text="House vote of February 9, 1825 · Adams 13 states, Jackson 7, Crawford 4" />
    </AbsoluteFill>
  );
};

const Secretary: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard src="img/jqa_stuart_1818.jpg" size={[1920, 2322]} x={150} y={180} w={440} h={580} fx={960} fy={950} scale={0.34} rot={-2} at={t.at('Days') - 1} />
      <CropCard src="img/clay_jouett.jpg" size={[1920, 2319]} x={700} y={240} w={440} h={580} fx={960} fy={1000} scale={0.34} rot={2} at={t.at('named') - 1} />
      <Note text="President Adams" x={170} y={830} size={48} rot={-2} at={t.at('President', 3)} color="#ffffff" />
      {g >= t.at('Secretary') && <Highlight text="SECRETARY OF STATE" x={1180} y={300} size={62} at={t.at('Secretary')} seed={411} rot={-3} />}
      <Note text="Henry Clay" x={760} y={880} size={48} rot={-2} at={t.at('named')} color="#ffffff" />
      <Note text="the usual stepping-stone" x={1220} y={450} size={50} rot={-3} at={t.at('stepping-stone')} />
      <Note text="to the presidency" x={1250} y={530} size={50} rot={-3} at={t.at('presidency')} />
      <Tag text="Gilbert Stuart, John Quincy Adams, 1818 · Jouett, Henry Clay, c. 1818" />
    </AbsoluteFill>
  );
};

/** Thirty pieces of silver. */
const Judas: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const c0 = t.at('thirty');
  return (
    <AbsoluteFill>
      <DarkPaper />
      {g >= t.at('Corrupt') && <Highlight text="THE “CORRUPT BARGAIN”" x={100} y={70} size={96} at={t.at('Corrupt')} seed={413} rot={-2} />}
      <Quote text="the Judas of the West has closed the contract and will receive the thirty pieces of silver." at={t.at('Judas')} x={120} y={260} w={1100} size={58} who="Andrew Jackson, letter, February 1825" />
      {Array.from({length: 30}).map((_, i) => {
        const at = c0 + Math.floor(i / 3);
        if (g < at) return null;
        const x = 1330 + (i % 6) * 88 + random(`cx${i}`) * 16;
        const y = 300 + Math.floor(i / 6) * 88 + random(`cy${i}`) * 16;
        const k = interpolate(g, [at, at + 3], [1.3, 1], clamp);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 72, height: 72, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #ffffff, #b9bcc2 55%, #7d8088)',
          border: '3px solid #2a2a2a', transform: `scale(${k})`, boxShadow: '0 6px 10px rgba(0,0,0,0.6)'}} />;
      })}
      <Note text="Okay. Dramatic." x={1300} y={820} size={72} rot={-4} at={t.at('Okay')} color={pal.subject} />
    </AbsoluteFill>
  );
};

const Insiders: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const a = t.at("There's");
  return (
    <Photo src="img/house_morse_1822.jpg" size={[1920, 1261]} fx={960} fy={600} a={a} b={a + 600} z0={1.3} z1={1.45} vignette={0.8}>
      {() => (
        <>
          <Note text="no proof of an actual deal" x={110} y={90} size={56} rot={-3} at={t.at('proof')} color="#ffffff" />
          <Note text="but to Jackson: Washington was run by insiders" x={110} y={190} size={52} rot={-3} at={t.at('insiders')} />
          <Note text="quit the Senate → running for 1828" x={110} y={290} size={52} rot={-3} at={t.at('quit')} color="#ffffff" />
          {g >= t.at('Insiders', 2) && <Highlight text="INSIDERS" x={220} y={560} size={120} at={t.at('Insiders', 2)} seed={415} rot={-3} />}
          {g >= t.at('versus') && <div style={{position: 'absolute', left: 900, top: 600, fontFamily: JF.display, fontSize: 80, color: '#f4efe6', textShadow: '0 4px 16px #000'}}>vs.</div>}
          {g >= t.at('people', 2) && <Highlight text="THE PEOPLE" x={1060} y={560} size={120} at={t.at('people', 2)} seed={417} rot={-2} />}
          <Note text="(this idea drives everything)" x={900} y={820} size={52} rot={-2} at={t.at('drives')} color={pal.subject} />
          <Tag text="Samuel F. B. Morse, The House of Representatives, 1822 · National Gallery of Art" />
        </>
      )}
    </Photo>
  );
};

const Body: React.FC = () => {
  const t = makeTimeline(N, 30);
  const at = t.at;
  const cuts: [number, React.ReactNode][] = [
    [0, <Four t={t} />],
    [at('Jackson won') - 1, <Tally t={t} />],
    [at('When nobody') - 1, <Twelfth t={t} />],
    [at('But he was') - 1, <Speaker t={t} />],
    [at('And Clay') - 1, <Chieftain t={t} />],
    [at("Clay's home") - 1, <HouseVote t={t} />],
    [at('Days') - 1, <Secretary t={t} />],
    [at('Jackson called') - 1, <Judas t={t} />],
    [at("There's") - 1, <Insiders t={t} />],
  ];
  const scene = useScene(cuts);
  return (
    <>
      {scene}
      {cuts.slice(1).map(([f], i) => <Sfx key={i} at={f} src="sfx/whoosh.wav" volume={0.28} />)}
      {['majority', 'Twelfth', 'Speaker', 'support', 'thirteen', 'Secretary', 'Corrupt', 'Insiders', 'people'].map((c) => <Sfx key={c} at={at(c)} src="sfx/stamp.wav" volume={0.27} />)}
      {CANDS.map((c) => <Sfx key={c.cue} at={at(c.cue, c.nth ?? 1) - 1} src="sfx/tick.wav" volume={0.4} />)}
      {Array.from({length: 10}).map((_, i) => <Sfx key={`c${i}`} at={at('thirty') + i} src="sfx/tick.wav" volume={0.25} />)}
      {['mess', 'same', 'electoral', '131', 'House', 'top', 'delegation', 'fourth', 'powerful', 'stand', 'business', 'Kentucky', 'anyway', 'stepping-stone', 'Okay', 'proof', 'insiders', 'quit', 'drives'].map((c) => (
        <Sfx key={c} at={at(c) - 2} src={WRITE.src} volume={WRITE.volume} />
      ))}
    </>
  );
};

export const Ch04: React.FC = () => (
  <ChapterShell n={N} audio="audio/v3_ch04_corrupt_bargain.wav" lead={LEAD} music={[{src: 'music/intrigue.mp3', volume: 0.13}]}>
    <Body />
  </ChapterShell>
);
