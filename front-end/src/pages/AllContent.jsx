import { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AiOutlineHome } from 'react-icons/ai'
import './Home.css'
import { BLOGS } from './blogsData.js'
import { LATEST_RESEARCH } from './latestResearchData.js'

export default function AllContent() {
  const location = useLocation()
  const [activeFilter, setActiveFilter] = useState('all')

  // Read filter from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const filter = params.get('filter')
    if (filter === 'blogs' || filter === 'research') {
      setActiveFilter(filter)
    }
  }, [location.search])

  // Format date like "AUG 19, 2025"
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  // Combine blogs and research, add type field
  const allPosts = useMemo(() => {
    const blogs = BLOGS.map(b => ({ ...b, type: 'blog' }))
    const research = LATEST_RESEARCH.map(r => ({ ...r, type: 'research' }))
    return [...blogs, ...research].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [])

  // Filter posts based on active filter
  const filteredPosts = useMemo(() => {
    if (activeFilter === 'all') return allPosts
    if (activeFilter === 'blogs') return allPosts.filter(p => p.type === 'blog')
    if (activeFilter === 'research') return allPosts.filter(p => p.type === 'research')
    return allPosts
  }, [activeFilter, allPosts])

  return (
    <section className="all-content">
      <div className="all-wrap">
        <div style={{ marginBottom: 20 }}>
          <Link to="/" className="blog-cta" title="Home" aria-label="Home">
            <AiOutlineHome style={{ verticalAlign: 'middle', marginRight: 6 }} /> Home
          </Link>
        </div>
        <div className="blog-filters">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All posts
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'blogs' ? 'active' : ''}`}
            onClick={() => setActiveFilter('blogs')}
          >
            Blogs
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'research' ? 'active' : ''}`}
            onClick={() => setActiveFilter('research')}
          >
            Research
          </button>
        </div>

        <div className="blog-grid-cartesia">
          {filteredPosts.map(post => (
            <Link 
              key={post.id} 
              to={post.type === 'blog' ? `/blogs/${post.id}` : `/research/${post.id}`} 
              className="blog-card-cartesia"
            >
              <div className="blog-card-date">{formatDate(post.date)}</div>
              <div className="blog-card-category">{post.category}</div>
              <img src={post.image} className="blog-card-image" alt="" />
              <div className="blog-card-title">{post.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}


