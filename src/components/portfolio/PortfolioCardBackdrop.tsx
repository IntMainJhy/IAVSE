'use client';
// Contact-card shader treatment adapted from rbp-portfolio/components/contact/contact-card.tsx.
import {ShaderFlow} from './ShaderFlow';
export function PortfolioCardBackdrop(){return <div className="portfolio-card-backdrop" aria-hidden="true"><ShaderFlow className="portfolio-flow" scale={3} brightness={3}/></div>;}
