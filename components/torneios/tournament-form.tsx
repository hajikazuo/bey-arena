"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";

import { criarTorneio, type CriarTorneioState } from "@/app/(dashboard)/torneios/actions";
import { GlobalToast } from "@/components/ui/global-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Grupo } from "@/types/grupo";
import { REGRAS_BEYBLADE_X_PADRAO } from "@/types/torneio";

const initialState: CriarTorneioState = { error: null, success: false };

export function TournamentForm({ grupos }: { grupos: Grupo[] }) {
  const [open, setOpen] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const [state, formAction, isPending] = useActionState(async (previousState: CriarTorneioState, formData: FormData) => {
    const nextState = await criarTorneio(previousState, formData);
    if (nextState.success) setOpen(false);
    setToastKey((value) => value + 1);
    return nextState;
  }, initialState);

  return (
    <>
      <GlobalToast message={state.error} type="error" toastKey={toastKey} />
      <GlobalToast message={state.success ? "Torneio criado com sucesso." : null} type="success" toastKey={toastKey} />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button disabled={grupos.length === 0}><Plus /> Novo torneio</Button>} />
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Novo torneio</SheetTitle>
            <SheetDescription>Cadastre um torneio e defina as regras das batalhas.</SheetDescription>
          </SheetHeader>

          <form action={formAction} className="flex flex-1 flex-col gap-5 px-4">
            <div className="grid gap-2">
              <Label htmlFor="torneio-grupo">Grupo</Label>
              <select id="torneio-grupo" name="grupoId" required className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="">Selecione um grupo</option>
                {grupos.map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>)}
              </select>
            </div>

            <div className="grid gap-2"><Label htmlFor="torneio-nome">Nome</Label><Input id="torneio-nome" name="nome" maxLength={160} required placeholder="Ex.: Campeonato Bey Arena" /></div>
            <div className="grid gap-2"><Label htmlFor="torneio-descricao">Descrição</Label><textarea id="torneio-descricao" name="descricao" maxLength={500} rows={3} placeholder="Descreva o torneio (opcional)" className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3" /></div>

            <div className="grid gap-2">
              <Label htmlFor="torneio-formato">Formato</Label>
              <select id="torneio-formato" name="formato" defaultValue="eliminacao_simples" required className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="eliminacao_simples">Eliminação simples</option>
                <option value="eliminacao_dupla">Eliminação dupla</option>
              </select>
            </div>

            <fieldset className="grid gap-3 rounded-lg border p-3">
              <legend className="px-1 text-sm font-medium">Regras de pontuação</legend>
              <div className="grid gap-2"><Label htmlFor="pontos-para-vencer">Pontos para vencer uma partida</Label><Input id="pontos-para-vencer" name="pontosParaVencer" type="number" min={1} step={1} defaultValue={REGRAS_BEYBLADE_X_PADRAO.pontosParaVencer} required /></div>
              <div className="grid grid-cols-2 gap-3">
                {([["pontosSpinFinish", "Spin Finish", REGRAS_BEYBLADE_X_PADRAO.pontosSpinFinish], ["pontosOverFinish", "Over Finish", REGRAS_BEYBLADE_X_PADRAO.pontosOverFinish], ["pontosBurstFinish", "Burst Finish", REGRAS_BEYBLADE_X_PADRAO.pontosBurstFinish], ["pontosExtremeFinish", "Extreme Finish", REGRAS_BEYBLADE_X_PADRAO.pontosExtremeFinish]] as const).map(([name, label, value]) => <div className="grid gap-2" key={name}><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type="number" min={0} step={1} defaultValue={value} required /></div>)}
              </div>
            </fieldset>

            <SheetFooter className="px-0"><Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : "Salvar torneio"}</Button></SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
