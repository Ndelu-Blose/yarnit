import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import {
  cataloguePhotoNote,
  catLabel,
  colourLabel,
  customColourMessage,
  productDescription,
  productWaMessage,
  resolveImageSrc,
  waUrl,
} from '../lib/catalog';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ProductModal({ product, onClose }) {
  useEffect(() => {
    if (!product) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.classList.add('modal-open');
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onKey);
    };
  }, [product, onClose]);

  const imageSrc = product ? resolveImageSrc(product.img) : null;
  const slides = imageSrc ? [imageSrc] : [];

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="product-modal react-product-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reactProductModalTitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.button
            type="button"
            className="product-modal-backdrop"
            aria-label="Close product details"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="product-modal-panel"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <button type="button" className="product-modal-close" onClick={onClose} aria-label="Close">
              &times;
            </button>
            <div className="product-modal-grid react-modal-grid">
              <div className="react-modal-gallery">
                {slides.length ? (
                  <Swiper modules={[Navigation, Pagination]} navigation pagination loop={false} className="react-product-swiper">
                    {slides.map((src) => (
                      <SwiperSlide key={src}>
                        <img src={src} alt={product.name} className="react-modal-slide-img" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="react-modal-slide-img react-modal-placeholder">Image coming soon</div>
                )}
              </div>
              <div className="product-modal-body">
                <p className="eyebrow">{catLabel(product.cat)}</p>
                <h2 className="product-modal-title" id="reactProductModalTitle">
                  {product.name}
                </h2>
                {product.badge ? <p className="product-modal-badge">{product.badge}</p> : null}
                <p className="product-modal-price">R{product.price} ZAR</p>
                {cataloguePhotoNote(product) ? (
                  <p className="product-modal-catalogue-note">{cataloguePhotoNote(product)}</p>
                ) : null}
                <p className="product-modal-status">Made to order · Handmade in Durban</p>
                {colourLabel(product.colours) ? (
                  <p className="product-modal-colours">Colours: {colourLabel(product.colours)}</p>
                ) : null}
                <p className="product-modal-desc">{productDescription(product)}</p>
                <div className="product-modal-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() =>
                      window.open(
                        waUrl(productWaMessage(product, "Hi Yarn It! I'd like to check availability for the")),
                        '_blank',
                        'noopener'
                      )
                    }
                  >
                    Check availability
                  </button>
                  <a
                    className="btn-outline wa-link"
                    href={waUrl(productWaMessage(product))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Enquire on WhatsApp
                  </a>
                  <a
                    className="btn-outline react-custom-colour-btn"
                    href={waUrl(customColourMessage(product))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ask about custom colour
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
