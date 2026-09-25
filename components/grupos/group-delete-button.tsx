"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { excluirGrupo } from "@/app/(dashboard)/grupos/actions";
import { GlobalToast } from "@/components/ui/global-toast";
import { Button } from "@/components/ui/button";

export function GrupoDeleteButton({ grupoId }: { grupoId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [toastKey, setToastKey] = useState(0);

  function handleDelete() {
    if (isPending) return;

    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.",
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await excluirGrupo(grupoId);

      setMessage(
        result.success
          ? "Grupo excluído com sucesso."
          : result.error ?? "Não foi possível excluir o grupo.",
      );
      setToastKey((value) => value + 1);
    });
  }

  const isSuccess = message === "Grupo excluído com sucesso.";

  return (
    <>
      <GlobalToast
        message={isSuccess ? message : null}
        type="success"
        toastKey={toastKey}
      />
      <GlobalToast
        message={!isSuccess ? message : null}
        type="error"
        toastKey={toastKey}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Excluir grupo"
        title="Excluir grupo"
        disabled={isPending}
        onClick={handleDelete}
      >
        <Trash2 className="text-destructive" />
      </Button>
    </>
  );
}
