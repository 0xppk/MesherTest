import { RefObject } from "react";
import useEventListener from "./useEventListener";

export default function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: (e: MouseEvent | FocusEvent | PointerEvent) => void,
) {
  useEventListener("pointerdown", (e) => {
    if (ref.current?.contains(e.target as Node)) return;
    callback(e);
  });
}
