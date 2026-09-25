import Link from "next/link";
import { notFound } from "next/navigation";

import { DashboardBreadcrumb } from "@/components/app-breadcrumb";
import { ParticipantForm } from "@/components/torneios/participant-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buscarTorneio,
  listarMembrosDisponiveis,
  listarParticipantesDoTorneio,
} from "./queries";

const statusLabels = {
  rascunho: "Rascunho",
  inscricoes: "Inscrições",
  em_andamento: "Em andamento",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
} as const;

export default async function TorneioDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const torneio = await buscarTorneio(id);

  if (!torneio) {
    notFound();
  }

  const { data: participantes, error: erroParticipantes } =
    await listarParticipantesDoTorneio(id);
  const idsInscritos = participantes.map((participante) => participante.usuarioId);
  const { data: membros, error: erroMembros } = await listarMembrosDisponiveis(
    torneio.grupoId,
    idsInscritos,
  );
  const podeAdicionar =
    torneio.status === "rascunho" || torneio.status === "inscricoes";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <DashboardBreadcrumb title={torneio.nome} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{torneio.nome}</h1>
            <p className="text-sm text-muted-foreground">
              Status: {statusLabels[torneio.status]}
            </p>
          </div>
        </div>

        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href="/torneios" />}
        >
          Voltar para torneios
        </Button>
      </div>

      {podeAdicionar && (
        <ParticipantForm torneioId={torneio.id} membros={membros} />
      )}

      {(erroParticipantes || erroMembros) && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-destructive">
            {erroParticipantes || erroMembros}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Participantes inscritos ({participantes.length})</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {participantes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum participante foi adicionado ainda.
            </p>
          ) : (
            participantes.map((participante) => {
              const nome =
                participante.perfil?.apelido ||
                participante.perfil?.nome ||
                participante.usuarioId;

              return (
                <div
                  key={participante.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {participante.usuarioId}
                    </p>
                  </div>

                  {participante.cabecaDeChave && (
                    <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                      Seed {participante.cabecaDeChave}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
