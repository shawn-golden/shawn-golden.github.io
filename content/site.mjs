// All site content lives here. Edit this file, then run `node build.mjs`.
//
// Slides: each project lists slide image names from docs/assets/slides/
// (without extension). A slide can carry `videos`: clips that play on top
// of the slide at the position they had in Figma (pixels on a 1920×1080 slide).
// A video only appears once its file exists in docs/assets/video/.
// `blends` recreate Figma blend-mode layers over a clip; `overlays` are
// transparent images (docs/assets/overlays/) for artwork that sat above it.
// Full-quality master clips pulled from Figma live in source/videos/.

export const site = {
  name: 'Shawn Golden',
  titles: ['Lead Brand Designer', 'Creative Director'],
  email: 'hi@shawngolden.co',
  location: 'Detroit',
  url: '', // set once the site has a public address, e.g. https://shawngolden.co
};

export const projects = [
  {
    slug: 'minka',
    title: 'Minka',
    tags: ['Brand strategy', 'Brand identity', 'Generative tool development'],
    accent: '#f5fc9f',
    summary:
      'Minka is building the infrastructure that connects banks, financial institutions, and payment networks to make instant payments possible at a national scale. As lead designer, I helped evolve Minka’s brand identity into a cohesive, flexible visual system spanning typography, geometric patterns, product identities, motion, and brand applications. The result balances the credibility of established financial institutions with the clarity and energy of modern financial technology.',
    team: ['Aaron Johnstone, Motion Designer', 'Ruth Facer, Delivery Lead'],
    role: ['Creative Director', 'Lead Brand Designer'],
    slides: range('minka', 10),
  },
  {
    slug: 'blumira',
    title: 'Blumira',
    tags: ['Creative direction', 'Brand identity', 'Animation'],
    accent: '#b4eac6',
    summary:
      'Blumira is a cybersecurity platform making threat detection and response simpler and more accessible. As Lead Brand Designer, I led the evolution of its visual identity, developing a cohesive brand system that balances technical credibility with an approachable, distinctive personality. The work spanned brand strategy, logo development, typography, color, illustration, and art direction, creating a flexible visual language designed to scale across marketing, product, and digital experiences.',
    team: ['Aaron Johnstone, Motion Designer', 'Ruth Facer, Delivery Lead'],
    role: ['Creative Director', 'Lead Brand Designer'],
    slides: [
      'blumira-01',
      'blumira-02',
      'blumira-03',
      'blumira-04',
      'blumira-05',
      { src: 'blumira-06', videos: [{ file: 'blumira-hog.mp4', x: 0, y: 89, w: 342, h: 342, rotate: -15 }] },
      'blumira-07',
      {
        // Waves clip tinted by three blend-mode rectangles, posters on top.
        src: 'blumira-08',
        videos: [{ file: 'blumira-waves.mp4', x: -564, y: 777, w: 3049, h: 1715 }],
        blends: [
          { x: 0, y: 776, w: 1920, h: 1080, color: '#000000', blend: 'saturation' },
          { x: 0, y: 776, w: 1920, h: 1080, color: '#5a97ff', blend: 'multiply' },
          { x: 0, y: 776, w: 1920, h: 1080, color: '#2d3748', blend: 'lighten' },
        ],
        overlays: [{ img: 'blumira-08-fg.webp', x: 0, y: 0, w: 1920, h: 1080 }],
      },
      'blumira-09',
      {
        // Night clip under a dark tint, infographic on top.
        src: 'blumira-10',
        videos: [{ file: 'blumira-night.mp4', x: 960, y: -8, w: 968, h: 1089 }],
        overlays: [{ img: 'blumira-10-fg.webp', x: 0, y: 0, w: 1920, h: 1080 }],
      },
    ],
  },
  {
    slug: 'ultra',
    title: 'Ultra',
    tags: ['Creative direction', 'Brand identity', 'Web design'],
    accent: '#181818',
    dark: true,
    summary:
      'Ultra is a cybersecurity company building runtime security for AI agents, helping organizations monitor, govern, and secure autonomous AI systems. As Lead Brand Designer, I led the development of a visual identity that translates complex security technology into a clear, confident, and distinctive brand. The work established a flexible design system spanning typography, color, graphic elements, motion, and digital applications, positioning Ultra as a credible and forward-thinking voice in an emerging category.',
    team: ['Ruth Facer, Delivery Lead'],
    role: ['Creative Director', 'Lead Brand Designer'],
    slides: range('ultra', 10),
  },
  {
    slug: 'keystrike',
    title: 'Keystrike',
    tags: ['Brand identity', 'Web design'],
    accent: '#3065f8',
    dark: true,
    summary:
      'Keystrike is a cybersecurity company pioneering a new approach to access security, verifying that every action taken within a system comes from an authorized user. As Creative Director and Lead Brand Designer, I led the development of a bold, modern visual identity that brings clarity and distinction to a complex technical offering. The work established a cohesive brand system spanning typography, color, graphic elements, and digital applications, positioning Keystrike as an innovative voice in a rapidly evolving security landscape.',
    team: ['Brian Caiazza, Motion Designer', 'Ruth Facer, Delivery Lead'],
    role: ['Creative Director', 'Lead Brand Designer'],
    slides: range('keystrike', 11),
  },
  {
    slug: 'tap-to-pay',
    title: 'Tap to Pay Launch',
    shortTitle: 'Tap to Pay',
    tags: ['Product launch campaign', 'Art direction', 'Motion design'],
    accent: '#c9e8f5',
    summary:
      'A massive cross-team collaboration product launch, Tap to Pay revolutionizes global payments by empowering any Square seller to take a contactless payment quickly and securely, with no additional hardware or costs, using just their phone.',
    team: [
      'Jeff Stark, Creative Director',
      'Sasha Galkin, Sr. Copywriter',
      'Chris Weissenberger, Engineer',
      'Megan Karande, Product Marketing Manager',
      'Alessandro Joabar, Data Scientist',
      'Jen Hardy, Researcher',
      'Adam Diehl, Product Designer',
      'Tai Kuo, Program Manager',
      'Noa Bell, Project Manager',
      'Landon McMahon, Photographer',
    ],
    role: ['Lead Designer'],
    contributions: ['Creative strategy', 'Photo and video art direction', 'Motion graphics', 'Visual system design & documentation'],
    slides: [
      { src: 'taptopay-01', caption: 'Art direction style guide' },
      { src: 'taptopay-02', caption: 'Product photoshoot art direction' },
      { src: 'taptopay-03', caption: 'Brand campaign design system for cross-functional use' },
      { src: 'taptopay-04', caption: 'Public web experience' },
      {
        src: 'taptopay-05',
        title: 'Collage CTA',
        body: [
          'To create a compelling user experience on our Tap to Pay landing page, we designed a dynamic animation that captures users’ attention as they reach the conclusion of the page, grabbing their attention just as we present our primary call to action.',
          'The collage animation serves as a visual summary of the people and images that users encountered while scrolling through the page. This collage reinforces our messaging of _on-the-go, anywhere, for anyone_ by showcasing a diverse array of sellers and payment methods.',
          'To bring this collage to life, each image is initially positioned outside of the viewport and then animated to move into place with a carefully choreographed staggered start.',
          'The distance between each image is proportional to the width of the user’s device, resulting in a scalable, seamless, and visually stunning animation that enhances the user’s overall experience.',
        ],
        figures: [{ img: 'taptopay-05-diagram.webp', w: 320, h: 160, alt: 'Diagram: images animate in from outside the viewport' }],
      },
      {
        src: 'taptopay-06',
        title: 'Scroll gallery',
        body: [
          'We integrated a scroll-based gallery on the Tap to Pay landing page to showcase diverse seller types and reinforce our _Sell on the go_ messaging. This animation enhances the visual appeal of our design and supports our messaging by, literally, moving our sellers.',
          'To bring this concept to life, we utilized the Web Animations API through Motion One, an open-source JavaScript library that enabled us to easily manage scroll-linked animations.',
          'Our primary considerations were to create a seamless user experience by determining optimal timing, duration, distance, and easing motion for the gallery images across all viewport sizes.',
          'These details resulted in a visually striking and impactful feature that effectively communicates our messaging.',
        ],
        figures: [
          { img: 'taptopay-06-diagram.webp', w: 320, h: 198, alt: 'Diagram: gallery images move with scroll' },
          { img: 'taptopay-06-easing.webp', w: 268, h: 86, alt: 'Easing curves' },
        ],
      },
      'taptopay-07',
      {
        src: 'taptopay-08',
        caption: 'Motion studies',
        videos: [
          { file: 'taptopay-tap-to-phone-3.mp4', x: 201, y: 159, w: 812, h: 514 },
          { file: 'taptopay-precomp-3.mp4', x: 1056, y: 159, w: 293, h: 355 },
          { file: 'taptopay-hero-7.mp4', x: 1388, y: 159, w: 331, h: 433 },
          { file: 'taptopay-precomp-4.mp4', x: 201, y: 716, w: 391, h: 223 },
          { file: 'taptopay-tap-to-phone-2.mp4', x: 613, y: 716, w: 400, h: 223 },
          { file: 'taptopay-hero-3.mp4', x: 1056, y: 557, w: 292, h: 382 },
          { file: 'taptopay-hero-5.mp4', x: 1388, y: 628, w: 331, h: 311 },
        ],
      },
      {
        src: 'taptopay-09',
        caption: 'Social media campaign motion graphics',
        videos: [{ file: 'taptopay-product-1.mp4', x: 125, y: 219, w: 318, h: 565 }],
        overlays: [{ img: 'taptopay-09-story.webp', x: 125, y: 219, w: 318, h: 59 }],
      },
    ],
  },
  {
    slug: 'ugly-magazine',
    title: 'Ugly Magazine',
    tags: ['Editorial design', 'Art direction', 'Marketing design'],
    accent: '#fcaf16',
    summary:
      'Ugly is an indie comedy magazine that showcases unique and quirky content. The project focused on bold, contemporary designs that capture attention and reflect the magazine’s distinctive voice, resulting in a visually engaging experience that captivates and entertains readers.',
    team: [
      'Petros Symeonidis, Program Manager',
      'Kirsten Van Bruyseel, Web Developer',
      'Alex Bergmans, Founder',
      'Molly Alampi, Founder',
      'Doug Kolbicz, Founder',
    ],
    role: ['Brand Designer'],
    contributions: [
      'Illustration and animation',
      'Ad copy',
      'Customer research',
      'User journey mapping',
      'Website design',
      'Brand guide',
      'Social ad campaigns and creative',
    ],
    slides: [
      { src: 'ugly-01', caption: 'Marketing website experience' },
      { src: 'ugly-02', caption: 'Brand guidelines' },
      {
        src: 'ugly-03',
        caption: 'Social media campaign design and animation',
        videos: [{ file: 'ugly-free-sample.mp4', x: 140, y: 236, w: 482, h: 607 }],
      },
      {
        src: 'ugly-04',
        caption: 'Marketing website animations',
        videos: [
          { file: 'ugly-kickflip-boy.mp4', x: 933, y: 658, w: 318, h: 318, radius: 14 },
          { file: 'ugly-running-man.mp4', x: 1485, y: 658, w: 318, h: 318, radius: 14 },
        ],
        overlays: [{ img: 'ugly-04-patch.webp', x: 1485, y: 952, w: 135, h: 24 }],
      },
      {
        // Info slide: video coordinates are relative to the 1387×922 panel.
        src: 'ugly-05',
        title: 'Security conscious hot dog',
        body: [
          'In designing the login and sign up page for Ugly Magazine, we aimed to inject some joy and playfulness into an otherwise mundane task. To achieve this, we added a _security-conscious_ hot dog to the page. The dog serves to enhance the overall user experience and reinforce the publication’s brand.',
          'This hot dog, which is designed to be both endearing and lighthearted, features interactive eyes that will inaccurately follow the user’s cursor around the screen. As an added security measure, the hot dog will also cover its eyes when the user focuses on the password field, creating an engaging and memorable interaction.',
        ],
        videos: [{ file: 'ugly-comp-2.mp4', x: 123, y: 93, w: 1142, h: 738 }],
      },
      { src: 'ugly-06', caption: 'Marketing website experience' },
      {
        src: 'ugly-07',
        title: 'About image and video hover',
        body: [
          'We designed Ugly Magazine’s about page to reflect the magazine’s absurdist and unexpected tone. The page is presented from the perspective of the physical magazine, telling a story that is in keeping with the publication’s overall sensibilities. In, might I add, wildly exaggerated jumbo typography.',
          'To enhance the narrative experience, we incorporated hover interactions that reveal images or videos that align with the magazine’s unique tone and aesthetics while reinforcing the story. This not only adds an engaging layer of interactivity to the design, keeping users scrolling and enjoying the madness, but also reinforces the overall brand of the publication.',
        ],
        videos: [{ file: 'ugly-comp-1.mp4', x: 123, y: 92, w: 1142, h: 738 }],
      },
      { src: 'ugly-08', caption: 'Joyful web experiences, custom cursors' },
      {
        src: 'ugly-09',
        title: 'Excessive congratulations confetti',
        body: [
          'Upon completion of a subscription sign-up for Ugly Magazine, we wanted to offer users a lighthearted and engaging reward. To achieve this, we developed an absurd and fun confetti animation that evokes a sense of accomplishment, but not without having a tongue in cheek.',
          'The exaggerated animation features an eye-catching display of exploding confetti that attacks the screen unexpectedly.',
          'By adding this touch of absurdism to the subscription process, we are able to create a memorable experience for our users, while also, again, reinforcing the overall tone and personality of the Ugly Magazine brand.',
        ],
        videos: [{ file: 'ugly-comp-3.mp4', x: 123, y: 93, w: 1142, h: 738 }],
      },
      { src: 'ugly-10', caption: 'Interaction models for collaboration with web development agency' },
    ],
  },
  {
    slug: 'email-design-system',
    title: 'Email Design System',
    tags: ['Design systems', 'Email marketing'],
    accent: '#000000',
    dark: true,
    summary:
      'Market for Email is a utilitarian email design system that saves time for designers and engineers by streamlining repetitive tasks, reducing the duplication of work across the organization, and ensuring consistency, ultimately resulting in quicker and more cost-effective email campaign launches.',
    team: [
      'Jenny Michelfelder, Design Manager',
      'Allie Fleming, Design Lead',
      'Myla Fay, Systems Designer',
      'Marisa Rando, Copywriter',
      'Chris Keene, Email Developer',
    ],
    role: ['Designer'],
    contributions: ['Template design', 'System design', 'Figma library, styles, components', 'Documentation'],
    slides: ['email-01', 'email-02', 'email-03', { src: 'email-04', caption: 'Design system instructions for cross-team collaboration' }, 'email-05'],
  },
  {
    slug: 'motion-calendar',
    title: 'Motion Calendar',
    hidden: true, // Not in the Figma menu. Set to false to show it.
    tags: ['Product design', 'Brand identity'],
    accent: '#ffffff',
    summary: 'A fast, elegant calendar that helps you focus on what matters most.',
    team: ['Patrick Torossian, Founder/Engineer', 'Patrick Haig, Advisor', 'Ian Sefferman, Advisor'],
    role: ['Product Designer'],
    contributions: ['Feature prioritization and design', 'Web and mobile app design', 'Brand identity'],
    slides: range('motioncal', 3),
  },
  {
    slug: 'experiments',
    title: 'Experiments',
    tags: ['Side projects', 'Explorations'],
    accent: '#cccccc',
    summary:
      'I’m always excited to dive into the latest technologies and design trends. My passion for experimentation doesn’t stop at work. I’m constantly working on side projects that help me refine my skills. This continuous learning fuels my ability to come up with fresh, innovative solutions.',
    slides: [
      { src: 'experiments-01', caption: 'Neat nature, Neature' },
      { src: 'experiments-02', caption: 'Square recruiting campaign' },
      { src: 'experiments-03', caption: 'Square illustration style' },
      { src: 'experiments-04', caption: 'Hack week website design exploration' },
    ],
  },
];

export const demoReel = {
  slug: 'demo-reel',
  title: 'Motion Demo Reel',
  tags: ['Motion design', 'Animation'],
  vimeoId: '1097306788',
  summary:
    'A selection of dynamic projects that highlight my skills in visual storytelling, motion graphics, and animation.',
  thumb: 'demoreel',
};

export const about = {
  intro:
    'Hello, I’m Shawn. I’m a Detroit-based creative director and designer making complex ideas clear, compelling, and impossible to ignore.',
  bio: [
    'I’m a multidisciplinary designer with over 15 years of experience building brands and digital experiences for startups, global companies, and everything in between.',
    'My work spans brand strategy, visual identity, digital design, and motion. I’m equally comfortable leading creative direction, building scalable design systems, and getting hands-on with the details that bring an idea to life.',
    'Outside of design, I write and direct animated comedy, perform improv, and pursue all kinds of creative experiments. I believe curiosity, humor, and a willingness to try something unexpected make for better creative work.',
  ],
  experience: [
    { role: 'Creative Director', company: 'FinalFinal', dates: 'Oct 2024 – Present' },
    { role: 'Senior Brand Designer', company: 'Square', dates: 'Apr 2020 – Feb 2024' },
    { role: 'Co-founder, Writer, Brand Designer', company: 'Ugly Magazine', dates: 'Oct 2019 – Apr 2023' },
    { role: 'Senior Visual Designer', company: 'Censys', dates: 'Jan 2019 – Jan 2020' },
    { role: 'Product Designer', company: 'Detroit Labs', dates: 'Feb 2017 – Dec 2019' },
    { role: 'Visual Designer', company: 'Duo Security', dates: 'Mar 2014 – Feb 2017' },
    { role: 'Web Designer', company: 'Momentum', dates: 'Nov 2011 – Mar 2014' },
  ],
  clients: [
    'Anthropic',
    'Adult Swim',
    'Square',
    'Cisco',
    'Jimmy Johns',
    'General Motors',
    'Quicken Loans',
    'Rocket Mortgage',
    'Little Caesars',
    'Detroit Free Press',
  ],
  capabilities: [
    'Creative Direction',
    'Brand Strategy & Identity',
    'Art Direction',
    'Visual Design Systems',
    'Digital & Web Design',
    'Motion Design & Animation',
    'Campaigns & Brand Activations',
    'Typography & Graphic Design',
    'Presentation & Editorial Design',
    'Creative Technology & Generative Tools',
    'Leadership & Mentorship',
    'Design Production',
  ],
  tools: [
    'Figma',
    'Adobe Creative Suite',
    'Claude Code / Cursor / ChatGPT',
    'Midjourney / Runway / Weave',
    'Framer',
    'Keynote / PowerPoint',
    'Google Cloud Tools',
    'Procreate',
    'HTML & CSS',
    'Womp',
  ],
  capabilitiesImage: 'capabilities',
};

function range(prefix, n) {
  return Array.from({ length: n }, (_, i) => `${prefix}-${String(i + 1).padStart(2, '0')}`);
}
