import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchProducts();
    }
  }, [query]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products?search=${query}&limit=100`);
      setProducts(response.data.data.products);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-with-pattern">
      {/* Search Header - 60% white, 30% text, 10% accent */}
      <div className="bg-white/90 backdrop-blur-sm border-b shadow-md animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce-slow">🔍</div>
            <h1 className="text-3xl font-bold text-secondary-dark mb-2">
              Search Results
            </h1>
            <p className="text-secondary-gray">
              Found <span className="font-bold text-accent-blue">{products.length}</span> results for 
              <span className="font-bold text-secondary-dark"> "{query}"</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 animate-scale-in">
          {loading ? (
            <LoadingSkeleton type="card" count={12} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-2xl font-bold text-secondary-dark mb-2">
                No Results Found
              </h3>
              <p className="text-secondary-gray mb-6">
                Try different keywords or browse our categories
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/category/ladies"
                  className="px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105"
                >
                  Ladies
                </Link>
                <Link
                  to="/category/gents"
                  className="px-6 py-3 bg-accent-purple text-white rounded-lg hover:bg-purple-600 transition-all transform hover:scale-105"
                >
                  Gents
                </Link>
                <Link
                  to="/category/lords"
                  className="px-6 py-3 bg-accent-green text-white rounded-lg hover:bg-green-600 transition-all transform hover:scale-105"
>
Lords
</Link>
</div>
</div>
)}
</div>
</div>
</div>
);
};
export default SearchPage;