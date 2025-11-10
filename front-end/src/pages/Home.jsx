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

  // ASR controls
  const [asrLanguage, setAsrLanguage] = useState('en')
  const [asrSrc, setAsrSrc] = useState('/en-male.mp3')
  const [transcribedText, setTranscribedText] = useState('')

  // Map languages/voices to files in public/ (update with your real filenames)
  const AUDIO_FILES = {
    en: { female: '/en-female.mp3', male: '/en-male.mp3' },
    hi: { female: '/hi-female.wav', male: '/hi-male.wav' },
    kn: { female: '/kn-female.mp3', male: '/kn-male.mp3' },
    mr: { female: '/mr-female.wav', male: '/mr-male.wav' }, 
    te: { female: '/te-female.wav', male: '/te-male.wav' }, 
    sa: { female: '/sa-female.wav', male: '/sa-male.wav' }, 
  }

  // ASR demo audio files (using male voices for demo)
  const ASR_AUDIO_FILES = {
    en: '/en-male.mp3',
    hi: '/hi-male.wav', 
    kn: '/kn-male.mp3',
    mr: '/mr-male.wav', 
    te: '/te-male.wav', 
    sa: '/sa-male.wav', 
  }


  // Demo texts for each language
  const DEMO_TEXTS = {
    en: 'We warmly welcome you to Somya Lab, a home for celebrating and preserving the world\'s many voices',
    kn: 'ಸೋಮ್ಯಾ ಲ್ಯಾಬ್‌ಗೆ ನಿಮಗೆ ಹೃತ್ಪೂರ್ವಕ ಸ್ವಾಗತ, ಇದು ವಿಶ್ವದ ಅನೇಕ ಧ್ವನಿಗಳನ್ನು ಆಚರಿಸುವ ಮತ್ತು ಸಂರಕ್ಷಿಸುವ ಮನೆಯಾಗಿದೆ.',
    hi: 'हम आपका हार्दिक स्वागत करते हैं सोम्या लैब में एक ऐसा स्थल जहाँ हम दुनिया की अनेक आवाज़ों का उत्सव मनाते और उन्हें संजोकर रखते हैं।',
    te: 'మేము మిమ్మల్ని హృదయపూర్వకంగా స్వాగతిస్తున్నాము సోమ్యా ల్యాబ్‌కి ఇది ప్రపంచంలోని అనేక స్వరాలను జరుపుకునే మరియు సంరక్షించే గృహం.',
    mr: 'आम्ही तुमचं हार्दिक स्वागत करतो सोम्या लॅबमध्ये जगातील अनेक आवाज साजरे आणि जपले जाणारे एक घर।',
    sa: 'वयं सोम्या प्रयोगशालायां हृदयपूर्वकं स्वागतं कुर्मः यत्र जगतः नानावाणीः उत्सवयामः च रक्षामः च।'
  }

  useEffect(() => {
    const path = AUDIO_FILES[ttsLanguage]?.[ttsVoice] ?? '/en-female.mp3'
    setTtsSrc(path)
  }, [ttsLanguage, ttsVoice])

  useEffect(() => {
    const path = ASR_AUDIO_FILES[asrLanguage] ?? '/en-male.mp3'
    setAsrSrc(path)
    // Clear transcribed text when language changes
    setTranscribedText('')
  }, [asrLanguage])

  const handleTranscribe = () => {
    // Show pre-written demo text for selected language
    const demoText = DEMO_TEXTS[asrLanguage] || DEMO_TEXTS.en
    setTranscribedText(demoText)
  }

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
              <div className="demo-text">{DEMO_TEXTS[ttsLanguage] || DEMO_TEXTS.en}</div>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', margin: '24px 24px 24px 24px'}}>
                <span style={{ opacity: 0.85 }}>Language:</span>
                <select className="tts-select" value={ttsLanguage} onChange={(e) => setTtsLanguage(e.target.value)}>
                  <option value="sa">Sanskrit</option> 
                  <option value="hi">Hindi</option>
                  <option value="kn">Kannada</option>
                  <option value="mr">Marathi</option>
                  <option value="te">Telugu</option>
                  <option value="en">English</option>
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
              <AudioPlayer src={asrSrc} />
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '24px 24px 16px 24px', flexWrap: 'wrap' }}>
                <span style={{ opacity: 0.85 }}>Language:</span>
                <select 
                  className="tts-select" 
                  value={asrLanguage} 
                  onChange={(e) => {
                    setAsrLanguage(e.target.value)
                    setTranscribedText('') // Clear text when language changes
                  }}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="kn">Kannada</option>
                  <option value="mr">Marathi</option>
                  <option value="te">Telugu</option>
                  <option value="sa">Sanskrit</option>
                </select>
                <button 
                  className="transcribe-btn-home"
                  onClick={handleTranscribe}
                >
                  Transcribe
                </button>
              </div>
              <div className="demo-text" align="left" style={{ 
                margin: '0 24px 16px 24px', 
                padding: '16px', 
                backgroundColor: transcribedText ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)', 
                borderRadius: '8px',
                border: transcribedText ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(255,255,255,0.1)',
                minHeight: '60px'
              }}>
                {transcribedText || ''}
              </div>
              <p className="demo-note">Speech to Text transcribes spoken audio into text. Select a language, play the sample, then click Transcribe to see the result.</p>
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
