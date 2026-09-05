/* The five suspects, as the magistrate's dossiers present them. Text adapted from the
   suspect cards, at a 9th-grade reading level. */
'use strict';

const SUSPECTS = [
  {
    id: 'calhoun', name: 'John C. Calhoun', portrait: 'calhoun',
    title: 'Senator from South Carolina · former Vice President',
    born: 'Born 1782, South Carolina', where: 'Lodging at the boarding house on the Avenue',
    topic: 'The Tariff & Nullification',
    dossier: [
      "Calhoun was Secretary of War under President Monroe and ran for president in 1824. He dropped out to run for Vice President instead, and won — first under John Quincy Adams, then in 1828 under Jackson.",
      "Then came the [Tariff of 1828]. It taxed imported goods so heavily that the South, which bought factory goods and sold cotton abroad, felt robbed to pay for Northern factories. Jackson supported it. Calhoun could not.",
      "Calhoun argued that South Carolina could simply refuse to obey: [nullification]. Jackson called that treason and threatened to hang him. After a furious fight at a dinner, Calhoun did something no Vice President had ever done. He quit.",
    ],
    grudge: "He believes Jackson would destroy the South to keep the North rich, and Jackson threatened to hang him personally.",
  },
  {
    id: 'clay', name: 'Henry Clay', portrait: 'clay',
    title: 'Senator from Kentucky · leader of the Whigs',
    born: 'Born 1777, Virginia; made his name in Kentucky', where: 'Usually found at the tavern',
    topic: 'The Corrupt Bargain & the Bank',
    dossier: [
      "Clay entered Kentucky politics young and by 1811 he was Speaker of the House, the most powerful man in Congress. He loves a drink, a bet, and a deal. He is the man who brings enemies together to compromise.",
      "In 1824 no one won a majority, so the House of Representatives chose the president. Clay threw his support to John Quincy Adams, who then made Clay Secretary of State. Jackson called it a [corrupt bargain]. He never, ever got over it.",
      "Clay leads the [Whig|whig] party against Jackson. He wants government to build roads and canals, and he fought hard to keep the [Bank of the United States|bank] alive — working closely with its president, Nicholas Biddle.",
    ],
    grudge: "Jackson has called him a cheat for eleven years, and has now killed the Bank that Clay's whole political plan depended on.",
  },
  {
    id: 'biddle', name: 'Nicholas Biddle', portrait: 'biddle',
    title: 'President of the Second Bank of the United States',
    born: 'Born 1786, Philadelphia', where: "Visiting the Bank's Washington office",
    topic: 'The Bank War',
    dossier: [
      "Biddle became president of the [Bank of the United States|bank] at only 37. He is brilliant, proud, and quick to take offense at any insult to his Bank or himself. His manners never slip. His judgment sometimes does.",
      "When it looked like Jackson would let the Bank die, Biddle and Henry Clay tried to renew its [charter] four years early, in 1832. Jackson [vetoed|veto] it, calling the Bank a monster that made the rich richer. He called Biddle *Czar Nicholas*.",
      "Biddle fought back with the Bank itself as a weapon: he cut off loans to ordinary farmers — Jackson's own voters — to cause a panic and blame it on the President. He also said, in public, that a man who \"scalped Indians and imprisoned judges\" would not get his way with the Bank.",
    ],
    grudge: "Jackson is destroying the institution Biddle built his life around, and mocking him while he does it.",
  },
  {
    id: 'ross', name: 'John Ross', portrait: 'ross',
    title: 'Principal Chief of the Cherokee Nation',
    born: 'Born 1790, in Cherokee country (now Alabama)', where: 'The Indian Queen Hotel, with the Cherokee delegation',
    topic: 'Indian Removal',
    dossier: [
      "Ross's father was Scottish and his mother part Cherokee. Blue-eyed and fair, educated at a school in Tennessee, he grew up Cherokee. He became the leader of Cherokee resistance to white settlers taking their land. He was elected Principal Chief in 1828.",
      "When Jackson signed the [Indian Removal Act], Ross took the Cherokee case to the Supreme Court — and won. In [Worcester v. Georgia] the Court said Georgia had no power over Cherokee land. Jackson simply refused to enforce the ruling.",
      "Ross has met Jackson face to face at the White House twice, asking him to honor the Court and the treaties. Jackson would not move. Ross is in Washington again this winter, asking Congress for help.",
    ],
    grudge: "Jackson is taking his people's homeland by force, and has ignored the highest court in the land to do it.",
  },
  {
    id: 'gregory', name: 'John Gregory', portrait: 'gregory',
    title: 'Former clerk to the Postmaster General',
    born: 'Born 1788, Boston', where: 'Works at the leather goods shop on the Avenue',
    topic: 'The Spoils System',
    dossier: [
      "Gregory served in the Post Office for nearly ten years, going back to the Adams administration. He did not think of himself as political. He was good at his job.",
      "When Jackson took office he began replacing government workers with his own loyal supporters — the [spoils system]. Gregory was one of hundreds fired. His replacement was a Jackson man from Tennessee with no experience and a great deal of loyalty.",
      "Gregory did not go quietly. He has attacked the President in print for his constant use of the [veto], calling him *King Andrew*. He struggled to find work and now clerks at a shop selling hats and leather goods.",
    ],
    grudge: "Jackson took his livelihood and gave it to a stranger for being loyal. He has said so, in public, often.",
  },
];

const SUSPECT = Object.fromEntries(SUSPECTS.map(s => [s.id, s]));
