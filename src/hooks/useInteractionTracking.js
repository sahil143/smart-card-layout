import { useRef, useCallback } from 'react';

export const useInteractionTracking = (cardId, onInteraction) => {
  const hoverStartTime = useRef(null);
  const isHovering = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const hoverTimeout = useRef(null);

  const handleMouseEnter = useCallback((e) => {
    if (!isHovering.current) {
      hoverStartTime.current = Date.now();
      isHovering.current = true;
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isHovering.current) {
      const currentPosition = { x: e.clientX, y: e.clientY };
      const distance = Math.sqrt(
        Math.pow(currentPosition.x - lastMousePosition.current.x, 2) +
        Math.pow(currentPosition.y - lastMousePosition.current.y, 2)
      );
      
      // Only count as active hover if mouse is moving (distance > 5px)
      if (distance > 5) {
        lastMousePosition.current = currentPosition;
        
        // Clear existing timeout and set a new one
        if (hoverTimeout.current) {
          clearTimeout(hoverTimeout.current);
        }
        
        // Set timeout to track hover time after mouse stops moving
        hoverTimeout.current = setTimeout(() => {
          if (isHovering.current && hoverStartTime.current) {
            const hoverDuration = Date.now() - hoverStartTime.current;
            if (hoverDuration > 100) { // Only count hovers longer than 100ms
              onInteraction(cardId, 'hover', hoverDuration);
            }
          }
        }, 500); // Track hover after 500ms of no movement
      }
    }
  }, [cardId, onInteraction]);

  const handleMouseLeave = useCallback(() => {
    if (isHovering.current && hoverStartTime.current) {
      const hoverDuration = Date.now() - hoverStartTime.current;
      if (hoverDuration > 100) { // Only count meaningful hovers
        onInteraction(cardId, 'hover', hoverDuration);
      }
    }
    
    // Clear timeout and reset state
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    
    isHovering.current = false;
    hoverStartTime.current = null;
  }, [cardId, onInteraction]);

  const handleClick = useCallback(() => {
    onInteraction(cardId, 'click', 1);
  }, [cardId, onInteraction]);

  return {
    onMouseEnter: handleMouseEnter,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick
  };
}; 