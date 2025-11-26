import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Home.css'
import AudioPlayer from '../components/AudioPlayer.jsx'
import { BLOGS } from './blogsData.js'
import { LATEST_RESEARCH } from './latestResearchData.js'
import { useAuth } from '../AuthContext.jsx'
import AuthModal from '../components/AuthModal.jsx'

const STEPS = [
  { id: 'Text to Speech', label: 'Text to Speech', body: 'Convert text into natural audio' },
  { id: 'Speech to Text', label: 'Speech to Text', body: 'Transcribe audio to readable text' },
]


export default function Home() {
  const { user } = useAuth()
  const [active, setActive] = useState('Text to Speech')
  const [hoveredBlogId, setHoveredBlogId] = useState(BLOGS[0].id)
  const blogDetailRef = useRef(null)
  const navigate = useNavigate()
  const [authOpen, setAuthOpen] = useState(false)
  const shouldNavigateAfterLogin = useRef(false)
  // TTS controls
  const [ttsLanguage, setTtsLanguage] = useState('')
  const [ttsVoice, setTtsVoice] = useState('male')
  const [ttsSrc, setTtsSrc] = useState('')

  // ASR controls
  const [asrLanguage, setAsrLanguage] = useState('')
  const [asrSrc, setAsrSrc] = useState('')
  const [transcribedText, setTranscribedText] = useState('')

  // Map languages/voices to files in public/ (update with your real filenames)
  const AUDIO_FILES = {
    en: { female: '/en-female.mp3', male: '/en-male.mp3' },
    hi: { female: '/hi-female.wav', male: '/hi-male.wav' },
    kn: { female: '/kn-female.mp3', male: '/kn-male.mp3' },
    mr: { female: '/mr-female.wav', male: '/mr-male.wav' }, 
    te: { female: '/te-female.wav', male: '/te-male.wav' }, 
    sa: { female: '/sa-female.wav', male: '/sa-male.wav' },
    bn: { female: '/bn-female.wav', male: '/bn-male.wav' },
    bh: { female: '/bh-female.wav', male: '/bh-male.wav' },
    mh: { female: '/mh-female.wav', male: '/mh-male.wav' },
    mg: { female: '/mg-female.wav', male: '/mg-male.wav' },
    ch: { female: '/ch-female.wav', male: '/ch-male.wav' },
    gu: { female: '/gu-female.wav', male: '/gu-male.wav' }
  }

  // ASR demo audio files (using male voices for demo)
  const ASR_AUDIO_FILES = {
    en: '/en-male.mp3',
    hi: '/hi-male.wav', 
    kn: '/kn-male.mp3',
    mr: '/mr-male.wav', 
    te: '/te-male.wav', 
    sa: '/sa-male.wav',
    bn: '/bn-male.wav',
    bh: '/bh-male.wav',
    mh: '/mh-male.wav',
    mg: '/mg-male.wav',
    ch: '/ch-male.wav',
    gu: '/gu-male.wav'
  }


  // Demo texts for each language
  const DEMO_TEXTS = {
    en: 'We warmly welcome you to Somya Lab, a home for celebrating and preserving the world\'s many voices',
    kn: 'ಸೋಮ್ಯಾ ಲ್ಯಾಬ್‌ಗೆ ನಿಮಗೆ ಹೃತ್ಪೂರ್ವಕ ಸ್ವಾಗತ, ಇದು ವಿಶ್ವದ ಅನೇಕ ಧ್ವನಿಗಳನ್ನು ಆಚರಿಸುವ ಮತ್ತು ಸಂರಕ್ಷಿಸುವ ಮನೆಯಾಗಿದೆ.',
    hi: 'हम आपका हार्दिक स्वागत करते हैं सोम्या लैब में एक ऐसा स्थल जहाँ हम दुनिया की अनेक आवाज़ों का उत्सव मनाते और उन्हें संजोकर रखते हैं।',
    te: 'మేము మిమ్మల్ని హృదయపూర్వకంగా స్వాగతిస్తున్నాము సోమ్యా ల్యాబ్‌కి ఇది ప్రపంచంలోని అనేక స్వరాలను జరుపుకునే మరియు సంరక్షించే గృహం.',
    mr: 'आम्ही तुमचं हार्दिक स्वागत करतो सोम्या लॅबमध्ये जगातील अनेक आवाज साजरे आणि जपले जाणारे एक घर।',
    sa: 'वयं सोम्या प्रयोगशालायां हृदयपूर्वकं स्वागतं कुर्मः यत्र जगतः नानावाणीः उत्सवयामः च रक्षामः च।',
    bn: 'আমরা আপনাকে সোম্যা ল্যাবে আন্তরিকভাবে স্বাগত জানাই, বিশ্বের বহু কণ্ঠ উদযাপন ও সংরক্ষণের একটি ঘর।',
    bh: 'हम आपका हार्दिक स्वागत करते हैं सोम्या लैब में एक ऐसा स्थल जहाँ हम दुनिया की अनेक आवाज़ों का उत्सव मनाते और उन्हें संजोकर रखते हैं।',
    mh: 'हम आपका हार्दिक स्वागत करते हैं सोम्या लैब में एक ऐसा स्थल जहाँ हम दुनिया की अनेक आवाज़ों का उत्सव मनाते और उन्हें संजोकर रखते हैं।',
    mg: 'हम आपका हार्दिक स्वागत करते हैं सोम्या लैब में एक ऐसा स्थल जहाँ हम दुनिया की अनेक आवाज़ों का उत्सव मनाते और उन्हें संजोकर रखते हैं।',
    ch: 'हम आपका हार्दिक स्वागत करते हैं सोम्या लैब में एक ऐसा स्थल जहाँ हम दुनिया की अनेक आवाज़ों का उत्सव मनाते और उन्हें संजोकर रखते हैं।',
    gu: 'અમે તમને સોમ્યા લેબમાં હૃદયપૂર્વક સ્વાગત કરીએ છીએ, એક એવું સ્થાન જ્યાં આપણે વિશ્વની અનેક અવાજોનો ઉત્સવ મનાવીએ છીએ અને તેમને સાચવીએ છીએ.'
  }

  useEffect(() => {
    if (ttsLanguage) {
      const path = AUDIO_FILES[ttsLanguage]?.[ttsVoice] ?? '/en-female.mp3'
      setTtsSrc(path)
    } else {
      setTtsSrc('')
    }
  }, [ttsLanguage, ttsVoice])

  useEffect(() => {
    if (asrLanguage) {
      const path = ASR_AUDIO_FILES[asrLanguage] ?? '/en-male.mp3'
      setAsrSrc(path)
    } else {
      setAsrSrc('')
    }
    // Clear transcribed text when language changes
    setTranscribedText('')
  }, [asrLanguage])

  const handleTranscribe = () => {
    if (!asrLanguage) {
      alert('Please select a language first')
      return
    }
    // Show pre-written demo text for selected language
    const demoText = DEMO_TEXTS[asrLanguage] || DEMO_TEXTS.en
    setTranscribedText(demoText)
  }

  function goToBlog(id) {
    navigate(`/blogs/${id}`)
  }

  const handlePlaygroundClick = (e) => {
    e.preventDefault()
    if (!user) {
      shouldNavigateAfterLogin.current = true
      setAuthOpen(true)
    } else {
      navigate('/playground')
    }
  }

  const handleAuthClose = () => {
    setAuthOpen(false)
  }

  // Navigate to playground after successful login
  useEffect(() => {
    if (user && shouldNavigateAfterLogin.current && !authOpen) {
      shouldNavigateAfterLogin.current = false
      navigate('/playground')
    }
  }, [user, authOpen, navigate])

  return (
    <>
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-copy" >
          <h1><span className="accent">समानो मन्त्रः समितिः समानी, <br />समानं मनः सहचित्तमेषाम्।</span> </h1>
          <p>Build speech experiences with instant Text‑to‑Speech and Speech‑to‑Text.</p>
          <div className="cta-container">
            <a href="/playground" className="primary-cta" onClick={handlePlaygroundClick}>Explore Our Playground</a>
            <p className="or-text">OR</p>
          </div>
        </div>

        <div className="hero-demo">
          <div className="steps">
              {STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  className={`step ${active === s.id ? 'active' : ''}`}
                  onClick={() => setActive(s.id)}
                >
                  <div className="step-text">
                    <div className="step-title">{s.label}</div>
                    <div className="step-desc">{s.body}</div>
                  </div>
                </button>
              ))}
            </div>
          {active === 'Text to Speech' && (
            <div className="demo-card tts">
              <p className="demo-note" >Text to Speech converts your input into natural‑sounding audio. Choose a language and voice, then press play to preview.</p>
              <div className="demo-text">{ttsLanguage ? (DEMO_TEXTS[ttsLanguage] || DEMO_TEXTS.en) : 'Please select a language to see demo text.'}</div>
              <div className="tts-controls">
                <span className="control-label">Language:</span>
                <select className="tts-select" value={ttsLanguage} onChange={(e) => setTtsLanguage(e.target.value)} required>
                  <option value="" disabled>Select language</option>
                  <option value="sa">Sanskrit</option> 
                  <option value="hi">Hindi</option>
                  <option value="kn">Kannada</option>
                  <option value="mr">Marathi</option>
                  <option value="te">Telugu</option>
                  <option value="en">English</option>
                  <option value="bn">Bengali</option>
                  <option value="bh">Bhojpuri</option>
                  <option value="mh">Maithili</option>
                  <option value="mg">Magahi</option>
                  <option value="ch">Chhattisgarhi</option>
                  <option value="gu">Gujarati</option>
                </select>
                <span className="control-label">Voice:</span>
                <select className="tts-select" value={ttsVoice} onChange={(e) => setTtsVoice(e.target.value)}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <AudioPlayer src={ttsSrc} />
              
            </div>
          )}
          {active === 'Speech to Text' && (
            <div className="demo-card stt" >
              
              <p className="demo-note">Speech to Text transcribes spoken audio into text. Select a language, play the sample, then click Transcribe to see the result.</p>
              <AudioPlayer src={asrSrc} />
              <div className="stt-controls">
                <span className="control-label">Language:</span>
                <select 
                  className="tts-select" 
                  value={asrLanguage} 
                  onChange={(e) => {
                    setAsrLanguage(e.target.value)
                    setTranscribedText('') // Clear text when language changes
                  }}
                  required
                >
                  <option value="" disabled>Select language</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="kn">Kannada</option>
                  <option value="mr">Marathi</option>
                  <option value="te">Telugu</option>
                  <option value="sa">Sanskrit</option>
                  <option value="bn">Bengali</option>
                  <option value="bh">Bhojpuri</option>
                  <option value="mh">Maithili</option>
                  <option value="mg">Magahi</option>
                  <option value="ch">Chhattisgarhi</option>
                  <option value="gu">Gujarati</option>
                </select>
                <button 
                  className="transcribe-btn-home"
                  onClick={handleTranscribe}
                  disabled={!asrLanguage}
                >
                  Transcribe
                </button>
              </div>
              <div className={`demo-text stt-transcribed-text ${transcribedText ? 'has-text' : ''}`}>
                {transcribedText || ''}
              </div>
              
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
          <Link className="blog-viewall" to="/all?filter=blogs">View all</Link>
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

    {/* Latest Research section */}
    <section className="stories">
      <div className="stories-wrap">
        <div className="stories-header">
          <h2 className="stories-title">Latest Research</h2>
          <Link className="stories-viewall" to="/all?filter=research">View all</Link>
        </div>
        <div className="stories-grid">
          {LATEST_RESEARCH.slice(0, 5).map((research, index) => {
            const spanClasses = index === 3 ? 'span-5' : index === 4 ? 'span-7' : 'span-4'
            const cardClasses = index >= 3 ? 'with-footer' : ''
            const scaleClass = index === 3 ? 'scale-zoom' : ''
            return (
              <Link key={research.id} to={`/research/${research.id}`} className={`story-card ${spanClasses} ${cardClasses}`}>
                <div className="story-head">
                  <div className="story-eyebrow">{research.eyebrow}</div>
                </div>
                <img className={`story-image ${scaleClass}`} src={research.image} alt={research.title} />
                <div className={`story-title-bottom ${index === 3 ? 'big' : ''}`}>{research.title}</div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
    {/* Footer */}
    <footer className="site-footer">
      <div className="footer-cta">
        <div className="footer-cta-inner">
          <h2>Get started with Somya Labs</h2>
          <a className="footer-cta-btn" type="button" href="/playground" onClick={handlePlaygroundClick}>Open Playground</a>
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
    <AuthModal open={authOpen} onClose={handleAuthClose} />
    </>
  );
}
