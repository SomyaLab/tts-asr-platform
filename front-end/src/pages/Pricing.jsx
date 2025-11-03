import { Link } from 'react-router-dom'
import './Pricing.css'

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 20,
    credits: 100,
    features: ['limited text', 'limited file uploading', 'NaN'],
    cta: 'Current plan',
    variant: 'current',
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 30,
    credits: 300,
    features: ['limited text', 'limited file uploading', 'NaN'],
    cta: 'Get Plus',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 50,
    credits: 400,
    features: ['limited text', 'limited file uploading', 'NaN'],
    cta: 'Get Pro',
  },
]

export default function Pricing() {
  return (
    <div className="pricing">
      <div className="pricing-top">
        <Link to="/" className="pg-back">←</Link>
        <span>Home</span>
      </div>
      <h2 className="pricing-title">Credit Plans</h2>
      <div className="plans-grid">
        {PLANS.map((plan) => (
          <article className="plan" key={plan.id}>
            <h3 className="plan-title">{plan.name}</h3>
            <button className={`plan-cta ${plan.variant === 'current' ? 'is-current' : ''}`}>
              {plan.cta}
            </button>
            <p className="plan-price">
              $ {plan.price} / {plan.credits} credits.
            </p>
            <ul className="plan-features">
              {plan.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}
