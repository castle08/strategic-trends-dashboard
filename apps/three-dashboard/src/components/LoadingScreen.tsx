import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="w-screen h-screen bg-gradient-to-b from-gray-900 via-slate-800 to-black flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity }
          }}
          className="mb-6"
        >
          <Loader className="w-16 h-16 text-blue-400 mx-auto" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-4 text-glow"
        >
          3D Trend Intelligence
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/70 text-lg"
        >
          Initializing 3D visualization...
        </motion.div>

        <motion.div 
          className="mt-8 flex space-x-2 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-3 h-3 bg-blue-400 rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;