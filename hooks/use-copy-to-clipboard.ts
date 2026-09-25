"use client";

import { useCallback, useRef, useState } from "react";

export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyToClipboard = useCallback(async (value: string) => {
    if (!navigator?.clipboard) return false;

    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);

      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setIsCopied(false), 2000);

      return true;
    } catch {
      setIsCopied(false);
      return false;
    }
  }, []);

  return { isCopied, copyToClipboard };
}
