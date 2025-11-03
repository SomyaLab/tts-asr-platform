import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Contact.css'

export default function Contact() {
  const [form, setForm] = useState({ first: '', last: '', email: '', phone: '', company: '' })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function submit(e) {
    e.preventDefault()
    // Placeholder: replace with real submission later
    alert('Submitted!')
  }

  return (
    <section className="contact">
      <div className="contact-top">
        <Link to="/" className="pg-back">←</Link>
        <span>Home</span>
      </div>

      <h2 className="contact-title">Request a demo</h2>

      <form className="contact-form" onSubmit={submit}>
        <div className="row">
          <label className="field">
            <span>First name *:</span>
            <input required value={form.first} onChange={(e) => update('first', e.target.value)} />
          </label>
          <label className="field">
            <span>Last name *:</span>
            <input required value={form.last} onChange={(e) => update('last', e.target.value)} />
          </label>
        </div>

        <label className="field">
          <span>Work Email* :</span>
          <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
        </label>

        <label className="field">
          <span>Mobile number* :</span>
          <input required value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        </label>

        <label className="field">
          <span>Company name* :</span>
          <input required value={form.company} onChange={(e) => update('company', e.target.value)} />
        </label>

        <div className="submit-row">
          <button type="submit" className="submit-btn">Submit</button>
        </div>
      </form>
    </section>
  );
}
