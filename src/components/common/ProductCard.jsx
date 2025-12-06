import { Link } from 'react-router-dom';
import { useState } from 'react';

const ProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get first image from images array or fallback
  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [product.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'];

  const currentImage = images[currentImageIndex];

  const handleWhatsAppContact = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const adminPhone = '+918548841866'; // Replace with actual admin number
    const message = `Hi! I'm interested in: ${product.name} (${product.category?.name}) - Price: $${parseFloat(product.price).toFixed(2)}`;
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <Link to={`/product/${product.id}`} className="block">
        {/* Image Container */}
        <div 
          className="relative aspect-square overflow-hidden bg-gray-100"
          onMouseEnter={() => images.length > 1 && setCurrentImageIndex(1)}
          onMouseLeave={() => setCurrentImageIndex(0)}
        >
          <img
            loading="lazy"
            src={currentImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
    e.target.onerror = null;
    e.target.src = '/no-image.png';
  }}
          />
          {product.isFeatured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
              FEATURED
            </div>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
              <span className="text-white font-bold">OUT OF STOCK</span>
            </div>
          )}
          
          {/* Image Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full ${
                    idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2">{product.category?.name}</p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-gray-900">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">
              {parseFloat(product.silverWeight).toFixed(2)}g
            </span>
          </div>
          
          {/* Buy Now Button */}
          <button
            onClick={handleWhatsAppContact}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
          >
            <span>💬</span>
            <span>Buy on WhatsApp</span>
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;