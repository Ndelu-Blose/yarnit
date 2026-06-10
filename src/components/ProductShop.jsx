import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { FILTER_OPTIONS, filterLabel, getProductById, getProducts } from '../lib/catalog';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ProductShop() {
  const [filter, setFilter] = useState('all');
  const [products, setProducts] = useState(() => getProducts());
  const [selectedId, setSelectedId] = useState(null);

  const refreshProducts = useCallback(() => {
    setProducts(getProducts());
  }, []);

  useEffect(() => {
    if (typeof window.ensureProductsSeed === 'function') window.ensureProductsSeed();

    const onFilter = (e) => {
      if (e.detail && e.detail.cat) setFilter(e.detail.cat);
    };
    const onOpen = (e) => {
      if (e.detail && e.detail.id) setSelectedId(e.detail.id);
    };
    const onStorage = () => refreshProducts();
    const onCatalog = () => refreshProducts();

    window.addEventListener('yarnit:filter', onFilter);
    window.addEventListener('yarnit:open-product', onOpen);
    window.addEventListener('yarnit:catalog-updated', onCatalog);
    window.addEventListener('storage', onStorage);
    refreshProducts();

    return () => {
      window.removeEventListener('yarnit:filter', onFilter);
      window.removeEventListener('yarnit:open-product', onOpen);
      window.removeEventListener('yarnit:catalog-updated', onCatalog);
      window.removeEventListener('storage', onStorage);
    };
  }, [refreshProducts]);

  const visible = useMemo(() => {
    if (filter === 'all') return products;
    return products.filter((p) => p.cat === filter);
  }, [products, filter]);

  const selectedProduct = selectedId ? getProductById(selectedId) : null;

  const resultText =
    visible.length === 0
      ? ''
      : filter === 'all'
        ? visible.length === 1
          ? 'Showing 1 piece'
          : 'Showing ' + visible.length + ' pieces'
        : visible.length === 1
          ? 'Showing 1 piece in ' + filterLabel(filter)
          : 'Showing ' + visible.length + ' pieces in ' + filterLabel(filter);

  function changeFilter(cat) {
    setFilter(cat);
    if (typeof window.filterProducts === 'function') {
      window.filterProducts(cat, null, { scroll: false, react: true });
    }
  }

  return (
    <>
      <div className="filter-row fade-in react-filter-row">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={'filter-btn' + (filter === opt.id ? ' active' : '')}
            data-cat={opt.id}
            onClick={() => changeFilter(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="filter-result" aria-live="polite">
        {resultText}
      </p>

      <AnimatePresence mode="wait">
        {visible.length === 0 ? (
          <motion.p
            key="empty"
            className="shop-empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            No pieces in this category yet. Try another filter or ask us about a custom order.
          </motion.p>
        ) : (
          <motion.div
            key={filter}
            className="products-carousel react-products-carousel fade-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Swiper
              modules={[Navigation, Pagination, A11y]}
              navigation
              pagination={{ clickable: true }}
              slidesPerView={1.05}
              spaceBetween={12}
              breakpoints={{
                480: { slidesPerView: 1.2, spaceBetween: 14 },
                640: { slidesPerView: 1.75, spaceBetween: 16 },
                900: { slidesPerView: 2.15, spaceBetween: 18 },
                1200: { slidesPerView: 2.65, spaceBetween: 20 },
              }}
              className="react-shop-swiper"
            >
              {visible.map((product, index) => (
                <SwiperSlide key={product.id}>
                  <ProductCard product={product} index={index} />
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductModal product={selectedProduct} onClose={() => setSelectedId(null)} />
    </>
  );
}
