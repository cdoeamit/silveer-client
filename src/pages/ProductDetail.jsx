import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ProductCard from '../components/common/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${id}`);
      const productData = response.data.data.product;
      setProduct(productData);
      setSelectedImageIndex(0);

      const relatedResponse = await api.get(
        `/products?category=${productData.category.name}&limit=4`
      );
      setRelatedProducts(
        relatedResponse.data.data.products.filter((p) => p.id !== productData.id)
      );
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppBuy = () => {
    const adminPhone = '+919876543210'; // Replace with actual admin number
    const message = `Hi! I'm interested in buying:\n\n${product.name}\nCategory: ${product.category.name}\nPrice: $${parseFloat(product.price).toFixed(2)}\nQuantity: ${quantity}\n\nProduct Link: ${window.location.href}`;
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen page-with-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <LoadingSkeleton type="hero" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen page-with-pattern flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center max-w-md animate-scale-in">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-secondary-dark mb-4">Product Not Found</h2>
          <p className="text-secondary-gray mb-6">The product you're looking for doesn't exist.</p>
          <Link 
            to="/" 
            className="inline-block px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Get images array - ONLY actual images, no placeholders
  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images.filter(img => img && img.trim() !== '') // Filter out empty strings
    : ['https://via.placeholder.com/600x600?text=No+Image'];

  const selectedImage = images[selectedImageIndex] || images[0];

  return (
    <div className="min-h-screen page-with-pattern">
      {/* Breadcrumb - 60% Dominant background */}
      <div className="bg-white/90 backdrop-blur-sm border-b shadow-sm animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-secondary-gray">
            <Link to="/" className="hover:text-accent-blue transition-colors">Home</Link>
            <span>/</span>
            <Link
              to={`/category/${product.category.name.toLowerCase()}`}
              className="hover:text-accent-blue transition-colors"
            >
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-secondary-dark font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail - 60% white background, 30% text, 10% accents */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* LEFT: Product Images (60% space) */}
            <div className="space-y-4 animate-slide-right">
              {/* Main Image */}
              <div className="aspect-square bg-dominant-light rounded-xl overflow-hidden shadow-lg border-2 border-secondary-light hover:border-accent-blue transition-all duration-300">
                <img
                  loading="lazy"
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
    e.target.onerror = null;
    e.target.src = '/no-image.png';
  }}
                />
              </div>
              
              {/* Thumbnail Gallery - ONLY show actual images */}
              {images.length > 1 && (
                <div className={`grid gap-3 ${
                  images.length === 2 ? 'grid-cols-2' :
                  images.length === 3 ? 'grid-cols-3' :
                  images.length === 4 ? 'grid-cols-4' :
                  'grid-cols-5'
                }`}>
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`aspect-square bg-dominant-light rounded-lg border-2 overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                        selectedImageIndex === idx 
                          ? 'border-accent-blue ring-4 ring-accent-blue/30 shadow-lg scale-105' 
                          : 'border-secondary-light hover:border-accent-blue/50'
                      }`}
                    >
                      <img
                        loading="lazy"
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
    e.target.onerror = null;
    e.target.src = '/no-image.png';
  }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Image Counter */}
              <div className="text-center text-sm text-secondary-gray">
                Viewing {selectedImageIndex + 1} of {images.length}
              </div>
            </div>

            {/* RIGHT: Product Info (30% space) */}
            <div className="animate-slide-left">
              {/* Category Badge - 10% accent */}
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-accent-purple/10 text-accent-purple text-sm font-bold rounded-full border border-accent-purple/30">
                  {product.category.name}
                </span>
              </div>

              {/* Product Name - 30% secondary */}
              <h1 className="text-4xl font-bold text-secondary-dark mb-4">
                {product.name}
              </h1>

              {/* Price - 10% accent */}
              <div className="flex items-baseline space-x-4 mb-6">
                <span className="text-4xl font-bold text-accent-blue">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
                <span className="text-secondary-gray">
                  ⚖️ {parseFloat(product.silverWeight).toFixed(2)}g
                </span>
              </div>

              {/* Description - 30% secondary */}
              {product.description && (
                <div className="mb-8 p-4 bg-dominant-light rounded-lg border border-secondary-light">
                  <p className="text-secondary-gray leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Stock Status - 10% accent colors */}
              <div className="mb-6 p-4 rounded-lg border-2 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {product.stock > 0 ? (
                  <div className="flex items-center text-accent-green border-accent-green bg-green-50">
                    <span className="text-2xl mr-3">✓</span>
                    <div>
                      <div className="font-bold">In Stock</div>
                      <div className="text-sm">{product.stock} units available</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-accent-red border-accent-red bg-red-50">
                    <span className="text-2xl mr-3">✕</span>
                    <div>
                      <div className="font-bold">Out of Stock</div>
                      <div className="text-sm">Contact us for availability</div>
                    </div>
                  </div>
                )}
              </div>

              {/* SKU */}
              {product.sku && (
                <div className="mb-6 text-sm text-secondary-gray">
                  <span className="font-semibold">SKU:</span> {product.sku}
                </div>
              )}

              {/* Quantity Selector - 30% secondary */}
              <div className="flex items-center space-x-4 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <label className="text-secondary-dark font-bold">Quantity:</label>
                <div className="flex items-center border-2 border-secondary-light rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-5 py-3 bg-dominant-light hover:bg-accent-blue hover:text-white transition-all duration-300 font-bold"
                  >
                    −
                  </button>
                  <span className="px-8 py-3 border-x-2 border-secondary-light font-bold text-secondary-dark">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-5 py-3 bg-dominant-light hover:bg-accent-blue hover:text-white transition-all duration-300 font-bold"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Buy Now Button - 10% accent (CTA) */}
              <button
                onClick={handleWhatsAppBuy}
                disabled={product.stock <= 0}
                className="w-full bg-gradient-to-r from-accent-green to-green-600 text-white py-5 rounded-xl font-bold text-lg hover:from-green-600 hover:to-accent-green transition-all duration-300 transform hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl mb-4 flex items-center justify-center space-x-3 animate-slide-up"
                style={{ animationDelay: '0.4s' }}
              >
                <span className="text-3xl">💬</span>
                <span>{product.stock > 0 ? 'BUY NOW ON WHATSAPP' : 'CONTACT US'}</span>
              </button>

              <p className="text-sm text-secondary-gray text-center mb-8">
                💡 Click to chat with us on WhatsApp and complete your purchase
              </p>

              {/* Product Details Accordion - 60% dominant */}
              <div className="space-y-3 border-t-2 border-secondary-light pt-8">
                <details className="group animate-slide-up" style={{ animationDelay: '0.5s' }}>
                  <summary className="flex items-center justify-between cursor-pointer p-4 bg-dominant-light rounded-xl hover:bg-accent-blue/10 transition-all duration-300 border border-secondary-light">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">✨</span>
                      <span className="font-bold text-secondary-dark">MATERIAL & CARE</span>
                    </div>
                    <span className="group-open:rotate-180 transition-transform duration-300 text-accent-blue text-xl">▼</span>
                  </summary>
                  <div className="p-5 text-secondary-gray space-y-2 bg-white rounded-b-xl border-x border-b border-secondary-light">
                    <p>✓ Pure 925 Sterling Silver</p>
                    <p>✓ Care Instructions: Clean with soft cloth, avoid chemicals</p>
                    <p>✓ Store in a cool, dry place</p>
                    <p>✓ Remove before swimming or bathing</p>
                  </div>
                </details>

                <details className="group animate-slide-up" style={{ animationDelay: '0.6s' }}>
                  <summary className="flex items-center justify-between cursor-pointer p-4 bg-dominant-light rounded-xl hover:bg-accent-blue/10 transition-all duration-300 border border-secondary-light">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📦</span>
                      <span className="font-bold text-secondary-dark">SHIPPING & RETURNS</span>
                    </div>
                    <span className="group-open:rotate-180 transition-transform duration-300 text-accent-blue text-xl">▼</span>
                  </summary>
                  <div className="p-5 text-secondary-gray space-y-2 bg-white rounded-b-xl border-x border-b border-secondary-light">
                    <p>✓ Fast delivery via WhatsApp coordination</p>
                    <p>✓ 7-day return policy</p>
                    <p>✓ Secure packaging with bubble wrap</p>
                    <p>✓ Includes authenticity certificate</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products - 60% dominant background */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 animate-fade-in">
            <h2 className="text-3xl font-bold mb-8 text-center text-secondary-dark">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <div 
                  key={relatedProduct.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;