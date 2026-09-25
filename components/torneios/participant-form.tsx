"use client";

import { useActionState, useState } from "react";

import {
  adicionarParticipantes,
  type CriarTorneioState,
} from "@/app/(dashboard)/torneios/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlobalToast } from "@/components/ui/global-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MembroDisponivel = {
  usuarioId: string;
  inscrito: boolean;
  perfil?: {
    nome: string;
    apelido: string | null;
  } | null;
};

const initialState: CriarTorneioState = {
  error: null,
  success: false,
};

export function ParticipantForm({
  torneioId,
  membros,
}: {
  torneioId: string;
  membros: MembroDisponivel[];
}) {
  const [state, formAction, isPending] = useActionState(
    adicionarParticipantes,
    initialState,
  );
  const [toastKey, setToastKey] = useState(0);

  function handleSubmit(formData: FormData) {
    setToastKey((value) => value + 1);
    return formAction(formData);
  }

  const membrosDisponiveis = membros.filter((membro) => !membro.inscrito);

  return (
    <>
      <GlobalToast
        message={state.error}
        type="error"
        toastKey={toastKey}
      />

      <GlobalToast
        message={state.success ? "Participantes adicionados com sucesso." : null}
        type="success"
        toastKey={toastKey}
      />

      <form action={handleSubmit}>
        <input type="hidden" name="torneioId" value={torneioId} />

        <Card>
          <CardHeader>
            <CardTitle>Adicionar participantes</CardTitle>
            <CardDescription>
              Selecione membros do grupo que participarão deste torneio.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {membrosDisponiveis.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todos os membros do grupo já estão inscritos.
              </p>
            ) : (
              membrosDisponiveis.map((membro) => {
                const nome =
                  membro.perfil?.apelido ||
                  membro.perfil?.nome ||
                  membro.usuarioId;

                return (
                  <div
                    key={membro.usuarioId}
                    className="flex flex-wrap items-center gap-3 rounded-lg border p-3"
                  >
                    <input
                      id={`participante-${membro.usuarioId}`}
                      name="usuarioId"
                      value={membro.usuarioId}
                      type="checkbox"
                      className="size-4 accent-primary"
                    />

                    <Label
                      htmlFor={`participante-${membro.usuarioId}`}
                      className="min-w-40 flex-1 cursor-pointer"
                    >
                      <span className="block font-medium">{nome}</span>
                      <span className="block text-xs text-muted-foreground">
                        {membro.usuarioId}
                      </span>
                    </Label>

                    <div className="grid w-32 gap-1">
                      <Label
                        htmlFor={`seed-${membro.usuarioId}`}
                        className="text-xs text-muted-foreground"
                      >
                        Cabeça de chave
                      </Label>
                      <Input
                        id={`seed-${membro.usuarioId}`}
                        name={`cabecaDeChave_${membro.usuarioId}`}
                        type="number"
                        min={1}
                        step={1}
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>

          {membrosDisponiveis.length > 0 && (
            <CardFooter className="justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adicionando..." : "Adicionar selecionados"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </form>
    </>
  );
}
