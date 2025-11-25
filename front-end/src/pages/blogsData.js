/**
 * Blog content supports Markdown format (like Mintlify).
 * 
 * You can use:
 * - Headings: ## Heading 2, ### Heading 3
 * - Paragraphs: Separate with blank lines
 * - Lists: Use - or * for bullet points, 1. for numbered lists
 * - Bold: **bold text**
 * - Italic: *italic text*
 * - Code: `inline code` or ```code blocks```
 * 
 * Example:
 * content: `
 *   ## Section Title
 *   
 *   This is a paragraph with **bold** and *italic* text.
 *   
 *   - Bullet point 1
 *   - Bullet point 2
 *   
 *   ### Subsection
 *   
 *   More content here.
 * `
 */

export const BLOGS = [
  {
    id: 'blog-tts',
    title: 'The Kannada Language: A Legacy of Epigraphy and Structural Integrity',
    subtitle: 'Tracing the History, Distinctive Features, and Contemporary Relevance of India\'s Classical Dravidian Tongue',
    image: '/Halmidi.jpeg',
    excerpt: 'As a venerable Classical Language of India, Kannada possesses a profound history evidenced by thousands of ancient inscriptions, including the pivotal Halmidi record (c. 450 CE). This formal overview examines Kannada\'s structural uniqueness, characterized by phonetic precision and a rich synthesis of Dravidian and Sanskrit elements, and highlights its enduring importance to cultural identity, socio-economic integration, and the preservation of India\'s vast linguistic diversity.',
    content: `
Kannada, a prominent member of the Dravidian language family, holds a significant place in India's cultural and linguistic heritage. Designated as a Classical Language by the Government of India in 2008, it is the administrative and official language of the state of Karnataka. The historical depth and structural sophistication of Kannada underscore its continued importance in the modern era.

## Historical Foundation and Epigraphic Evidence

The antiquity of the Kannada language is substantially substantiated by a rich tradition of inscriptions. The earliest evidence includes the word 'Isila', found in the Ashoka rock edict at Brahmagiri, which dates back to the 3rd century BCE.

A pivotal document in the history of written Kannada is the Halmidi inscription, generally dated to approximately 450 CE. This stone record, written in a form known as Poorvada Halegannada (Proto-Kannada), represents a crucial milestone in the evolution of the script. Further archaeological findings, such as the Talagunda inscription (c. 370 CE), which utilizes a mix of Kannada and Sanskrit, continue to refine the timeline of the language's development.

Historically, Kannada served as the court language for major South Indian dynasties, including the Kadambas, Chalukyas, Rashtrakutas, Hoysalas, and the Vijayanagara Empire. The vast corpus of inscriptions left by these kingdoms on stone, copper plates, and temple structures—spanning over a millennium—confirms Kannada's historical prominence and widespread use across the Deccan region.

## The Uniqueness of Kannada Structure

Kannada possesses several distinctive structural features that contribute to its rich expressive capability:

- **Linguistic Synthesis**: While firmly rooted in the Dravidian family, Kannada exhibits a rare capacity among its peers to effectively synthesize both native Dravidian grammar and vocabulary with elements drawn from Sanskrit. This adaptability has allowed the language to maintain a unique identity while enriching its lexicon over centuries.

- **Phonetic Precision**: The Kannada script, which evolved from the ancient Kadamba script, is renowned for its syllabic and phonetic consistency. Every written symbol corresponds precisely to one syllable, and the language contains no silent letters. This feature makes Kannada highly systematic and contributes to its melodious quality and clarity of articulation.

- **Literary Depth**: Kannada possesses one of the oldest and most extensive literary traditions among Indian languages, with an unbroken history spanning approximately 1,200 years. Its literary output has been recognized with eight Jnanpith Awards, the highest honor in Indian literature, demonstrating the depth and continued influence of its poets and writers, from the 9th-century Kavirajamarga to contemporary prose.

## Modern Usage and Importance

In the contemporary context, particularly in the rapidly developing state of Karnataka, the importance of the Kannada language extends far beyond cultural preservation:

- **Cultural Preservation and Identity**: Kannada acts as a vital conduit for the transmission of the region's diverse cultural expressions, including folk traditions, classical music, and traditional art forms like Yakshagana. For its millions of speakers, it is the foundation of their identity and heritage.

- **Socio-Economic Integration**: In the context of Bengaluru and other urban centers, proficiency in Kannada is instrumental for effective communication within the local administration, commercial sectors, and community. It facilitates social integration and offers a professional advantage in navigating local governance and business environments.

- **Contribution to Linguistic Diversity**: As a venerable Classical Language, the active promotion and usage of Kannada is a crucial effort in safeguarding India's profound linguistic diversity. It ensures that a language with a long documented history and a wealth of literary resources remains vibrant for academic study and future generations.

In summary, the Kannada language is a synthesis of history and progress. Its ancient roots, evidenced in thousands of inscriptions, are complemented by a refined structural uniqueness that continues to enable rich literary and intellectual discourse, affirming its pivotal role in the modern landscape of South India.
    `,
  },
  {
    id: 'blog-stt',
    title: 'Real‑Time Speech‑to‑Text at Scale',
    subtitle: 'Streaming, buffering, and correction strategies',
    image: '/Temples .jpeg',
    excerpt: 'Realtime STT hinges on streaming design and correction. We break down buffering strategy, confidence scoring, and late word corrections.',
    content: `
Stream audio in small chunks and surface partial transcripts with confidence scores for better UX.

Implement late word corrections and visual cues so users understand when text may still settle.
    `,
  },
  {
    id: 'blog-voice',
    title: 'Voice UX Best Practices',
    subtitle: 'Clarity, consent, and context',
    image: '/_.jpeg',
    excerpt: 'Voice interfaces should respect privacy, provide context, and confirm actions. These guidelines help teams design respectful, effective voice products.',
    content: `
Always inform users when recording and provide clear controls to pause or stop.

Use short confirmations and contextual hints to reduce user uncertainty and errors.
    `,
  },
]


