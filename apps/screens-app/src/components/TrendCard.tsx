import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendItem, getTimeAgo, extractDomain } from '@trends/shared';
import { ExternalLink, Clock, Tag, TrendingUp } from 'lucide-react';
import QRCode from './QRCode';

interface TrendCardProps {
  trend: TrendItem;
  index: number;
  total: number;
  generatedAt: string;
}

const TrendCard: React.FC<TrendCardProps> = ({ trend, index, total, generatedAt }) => {
  const [showQR, setShowQR] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowQR(true), 8000);
    return () => {
      clearTimeout(timer);
      setShowQR(false);
    };
  }, [trend.id]);

  const domain = trend.url ? extractDomain(trend.url) : null;
  const timeAgo = trend.publishedAt ? getTimeAgo(trend.publishedAt) : null;
  const lastUpdated = getTimeAgo(generatedAt);

  return (
    <motion.div
      key={trend.id}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full h-screen flex items-center justify-center"
    >
      <div className="backdrop-blur-glass rounded-3xl p-12 max-w-5xl w-full border border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div 
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: trend.viz.colorHint }}
            />
            <span className="text-white/70 text-lg font-medium">{trend.category}</span>
            <div className="flex space-x-2">
              {trend.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right text-white/60 text-sm">
            {timeAgo && (
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4" />
                <span>{timeAgo}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>{Math.round(trend.scores.total)}/100</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-12 mb-8">
          
          {/* Left Column - Title & Summary */}
          <div className="col-span-2 space-y-6">
            <motion.h1 
              className="text-6xl font-bold text-white leading-tight text-shadow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {trend.creative.shortCardCopy}
            </motion.h1>
            
            <motion.p 
              className="text-2xl text-white/90 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {trend.whyItMatters}
            </motion.p>

            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-xl font-semibold text-white/80">Key Opportunities:</h3>
              <div className="grid grid-cols-2 gap-4">
                {trend.brandAngles.slice(0, 4).map((angle, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-white/80 text-lg">{angle}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - QR & Source */}
          <div className="flex flex-col items-center justify-between">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: showQR ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              {showQR && trend.url && <QRCode url={trend.url} />}
            </motion.div>
            
            {(domain || trend.source) && (
              <div className="text-center space-y-4">
                {domain && (
                  <div className="flex items-center justify-center space-x-3 text-white/70">
                    <ExternalLink className="w-5 h-5" />
                    <span className="text-lg">{domain}</span>
                  </div>
                )}
                {trend.source && (
                  <div className="text-white/50 text-sm">
                    Source: {trend.source}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Use Cases */}
        <motion.div
          className="border-t border-white/20 pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <h3 className="text-lg font-semibold text-white/80 mb-4">Example Applications:</h3>
          <div className="flex flex-wrap gap-4">
            {trend.exampleUseCases.map((useCase, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-white/10 rounded-lg text-white/80"
              >
                {useCase}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Progress indicator */}
        <div className="absolute bottom-6 right-6 text-white/50 text-sm">
          {index + 1} / {total} • Updated {lastUpdated}
        </div>
      </div>
    </motion.div>
  );
};

export default TrendCard;