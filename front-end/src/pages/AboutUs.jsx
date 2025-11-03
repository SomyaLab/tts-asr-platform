import { Link } from 'react-router-dom'
import './AboutUs.css'

export default function AboutUs() {
  return (
    <section className="about">
      <div className="about-top">
        <Link to="/" className="pg-back">←</Link>
        <span>Home</span>
      </div>
      <div className="about-content">
        <p className="lead">At Somya.ai, we’re on a mission to make generative AI real for Bharat.</p>

        <p>
          Founded by a team of passionate experts, we aim to lead transformative research in AI that will make
          development, deployment, and distribution of GenAI apps in India significantly robust, performant,
          and cost-effective.
        </p>

        <p>
          With Somya’s generative AI building blocks, enterprises can unlock new market opportunities, establish
          direct and deeper connect with their customers.
        </p>

        <p>
          Join us as we continue to redefine what’s possible in the world of AI.
        </p>
      </div>
    </section>
  );
}
