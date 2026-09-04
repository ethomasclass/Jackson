/* The ten evidence items from the deck. `links` gives the argument a prosecutor can make
   tying the item to a suspect at trial; anything not listed is weak for that suspect. */
'use strict';

const EVIDENCE_ORDER = ['hat', 'pipe', 'address_card', 'bank_note', 'resolutions', 'poster', 'playing_cards', 'check', 'whiskey', 'cartoon'];

const EVIDENCE = {
  hat: {
    name: "Gentleman's Hat", tier: 'Physical',
    desc: "A good beaver-felt hat, found on the Capitol steps where the pistols were fired. The leather sweatband inside is stamped with a small maker's mark: a running stag. Lawrence says it isn't his.",
    links: {
      gregory: "The stag is the mark of the leather shop where Gregory works. He sold this hat — and he knows to whom.",
      lawrence: "It was found at the assassin's feet.",
    },
  },
  pipe: {
    name: 'Clay Smoking Pipe', tier: 'Physical',
    desc: "A long clay pipe, dropped on the steps near the hat. The bowl is carved with a palmetto tree — the emblem of South Carolina. Whoever owned it was standing close to the President.",
    links: {
      calhoun: "A South Carolina pipe, dropped a few feet from the President by a man who admits it is his.",
    },
  },
  address_card: {
    name: 'Address Card', tier: 'Document',
    desc: "A printed card: *420 Chestnut Street, Philadelphia*. That is the address of the Second [Bank of the United States|bank] — Nicholas Biddle's bank. It was in Richard Lawrence's coat pocket.",
    links: {
      biddle: "The address of Biddle's own bank, in the assassin's pocket. Lawrence had been writing there for months.",
      lawrence: "Lawrence carried the Bank's address. He believed the government owed him money.",
    },
  },
  bank_note: {
    name: 'Bank Note', tier: 'Physical',
    desc: "A crisp ten-dollar note issued by the Bank of the United States — its Washington branch, this very month. Found in Lawrence's pocket. An unemployed house painter does not usually carry new Bank money.",
    links: {
      biddle: "New money from Biddle's Washington branch, in the pocket of a man with no work. Someone paid him.",
      clay: "The Bank's records show this note was part of a sum drawn by Henry Clay.",
    },
  },
  resolutions: {
    name: 'Virginia & Kentucky Resolutions', tier: 'Document',
    desc: "A well-thumbed copy of the 1798 Resolutions, which argued that a state may refuse to obey a federal law it believes is unconstitutional. This is the root of [nullification]. Heavily underlined, in Calhoun's hand.",
    links: {
      calhoun: "Calhoun's own annotated copy — the argument that a state may defy the President. He resigned the Vice Presidency over it.",
    },
  },
  poster: {
    name: '1828 Coffin Handbill', tier: 'Document',
    desc: "The notorious *Coffin Handbill* from the 1828 election: six black coffins for six militiamen Jackson had shot for desertion, printed by his enemies to call him a murderer. The new postmaster pinned it up the day he took John Gregory's job, as a trophy. Someone has scratched *KING* across Jackson's name.",
    links: {
      gregory: "Gregory was fired to make room for a Jackson loyalist, and left this poster defaced on his way out.",
    },
  },
  playing_cards: {
    name: 'Playing Cards', tier: 'Physical',
    desc: "A deck of cards from the tavern's back table, where Henry Clay plays for high stakes. Several cards are marked with a fingernail. One of the regular players, the keeper says, was a house painter who talked like a king.",
    links: {
      clay: "Clay gambled at the very table where Lawrence sat. He knew the assassin.",
    },
  },
  check: {
    name: 'Bank Cheque — $5,700,000', tier: 'Document',
    desc: "A record from the Bank's ledger, dated 1830: five million, seven hundred thousand dollars, to be distributed as *loans to members of Congress and friends of the Bank*. Henry Clay's name is on the list.",
    links: {
      biddle: "Biddle used the Bank's money to buy friends in Congress. He had millions to spend and every reason to spend it.",
      clay: "Clay was on the Bank's payroll. Jackson's veto threatened both their fortunes.",
    },
  },
  whiskey: {
    name: 'Kentucky Whiskey', tier: 'Physical',
    desc: "A bottle of Kentucky bourbon from Clay's table at the tavern. Clay's reputation for drinking and gambling is well earned. The bottle was bought for a guest — the keeper does not recall who.",
    links: {
      clay: "Clay's own bottle, from the table where he entertained the man who fired the pistols.",
    },
  },
  cartoon: {
    name: '"King Andrew the First"', tier: 'Document',
    desc: "A political cartoon from the print shop: Jackson in a crown and robes, a [veto] in his hand, trampling the Constitution. The printer says the words beneath it were written by John Gregory.",
    links: {
      gregory: "Gregory wrote the words under this cartoon. He has called the President a tyrant in print.",
    },
  },
};

// Plain-language definitions for underlined terms in dialogue.
const GLOSSARY = {
  'spoils system': 'Giving government jobs to loyal supporters of the winning party — "to the victor belong the spoils." Jackson used it more openly than any president before him.',
  'spoils': 'Government jobs handed to political supporters as a reward for loyalty.',
  'rotation in office': "Jackson's name for the spoils system: the idea that ordinary citizens should take turns holding government jobs, so no one becomes permanent.",
  'tariff': 'A tax on imported goods. It protected Northern factories but made Southern planters pay more for what they bought.',
  'tariff of 1828': 'A very high tax on imports, called the "Tariff of Abominations" in the South, which felt it paid the cost while the North got the benefit.',
  'nullification': 'The claim that a state can declare a federal law void inside its borders. South Carolina tried it in 1832; Jackson threatened to send the army.',
  'veto': "The President's power to reject a bill passed by Congress. Jackson vetoed more bills than all six presidents before him combined.",
  'bank': 'The Second Bank of the United States: a private bank holding the government\'s money, with great power over credit. Jackson called it a "monster" and killed it.',
  'bank war': "Jackson's fight to destroy the Second Bank of the United States. He vetoed its new charter in 1832 and pulled the government's money out in 1833.",
  'charter': "The legal permission a bank needs to operate. The Bank's charter ran out in 1836; Clay and Biddle tried to renew it early.",
  'corrupt bargain': 'In 1824 no candidate won a majority. The House chose John Quincy Adams; Clay backed him and became Secretary of State. Jackson called it a deal — and never forgave either man.',
  'indian removal act': 'The 1830 law that let the President push Native nations west of the Mississippi in exchange for their homelands. Jackson signed it and enforced it.',
  'worcester v. georgia': 'An 1832 Supreme Court case ruling that Georgia had no power over Cherokee land. Jackson ignored it.',
  'trail of tears': 'The forced march of the Cherokee to Oklahoma in 1838–39. About 4,000 died along the way.',
  'kitchen cabinet': 'The unofficial group of friends and newspapermen Jackson actually listened to, instead of his official Cabinet.',
  'whig': 'The political party formed in the 1830s to oppose Jackson. Named after the English party that resisted the king.',
  'american system': "Clay's plan: high tariffs, a national bank, and federal money for roads and canals, all to tie the country together.",
  'common man': 'Jackson\'s idea of himself and his voters: ordinary farmers and workers, not the wealthy elite. Under him, far more white men could vote than ever before.',
  'magistrate': 'A local judge who handles arrests and decides whether there is enough evidence for a trial.',
  'insanity': 'In 1835 a jury could find a man not guilty if he did not understand what he was doing. Lawrence was the first person acquitted this way for attacking a president.',
};
