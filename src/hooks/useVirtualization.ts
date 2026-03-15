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

  // Intentional Bug: Missing dependency in ResizeObserver callback
  // This will be documented in the README as requested.
  // The viewportHeight might not update correctly if the resize observer uses a stale reference
  // or if we forget to update it when the container changes.
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setViewportHeight(entry.contentRect.height);
      }
    });

    observer.observe(containerRef.current);
    
    // We'll intentionally keep a "small" bug here by not cleaning up if we wanted a leak,
    // but the prompt asks for exactly one bug. Let's make it a logic bug.
    return () => observer.disconnect();
  }, []); // Missing containerRef.current in dependency might be one, but ref doesn't trigger re-render.

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const { startIndex, endIndex, translateY } = useMemo(() => {
    // Virtualization Math
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(totalItems, Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan);
    
    return {
      startIndex: start,
      endIndex: end,
      translateY: start * itemHeight
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
