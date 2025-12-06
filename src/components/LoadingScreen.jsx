import { useEffect, useState } from 'react';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(onLoadingComplete, 300);
          return 100;
        }
        return newProgress;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-secondary-dark via-gray-900 to-black">
      {/* 60% - Background with pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url(/pattern-bg.jpg)',
          backgroundSize: 'cover',
        }}
      ></div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
      </div>

      <div className="relative z-10 text-center px-4">
        {/* Logo - 10% accent with glow */}
        <div className="mb-8 animate-bounce-slow">
          <div className="text-8xl mb-4 filter drop-shadow-glow">👑</div>
          <h1 className="text-7xl font-bold text-white mb-3 tracking-wider animate-slide-down">
            ARGENTUM
          </h1>
          <p className="text-2xl text-gray-300 animate-slide-up">Silver Grace Jewelry</p>
        </div>

        {/* Loading Bar - 60% container, 10% accent fill */}
        <div className="w-80 max-w-full mx-auto animate-scale-in">
          <div className="h-3 bg-secondary-gray/30 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-blue bg-[length:200%_100%] transition-all duration-300 ease-out animate-gradient"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className="text-gray-400">Loading your experience...</span>
            <span className="text-white font-bold">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Sparkle Effect - 10% accent */}
        <div className="mt-8 flex justify-center space-x-3">
          <span className="w-3 h-3 bg-accent-blue rounded-full animate-ping"></span>
          <span className="w-3 h-3 bg-accent-purple rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-3 h-3 bg-accent-green rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;