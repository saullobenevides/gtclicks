'use client';

import { useState } from 'react';

export default function ExpandableDescription({ description, maxLength = 200 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!description) return null;
  
  const shouldTruncate = description.length > maxLength;
  const displayText = isExpanded || !shouldTruncate 
    ? description 
    : description.substring(0, maxLength) + '...';
  
  return (
    <div>
      <p className="text-base md:text-lg text-gray-200/80 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
        {displayText}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        >
          {isExpanded ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
    </div>
  );
}
