"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalToast } from "@/components/ui/global-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CriarGrupoState } from "@/app/(dashboard)/grupos/actions";

type GroupAction = (state: CriarGrupoState, formData: FormData) => Promise<CriarGrupoState>;

export function GroupForm({ action, title, description, submitLabel, id, nome = "", descricao = "" }: {
  action: GroupAction;
  title: string;
  description: string;
  submitLabel: string;
  id?: string;
  nome?: string;
  descricao?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, { error: null, success: false });

  return (
    <>
      <GlobalToast message={state.error} type="error" />
      <GlobalToast message={state.success ? "Grupo salvo com sucesso." : null} type="success" />
      <form action={formAction} className="max-w-2xl">
        {id && <input type="hidden" name="id" value={id} />}
        <Card>
          <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-2"><Label htmlFor="nome">Nome</Label><Input id="nome" name="nome" defaultValue={nome} maxLength={120} required placeholder="Ex.: Bey Arena São Paulo" /></div>
            <div className="grid gap-2"><Label htmlFor="descricao">Descrição</Label><textarea id="descricao" name="descricao" defaultValue={descricao} maxLength={500} rows={4} placeholder="Descreva o grupo (opcional)" className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3" /></div>
          </CardContent>
          <CardFooter className="justify-end"><Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : submitLabel}</Button></CardFooter>
        </Card>
      </form>
    </>
  );
}
