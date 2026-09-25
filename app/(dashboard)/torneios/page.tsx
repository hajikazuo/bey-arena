import Link from "next/link";

import { DashboardBreadcrumb } from "@/components/app-breadcrumb";
import { TournamentForm } from "@/components/torneios/tournament-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listarGrupos } from "../grupos/queries";
import { listarTorneios } from "./queries";

const statusLabels = {
  rascunho: "Rascunho",
  inscricoes: "Inscrições",
  em_andamento: "Em andamento",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
} as const;
const formatoLabels = {
  eliminacao_simples: "Eliminação simples",
  eliminacao_dupla: "Eliminação dupla",
} as const;

export default async function TorneiosPage() {
  const [{ data: torneios, error }, { data: grupos }] = await Promise.all([
    listarTorneios(),
    listarGrupos(),
  ]);
  const dateFormatter = new Intl.DateTimeFormat("pt-BR");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <DashboardBreadcrumb title="Torneios" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Torneios</h1>
            <p className="text-sm text-muted-foreground">
              Crie e acompanhe os torneios dos seus grupos.
            </p>
          </div>
        </div>
        <TournamentForm grupos={grupos} />
      </div>

      {grupos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center text-sm text-muted-foreground">
            <p>Crie ou participe de um grupo antes de cadastrar um torneio.</p>
            <Button
              nativeButton={false}
              variant="outline"
              render={<Link href="/grupos" />}
            >
              Ir para grupos
            </Button>
          </CardContent>
        </Card>
      )}
      {error ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : torneios.length === 0 && grupos.length > 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Você ainda não cadastrou nenhum torneio.
          </CardContent>
        </Card>
      ) : (
        torneios.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {torneios.map((torneio) => (
              <Card key={torneio.id}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-3">
                    {torneio.nome}
                    <span className="rounded-full bg-muted px-2 py-1 text-xs font-normal text-muted-foreground">
                      {statusLabels[torneio.status]}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {torneio.descricao ?? "Sem descrição"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Grupo</span>
                    <span>{torneio.grupoNome}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Formato</span>
                    <span>{formatoLabels[torneio.formato]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Criado em</span>
                    <span>
                      {dateFormatter.format(new Date(torneio.criadoEm))}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button nativeButton={false} className="w-full" render={<a href={`/torneios/${torneio.id}`} />}>
                    Participantes
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
