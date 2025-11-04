import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Home.css'
import AudioPlayer from '../components/AudioPlayer.jsx'
import { BLOGS } from './blogsData.js'
import { STORIES } from './storiesData.js'

const STEPS = [
  { id: 'Text to Speech', label: 'Text to Speech', body: 'Convert text into natural audio' },
  { id: 'Speech to Text', label: 'Speech to Text', body: 'Transcribe audio to readable text' },
]


export default function Home() {
  const [active, setActive] = useState('Text to Speech')
  const [hoveredBlogId, setHoveredBlogId] = useState(BLOGS[0].id)
  const blogDetailRef = useRef(null)
  const navigate = useNavigate()
  // TTS controls
  const [ttsLanguage, setTtsLanguage] = useState('en')
  const [ttsVoice, setTtsVoice] = useState('female')
  const [ttsSrc, setTtsSrc] = useState('/en-female.mp3')

  // Map languages/voices to files in public/ (update with your real filenames)
  const AUDIO_FILES = {
    en: { female: '/en-female.mp3', male: '/en-male.mp3' },
    hi: { female: '/hi-female.mp3', male: '/hi-male.mp3' },
    es: { female: '/kn-female.mp3', male: '/kn-male.mp3' }, // Kannada
  }

  useEffect(() => {
    const path = AUDIO_FILES[ttsLanguage]?.[ttsVoice] ?? '/en-female.mp3'
    setTtsSrc(path)
  }, [ttsLanguage, ttsVoice])

  function goToBlog(id) {
    navigate(`/blogs/${id}`)
  }

  return (
    <>
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-copy" >
          <h1><span className="accent">समानो मन्त्रः समितिः समानी, <br />समानं मनः सहचित्तमेषाम्।</span> </h1>
          <p>Build speech experiences with instant Text‑to‑Speech and Speech‑to‑Text.</p>
          <Link to="/playground" className="primary-cta">Open Playground</Link>

          <div className="steps">
            {STEPS.map((s, idx) => (
              <button
                key={s.id}
                className={`step ${active === s.id ? 'active' : ''}`}
                onClick={() => setActive(s.id)}
              >
                <span className="step-index">{idx + 1}</span>
                <div className="step-text">
                  <div className="step-title">{s.label}</div>
                  <div className="step-desc">{s.body}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="hero-demo">
          {active === 'Text to Speech' && (
            <div className="demo-card tts">
              <div className="demo-text">  Welcome the Somya Labs </div>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', margin: '24px 24px 24px 24px'}}>
                <span style={{ opacity: 0.85 }}>Language:</span>
                <select className="tts-select" value={ttsLanguage} onChange={(e) => setTtsLanguage(e.target.value)}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Kannada</option>
                  <option value="es">Telugu</option>
                  <option value="es">Marathi</option>
                  <option value="es">Sanskrit</option>
                </select>
                <span style={{ opacity: 0.85}} >Voice:</span>
                <select className="tts-select" value={ttsVoice} onChange={(e) => setTtsVoice(e.target.value)}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <AudioPlayer src={ttsSrc} />
              <p className="demo-note" >Text to Speech converts your input into natural‑sounding audio. Choose a language and voice, then press play to preview.</p>
            </div>
          )}
          {active === 'Speech to Text' && (
            <div className="demo-card stt" >
              <AudioPlayer src="/en-male.mp3" />
              <div className="demo-text" align="left"> Welcome the Somya Labs</div>
              <p className="demo-note">Speech to Text transcribes spoken audio into text. Play the sample to hear the audio and compare it with the transcript.</p>
            </div>
          )}
        </div>
      </div>
    </section>
    {/* Blog section */}
    <section id="blog" className="blog">
      <div className="blog-wrap">
        <div className="blog-header">
          <h2><a href="/blogs/blog-tts" style={{ color: 'inherit', textDecoration: 'none' }}>Blogs</a></h2>
          <a className="blog-viewall" href="/all">View all</a>
        </div>
        <div className={`blog-grid open-${BLOGS.findIndex(x => x.id === hoveredBlogId) + 1}`} onMouseLeave={() => setHoveredBlogId(BLOGS[0].id)}>
          {BLOGS.slice(0, 3).map(b => (
            <article
              key={b.id}
              className={`blog-card ${hoveredBlogId === b.id ? 'open' : ''}`}
              onMouseEnter={() => setHoveredBlogId(b.id)}
              onClick={() => goToBlog(b.id)}
            >
              <div className="blog-card-inner">
                <div className="blog-image-wrap">
                  <img src={b.image} alt="" className="blog-image" />
                </div>
                <div className="blog-content">
                  <h3 className="blog-title">{b.title}</h3>
                  <div className="blog-subtitle">{b.subtitle}</div>
                  <div className="blog-body">
                    <p>{b.excerpt}</p>
                    
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        
      </div>
    </section>

    {/* Stories section */}
    <section className="stories">
      <div className="stories-wrap">
        <h2 className="stories-title"><a href="/blogs/blog-tts" style={{ color: 'inherit', textDecoration: 'none' }}>Latest Research</a></h2>
        <div className="stories-grid">
          <a className="story-card span-4" href="#">
            <div className="story-head">
              <div className="story-eyebrow"> </div>
              <div className="story-title"> </div>
            </div>
            <img className="story-image" src="/Pattern1.png" alt="" />
          </a>

          <a className="story-card span-4" href="#">
            <div className="story-head">
              <div className="story-eyebrow"> </div>
              <div className="story-title"></div>
            </div>
            <img className="story-image" src="/Pattern2.png" alt="" />
          </a>

          <a className="story-card span-4" href="#">
            <div className="story-head">
              <div className="story-eyebrow"></div>
              <div className="story-title"></div>
            </div>
            <img className="story-image" src="/Pattern4.png" alt="" />
          </a>

          <a className="story-card span-5 with-footer" href="#">
            <div className="story-head">
              <div className="story-eyebrow"></div>
              <div className="story-title big"></div>
            </div>
            <img className="story-image scale-zoom" src="/Pattern3.png" alt="" />
            
          </a>

          <a className="story-card span-7 with-footer" href="#">
            <div className="story-head">
              <div className="story-eyebrow"> </div>
              <div className="story-title"></div>
            </div>
            <img className="story-image" src="/Pattern5.png" alt="" />
            
          </a>
        </div>
      </div>
    </section>
    {/* Footer */}
    <footer className="site-footer">
      <div className="footer-cta">
        <div className="footer-cta-inner">
          <h2>Get started with Somya Labs</h2>
          <button className="footer-cta-btn" type="button">Open Playground</button>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-wrap">
          <div className="footer-col">
            <div className="footer-heading">Our Research</div>
            <a href="#">Research Index</a>
            <a href="#">Research Overview</a>
            <a href="#">Research Residency</a>
          </div>
          <div className="footer-col">
            <div className="footer-heading">Somya labs</div>
            <a href="#">Explore playground</a>
            <a href="#">Enterprise</a>
            <a href="#">Education</a>
            <a href="#">Pricing</a>
          </div>
          <div className="footer-col">
            <div className="footer-heading">For Business</div>
            <a href="#">Business Overview</a>
            <a href="#">Solutions</a>
            <a href="#">Contact Sales</a>
          </div>
          <div className="footer-col">
            <div className="footer-heading">Company</div>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Brand</a>
          </div>
          <div className="footer-col">
            <div className="footer-heading">Terms & Policies</div>
            <a href="#">Terms of Use</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Other Policies</a>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
