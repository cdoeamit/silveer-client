import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products?limit=8&isFeatured=true'),
        api.get('/products/categories')
      ]);
      setProducts(productsRes.data.data.products);
      setCategories(categoriesRes.data.data.categories);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-with-pattern">
      {/* Hero Section */}
      <section className="relative bg-black text-white h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60 animate-float"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200)'
          }}
        ></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
        </div>

        <div className="relative z-20 text-center px-4 animate-fadeInUp">
          <div className="inline-block mb-4">
            <span className="text-6xl animate-bounce-slow filter drop-shadow-glow">👑</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 drop-shadow-lg animate-slideInLeft">
            TIMELESS SILVER JEWELS
          </h1>
          <p className="text-2xl mb-8 text-gray-200 animate-slideInRight">
            Crafted for Elegance, Designed for You
          </p>
          <Link
            to="/category/ladies"
            className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 shadow-2xl animate-scaleIn"
          >
            SHOP NOW →
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 animate-fadeInUp">
          <div className="text-center mb-12 animate-fadeInDown">
            <h2 className="text-4xl font-bold mb-3 gradient-text">Shop by Collection</h2>
            <p className="text-gray-600">Discover our exquisite silver jewelry categories</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/category/${category.name.toLowerCase()}`}
                className="group relative h-96 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 card-hover"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
                <img
                  src={`https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600`}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 transform group-hover:translate-y-[-10px] transition-transform duration-300">
                  <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full mb-3">
                    {category.productCount} Products
                  </span>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-200 text-sm mb-4">{category.description}</p>
                  <div className="flex items-center text-white font-semibold group-hover:gap-2 transition-all">
                    <span>Explore Collection</span>
                    <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full mb-4">
              ⭐ Featured
            </span>
            <h2 className="text-4xl font-bold mb-3">Featured Products</h2>
            <p className="text-gray-600">Handpicked pieces from our latest collection</p>
          </div>
          
          {loading ? (
            <LoadingSkeleton type="card" count={8} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/category/ladies"
              className="inline-block px-8 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '💬',
              title: 'WhatsApp Orders',
              description: 'Direct communication for easy purchasing'
            },
            {
              icon: '✨',
              title: 'Premium Quality',
              description: '925 Sterling Silver guaranteed'
            },
            {
              icon: '🎁',
              title: 'Perfect Gifts',
              description: 'Elegant packaging for special moments'
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 card-hover animate-fadeInUp"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="text-5xl mb-4 animate-bounce-slow">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;