import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { AiOutlineHome } from 'react-icons/ai'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './Blogs.css'
import { BLOGS } from './blogsData.js'
import { STORIES } from './storiesData.js'

export default function Blogs() {
  const params = useParams()
  const location = useLocation()
  const current = useMemo(() => BLOGS.find(b => b.id === params.blogId) ?? BLOGS[0], [params.blogId])
  const [activeList, setActiveList] = useState('blogs')

  useEffect(() => {
    const qs = new URLSearchParams(location.search)
    const tab = qs.get('tab')
    if (tab === 'stories') setActiveList('stories')
    else setActiveList('blogs')
  }, [location.search])

  return (
    <section className="blog blog-page">
      <div className="blog-wrap two-col">
        <aside className="blog-aside">
          <div style={{ marginBottom: 10 }}>
            <Link to="/" className="blog-cta" title="Home" aria-label="Home">
              <AiOutlineHome style={{ verticalAlign: 'middle', marginRight: 6 }} /> Home
            </Link>
          </div>
          <div className="side-buttons">
            <button className={`side-btn ${activeList === 'blogs' ? 'active' : ''}`} onClick={() => setActiveList('blogs')}>Blogs</button>
            <button className={`side-btn ${activeList === 'stories' ? 'active' : ''}`} onClick={() => setActiveList('stories')}>Stories</button>
          </div>
          <div className="side-list">
            {activeList === 'blogs' && (
              <div className="side-group">
                {BLOGS.map(b => (
                  <Link key={b.id} to={`/blogs/${b.id}`} className={`side-item ${b.id === current.id ? 'current' : ''}`}>{b.title}</Link>
                ))}
              </div>
            )}
            {activeList === 'stories' && (
              <div className="side-group">
                {STORIES.map(s => (
                  <a key={s.id} href="#" className="side-item">{s.title}</a>
                ))}
              </div>
            )}
          </div>
        </aside>

        <article className="blog-article">
          <div className="blog-hero">
            <div className="meta-line">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <h1 className="blog-title-hero">{current.title}</h1>
            <p className="blog-sub-hero">{current.subtitle}</p>
            
          </div>

          <div id="content" className="blog-detail">
            <div className="blog-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{current.content}</ReactMarkdown>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Link to="/" className="blog-cta">Back to Home</Link>
          </div>
        </article>
      </div>
    </section>
  )
}


