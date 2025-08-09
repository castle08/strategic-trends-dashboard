import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendsData, TrendItem, getTimeAgo } from '../types';
import { X, TrendingUp, AlertCircle } from 'lucide-react';

interface UIProps {
  trendsData: TrendsData | null;
  selectedTrend: TrendItem | null;
  onTrendSelect: (trend: TrendItem | null) => void;
  error: string | null;
  isDemoMode: boolean;
}

const UI: React.FC<UIProps> = ({ 
  trendsData, 
  selectedTrend, 
  onTrendSelect, 
  error,
  isDemoMode 
}) => {
  return (
    <>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white text-glow">
              Trend Intelligence 3D
            </h1>
            <div className="flex items-center space-x-4 mt-2 text-white/70">
              {error && (
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              <span className="text-sm">
                {isDemoMode ? 'DEMO MODE' : 'LIVE'} • {trendsData?.trends.length || 0} trends
              </span>
              {trendsData && (
                <span className="text-sm">
                  Updated {getTimeAgo(trendsData.generatedAt)}
                </span>
              )}
            </div>
          </div>
          
          <div className="glass-panel rounded-xl p-4">
            <div className="text-white/80 text-sm">
              <div>
                <strong>Strategic Trends:</strong> {trendsData?.trends.length} market insights generated
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {selectedTrend && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="absolute top-0 right-0 h-full w-96 z-30 glass-panel border-l border-white/10 overflow-y-auto scrollbar-hide"
          >
            <div className="p-6">
              {/* Close button */}
              <button
                onClick={() => onTrendSelect(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full glass-panel flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              {/* Trend details */}
              <div className="space-y-6 mt-8">
                {/* Category badge */}
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedTrend.viz.colorHint }}
                  />
                  <span className="text-white/70 font-medium">{selectedTrend.category}</span>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white leading-tight">
                  {selectedTrend.title}
                </h2>

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-sm text-white/60">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{Math.round(selectedTrend.scores.total)}/100 Impact Score</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedTrend.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-white/10 rounded-md text-sm text-white/80"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Why it matters */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Why it matters</h3>
                  <p className="text-white/80 leading-relaxed">{selectedTrend.whyItMatters}</p>
                </div>

                {/* Scores */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Trend Scores</h3>
                  <div className="space-y-3">
                    {Object.entries(selectedTrend.scores).map(([key, value]) => {
                      if (key === 'total') return null;
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/70 capitalize">{key}</span>
                            <span className="text-white">{Math.round(value)}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Brand angles */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Brand Opportunities</h3>
                  <ul className="space-y-2">
                    {selectedTrend.brandAngles.map((angle, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-white/80">{angle}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Use cases */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Example Use Cases</h3>
                  <div className="space-y-2">
                    {selectedTrend.exampleUseCases.map((useCase, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 bg-white/5 rounded-lg text-white/80 text-sm"
                      >
                        {useCase}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {!selectedTrend && (
        <div className="absolute bottom-6 left-6 glass-panel rounded-lg p-4 max-w-sm z-20">
          <div className="text-white/80 text-sm space-y-2">
            <div className="font-medium">How to explore:</div>
            <div>• Click and drag to rotate the view</div>
            <div>• Scroll to zoom in/out</div>
            <div>• Click on spheres to view details</div>
            <div>• Larger, brighter spheres = higher impact</div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 right-6 glass-panel rounded-lg p-4 z-20">
        <div className="text-white/80 text-sm space-y-2">
          <div className="font-medium mb-3">Legend</div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>AI/ML</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Sustainability</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>E-commerce</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span>Social Media</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span>Technology</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default UI;