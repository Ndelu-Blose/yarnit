import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  colourSwatches,
  getProducts,
  heroPieceCopy,
  openProductModal,
  pickHeroProduct,
  resolveImageSrc,
} from '../lib/catalog';

export default function Hero() {
  const featured = useMemo(() => pickHeroProduct(getProducts()), []);
  const copy = featured ? heroPieceCopy(featured) : null;
  const heroImage = featured ? resolveImageSrc(featured.img) : null;

  return (
    <motion.div
      className="react-hero-visual"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="hero-image-frame react-hero-image-frame"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {heroImage ? (
          <img src={heroImage} alt={featured.name} loading="eager" decoding="async" />
        ) : (
          <div className="img-placeholder" role="img" aria-label="Yarn It crochet pieces">
            <span className="img-placeholder-text">Product image pending</span>
          </div>
        )}
      </motion.div>

      {featured && copy ? (
        <motion.button
          type="button"
          className="hero-mini-card hero-open react-hero-mini-card"
          onClick={() => openProductModal(featured.id)}
          aria-label={'View ' + copy.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3 }}
        >
          {featured.badge ? <span className="hero-mini-badge">{featured.badge}</span> : null}
          <span className="hero-mini-eyebrow">{copy.tag}</span>
          <div className="hero-mini-swatches" aria-hidden={!featured.colours}>
            {colourSwatches(featured.colours).map((s) => (
              <span key={s.name} className="colour-swatch" style={{ backgroundColor: s.hex }} />
            ))}
          </div>
          <h3>{copy.title}</h3>
          <p className="hero-mini-price">{copy.priceText}</p>
          <span className="hero-mini-cta">View piece <span className="btn-arrow">→</span></span>
        </motion.button>
      ) : null}
    </motion.div>
  );
}
