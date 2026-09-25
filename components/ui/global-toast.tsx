"use client";

import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/toast";

type GlobalToastProps = {
  message: string | null;
  type?: "error" | "success" | "info" | "warning";
  toastKey?: string | number | null;
};

export function GlobalToast({ message, type = "info", toastKey }: GlobalToastProps) {
  const lastToast = useRef<string | null>(null);

  useEffect(() => {
    if (!message) {
      lastToast.current = null;
      return;
    }

    const currentToastKey = `${type}:${message}:${toastKey ?? ""}`;

    if (lastToast.current === currentToastKey) return;

    lastToast.current = currentToastKey;

    toast.add({
      id: "global-toast",
      type,
      description: message,
      priority: type === "error" ? "high" : "low",
    });
  }, [message, type, toastKey]);

  return null;
}
