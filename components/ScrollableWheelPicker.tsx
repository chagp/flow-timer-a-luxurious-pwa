import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ScrollableWheelPickerProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  formatter?: (value: number) => string;
  itemHeight?: number;
  visibleItems?: number;
}

const ScrollableWheelPicker: React.FC<ScrollableWheelPickerProps> = ({
  value,
  min,
  max,
  onChange,
  formatter = (v) => String(v).padStart(2, '0'),
  itemHeight = 40,
  visibleItems = 5
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const totalHeight = itemHeight * items.length;
  const containerHeight = itemHeight * visibleItems;
  const centerOffset = Math.floor(visibleItems / 2);

  const getScrollTop = useCallback((selectedValue: number) => {
    const index = selectedValue - min;
    return index * itemHeight;
  }, [min, itemHeight]);

  const getValueFromScrollTop = useCallback((scrollTop: number) => {
    const index = Math.round(scrollTop / itemHeight);
    return Math.max(min, Math.min(max, min + index));
  }, [min, max, itemHeight]);

  useEffect(() => {
    if (containerRef.current && !isDragging) {
      containerRef.current.scrollTop = getScrollTop(value);
    }
  }, [value, getScrollTop, isDragging]);

  const idleTimer = useRef<number | null>(null);
  const handleScroll = useCallback(() => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      if (!containerRef.current) return;
      const newValue = getValueFromScrollTop(containerRef.current.scrollTop);
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
        style={{ 
          height: containerHeight,
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'auto',
          scrollSnapType: 'y mandatory' as any,
        }}
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
            {formatter(item)}
          </div>
        ))}
        {/* Bottom padding for center alignment */}
        <div style={{ height: centerOffset * itemHeight }} />
      </div>
    </div>
  );
};

export default ScrollableWheelPicker;