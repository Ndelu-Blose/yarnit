import { motion } from 'framer-motion';
import { colourLabel, openProductModal, resolveImageSrc, usesCataloguePhoto } from '../lib/catalog';
import ColourSwatches from './ColourSwatches';

export default function ProductCard({ product, index }) {
  const catalogue = usesCataloguePhoto(product);
  const src = resolveImageSrc(product.img);

  return (
    <motion.article
      className="product-card boutique-card react-product-card"
      data-cat={product.cat}
      data-product-id={product.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <button
        type="button"
        className="product-open"
        onClick={() => openProductModal(product.id)}
        aria-label={'View ' + product.name}
      >
        <div className={'product-img-wrap standard-img-wrap mock-card-media' + (catalogue ? ' is-catalogue' : '')}>
          <span className="product-favourite" aria-hidden="true">♡</span>
          {catalogue ? <span className="catalogue-chip">Colour range</span> : null}
          {product.badge ? <span className="product-badge">{product.badge}</span> : null}
          {src ? (
            <div className="media-frame">
              <img src={src} alt={product.name} loading="lazy" decoding="async" />
            </div>
          ) : (
            <div className="media-frame">
              <div className="img-placeholder" role="img" aria-label={product.name}>
                <span className="img-placeholder-text">Product image pending</span>
              </div>
            </div>
          )}
        </div>
        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="product-price">
            R{product.price}
            <span> ZAR</span>
          </p>
          <ColourSwatches colours={product.colours} />
          {colourLabel(product.colours) ? (
            <div className="product-colours">
              <span className="colour-label">{colourLabel(product.colours)}</span>
            </div>
          ) : null}
          <span className="view-piece-label">View piece <span className="btn-arrow" aria-hidden="true">→</span></span>
        </div>
      </button>
    </motion.article>
  );
}
