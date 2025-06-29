import React, { useRef, useEffect, useState, useCallback } from 'react';

const VirtualizedMessageList = ({ 
  messages, 
  renderMessage, 
  itemHeight = 80, 
  overscan = 5,
  onLoadMore,
  hasMore,
  isLoadingMore 
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    messages.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Get visible messages
  const visibleMessages = messages.slice(startIndex, endIndex + 1);

  // Calculate total height for scrollbar
  const totalHeight = messages.length * itemHeight;

  // Handle scroll
  const handleScroll = useCallback((e) => {
    const { scrollTop: newScrollTop } = e.target;
    setScrollTop(newScrollTop);

    // Check if we need to load more messages
    if (hasMore && !isLoadingMore && newScrollTop === 0) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Update container height
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  // Calculate transform for visible messages
  const getTransform = (index) => {
    return `translateY(${index * itemHeight}px)`;
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        height: '100%', 
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      {/* Loading indicator at top */}
      {isLoadingMore && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '10px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6c757d'
        }}>
          Loading more messages...
        </div>
      )}

      {/* Spacer for total height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Render only visible messages */}
        {visibleMessages.map((message, index) => {
          const actualIndex = startIndex + index;
          return (
            <div
              key={message._id || `temp-${actualIndex}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                transform: getTransform(actualIndex),
                height: itemHeight
              }}
            >
              {renderMessage(message, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualizedMessageList; 