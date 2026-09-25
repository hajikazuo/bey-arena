"use client";

import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  visible: boolean;
  required?: boolean;
  minLength?: number;
  onToggle: () => void;
};

export function PasswordField({
  id,
  name,
  label,
  visible,
  required = true,
  minLength,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          className="pr-10"
        />
        <button
          type="button"
          className="absolute top-1/2 right-1 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onToggle}
          aria-label={visible ? `Ocultar ${label.toLowerCase()}` : `Exibir ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}
