import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

interface VirtualizationOptions {
  itemHeight: number;
  totalItems: number;
  overscan?: number;
}

export const useVirtualization = ({ itemHeight, totalItems, overscan = 5 }: VirtualizationOptions) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setViewportHeight(entry.contentRect.height);
      }
    });

    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []); 

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const { startIndex, endIndex, translateY } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(totalItems, Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan);
    
    const clampedStart = Math.max(0, start);
    const clampedEnd = Math.min(totalItems, end);
    
    return {
      startIndex: clampedStart,
      endIndex: clampedEnd,
      translateY: clampedStart * itemHeight
    };
  }, [scrollTop, itemHeight, totalItems, viewportHeight, overscan]);


  const totalContentHeight = totalItems * itemHeight;

  return {
    containerRef,
    onScroll,
    startIndex,
    endIndex,
    translateY,
    totalContentHeight
  };
};
