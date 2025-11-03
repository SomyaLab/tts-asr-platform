import { Link } from 'react-router-dom'
import './Home.css'
import { BLOGS } from './blogsData.js'
import { STORIES } from './storiesData.js'

export default function AllContent() {
  return (
    <section className="all-content">
      <div className="all-wrap">
        <div className="all-header">
          <h2>All Blogs</h2>
        </div>
        <div className="all-blog-grid">
          {BLOGS.map(b => (
            <Link key={b.id} to={`/blogs/${b.id}`} className="all-blog-card">
              <img src={b.image} className="all-blog-image" alt="" />
              <div className="all-blog-meta">
                <div className="all-blog-title">{b.title}</div>
                <div className="all-blog-sub">{b.subtitle}</div>
                <div className="all-blog-excerpt">{b.excerpt}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="all-header" style={{ marginTop: 40 }}>
          <h2>All Stories</h2>
        </div>
        <div className="all-stories-grid">
          {STORIES.map(s => (
            <a key={s.id} className="all-story-card" href="#">
              <img src={s.image} className="all-story-image" alt="" />
              <div className="all-story-meta">
                <div className="all-story-eyebrow">{s.eyebrow}</div>
                <div className="all-story-title">{s.title}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}


