export const BLOGS = [
  {
    id: 'blog-tts',
    title: 'Building Delightful Text‑to‑Speech UX',
    subtitle: 'Latency, voice choice, and emotion matter',
    image: '/Halmidi.jpeg',
    excerpt: 'Designing TTS that feels natural is more than just swapping a voice. Learn how to manage latency, provide voice choices, and set expectations for users.',
    content: [
      'Great TTS experiences minimize perceived latency, provide clear voice options, and give users control over pace and emotion.',
      'Use caching, progressive rendering, and helpful defaults to make playback feel instant while keeping the UI simple.',
    ],
  },
  {
    id: 'blog-stt',
    title: 'Real‑Time Speech‑to‑Text at Scale',
    subtitle: 'Streaming, buffering, and correction strategies',
    image: '/Temples .jpeg',
    excerpt: 'Realtime STT hinges on streaming design and correction. We break down buffering strategy, confidence scoring, and late word corrections.',
    content: [
      'Stream audio in small chunks and surface partial transcripts with confidence scores for better UX.',
      'Implement late word corrections and visual cues so users understand when text may still settle.',
    ],
  },
  {
    id: 'blog-voice',
    title: 'Voice UX Best Practices',
    subtitle: 'Clarity, consent, and context',
    image: '/_.jpeg',
    excerpt: 'Voice interfaces should respect privacy, provide context, and confirm actions. These guidelines help teams design respectful, effective voice products.',
    content: [
      'Always inform users when recording and provide clear controls to pause or stop.',
      'Use short confirmations and contextual hints to reduce user uncertainty and errors.',
    ],
  },
]


