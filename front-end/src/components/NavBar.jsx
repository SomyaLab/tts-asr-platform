import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './NavBar.css'
import AuthModal from './AuthModal.jsx'
import { useAuth } from '../AuthContext.jsx'
import { IoMenu } from 'react-icons/io5'

export default function NavBar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [onLight, setOnLight] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change or window resize up to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 860) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Detect when nav sits over a light (white) section like #blog
  useEffect(() => {
    function updateTheme() {
      const blog = document.getElementById('blog')
      const nav = document.querySelector('.site-nav')
      if (!blog || !nav) {
        setOnLight(false)
        return
      }
      const navHeight = nav.getBoundingClientRect().height
      const blogTop = blog.getBoundingClientRect().top + window.scrollY
      setOnLight(window.scrollY + navHeight >= blogTop - 1)
    }
    window.addEventListener('scroll', updateTheme)
    window.addEventListener('resize', updateTheme)
    updateTheme()
    return () => {
      window.removeEventListener('scroll', updateTheme)
      window.removeEventListener('resize', updateTheme)
    }
  }, [])

  const [authOpen, setAuthOpen] = useState(false)
  const shouldNavigateAfterLogin = useRef(false)

  const handlePlaygroundClick = (e) => {
    e.preventDefault()
    setMenuOpen(false)
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
    <header className={`site-nav ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'menu-open' : ''} ${onLight ? 'on-light' : ''}`}>
      <div className="header-inner">
        <div className="nav-glass">
          <div className="site-brand">
            <img src="/logo.png" alt="Somya Labs logo" className="site-logo" />
            <span>Somya Lab</span>
          </div>

          {/* Mobile toggle button */}
          <button
            className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen(v => !v)}
          >
            <span className="sr-only">Toggle menu</span>
            <IoMenu />
          </button>

          {/* Inline desktop layout */}
          <nav className="site-links" id="primary-navigation">
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)}>About us</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          </nav>
          <div className="nav-actions">
            {!user && (
              <button className="link-btn" onClick={() => { setMenuOpen(false); setAuthOpen(true) }}>Login</button>
            )}
            <a href="/playground" className="primary-cta" onClick={handlePlaygroundClick}>Playground</a>
          </div>

          {/* Collapsible dropdown (mobile) */}
          <div className="nav-collapsible">
            <nav className="site-links">
              <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)}>About us</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            </nav>
            <div className="nav-actions">
              {!user && (
                <button className="link-btn" onClick={() => { setMenuOpen(false); setAuthOpen(true) }}>Login</button>
              )}
              <a href="/playground" className="primary-cta" onClick={handlePlaygroundClick}>Playground</a>
            </div>
          </div>
        </div>
      </div>
      <AuthModal open={authOpen} onClose={handleAuthClose} />
    </header>
    {menuOpen && <div className="nav-scrim" onClick={() => setMenuOpen(false)} />}
    </>
  )
}


