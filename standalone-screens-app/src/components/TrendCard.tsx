import React from 'react';
import { motion } from 'framer-motion';
import { TrendItem, getTimeAgo } from '../types';
import { TrendingUp } from 'lucide-react';

interface TrendCardProps {
  trend: TrendItem;
  index: number;
  total: number;
  generatedAt: string;
}

const TrendCard: React.FC<TrendCardProps> = ({ trend, index, total, generatedAt }) => {
  const timeAgo = trend.publishedAt ? getTimeAgo(trend.publishedAt) : null;
  const lastUpdated = getTimeAgo(generatedAt);

  return (
    <motion.div
      key={trend.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full h-screen flex flex-col justify-center px-8 py-12 md:px-16 lg:px-24 relative"
    >
      {/* Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
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
      <div className="relative backdrop-blur-xl bg-black/10 border border-white/10 rounded-3xl p-8 md:p-12 lg:p-16 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div className="flex items-center space-x-4 md:space-x-6">
            <div 
              className="w-3 h-3 md:w-4 md:h-4 rounded-full"
              style={{ backgroundColor: trend.viz.colorHint }}
            />
            <span className="text-white/70 text-lg md:text-xl lg:text-2xl font-medium">{trend.category}</span>
          </div>
          
          {/* Large Impact Score */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
            <span className="text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {Math.round(trend.scores.total)}
            </span>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl lg:text-2xl text-white/80 font-semibold">IMPACT</span>
              <span className="text-sm md:text-base text-white/50">SCORE</span>
            </div>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-12">
          {trend.tags.slice(0, 4).map(tag => (
            <span 
              key={tag}
              className="px-3 py-1 md:px-4 md:py-2 bg-white/10 rounded-full text-sm md:text-base text-white/70"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center space-y-8 md:space-y-12">
          
          {/* Title with 3D effect */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-tight tracking-tight"
            style={{
              textShadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {trend.creative.shortCardCopy}
          </motion.h1>
          
          {/* Description */}
          <motion.p 
            className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/90 leading-relaxed font-light max-w-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {trend.whyItMatters}
          </motion.p>

          {/* Key Opportunities */}
          <motion.div 
            className="space-y-6 md:space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white/80">Key Opportunities</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {trend.brandAngles.slice(0, 4).map((angle, idx) => (
                <motion.div 
                  key={idx} 
                  className="flex items-start space-x-4 p-4 md:p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                >
                  <div 
                    className="w-2 h-2 md:w-3 md:h-3 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: trend.viz.colorHint }}
                  />
                  <span className="text-white/80 text-base md:text-lg lg:text-xl leading-relaxed">{angle}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Section - Use Cases */}
        <motion.div
          className="border-t border-white/20 pt-6 md:pt-8 space-y-4 md:space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-white/80">Example Applications</h3>
          <div className="flex flex-wrap gap-3 md:gap-4">
            {trend.exampleUseCases.map((useCase, idx) => (
              <motion.span
                key={idx}
                className="px-4 py-2 md:px-6 md:py-3 bg-white/10 rounded-lg text-white/80 text-sm md:text-base lg:text-lg font-medium"
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
        <div className="mt-8 md:mt-12 text-white/50 text-sm md:text-base text-center">
          {index + 1} / {total} • Updated {lastUpdated}
        </div>
      </div>
    </motion.div>
  );
};

export default TrendCard;