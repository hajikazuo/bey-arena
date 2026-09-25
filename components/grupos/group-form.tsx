"use client";

import { useActionState, useState } from "react";
import { Pencil, Plus } from "lucide-react";

import { criarGrupo, editarGrupo, type CriarGrupoState } from "@/app/(dashboard)/grupos/actions";
import { GlobalToast } from "@/components/ui/global-toast";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type GroupData = {
  id: string;
  nome: string;
  descricao: string | null;
};

const initialState: CriarGrupoState = { error: null, success: false };

export function GroupForm({ grupo }: { grupo?: GroupData }) {
  const isEditando = Boolean(grupo);
  const fieldId = grupo?.id ?? "novo";
  const [open, setOpen] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const [state, formAction, isPending] = useActionState(
    async (previousState: CriarGrupoState, formData: FormData) => {
      const nextState = isEditando
        ? await editarGrupo(previousState, formData)
        : await criarGrupo(previousState, formData);

      if (nextState.success) setOpen(false);
      setToastKey((value) => value + 1);
      return nextState;
    },
    initialState,
  );

  return (
    <>
      <GlobalToast message={state.error} type="error" toastKey={toastKey} />
      <GlobalToast
        message={state.success ? isEditando ? "Grupo atualizado com sucesso." : "Grupo criado com sucesso." : null}
        type="success"
        toastKey={toastKey}
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant={isEditando ? "ghost" : "default"}
              size={isEditando ? "icon" : "default"}
              aria-label={isEditando ? "Editar grupo" : undefined}
              title={isEditando ? "Editar grupo" : undefined}
            />
          }
        >
          {isEditando ? <Pencil /> : <Plus />}
          {!isEditando && "Novo grupo"}
        </SheetTrigger>

        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEditando ? "Editar grupo" : "Novo grupo"}</SheetTitle>
            <SheetDescription>
              {isEditando ? "Atualize os dados do grupo." : "Crie um grupo para organizar seus torneios."}
            </SheetDescription>
          </SheetHeader>

          <form action={formAction} className="flex flex-1 flex-col gap-5 px-4">
            {grupo && <input type="hidden" name="id" value={grupo.id} />}

            <div className="grid gap-2">
              <Label htmlFor={`nome-${fieldId}`}>Nome</Label>
              <Input id={`nome-${fieldId}`} name="nome" defaultValue={grupo?.nome} maxLength={120} required placeholder="Ex.: Bey Arena São Paulo" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`descricao-${fieldId}`}>Descrição</Label>
              <textarea
                id={`descricao-${fieldId}`}
                name="descricao"
                defaultValue={grupo?.descricao ?? ""}
                maxLength={500}
                rows={4}
                placeholder="Descreva o grupo (opcional)"
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3"
              />
            </div>

            <SheetFooter className="px-0">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : isEditando ? "Atualizar" : "Salvar"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
