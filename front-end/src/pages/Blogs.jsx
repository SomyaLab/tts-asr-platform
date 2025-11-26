import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './Blogs.css'
import { BLOGS } from './blogsData.js'

export default function Blogs() {
  const params = useParams()
  const current = useMemo(() => BLOGS.find(b => b.id === params.blogId) ?? BLOGS[0], [params.blogId])

  return (
    <section className="blog blog-page">
      <div className="blog-wrap">
        <div style={{ marginBottom: 20 }}>
          <Link to="/all" className="blog-cta" title="Back to All Posts" aria-label="Back to All Posts">
            <FaArrowLeft style={{ verticalAlign: 'middle', marginRight: 6 }} /> Back to All Posts
          </Link>
        </div>

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
            <Link to="/all" className="blog-cta">
              <FaArrowLeft style={{ verticalAlign: 'middle', marginRight: 6 }} /> Back to All Posts
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}


