import React from 'react';
import { motion } from 'framer-motion';
import { TrendItem, getTimeAgo, getCategoryGradient, getCategoryColor } from '../types';
import { TrendingUp } from 'lucide-react';

interface TrendCardProps {
  trend: TrendItem;
  index: number;
  total: number;
  generatedAt: string;
}

const TrendCard: React.FC<TrendCardProps> = ({ trend, index, total, generatedAt }) => {
  const lastUpdated = getTimeAgo(generatedAt);
  const categoryGradient = getCategoryGradient(trend.category);
  const categoryColor = getCategoryColor(trend.category);
  
  // Calculate text color for accessibility based on category color
  const getTextColor = (hexColor: string): string => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Calculate luminance (0-255)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    // Return white for dark colors, black for light colors
    return luminance < 128 ? '#ffffff' : '#000000';
  };
  
  const textColor = getTextColor(categoryColor);

  return (
    <motion.div
      key={trend.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full h-screen flex flex-col justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-12 lg:px-16 xl:px-20 relative"
    >
      {/* Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-orange-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Glassmorphism Container */}
      <div className="relative backdrop-blur-xl bg-black/20 border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 shadow-2xl max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            <div 
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
              style={{ background: categoryGradient }}
            />
            <span className="text-white/70 text-sm sm:text-base md:text-lg font-medium">{trend.category}</span>
          </div>
          
          {/* Large Impact Score */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <TrendingUp 
              className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" 
              style={{ color: getCategoryColor(trend.category) }}
            />
            <span 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-clip-text text-transparent"
              style={{ background: categoryGradient, WebkitBackgroundClip: 'text' }}
            >
              {Math.round(trend.scores.total)}
            </span>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm md:text-base text-white/80 font-semibold">IMPACT</span>
              <span className="text-xs text-white/50">SCORE</span>
            </div>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6 md:mb-8">
          {trend.tags.slice(0, 4).map(tag => (
            <span 
              key={tag}
              className="px-2 py-1 sm:px-3 sm:py-1 bg-white/10 rounded-full text-xs sm:text-sm text-white/70"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center space-y-4 sm:space-y-6 md:space-y-8">
          
          {/* Title with 3D effect */}
          <motion.h1 
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(234, 141, 105, 0.5))'
            } as any}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {trend.creative.shortCardCopy}
          </motion.h1>
          
          {/* Description */}
          <motion.p 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed font-light max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {trend.whyItMatters}
          </motion.p>

          {/* Key Opportunities */}
          <motion.div 
            className="space-y-3 sm:space-y-4 md:space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white/80">Key Opportunities</h3>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              {trend.brandAngles.slice(0, 4).map((angle, idx) => (
                <motion.div 
                  key={idx} 
                  className="p-2 sm:p-3 md:p-4 rounded-lg hover:scale-105 transition-all duration-300"
                  style={{ background: categoryGradient }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                >
                  <span 
                    className="text-xs sm:text-sm md:text-base leading-relaxed font-medium"
                    style={{ color: textColor }}
                  >
                    {angle}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Section - Use Cases */}
        <motion.div
          className="pt-3 sm:pt-4 md:pt-6 space-y-2 sm:space-y-3 md:space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white/80">Example Applications</h3>
          <div className="flex flex-wrap gap-1 sm:gap-2 md:gap-3">
            {trend.exampleUseCases.map((useCase, idx) => (
              <motion.span
                key={idx}
                className="px-2 py-1 sm:px-3 sm:py-2 bg-white/10 rounded-md text-white/80 text-xs sm:text-sm font-medium"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + idx * 0.05 }}
              >
                {useCase}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Progress indicator */}
        <div className="mt-4 sm:mt-6 md:mt-8 text-white/50 text-xs sm:text-sm text-center">
          {index + 1} / {total} • Updated {lastUpdated}
        </div>
      </div>
    </motion.div>
  );
};

export default TrendCard;