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
  positioning:
    'Detroit-based creative director and designer making complex ideas clear, compelling, and impossible to ignore.',
  url: 'https://shawn-golden.github.io', // public address, used for share images
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
      {
        // The hedgehog clip lost its transparency in Figma's stream, so it's
        // multiplied onto the badge (white drops out), over a cream patch that
        // hides the badge's static hedgehog.
        src: 'blumira-06',
        under: [{ x: 132, y: 127, w: 156, h: 156, color: '#f5f2ec', round: true }],
        videos: [{ file: 'blumira-hog.mp4', x: 0, y: 89, w: 342, h: 342, rotate: -15, blend: 'multiply' }],
      },
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
      { src: 'taptopay-07', caption: 'Scalable design system for international launch: US, UK, France, Spain, Canada, Australia, Ireland' },
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
    // Draft summary written from the work itself; role and team still to confirm.
    slug: 'tracebit',
    title: 'Tracebit',
    tags: ['Brand identity', 'Web design', 'Generative tools'],
    accent: '#f3dcd5',
    summary:
      'Tracebit helps security teams catch attackers early by planting canaries across their cloud, decoys that alert the moment someone touches them, positioning the company as “the answer to Assume Breach.” The identity centers on a single mark that rotates through a fixed set of angles, so one symbol can carry signage, web, social, events and merch while staying recognizably Tracebit. A browser-based tool lets the team build new mark compositions on brand.',
    slides: [
      'tracebit-01',
      'tracebit-02',
      'tracebit-03',
      'tracebit-04',
      'tracebit-05',
      { row: ['tracebit-h1', 'tracebit-h2', 'tracebit-h3'] },
      'tracebit-06',
      'tracebit-07',
      'tracebit-08',
    ],
  },
  {
    // Draft summary written from the work itself; role and team still to confirm.
    slug: 'expel',
    title: 'Expel',
    tags: ['Brand identity', 'Campaigns', 'Environmental design'],
    accent: '#5ce58b',
    summary:
      'Expel runs managed detection and response for security teams. The brand pairs a plainspoken voice, “No Black Box. No BS.,” with an X pattern built from the logomark, and carries it from guidelines and the website to a trade show booth, a keynote stage, campaign posters, a pixel mascot and merch.',
    slides: [
      'expel-01',
      'expel-02',
      'expel-03',
      'expel-04',
      'expel-05',
      { row: ['expel-h1', 'expel-h2'] },
      'expel-06',
      { row: ['expel-h3', 'expel-h4'] },
      { row: ['expel-h5', 'expel-h6'] },
    ],
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

// Homepage groups, in order. Projects not listed fall into the last group.
export const groups = [
  { name: 'Brand systems', slugs: ['minka', 'blumira', 'ultra', 'keystrike', 'tracebit', 'expel'] },
  { name: 'Design systems', slugs: ['email-design-system'] },
  { name: 'Launches & campaigns', slugs: ['tap-to-pay', 'demo-reel'] },
  { name: 'Editorial & interaction', slugs: ['ugly-magazine'] },
  { name: 'Side projects', slugs: ['experiments'] },
];

// Principles quoted from the brand guidelines in Figma, shown between slides.
export const principles = {
  minka: [
    { after: 'minka-01', quote: 'Color in Minka is a tool, not a theme.', source: 'Minka guidelines · Color' },
    { after: 'minka-02', quote: 'Guilloché should feel engineered, not ornamental.', source: 'Minka guidelines · Imagery' },
    {
      after: 'minka-05',
      quote: 'Patterns should always feel purposeful, precise, and integrated — never ornamental or illustrative.',
      source: 'Minka guidelines · Pattern',
    },
  ],
  blumira: [
    {
      after: 'blumira-03',
      quote: 'Each illustration is created from a single, unbroken line, symbolizing connection, vigilance, and flow.',
      source: 'Blumira guidelines · Illustration',
    },
    {
      after: 'blumira-04',
      quote: 'Each color expresses a facet of Blumira’s personality. Use them with intention to convey mood and hierarchy.',
      source: 'Blumira guidelines · Color',
    },
  ],
  expel: [
    {
      after: 'expel-03',
      quote: 'Technical, data-driven, systematic, precise. A visual callback to when computer output showed its work.',
      source: 'Expel guidelines · Graphic device',
    },
    {
      after: 'expel-05',
      quote: 'When you’d like to add emphasis to the layout, extend a color block to half or even 3/4 of the design.',
      source: 'Expel guidelines · Layout',
    },
  ],
  'email-design-system': [
    {
      after: 'email-01',
      quote: 'Aim to keep this within 2 lines on desktop and 3 lines on mobile.',
      source: 'Usage note built into the headline component',
    },
  ],
};

// Alt text for every image, keyed by image name.
export const alts = {
  'minka-01': 'Pages from the Minka brand guidelines: secondary colors, logo, logomark and guilloché imagery, laid out at an angle.',
  'minka-02': 'The Minka logo on a white blade sign hanging off a brick wall.',
  'minka-03': 'Minka homepage headline, “Connective Infrastructure for Instant Economies,” under a beta announcement bar.',
  'minka-04': 'A dark event stage with Minka’s striped pattern and logo across the backdrop.',
  'minka-05': 'Two dark posters filled with Minka’s blocky color and line patterns.',
  'minka-06': 'Three covers of “A Blueprint for National RTP Success” in blue, yellow and coral.',
  'minka-07': 'Minka’s team page in black and white, with portraits set into blue and gray tiles.',
  'minka-08': 'Minka’s pattern generator: controls on the left, a black and white pattern it made on the right.',
  'minka-09': 'Three report covers pairing Minka patterns with architectural photography.',
  'minka-10': 'The Minka site’s Products menu, with a yellow and black pattern card beside the list.',
  'blumira-01': 'Blumira billboards on a city street, “Your Security Team in the Cloud” and “See Clearly. Respond Confidently.”',
  'blumira-02': 'Blumira’s Logs screen floating over a dark blue wave background.',
  'blumira-03': '“Where Good Security Becomes Second Nature.” on blue, beside a line drawing of a climber planting a flag.',
  'blumira-04': 'The Mira hedgehog app icon in eight brand colors.',
  'blumira-05': 'A laptop open to Blumira’s homepage, “Security smarts to help you spot threats with ease.”',
  'blumira-06': 'A Blumira tote bag on concrete steps, with a round offsite sticker in the corner.',
  'blumira-07': 'Spreads from Blumira’s guidelines covering Mira’s expressions and the illustration styles.',
  'blumira-08': 'Two Blumira posters, “Respond like a pro.” and “Capture the complete picture.”, over a moving blue wave.',
  'blumira-09': 'A “Demo & Discuss” event poster in pale green, shown flat and on a sidewalk sign.',
  'blumira-10': 'A one-line drawing of someone at a broken computer, next to a healthcare threat report full of big numbers.',
  'ultra-01': 'Ultra business cards: a dark name card and one covered in the blue, green and pink pixel pattern.',
  'ultra-02': 'An Ultra sign on a stone wall, its pixel pattern breaking up in the leaf shadows.',
  'ultra-03': 'Ultra’s pattern generator: a colorful pixel field with a panel of controls.',
  'ultra-04': 'Three Ultra social posts: a wireframe diagram, a pixel pattern, and a green “Every action, secured.”',
  'ultra-05': 'Someone carrying an Ultra tote printed with a black and white pixel pattern.',
  'ultra-06': 'Ultra’s web hero, “Secure every action your agents take,” over a strip of pixel pattern.',
  'ultra-07': 'Two Ultra mobile screens: “Security for agents that act.” and a blue pattern card.',
  'ultra-08': 'Four tall Ultra banners in blue, green, white and pink: Enable, Govern, Own, Verify.',
  'ultra-09': 'Ultra presentation slides titled “Built for what’s next.”',
  'ultra-10': 'Two Ultra ebook covers about securing what AI agents are allowed to do.',
  'keystrike-01': 'A Keystrike employee handbook on a round wooden side table.',
  'keystrike-02': 'A Keystrike billboard, “Protection without pauses.”, with colored ribbons running across it.',
  'keystrike-03': 'Keystrike platform cards: Continuous Verification, Live Remote Access Mapping and The Keystrike Platform.',
  'keystrike-04': 'A Keystrike business card on wood, next to a card covered in blue and violet blocks.',
  'keystrike-05': 'A Keystrike slide, “Keystrike: Unified,” with gradient shapes tied to a center point.',
  'keystrike-06': 'An office lobby with a Keystrike poster on a stand and a blue “All Hands Reykjavík 2026” card.',
  'keystrike-07': 'Keystrike homepage, “Continuous verification. Zero friction.”, with ribbons sweeping across.',
  'keystrike-08': 'A Keystrike flyer lying on moss-covered bricks.',
  'keystrike-09': 'A Keystrike social post: “Protect the core when everything else fails.”',
  'keystrike-10': 'The opening page of Keystrike’s brand story, “Who We Are.”',
  'keystrike-11': 'Three Keystrike cards in purple, green and pink: “Authentication assumes. Verification happens continuously.”',
  'tracebit-01': 'Tracebit web and product screens tilted into a collage: “The answer to Assume Breach.”',
  'tracebit-02': 'A Tracebit sign mounted on a concrete wall, plus a slim sign stand.',
  'tracebit-03': 'The Tracebit mark shown at a set of fixed angles, in color and in white.',
  'tracebit-04': 'A browser tool for composing the Tracebit mark, with the mark on a dark grid.',
  'tracebit-05': 'Tracebit on a desktop monitor, and a Tracebit business card.',
  'tracebit-h1': 'A full Tracebit homepage, top to bottom.',
  'tracebit-h2': 'A tall Tracebit kiosk outside a perforated metal building.',
  'tracebit-h3': 'A black Tracebit tote held up by one strap.',
  'tracebit-06': 'Four Tracebit social graphics in blush and black.',
  'tracebit-07': 'Two Tracebit posters: “Detect attacks across cloud at scale.”',
  'tracebit-08': 'Someone in a cream Tracebit hoodie.',
  'expel-01': 'A keynote stage with “No Black Box. No BS.” on the screen.',
  'expel-02': 'Expel’s trade show booth, its green X logo lit up on a metal frame.',
  'expel-03': 'Pages from Expel’s brand guidelines: logo variations, clearspace and layout types.',
  'expel-04': 'Two Expel web pages: “Before it’s a breach” and a page of big green stats.',
  'expel-05': 'Three Expel posters: “3 AM, you’re asleep. We’re on the breach.”, “We don’t sell peace of mind.” and “Detected. Contained.”',
  'expel-h1': 'Expel’s pixel robot mascot in twelve expressions.',
  'expel-h2': 'The pixel mascot up close.',
  'expel-06': 'An Expel lanyard badge and an annual report cover with the X pattern.',
  'expel-h3': 'A pile of green Expel keycaps.',
  'expel-h4': 'An Expel keycap keychain.',
  'expel-h5': 'A black Expel tote bag with the X pattern.',
  'expel-h6': 'A dark green Expel sweatshirt.',
  'taptopay-01': 'Tap to Pay style guide: seller portraits on pale blue, hands tapping a card to a phone, color swatches and ad layouts.',
  'taptopay-02': 'One hand holds out a card, the other holds an iPhone showing $35.00.',
  'taptopay-03': 'Pages from the Tap to Pay campaign design system: color, messaging and approved UI screens.',
  'taptopay-04': 'The Tap to Pay landing page open on a laptop.',
  'taptopay-07': 'Tap to Pay landing pages for Spain, France, Canada and more, tiled at an angle.',
  'taptopay-08': 'Tap to Pay motion studies: animated type, photo collages and a checkmark confirmation.',
  'taptopay-09': 'A phone playing a Tap to Pay social story, next to a grid of campaign frames.',
  'ugly-01': 'Ugly Magazine’s site: “28 pages packed with goofs, spoofs, and gags,” the $3 monthly club and a big SUBSCRIBE.',
  'ugly-02': 'Ugly Magazine brand guide pages: color palettes, typography and a giant lowercase a.',
  'ugly-03': 'Three Ugly social ads: a free-sample starburst, an “ask me to draw anything” post and the Goofs badge.',
  'ugly-04': 'Ugly’s cartoon characters, drawn for the website animations.',
  'ugly-06': 'Ugly’s About page on a phone held by a wooden hand: “Hello I am Ugly Magazine & I am a new indie comedy magazine…”',
  'ugly-08': 'Ugly’s custom cursor set: waving hand, grabbing hand, pointing finger, two arrows, a no sign and a text cursor.',
  'ugly-10': 'Four dark screens mapping Ugly’s referral, subscription, issue management and preorder flows.',
  'email-01': 'Type styles from the Market for Email system, on light and dark.',
  'email-02': 'The email icon library, sorted into action, alert, arrow, device and finance sets.',
  'email-03': 'Color tokens, logo lockups, buttons and a data table from the email system.',
  'email-04': 'Instructions for using the Figma library: grabbing a component and swapping nested ones.',
  'email-05': 'A finished loan offer email, “You’re on a roll, Kaitlyn,” beside the template variations behind it.',
  'motioncal-01': 'Motion’s desktop week view with color-coded events.',
  'motioncal-02': 'Three Motion phone screens: day view, a Groceries task and a to-do list.',
  'motioncal-03': 'Checking off a stack of “Sales team huddle” events in Motion, with the week view behind.',
  'experiments-01': 'Neature: posters and a tee built from vintage nature illustrations of a blue jay, pears, a brook trout and a tree.',
  'experiments-02': 'Square recruiting ads: “Join us in shaping the future of business,” “We’re hiring,” “Everyone.”',
  'experiments-03': 'Square illustration style: sellers and everyday objects drawn in red, blue and black.',
  'experiments-04': 'A hack week website exploration with neon gradients, a payments menu and a dotted schedule.',
  demoreel: 'Motion demo reel title card: SHAWN GOLDEN in tall type with a cartoon head.',
  capabilities: 'Creative Capabilities, with direction, brand, interactive, writing, illustration, motion and print in floating ovals.',
};

function range(prefix, n) {
  return Array.from({ length: n }, (_, i) => `${prefix}-${String(i + 1).padStart(2, '0')}`);
}
