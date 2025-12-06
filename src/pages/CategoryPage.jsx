import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products?category=${category}&limit=300`);
      setProducts(response.data.data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryInfo = {
    ladies: {
      title: "LADIES' SILVER JEWELS",
      subtitle: 'Crafted for Elegance, Designed for You',
      hero: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200',
      icon: '👸'
    },
    gents: {
      title: "GENTS' COLLECTION",
      subtitle: 'Sophisticated Silver Pieces for Men',
      hero: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1200',
      icon: '🤵'
    },
    lords: {
      title: "LORDS' SILVER JEWELS",
      subtitle: 'Exquisite Craftsmanship for the Elite',
      hero: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=1200',
      icon: '👑'
    }
  };

  const info = categoryInfo[category?.toLowerCase()] || categoryInfo.ladies;

  return (
    <div className="min-h-screen page-with-pattern">
      {/* Hero Banner - 60% dominant with 10% accent overlay */}
      <section className="relative bg-secondary-dark text-white h-80 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 animate-float"
          style={{ backgroundImage: `url(${info.hero})` }}
        ></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
        </div>

        <div className="relative z-20 text-center px-4">
          <div className="text-6xl mb-4 animate-bounce-slow drop-shadow-glow">{info.icon}</div>
          <h1 className="text-5xl font-bold mb-2 drop-shadow-lg animate-slide-down">
            {info.title}
          </h1>
          <p className="text-xl text-gray-200 animate-slide-up">
            {info.subtitle}
          </p>
        </div>
      </section>

      {/* Products Count Bar - 60% white background, 30% text */}
      <section className="bg-white/90 backdrop-blur-sm border-b shadow-md animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary-gray">
              <span className="font-bold text-secondary-dark">{products.length}</span> Products in {info.title}
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue rounded-full font-semibold">
                Premium Quality
              </span>
              <span className="px-3 py-1 bg-accent-green/10 text-accent-green rounded-full font-semibold">
                925 Silver
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid - 60% dominant background */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 animate-scale-in">
          {loading ? (
            <LoadingSkeleton type="card" count={12} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${(index % 12) * 0.05}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-secondary-dark mb-2">
                No Products Yet
              </h3>
              <p className="text-secondary-gray">
                Products will be added soon in this category
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;