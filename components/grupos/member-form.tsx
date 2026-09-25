"use client";

import { useActionState } from "react";
import { adicionarMembro, type MembroGrupoState } from "@/app/(dashboard)/grupos/[id]/membros/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalToast } from "@/components/ui/global-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MemberForm({ idGrupo }: { idGrupo: string }) {
  const [state, formAction, isPending] = useActionState<MembroGrupoState, FormData>(adicionarMembro, { error: null, success: false });
  return <>
    <GlobalToast message={state.error} type="error" />
    <GlobalToast
      message={state.success ? "Membro adicionado com sucesso." : null}
      type="success"
    />
    <form action={formAction}>
      <input type="hidden" name="grupoId" value={idGrupo} />
      <Card>
        <CardHeader>
          <CardTitle>Adicionar membro</CardTitle>
          <CardDescription>Informe o UUID do usuário cadastrado.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[1fr_160px]">
          <div className="grid gap-2">
            <Label htmlFor="usuarioId">ID do usuário</Label>
            <Input
              id="usuarioId"
              name="usuarioId"
              required
              placeholder="UUID do usuário"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="papel">Papel</Label>
            <select
              id="papel"
              name="papel"
              defaultValue="membro"
              className="border-input bg-background h-8 rounded-lg border px-2 text-sm"
            >
              <option value="membro">Membro</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Adicionando..." : "Adicionar membro"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  </>;

}
