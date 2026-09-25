import { notFound } from "next/navigation";

import { DashboardBreadcrumb } from "@/components/app-breadcrumb";
import { ParticipantForm } from "@/components/torneios/participant-form";
import { StartTournamentButton } from "@/components/torneios/start-tournament-button";
import { TournamentBracket } from "@/components/torneios/bracket";
import { TournamentInfoSheet } from "@/components/torneios/tournament-info-sheet";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  buscarTorneio,
  listarMembrosDisponiveis,
  listarPartidasDoTorneio,
  listarBatalhasDoTorneio,
  listarParticipantesDoTorneio,
} from "./queries";
import { createClient } from "@/lib/supabase/server";

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
  const { data: partidas, error: erroPartidas } = await listarPartidasDoTorneio(id);
  const { data: batalhas, error: erroBatalhas } = await listarBatalhasDoTorneio(id);
  const supabase = await createClient();
  const { data: { user: usuarioAtual } } = await supabase.auth.getUser();
  const podeAdicionar =
    torneio.status === "rascunho" || torneio.status === "inscricoes";
  const podeIniciar = podeAdicionar && participantes.length >= 2;
  const nomesParticipantes = new Map(
    participantes.map((participante) => [
      participante.id,
      participante.perfil?.apelido ||
        participante.perfil?.nome ||
        participante.usuarioId,
    ]),
  );
  const nomes = Object.fromEntries(nomesParticipantes);
  const ranking = participantes
    .map((participante) => ({
      participanteId: participante.id,
      nome: nomesParticipantes.get(participante.id) ?? participante.usuarioId,
      pontos: partidas.reduce((total, partida) => (
        total + (partida.jogador1_id === participante.id ? Number(partida.pontos_jogador1) : 0)
          + (partida.jogador2_id === participante.id ? Number(partida.pontos_jogador2) : 0)
      ), 0),
    }))
    .sort((a, b) => b.pontos - a.pontos || a.nome.localeCompare(b.nome));

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

        <div className="flex flex-wrap items-center justify-end gap-2">
          <TournamentInfoSheet
            participantes={participantes.map((participante) => ({
              id: participante.id,
              nome: nomesParticipantes.get(participante.id) ?? participante.usuarioId,
              usuarioId: participante.usuarioId,
              cabecaDeChave: participante.cabecaDeChave,
            }))}
            ranking={ranking}
            exibirRanking={torneio.status === "finalizado"}
          />
          {podeIniciar && <StartTournamentButton torneioId={torneio.id} />}
        </div>
      </div>

      {podeAdicionar && (
        <ParticipantForm torneioId={torneio.id} membros={membros} />
      )}

      {(erroParticipantes || erroMembros || erroPartidas || erroBatalhas) && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-destructive">
            {erroParticipantes || erroMembros || erroPartidas || erroBatalhas}
          </CardContent>
        </Card>
      )}

      {partidas.length > 0 && (
        <TournamentBracket
          partidas={partidas}
          batalhas={batalhas}
          nomes={nomes}
          podeEditar={usuarioAtual?.id === torneio.criadoPor}
        />
      )}
    </div>
  );
}
