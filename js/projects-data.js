/**
 * projects-data.js
 *
 * This is the only file you need to edit to manage your projects.
 *
 * TO ADD A PROJECT:    Add a new object to the array.
 * TO REMOVE A PROJECT: Delete its object from the array.
 * TO REORDER:          Move objects up/down in the array.
 *                      Order here = order on the projects page.
 *
 * "View other projects" on each case study page automatically shows
 * the next 3 projects in circular order — no extra config needed.
 *
 * Project image (carousel):
 *   One image per project shown in the spinning wheel carousel.
 *   Save to: assets/images/projects/[project-id]/phone-1.png
 *
 * Card image:
 *   The thumbnail shown in "View other projects".
 *   Save to: assets/images/projects/[project-id]/card.png
 *
 * Card circle color:
 *   The background circle color on the "View other projects" card.
 *   Pick a color that matches the project's visual style.
 */

const projects = [
  {
    id:          'public-matches',
    number:      'Project 01',
    title:       'Public Matches',
    description: 'Adding a marketplace to the MATCHi app made it easier for players to connect and team up for matches. The feature was designed to fit seamlessly into the platform while also helping venues fill their courts.',
    readMoreLink: 'projects/public-matches.html',
    image:        'assets/images/projects/public-matches/public_matches_carousel.png',
    cardImage:        'assets/images/projects/public-matches/hero_image.png',
    cardCircleColor:  '#FFB8B8',
    cardSubtitle:     'Adding a feature',
  },
  // Hidden — preserved for later use
  // {
  //   id:          'rent-a-scooter',
  //   number:      'Project 02',
  //   title:       'Rent a Scooter',
  //   description: 'A scooter rental prototype where users can browse, book and earn points. Built to explore the prototyping capabilities of InVision with a focus on smooth transitions and intuitive user flows.',
  //   readMoreLink: 'projects/rent-a-scooter.html',
  //   image:        'assets/images/projects/rent-a-scooter/rent_a_scooter_carousel.png',
  //   cardImage:        'assets/images/projects/rent-a-scooter/card.png',
  //   cardCircleColor:  '#c1c5d5',
  //   cardSubtitle:     'App concept',
  // },
  {
    id:          'montah',
    number:      'Project 02',
    title:       'Montah',
    description: 'A personal exploration into AI-driven product development, building a bead pattern generator from idea to live website, without a line of hand-written code.',
    readMoreLink: 'projects/montah.html',
    image:        'assets/images/projects/montah/carousel.png',
    cardImage:        'assets/images/projects/montah/hero.png',
    cardCircleColor:  '#C1DDFF',
    cardSubtitle:     'Private project',
  },
  {
    id:          'split-payment',
    number:      'Project 03',
    title:       'Split Payment',
    description: 'Adding a split payment feature to an existing app, making it easier for groups to share costs seamlessly within the booking flow.',
    readMoreLink: 'projects/split-payment.html',
    image:        'assets/images/projects/split-payment/split_payment_carousel.png',
    cardImage:        'assets/images/projects/split-payment/hero.png',
    cardCircleColor:  '#C3EACB',
    cardSubtitle:     'Adding a feature',
  },
  {
    id:          'clima-card',
    number:      'Project 04',
    title:       'Clima Card',
    description: 'A private project exploring a weather-integrated card interface, combining data visualisation with a clean, minimal aesthetic.',
    readMoreLink: 'projects/clima-card.html',
    image:        'assets/images/projects/clima-card/clima_card_carousel.png',
    cardImage:        'assets/images/projects/clima-card/hero.png',
    cardCircleColor:  '#D7E0FF',
    cardSubtitle:     'Private project',
  },
];
