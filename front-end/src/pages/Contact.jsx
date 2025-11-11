import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiMiniHome } from 'react-icons/hi2'
import './Contact.css'

export default function Contact() {
  const [form, setForm] = useState({ first: '', last: '', email: '', phone: '', company: '' })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const [submitted, setSubmitted] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setIsSending(true)
    setError('')
    
    try {
      // Get API base URL from environment variable or use default
      const rawApiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'
      const API_BASE = rawApiBase.replace(/\/api\/?$/, '')
      
      const response = await fetch(`${API_BASE}/api/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to submit form' }))
        throw new Error(errorData.detail || `Server error: ${response.status}`)
      }
      
      const data = await response.json()
      setIsSending(false)
      setSubmitted(true)
      
      // Reset form after showing success message
      setTimeout(() => {
        setForm({ first: '', last: '', email: '', phone: '', company: '' })
        setSubmitted(false)
      }, 3000)
    } catch (err) {
      console.error('Error submitting form:', err)
      setError(err.message || 'Failed to submit form. Please try again.')
      setIsSending(false)
    }
  }

  return (
    <section className="contact">
      <div className="contact-top">
        <Link to="/" className="navbar-btn home-btn" title="Home">
          <HiMiniHome />
        </Link>
      </div>

      <h2 className="contact-title">Request a demo</h2>

      <form className="contact-form" onSubmit={submit}>

          <label className="field">
            <span>First name :</span>
            <input required value={form.first} onChange={(e) => update('first', e.target.value)} />
          </label>
        

        <label className="field">
          <span>Work Email :</span>
          <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
        </label>

        <label className="field">
          <span>Mobile number :</span>
          <input required value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        </label>

        <label className="field">
          <span>Company name :</span>
          <input required value={form.company} onChange={(e) => update('company', e.target.value)} />
        </label>

        {error && (
          <div className="submit-error">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}
        <div className="submit-row">
          {submitted ? (
            <div className="submit-success">
              <span className="success-icon">✓</span>
              <span>Form submitted successfully!</span>
            </div>
          ) : (
            <button type="submit" className="submit-btn" disabled={isSending}>
              {isSending ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
