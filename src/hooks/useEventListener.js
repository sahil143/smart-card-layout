import React from 'react';

export const useEventListener = (
  eventTarget,
  event,
  cb,
) => {
  React.useEffect(() => {
    eventTarget?.addEventListener(event, cb);
    return () => eventTarget?.removeEventListener(event, cb);
  }, [cb, event, eventTarget]);
};
