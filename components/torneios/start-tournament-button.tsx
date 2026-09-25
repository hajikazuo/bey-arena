"use client";

import { useActionState, useState } from "react";

import {
  iniciarTorneio,
  type CriarTorneioState,
} from "@/app/(dashboard)/torneios/actions";
import { Button } from "@/components/ui/button";
import { GlobalToast } from "@/components/ui/global-toast";

const initialState: CriarTorneioState = {
  error: null,
  success: false,
};

export function StartTournamentButton({ torneioId }: { torneioId: string }) {
  const [state, formAction, isPending] = useActionState(
    iniciarTorneio,
    initialState,
  );
  const [toastKey, setToastKey] = useState(0);

  function handleSubmit(formData: FormData) {
    if (!window.confirm("Deseja iniciar o torneio? Depois disso, não será possível adicionar participantes.")) {
      return;
    }

    setToastKey((value) => value + 1);
    return formAction(formData);
  }

  return (
    <>
      <GlobalToast
        message={state.error}
        type="error"
        toastKey={toastKey}
      />

      <GlobalToast
        message={state.success ? "Torneio iniciado com sucesso." : null}
        type="success"
        toastKey={toastKey}
      />

      <form action={handleSubmit}>
        <input type="hidden" name="torneioId" value={torneioId} />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Iniciando..." : "Iniciar torneio"}
        </Button>
      </form>
    </>
  );
}
