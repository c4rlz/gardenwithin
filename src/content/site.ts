// All page copy and links. Edit words here; layout lives in src/pages and src/components.
// Field Notes posts are Markdown files in src/content/blog/<slug>/index.md.

export const site = {
  name: 'The Garden Within',
  description:
    'Field notes on living slower, in rhythm with my inner seasons, and in conversation with my body.',
  instagram: 'https://instagram.com/being.radiant',

  nav: [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Field Notes' },
    { href: '/tools', label: 'Tools' },
    { href: '/work-with-me', label: 'Work with me' },
    { href: '/contact', label: 'Contact' },
  ],

  home: {
    title: 'Attuning to my own inner seasons.',
    lede: 'I’m learning how to move with the energy of my seasons instead of expecting myself to bloom all year long.',
    intro: [
      'Like many people, I have learned to live inside systems that reward urgency, productivity, and constant forward motion — often at the expense of rest, embodiment, creativity, and genuine connection to ourselves.',
      'But lately, my body has been getting louder, asking for a different rhythm than the one I’ve been taught to value.',
      'This space is a collection of field notes from that unfolding.',
    ],
    notes: {
      title: 'Field Notes',
      body: [
        'I’m sharing observations I’ve gathered while learning how to live more intentionally and in rhythm with my inner seasons.',
        'This space is an exploration of living slower and more sustainably, in a way that honours all the different parts of myself.',
      ],
    },
    about: {
      title: 'Honouring the creature within',
      body: [
        'By day, I work in tech as a software developer. Over time, it became increasingly apparent how disconnected I had become from my own rhythms beneath the pressure of modern life.',
        'A lot of my life has been shaped by systems that taught me how to perform, produce, and keep pushing — even when my body was asking for something different.',
        'Lately, I’ve been exploring what it means to live differently. Living in conversation with my body instead of constantly overriding it.',
        'This space is where I’m collecting reflections, experiments, questions, and field notes from that unfolding.',
        'My hope is that this space encourages others to slow down, listen to themselves more deeply, and build lives that feel nourishing, rooted, and true to who they are.',
      ],
    },
  },

  tools: {
    title: 'Tools for tending your inner landscape',
    lede: 'Gentle tools for reflection, intentional growth, and living in conversation with yourself.',
    why: {
      title: 'Why I made it',
      body: 'I wanted something that helped me pay attention to my life without turning my life into another thing to optimize. The Garden Within grew out of a practice I’ve used and refined in my own life.',
    },
    template: {
      title: 'The Garden Within',
      tagline: 'A system for tending your life.',
      parts: [
        '🌱 Daily Seeds — Notice what matters',
        '🌿 Weekly Roots — Reflect on what is taking root',
        '🌸 Blossoms — Grow what deserves your attention',
      ],
      cta: 'View Template',
      href: 'https://rattle-layer-d9a.notion.site/The-Garden-Within-509258cd448282cc883e816a3577324a',
    },
    more: {
      title: 'More is growing',
      body: [
        'A small collection of practices, reflection tools and creative resources will live here over time.',
        'This space will grow slowly.',
      ],
    },
  },

  // New page for launch. [Bracketed] text is placeholder for Carly to replace.
  workWithMe: {
    title: 'Work with me',
    lede: 'For people in a season of change who are ready to stop overriding themselves, and to build days that feel rooted, spacious, and true.',
    body: [
      'Each session begins by slowing down and noticing what’s alive for you right now. From there, we gently untangle what you’re carrying and find one small, doable step for the season you’re in. Between sessions, you’ll have simple practices and tools, shaped around who you are and what you need. No giant plan for reinventing your life. Just steady tending, one step at a time.',
      'This is a good fit if you’re a dreamer who struggles to bring your ideas down to Earth, if you’re moving through a layoff, burnout or a big transition, or if you’ve spent years pushing past what your body is asking for. It isn’t therapy or medical care, and it isn’t a productivity program. If you’re looking for a quick fix or someone to keep you hustling, I’m probably not your person.',
    ],
    call: {
      title: 'A free 15-minute call',
      body: 'A short, no-pressure conversation to see whether working together feels right.',
      // Cal.com event link, e.g. 'https://cal.com/<username>/15min'. Empty shows a contact link instead.
      bookingUrl: '',
    },
  },

  contact: {
    title: 'I would love to hear from you ♡',
    thanks: {
      title: 'Thank you ♡',
      body: 'Your note is on its way to me. I’ll write back soon.',
    },
  },
};
