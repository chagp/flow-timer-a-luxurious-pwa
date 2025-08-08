import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SecondsWheelPickerProps {
  value: number;
  onChange: (value: number) => void;
  itemHeight?: number;
  visibleItems?: number;
}

const SecondsWheelPicker: React.FC<SecondsWheelPickerProps> = ({
  value,
  onChange,
  itemHeight = 50,
  visibleItems = 5
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Generate 5-second intervals: 0, 5, 10, 15, ..., 55
  const items = Array.from({ length: 12 }, (_, i) => i * 5);
  const containerHeight = itemHeight * visibleItems;
  const centerOffset = Math.floor(visibleItems / 2);

  const getScrollTop = useCallback((selectedValue: number) => {
    const index = items.indexOf(selectedValue);
    return index * itemHeight;
  }, [items, itemHeight]);

  const getValueFromScrollTop = useCallback((scrollTop: number) => {
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
    return items[clampedIndex];
  }, [items, itemHeight]);

  useEffect(() => {
    if (containerRef.current && !isDragging) {
      containerRef.current.scrollTop = getScrollTop(value);
    }
  }, [value, getScrollTop, isDragging]);

  // Smooth snapping with CSS scroll snap + settle correction
  const idleTimer = useRef<number | null>(null);
  const handleScroll = useCallback(() => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      if (!containerRef.current) return;
      const newValue = getValueFromScrollTop(containerRef.current.scrollTop);
      // Snap exactly to the nearest item
      containerRef.current.scrollTo({ top: getScrollTop(newValue), behavior: 'smooth' });
      onChange(newValue);
      setIsDragging(false);
    }, 120);
  }, [getScrollTop, getValueFromScrollTop, onChange]);

  const handleScrollEnd = useCallback(() => {
    if (containerRef.current) {
      const newValue = getValueFromScrollTop(containerRef.current.scrollTop);
      onChange(newValue);
      
      // Snap to center with smooth animation
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: getScrollTop(newValue),
            behavior: 'smooth'
          });
        }
      });
    }
    setIsDragging(false);
  }, [getValueFromScrollTop, onChange, getScrollTop]);

  return (
    <div className="relative">
      {/* Selection indicator overlay */}
      <div 
        className="absolute left-0 right-0 bg-light-accent/10 dark:bg-dark-accent/10 border-t border-b border-light-accent dark:border-dark-accent pointer-events-none z-10"
        style={{
          top: centerOffset * itemHeight,
          height: itemHeight
        }}
      />
      
      {/* Scrollable container */}
      <div
        ref={containerRef}
        className="overflow-y-auto scrollbar-hide relative"
        style={{ height: containerHeight, WebkitOverflowScrolling: 'touch', scrollBehavior: 'auto', scrollSnapType: 'y mandatory' as any }}
        onScroll={handleScroll}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={handleScrollEnd}
        onTouchCancel={handleScrollEnd}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={handleScrollEnd}
        onMouseLeave={handleScrollEnd}
      >
        {/* Top padding for center alignment */}
        <div style={{ height: centerOffset * itemHeight }} />
        {/* Items */}
        {items.map((item) => (
          <div
            key={item}
            className={`flex items-center justify-center font-mono text-lg select-none ${
              item === value 
                ? 'text-light-text dark:text-dark-text font-bold' 
                : 'text-light-text/50 dark:text-dark-text/50'
            }`} 
            style={{ 
              height: itemHeight,
              lineHeight: `${itemHeight}px`,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none'
            }}
          >
            {String(item).padStart(2, '0')}
          </div>
        ))}
        {/* Bottom padding for center alignment */}
        <div style={{ height: centerOffset * itemHeight }} />
      </div>
    </div>
  );
};

export default SecondsWheelPicker;