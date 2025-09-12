import { useEffect, useRef } from "react";

interface UseOutsideClickProps {
  callback: () => void;
  enabled?: boolean;
}

export function useOutsideClick({
  callback,
  enabled = true,
}: UseOutsideClickProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback, enabled]);

  return ref;
}
