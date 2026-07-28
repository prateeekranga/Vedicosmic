import type { BlogPost } from '@/types/blog.types';

export default {
  id: 'chakras-subtle-body-prana-flow',
  slug: 'chakras-subtle-body-prana-flow',
  title: 'The Chakras and the Subtle Body: How Prana Flows Through You',
  seoTitle: 'The Chakras and the Subtle Body: Prana, Nadis & Energy Flow',
  excerpt:
    'How do the chakras relate to prana, the nadis and kundalini energy? A look at the chakras as part of the wider subtle-body system.',
  category: 'energy',
  tags: ['the chakras', 'subtle body', 'prana', 'nadis', 'kundalini', 'chakras'],
  authorId: 'vasanti',
  publishedAt: '2026-07-28',
  heroImage: '/og/blog/chakras-subtle-body-prana-flow.png',
  keyTakeaways: [
    'In yogic anatomy, the chakras are not isolated points — they sit along channels of subtle energy called nadis.',
    'Prana is the traditional term for subtle life-force, said to move through the nadis and gather at each chakra.',
    'Kundalini is described as a dormant, coiled energy at the base of the spine that can rise through the chakras.',
    'This is a traditional framework describing an unverified subtle anatomy — distinct from the physical nervous system.',
  ],
  content: [
    {
      type: 'paragraph',
      text:
        'The chakras are rarely described in isolation in the original texts — they are one part of a wider traditional map called the "subtle body," which also includes channels of energy flow (nadis) and life-force itself (prana). Understanding how these three fit together gives a fuller picture of what the chakra system is actually describing.',
    },
    { type: 'heading', level: 2, text: 'What Is Prana?' },
    {
      type: 'paragraph',
      text:
        'Prana is the traditional Sanskrit term for subtle life-force — the animating energy the yogic tradition says moves through the body, distinct from breath or blood in the purely physical sense, though closely tied to breath in practice. Pranayama, the yogic practice of breath control, is built on the idea that regulating the breath can influence the flow of prana through the subtle body.',
    },
    { type: 'internal-link', postSlug: 'pranayama-for-beginners', label: 'New to breathwork? Read Pranayama for Beginners' },
    { type: 'heading', level: 2, text: 'What Are Nadis?' },
    {
      type: 'paragraph',
      text:
        'Nadis are the traditional channels through which prana is said to flow, similar in concept to how meridians function in Traditional Chinese Medicine. Classical texts describe thousands of nadis, but three are considered most important: Ida (associated with the left side and lunar, cooling qualities), Pingala (the right side and solar, heating qualities), and Sushumna (the central channel running straight up the spine, along which the chakras themselves are said to sit).',
    },
    { type: 'diagram', id: 'chakra-column', caption: 'The chakras sit along Sushumna, the central subtle channel.' },
    { type: 'heading', level: 2, text: 'How Kundalini Relates to the Chakras' },
    {
      type: 'paragraph',
      text:
        'Kundalini is traditionally described as a dormant, coiled energy resting at the base of the spine, near the Root chakra. Certain practices — meditation, pranayama, specific postures — are said to gradually awaken this energy, allowing it to rise up through Sushumna and activate each chakra in turn as it ascends toward the Crown. This is described as a gradual, carefully-guided process in most traditional teaching, not something to force.',
    },
    { type: 'cta-tool', toolSlug: 'kundalini', label: 'Take the Guided Kundalini Journey' },
    {
      type: 'callout',
      tone: 'tip',
      title: 'A gradual process, never a forced one',
      text:
        'Traditional teaching consistently warns against forcing kundalini energy or attempting intense practices without guidance. A slow, steady approach — simple breathwork and meditation, built up gradually — is the recommended path, especially for beginners.',
    },
    { type: 'heading', level: 2, text: 'Subtle Body vs. Physical Nervous System' },
    {
      type: 'paragraph',
      text:
        'It is worth being clear that the subtle body — chakras, nadis and prana — is a traditional, symbolic model, distinct from the physical nervous system studied in anatomy and medicine. Some modern writers draw loose comparisons between chakra locations and major nerve plexuses or endocrine glands, but this is an interpretive analogy, not an anatomical finding, and the subtle body has not been verified through medical science.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A traditional model, not verified anatomy',
      text:
        'This is a symbolic framework for reflection and practice, not a scientifically confirmed description of the body. It does not diagnose or treat any condition, and it should never replace qualified medical or mental health care.',
    },
    { type: 'divider' },
    {
      type: 'internal-link',
      postSlug: 'seven-chakras-beginners-guide',
      label: 'Back to the full 7 chakras beginner\'s guide',
    },
    { type: 'cta-course', courseSlug: 'chakra-healing', label: 'Explore the Chakra Healing Course' },
  ],
  relatedToolSlugs: ['kundalini', 'chakra-assessment'],
  relatedCourseSlugs: ['chakra-healing'],
  faqs: [
    {
      id: 'chakras-subtle-body-faq-1',
      header: 'What is prana and how does it relate to chakras?',
      body:
        'Prana is the traditional term for subtle life-force, said to move through the body\'s nadis and gather at each chakra, expressing itself through that chakra\'s particular theme. Pranayama (breathwork) is the classical practice most associated with working with prana directly.',
    },
    {
      id: 'chakras-subtle-body-faq-2',
      header: 'What are nadis and how many are there?',
      body:
        'Nadis are the traditional channels through which prana is said to flow. Classical texts describe thousands of them, but three are considered most significant: Ida, Pingala, and Sushumna, the central channel along which the seven chakras are traditionally located.',
    },
    {
      id: 'chakras-subtle-body-faq-3',
      header: 'How does kundalini energy relate to the chakra system?',
      body:
        'Kundalini is described as a dormant energy at the base of the spine, near the Root chakra. Certain practices are said to gradually awaken it, allowing it to rise through the central channel and activate each chakra in sequence on its way toward the Crown.',
    },
    {
      id: 'chakras-subtle-body-faq-4',
      header: 'Can breathing exercises really affect subtle energy?',
      body:
        'Traditional teaching holds that breath and prana are closely linked, which is why pranayama practices are considered a direct way to work with subtle energy. There is no scientific measurement of "subtle energy" itself, but breathwork does have well-documented effects on the nervous system and stress response, which is likely part of why these practices feel calming in real, tangible ways.',
    },
    {
      id: 'chakras-subtle-body-faq-5',
      header: 'Is the subtle body the same as the physical nervous system?',
      body:
        'No. The subtle body — chakras, nadis and prana — is a traditional, symbolic model distinct from the anatomical nervous system studied in medicine. Some writers draw loose comparisons to nerve plexuses or glands, but this is an interpretive analogy, not a verified anatomical claim.',
    },
  ],
} satisfies BlogPost;
