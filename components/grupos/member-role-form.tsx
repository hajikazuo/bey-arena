"use client";

import { useActionState, useState } from "react";
import { editarMembro, type MembroGrupoState } from "@/app/(dashboard)/grupos/[id]/membros/actions";
import { GlobalToast } from "@/components/ui/global-toast";

export function MemberRoleForm({ idGrupo, idMembro, papel }: { idGrupo: string; idMembro: string; papel: string }) {
  const [toastKey, setToastKey] = useState(0);
  const [state, formAction, isPending] = useActionState<MembroGrupoState, FormData>(
    async (previousState, formData) => {
      const nextState = await editarMembro(previousState, formData);
      setToastKey((value) => value + 1);
      return nextState;
    },
    { error: null, success: false },
  );

  return <>
  <GlobalToast message={state.error} type="error" toastKey={toastKey} />
  <GlobalToast
    message={state.success ? "Papel do membro atualizado com sucesso." : null}
    type="success"
    toastKey={toastKey}
  />
  <form action={formAction} className="flex items-center gap-2">
    <input type="hidden" name="grupoId" value={idGrupo} />
    <input type="hidden" name="membroId" value={idMembro} />
    <select
      name="papel"
      defaultValue={papel}
      className="border-input bg-background h-8 rounded-lg border px-2 text-xs"
      disabled={isPending || papel === "dono"}
    >
      <option value="membro">Membro</option>
      <option value="admin">Administrador</option>
      <option value="dono">Dono</option>
    </select>
    <button
      type="submit"
      className="border-input bg-background h-8 rounded-lg border px-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
      disabled={isPending}
    >
      Salvar
    </button>
  </form>
</>;
}
