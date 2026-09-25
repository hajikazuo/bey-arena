"use client";

import { useActionState } from "react";
import { editarMembro, type MembroGrupoState } from "@/app/(dashboard)/grupos/[id]/membros/actions";

export function MemberRoleForm({ idGrupo, idMembro, papel }: { idGrupo: string; idMembro: string; papel: string }) {
  const [state, formAction, isPending] = useActionState<MembroGrupoState, FormData>(editarMembro, { error: null, success: false });
  return <form action={formAction} className="flex items-center gap-2"><input type="hidden" name="grupoId" value={idGrupo} /><input type="hidden" name="membroId" value={idMembro} /><select name="papel" defaultValue={papel} className="border-input bg-background h-8 rounded-lg border px-2 text-xs" disabled={isPending || papel === "dono"}><option value="membro">Membro</option><option value="admin">Administrador</option><option value="dono">Dono</option></select>{papel !== "dono" && <button type="submit" className="text-xs text-muted-foreground underline" disabled={isPending}>Salvar</button>}{state.error && <span className="sr-only">{state.error}</span>}</form>;
}
