import { useCallback, useEffect } from "react";

export default function useEventListener<
  T extends keyof GlobalEventHandlersEventMap,
>(
  eventType: T,
  callback: (e: GlobalEventHandlersEventMap[T]) => void,
  element: any = globalThis,
) {
  const cb = useCallback(callback, [callback]);

  useEffect(() => {
    element.addEventListener(eventType, cb);
    return () => element.removeEventListener(eventType, cb);
  }, [eventType, element, cb]);
}
