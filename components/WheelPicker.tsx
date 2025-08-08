import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from 'react';
import './WheelPicker.css';
import { triggerHaptic } from '../utils/haptics';

export type HapticsMode = 'auto' | 'vibration' | 'capacitor' | 'none';

export interface WheelPickerHandle {
  scrollToIndex: (index: number, animated?: boolean) => void;
}

export interface WheelPickerProps<T extends number | string = number> {
  items: T[];
  value: T;
  onChange: (value: T, index: number) => void;
  itemHeight?: number; // px
  visibleRows?: number; // odd number preferred
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode;
  itemToString?: (item: T) => string;
  haptics?: HapticsMode;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  disabled?: boolean;
}

const DEFAULT_ITEM_HEIGHT = 50;
const DEFAULT_VISIBLE_ROWS = 5;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    try {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    } catch {
      // Safari < 14 fallback
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);
  return reduced;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

const WheelPickerInner = <T extends number | string>(
  {
    items,
    value,
    onChange,
    itemHeight = DEFAULT_ITEM_HEIGHT,
    visibleRows = DEFAULT_VISIBLE_ROWS,
    renderItem,
    itemToString,
    haptics = 'auto',
    className,
    style,
    ariaLabel,
    disabled = false,
  }: WheelPickerProps<T>,
  ref: React.Ref<WheelPickerHandle>
) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    const idx = items.indexOf(value);
    return idx >= 0 ? idx : 0;
  });
  const reducedMotion = usePrefersReducedMotion();

  // Derived sizes
  const viewportHeight = itemHeight * visibleRows;
  const centerOffset = Math.floor(visibleRows / 2);
  const spacerSize = centerOffset * itemHeight;

  // Keep selectedIndex in sync with value prop when not actively scrolling
  useEffect(() => {
    const idx = items.indexOf(value);
    if (idx >= 0 && idx !== selectedIndex) {
      setSelectedIndex(idx);
      // Also move scroll if value was updated externally
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: idx * itemHeight, behavior: 'auto' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items]);

  const scrollToIndex = useCallback(
    (index: number, animated: boolean = true) => {
      const clamped = clamp(index, 0, items.length - 1);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: clamped * itemHeight,
          behavior: animated && !reducedMotion ? 'smooth' : 'auto',
        });
      }
    },
    [itemHeight, items.length, reducedMotion]
  );

  useImperativeHandle(ref, () => ({ scrollToIndex }), [scrollToIndex]);

  // On mount, position to initial value
  useLayoutEffect(() => {
    const initialIndex = items.indexOf(value);
    if (scrollRef.current && initialIndex >= 0) {
      scrollRef.current.scrollTop = initialIndex * itemHeight;
      setSelectedIndex(initialIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Axis-lock for Safari to avoid slight horizontal drift
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const t = e.touches[0];
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        // Block horizontal panning to prevent visual drift
        e.preventDefault();
      }
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onTouchStart as any);
      el.removeEventListener('touchmove', onTouchMove as any);
    };
  }, []);

  // Scroll handling with rAF + idle timeout to detect settle
  const lastScrollTopRef = useRef(0);
  const scrollIdleTimer = useRef<number | null>(null);
  const isScrollingRef = useRef(false);

  const settle = useCallback(() => {
    if (!scrollRef.current) return;
    const rawIndex = Math.round(scrollRef.current.scrollTop / itemHeight);
    const nextIndex = clamp(rawIndex, 0, items.length - 1);
    const changed = nextIndex !== selectedIndex;

    // Snap precisely to computed index
    scrollToIndex(nextIndex, true);

    if (changed) {
      setSelectedIndex(nextIndex);
      const nextValue = items[nextIndex];
      // Haptic feedback on snap only
      triggerHaptic(haptics);
      onChange(nextValue, nextIndex);
    }
  }, [itemHeight, items, onChange, scrollToIndex, selectedIndex, haptics]);

  const onScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const st = scrollRef.current.scrollTop;
    if (st === lastScrollTopRef.current && isScrollingRef.current) {
      // Ignore redundant events
      return;
    }
    lastScrollTopRef.current = st;
    isScrollingRef.current = true;

    // rAF throttle by scheduling settle timer reset
    if (scrollIdleTimer.current) {
      window.clearTimeout(scrollIdleTimer.current);
    }
    scrollIdleTimer.current = window.setTimeout(() => {
      isScrollingRef.current = false;
      settle();
    }, 120);
  }, [settle]);

  // Keyboard accessibility
  const moveBy = useCallback(
    (delta: number) => {
      const next = clamp(selectedIndex + delta, 0, items.length - 1);
      if (next !== selectedIndex) {
        setSelectedIndex(next);
        scrollToIndex(next, true);
        const nextValue = items[next];
        triggerHaptic(haptics);
        onChange(nextValue, next);
      }
    },
    [haptics, items, onChange, scrollToIndex, selectedIndex]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      switch (e.key) {
        case 'ArrowUp':
        case 'Up':
          e.preventDefault();
          moveBy(-1);
          break;
        case 'ArrowDown':
        case 'Down':
          e.preventDefault();
          moveBy(1);
          break;
        case 'PageUp':
          e.preventDefault();
          moveBy(-5);
          break;
        case 'PageDown':
          e.preventDefault();
          moveBy(5);
          break;
        case 'Home':
          e.preventDefault();
          moveBy(-Infinity);
          break;
        case 'End':
          e.preventDefault();
          moveBy(Infinity);
          break;
        default:
          break;
      }
    },
    [disabled, moveBy]
  );

  const ariaValueText = useMemo(() => {
    const current = items[selectedIndex];
    if (itemToString) return itemToString(current);
    return String(current);
  }, [itemToString, items, selectedIndex]);

  // Progressive styling per distance from selected index
  const getItemStyle = useCallback(
    (index: number): React.CSSProperties => {
      const distance = Math.abs(index - selectedIndex);
      const clamped = Math.min(distance, 3);
      const opacity = 1 - clamped * 0.2; // 1, 0.8, 0.6, 0.4...
      // Avoid horizontal jitter by scaling on Y only; keep X at 1.0
      const scaleY = index === selectedIndex ? 1.08 : 1 - Math.min(distance, 2) * 0.02; // 1.08 center, then 0.98, 0.96
      return reducedMotion
        ? { opacity }
        : { opacity, transform: `translateZ(0) scale(1, ${scaleY})` };
    },
    [reducedMotion, selectedIndex]
  );

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`wheelPicker ${reducedMotion ? 'wheelPicker--reduced' : ''} ${className || ''}`.trim()}
      style={{ height: viewportHeight, ...style }}
      role="spinbutton"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={items.length - 1}
      aria-valuenow={selectedIndex}
      aria-valuetext={ariaValueText}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={onKeyDown}
      data-disabled={disabled ? 'true' : undefined}
    >
      <div
        ref={scrollRef}
        className="wheelPicker__list"
        style={{
          height: viewportHeight,
          WebkitOverflowScrolling: 'touch' as any,
        }}
        onScroll={onScroll}
      >
        {/* Top spacer to allow first item to center */}
        <div style={{ height: spacerSize, flexShrink: 0 }} />
        {items.map((item, index) => (
          <div
            key={index}
            className={`wheelPicker__item ${index === selectedIndex ? 'is-selected' : ''}`}
            style={{ height: itemHeight, lineHeight: `${itemHeight}px`, ...getItemStyle(index) }}
          >
            {renderItem ? renderItem(item, index === selectedIndex) : (itemToString ? itemToString(item) : String(item))}
          </div>
        ))}
        {/* Bottom spacer to allow last item to center */}
        <div style={{ height: spacerSize, flexShrink: 0 }} />
      </div>
      {/* Center selection overlay band to match existing UI */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: centerOffset * itemHeight,
          height: itemHeight,
        }}
      >
        <div className="h-full bg-light-accent/10 dark:bg-dark-accent/10 border-t border-b border-light-accent dark:border-dark-accent" />
      </div>
    </div>
  );
};

const WheelPicker = forwardRef(WheelPickerInner) as <T extends number | string = number>(
  p: WheelPickerProps<T> & { ref?: React.Ref<WheelPickerHandle> }
) => ReturnType<typeof WheelPickerInner>;

export default WheelPicker;


