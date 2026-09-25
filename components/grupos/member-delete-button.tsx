"use client";

import { useState, useTransition } from "react";
import { removerMembro } from "@/app/(dashboard)/grupos/[id]/membros/actions";
import { Button } from "@/components/ui/button";
import { GlobalToast } from "@/components/ui/global-toast";

export function MemberDeleteButton({ idMembro, idGrupo }: { idMembro: string; idGrupo: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [toastKey, setToastKey] = useState(0);

  function handleDelete() {
    if (isPending || !window.confirm("Deseja remover este membro?")) return;

    startTransition(async () => {
      const result = await removerMembro(idMembro, idGrupo);
      setMessage(result.success ? "Membro removido com sucesso." : result.error ?? "Não foi possível remover o membro.");
      setToastKey((value) => value + 1);
    });
  }

  const sucesso = message === "Membro removido com sucesso.";
  return <>
    <GlobalToast
      message={sucesso ? message : null}
      type="success"
      toastKey={toastKey}
    />
    <GlobalToast
      message={sucesso ? null : message}
      type="error"
      toastKey={toastKey}
    />
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={handleDelete}
    >
      {isPending ? "Removendo..." : "Remover"}
    </Button>
  </>;

}
