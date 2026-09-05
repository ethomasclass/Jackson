/* The story spine: three acts on a 45-minute clock, their goals, what students should write down at
   each break, Toby's remarks, and the two set pieces. All text at a 9th-grade level. */
'use strict';

const STORY = {
  // Real minutes from the start of a new case. Scaled if the teacher sets ?minutes=N.
  totalMinutes: 45,
  // In-game time: the case opens at noon on January 30th and the clock runs to eight in the evening.
  startHour: 12, spanHours: 8,

  acts: {
    1: {
      title: 'Act I', name: 'Who Wanted Him Dead?', deadline: 14,
      blurb: "The pistols misfired this morning. By tonight the President wants a name. You have the afternoon.",
      goals: [
        { label: 'Search the Capitol steps', done: (S) => S.evidence.includes('hat') && S.evidence.includes('pipe') },
        { label: 'Talk to two of the five suspects', count: (S) => [Math.min(2, S.interviewed.length), 2], done: (S) => S.interviewed.length >= 2 },
      ],
      notebook: [
        "Which two suspects did you talk to? Write one sentence on what each one wanted from Jackson.",
        "What did you find on the steps, and who does each object point at?",
        "Write down one thing Lawrence said that sounded like a reason, and one that sounded mad.",
      ],
    },
    2: {
      title: 'Act II', name: 'The Case That Fell Apart', deadline: 27,
      blurb: "Two witnesses say they saw Lawrence at a senator's house. Everyone wants it to be true. Pull on the story and see if it holds.",
      goals: [
        { label: 'Hear both witnesses', count: (S) => [(S.flags.foy_story ? 1 : 0) + (S.flags.stewart_story ? 1 : 0), 2], done: (S) => S.flags.foy_story && S.flags.stewart_story },
        { label: 'Find two holes in their story', count: (S) => [Math.min(2, Story.cracks(S)), 2], done: (S) => Story.cracks(S) >= 2 },
      ],
      notebook: [
        "Write down each hole you found in the witnesses' story, and who told you about it.",
        "Why might a man swear to something he did not see? Write two reasons from what you learned today.",
        "Mr. Thorne mentioned that your job is an appointment. What was he really saying?",
      ],
    },
    3: {
      title: 'Act III', name: 'Name Someone Anyway', deadline: 37,
      blurb: "The witnesses are gone. The pressure is not. Finish the case with what you can actually hold in your hand.",
      goals: [
        { label: 'Talk to all five suspects', count: (S) => [S.interviewed.length, 5], done: (S) => S.interviewed.length >= 5 },
        { label: 'Collect six pieces of evidence', count: (S) => [Math.min(6, S.evidence.length), 6], done: (S) => S.evidence.length >= 6 },
        { label: 'Return to the magistrate with a name', done: (S) => !!S.accused },
      ],
      notebook: [
        "The paper printed the name you gave. Write down how the person you named reacted when you saw them.",
        "For your final accusation, list the three pieces of evidence you will use and what each one proves.",
        "Which suspect had the strongest reason but the weakest evidence?",
      ],
    },
  },

  // Holes in the witnesses' story. Any two are enough.
  cracks: {
    day: "Foy says Saturday. Stewart says Tuesday. They cannot both be right.",
    job: "Foy got a government job the week he came forward. A friend of the President arranged it.",
    tavern: "The tavern keeper says Stewart was passed-out drunk on the night he swears he saw Lawrence.",
    senator: "Senator Poindexter had twelve dinner guests on Tuesday and was in the Senate on Saturday.",
    lawrence: "Lawrence has never heard the name Poindexter. He is too sick to lie about it.",
  },

  names: { poindexter: 'Senator George Poindexter' },

  headline(prelim) {
    if (prelim === 'poindexter') return { head: 'SENATOR POINDEXTER NAMED IN PLOT', sub: "Magistrate's office points to Mississippi senator on the word of two witnesses. Whig paper calls the witnesses liars. The Senate demands an inquiry." };
    const n = SUSPECT[prelim] ? SUSPECT[prelim].name.toUpperCase() : 'A SUSPECT';
    return { head: `${n} NAMED IN PLOT AGAINST THE PRESIDENT`, sub: "Magistrate's office sends a name to the President. No warrant yet. Friends of the accused call it an outrage. The city talks of nothing else." };
  },

  // Toby's remarks. He speaks in short bursts over his head.
  barks: {
    room: {
      capitol_steps: "That's where it happened. Right there. I sold a hundred papers on this spot by noon.",
      jail: "Don't get too close to the bars. He bit a jailer, they say. Or maybe he only said he was going to.",
      post_office: "New postmaster. He came up from Tennessee with the General. Everybody in there did.",
      hat_shop: "Mr. Gregory used to be somebody. Now he sells hats. He's still angry about it. You'll see.",
      tavern: "Mr. Clay's in the back. He's always in the back. Don't play cards with him.",
      bank_office: "Nobody likes the Bank. Everybody wants the Bank's money. That's the whole war, my uncle says.",
      print_shop: "Mr. Hale. He printed the King Andrew picture. He'd print the other side too, if they paid.",
      boarding_house: "Mr. Calhoun lives here. He was Vice President. Then he quit. Nobody had ever quit before.",
      hotel: "The Cherokee are upstairs. Chief Ross. He's met the President twice, and it did him no good either time.",
      white_house: "Straight in. He sees anybody. He'll tell you who did it before you sit down. Don't believe him yet.",
      magistrate: "",
      street: "",
    },
    evidence: {
      hat: "A stag inside the band. That's the hat shop's mark. Mr. Gregory's shop!",
      pipe: "Palmetto tree. That's South Carolina. That's Calhoun's state. Half the men on the steps were from there, though.",
      address_card: "Chestnut Street. That's the Bank. Why does a house painter carry the Bank's address?",
      bank_note: "New money. Brand new. Painters don't have new money. Somebody gave him that.",
      resolutions: "Virginia and Kentucky Resolutions. Mr. Calhoun reads that like scripture. It's about a state saying no to the government.",
      poster: "The Coffin Handbill! From the election. They called the General a murderer. Somebody's scratched KING on it.",
      playing_cards: "Marked cards. Somebody at Mr. Clay's table was cheating. And losing anyway, I'd bet.",
      check: "Five million dollars. To congressmen. I can't even count that high.",
      whiskey: "Kentucky whiskey. That's Mr. Clay's. He bought a bottle for somebody. Ask who.",
      cartoon: "King Andrew the First! Mr. Gregory wrote the words under it. Mr. Hale printed it. Everybody's seen it.",
    },
    interviewed: {
      calhoun: "He talks like a schoolbook. But he told you where he stood. Nobody else has.",
      clay: "He laughs a lot. My uncle says that's how you know he's thinking.",
      biddle: "He never got up. Did you notice? He never gets up for anybody.",
      ross: "He's the only one who offered you a chair. Write that down. It won't count for much in court.",
      gregory: "He's not sorry. About any of it. That's not the same as guilty, though. Is it?",
    },
    crack: "Write that down! That's a hole in their story.",
    warn: {
      1: "We should head back soon. The magistrate said this afternoon, and he meant it.",
      2: "It's getting late. Whatever you've found on those two, the magistrate needs it now.",
      3: "Not long now. Mr. Key's already at the courthouse. Whatever you've got, that's the case.",
    },
    ready: "That's a case. Six things in the bag and all five talked to. Let's go see the magistrate.",
    toby_attached: "I'll stay behind you. Turn around and press Talk if you want to ask me anything.",
  },

  // ---------------------------------------------------------------------------
  // Set pieces. Lines use the "@Name|portrait: text" speaker switch.
  // ---------------------------------------------------------------------------
  scenes: {
    funeral: [
      "@Toby|: That's Congressman Davis, going out to the cemetery. It was his funeral the President walked out of this morning, when the pistols came up.",
      "@Toby|: Look who's come to watch. Every one of them's on your list.",
      "@John C. Calhoun|calhoun: He was my friend. He was a South Carolina man. And the President walked behind his coffin as if he were one of us.",
      "@Henry Clay|clay: Jackson would walk behind anybody's coffin, John, so long as the crowd was watching. He'll walk behind mine one day, and enjoy the weather.",
      "@John C. Calhoun|calhoun: You are a cold man, Henry.",
      "@Henry Clay|clay: I am a warm man in a cold city. Look at them. Half of them came for Davis. The other half came to see whether the President dares show his face again.",
      "@John Ross|ross: (quietly) He will. He does not know how to do anything else.",
      "@John Gregory|gregory: (at the edge of the crowd, to no one) They fire a pistol at him, and the whole city puts on black and bows. Nothing changes. Nothing ever changes.",
      "@Toby|: Did you hear all that? Write it down before it goes out of your head. Then come on. The magistrate's got two men in his office who say they know who did it.",
    ],
    bank1: [
      "@Toby|: Told you. Half the Avenue's here. They've been at it an hour.",
      "@A Carter|: You called in my loan, Biddle! You took my cart! Where's my cart?",
      "@Nicholas Biddle|biddle: I called in loans because the President took the government's money out of this Bank. You want your cart? Ask him for it.",
      "@Toby|: (Somebody throws a lump of ice. It misses. Mr. Biddle does not move.)",
      "@Nicholas Biddle|biddle: Shout, then. It changes nothing. In a year this Bank will be gone, and you will find out what a country without one feels like. I hope you enjoy it.",
    ],
    bank2: [
      "@Mr. Thorne|: You see, clerk? A city wants a name. It will take one from the President, or from the papers, or from that mob. Better it takes one from you.",
      "@Mr. Thorne|: The magistrate is waiting. He has a pen. Come along.",
    ],
    crowd: ["Where's our money?", "Biddle's ruined us!", "Hurrah for Jackson!", "Hang the Bank!", "My loan! My loan!", "Czar Nicholas!", "Give us our deposits!", "Go back to Philadelphia!"],
  },
};
