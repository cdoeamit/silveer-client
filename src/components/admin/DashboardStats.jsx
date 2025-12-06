const DashboardStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats || !stats.overview) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-500 text-lg">No statistics available</p>
        <p className="text-gray-400 text-sm mt-2">Please refresh to load data</p>
      </div>
    );
  }

  const cards = [
    
    {
      title: 'Total Products',
      value: stats.overview.totalProducts || '0',
      subtitle: 'Active products',
      icon: '💎',
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Users',
      value: stats.overview.totalUsers || '0',
      subtitle: 'Registered customers',
      icon: '👥',
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.color} text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 transform hover:scale-105 hover:-translate-y-1 cursor-pointer animate-slide-up`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-5xl opacity-90">{card.icon}</div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-white/40 rounded"></div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold mb-2 opacity-90 uppercase tracking-wide">
            {card.title}
          </h3>

          {/* Value */}
          <p className="text-4xl font-bold mb-1">{card.value}</p>

          {/* Subtitle */}
          <p className="text-xs opacity-80">{card.subtitle}</p>

          {/* Progress Bar (decorative) */}
          <div className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/60 rounded-full transition-all duration-1000"
              style={{ width: '75%' }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;