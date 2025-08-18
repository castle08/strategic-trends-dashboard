import React from 'react';

interface ChatToWallProps {
  question: string;
  answer: string;
  isLoading: boolean;
  onAskNew: () => void;
}

export default function ChatToWall({ question, answer, isLoading, onAskNew }: ChatToWallProps) {
  return (
    <div className="space-y-3">
      {/* Answer */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-3">
        <div className="text-xs font-medium text-slate-600 mb-2">The Wall's Response:</div>
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-slate-600">Analyzing...</span>
          </div>
        ) : (
          <div className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
            {answer}
          </div>
        )}
      </div>

      {/* Ask New Question Link */}
      {!isLoading && answer && (
        <button
          onClick={onAskNew}
          className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Ask a new question
        </button>
      )}
    </div>
  );
}
