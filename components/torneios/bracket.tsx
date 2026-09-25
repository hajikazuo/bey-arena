"use client";

import { useActionState, useState } from "react";
import { Check, ChevronRight, CircleHelp, LockKeyhole, Medal, Swords, Trophy } from "lucide-react";

import { registrarResultadoPartida, type CriarTorneioState } from "@/app/(dashboard)/torneios/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalToast } from "@/components/ui/global-toast";

export type PartidaVisual = {
  id: string;
  chave: string;
  rodada: number;
  posicao: number;
  jogador1_id: string | null;
  jogador2_id: string | null;
  vencedor_id?: string | null;
  status: string;
  pontos_jogador1: number;
  pontos_jogador2: number;
};

export type BatalhaVisual = {
  id: string;
  partida_id: string;
  sequencia: number;
  vencedor_id: string;
  tipo_finalizacao: "spin" | "over" | "burst" | "extreme";
  pontos_concedidos: number;
};

export type RankingItem = {
  participanteId: string;
  nome: string;
  pontos: number;
};

const initialState: CriarTorneioState = { error: null, success: false };

function nomeDoJogador(id: string | null, nomes: Record<string, string>) {
  return id ? nomes[id] ?? "Jogador" : "A definir";
}

const tiposFinalizacao = [
  ["spin", "Spin Finish"],
  ["over", "Over Finish"],
  ["burst", "Burst Finish"],
  ["extreme", "Extreme Finish"],
] as const;

function PartidaCard({ partida, batalhas, nomes, podeEditar, emDestaque }: { partida: PartidaVisual; batalhas: BatalhaVisual[]; nomes: Record<string, string>; podeEditar: boolean; emDestaque: boolean }) {
  const [state, formAction, isPending] = useActionState(registrarResultadoPartida, initialState);
  const [toastKey, setToastKey] = useState(0);
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const pronta = partida.status === "pronta" || partida.status === "em_andamento";
  const finalizada = partida.status === "finalizada";
  const editavel = podeEditar && pronta && !finalizada;

  return (
    <div className={`relative rounded-xl border p-3 shadow-sm transition-colors ${emDestaque ? "border-primary/60 bg-primary/[0.04] shadow-md ring-2 ring-primary/10" : finalizada ? "bg-muted/20" : "bg-background/70"}`}>
      {emDestaque && podeEditar && (
        <div className="absolute -top-3 left-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
          <Swords className="size-3" /> Sua vez
        </div>
      )}
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="font-medium">Partida {partida.posicao}</span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${finalizada ? "bg-emerald-500/10 text-emerald-600" : partida.status === "bye" ? "bg-muted" : partida.status === "pronta" || partida.status === "em_andamento" ? "bg-primary/10 text-primary" : "bg-muted"}`}>
          {finalizada && <Check className="size-3" />}
          {partida.status === "finalizada" ? "Finalizada" : partida.status === "pronta" ? "Pronta" : partida.status === "bye" ? "Bye" : "Aguardando"}
        </span>
      </div>
      <form action={(data) => { setToastKey((value) => value + 1); return formAction(data); }} className="space-y-2">
        <input type="hidden" name="partidaId" value={partida.id} />
        {editavel && (
          <>
            <label className="block text-xs font-medium text-foreground">Quem marcou o ponto?</label>
            <select name="vencedorId" required className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">
              <option value="">Selecione o jogador</option>
              {[partida.jogador1_id, partida.jogador2_id].map((jogadorId) => (
                <option key={jogadorId} value={jogadorId ?? ""}>{nomeDoJogador(jogadorId, nomes)}</option>
              ))}
            </select>
            <label className="block text-xs font-medium text-foreground">Como venceu a batalha?</label>
            <input type="hidden" name="tipoFinalizacao" value={tipoSelecionado} />
            <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Tipo de finalização">
              {tiposFinalizacao.map(([value, label]) => {
                const selecionado = tipoSelecionado === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selecionado}
                    onClick={() => setTipoSelecionado(value)}
                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 ${selecionado ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-input bg-background hover:bg-muted"}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </>
        )}
        {[partida.jogador1_id, partida.jogador2_id].map((jogadorId, index) => (
          <div key={jogadorId ?? `slot-${index}`} className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${partida.vencedor_id === jogadorId ? "border-primary/30 bg-primary/10" : "border-transparent bg-muted/50"}`}>
            <span className={`min-w-0 flex-1 truncate text-sm ${partida.vencedor_id === jogadorId ? "font-semibold text-primary" : ""}`}>
              {nomeDoJogador(jogadorId, nomes)}
            </span>
            <strong className="min-w-7 text-right text-lg tabular-nums">{index === 0 ? partida.pontos_jogador1 : partida.pontos_jogador2}</strong>
          </div>
        ))}
        {editavel && (
          <Button type="submit" size="sm" className="mt-2 w-full" disabled={isPending}>
            {isPending ? "Registrando..." : "Registrar pontuação"}
          </Button>
        )}
      </form>
      {batalhas.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">Batalhas registradas</p>
          {batalhas.map((batalha) => (
            <div key={batalha.id} className="flex items-center justify-between gap-2">
              <span>{nomeDoJogador(batalha.vencedor_id, nomes)} · {tiposFinalizacao.find(([value]) => value === batalha.tipo_finalizacao)?.[1]}</span>
              <strong>+{batalha.pontos_concedidos}</strong>
            </div>
          ))}
        </div>
      )}
      <GlobalToast message={state.error} type="error" toastKey={toastKey} />
      <GlobalToast message={state.success ? "Resultado salvo. Próxima partida liberada." : null} type="success" toastKey={toastKey} />
    </div>
  );
}

export function TournamentBracket({ partidas, batalhas, nomes, podeEditar }: { partidas: PartidaVisual[]; batalhas: BatalhaVisual[]; nomes: Record<string, string>; podeEditar: boolean }) {
  const rodadas = [...new Set(partidas.map((partida) => partida.rodada))].sort((a, b) => a - b);
  const nomesPorChave = [...new Set(partidas.map((partida) => partida.chave))];
  const partidaAtiva = partidas
    .filter((partida) => partida.status === "pronta" || partida.status === "em_andamento")
    .sort((a, b) => a.rodada - b.rodada || a.posicao - b.posicao)[0]?.id;
  const partidasFinalizadas = partidas.filter((partida) => partida.status === "finalizada").length;
  const partidaAtual = partidas.find((partida) => partida.id === partidaAtiva);

  return (
    <Card>
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Trophy className="size-4 text-primary" />
              <CardTitle>Chaves das partidas</CardTitle>
            </div>
            <CardDescription>
              {podeEditar ? "Registre uma batalha por vez. A pontuação é calculada pelas regras do torneio." : "Acompanhe os resultados e o avanço dos jogadores."}
            </CardDescription>
          </div>
          <div className="rounded-lg border bg-background px-3 py-2 text-right">
            <p className="text-lg font-semibold tabular-nums">{partidasFinalizadas}/{partidas.length}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">partidas concluídas</p>
          </div>
        </div>
        {partidaAtual && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
            {podeEditar ? <Swords className="size-4 shrink-0 text-primary" /> : <CircleHelp className="size-4 shrink-0 text-primary" />}
            <span><strong>Partida atual:</strong> {nomeDoJogador(partidaAtual.jogador1_id, nomes)} x {nomeDoJogador(partidaAtual.jogador2_id, nomes)}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-8">
        {nomesPorChave.map((chave) => (
          <section key={chave} className="space-y-3">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold capitalize"><Swords className="size-4 text-muted-foreground" /> Chave de {chave}</h3>
            <div className="grid gap-4 overflow-x-auto pb-3" style={{ gridTemplateColumns: `repeat(${rodadas.length}, minmax(250px, 1fr))` }}>
              {rodadas.map((rodada) => (
                <div key={rodada} className="min-w-[250px] space-y-3">
                  <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rodada {rodada}{rodada < rodadas[rodadas.length - 1] && <ChevronRight className="size-3" />}</p>
                  {partidas.filter((partida) => partida.chave === chave && partida.rodada === rodada).map((partida) => (
                    <PartidaCard key={partida.id} partida={partida} batalhas={batalhas.filter((batalha) => batalha.partida_id === partida.id)} nomes={nomes} podeEditar={podeEditar && partida.id === partidaAtiva} emDestaque={partida.id === partidaAtiva} />
                  ))}
                  {partidas.filter((partida) => partida.chave === chave && partida.rodada === rodada).length === 0 && <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground"><LockKeyhole className="mx-auto mb-1 size-4" />Aguardando avanço</div>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}

export function TournamentRanking({ ranking }: { ranking: RankingItem[] }) {
  return (
    <Card>
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <Medal className="size-5 text-primary" />
          <div>
            <CardTitle>Ranking do torneio</CardTitle>
            <CardDescription>Classificação final por pontos conquistados nas partidas.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {ranking.map((item, index) => {
            const colocacao = index > 0 && item.pontos === ranking[index - 1].pontos
              ? index
              : index + 1;
            const destaque = colocacao <= 3;

            return (
              <div key={item.participanteId} className={`flex items-center gap-3 px-4 py-3 ${destaque ? "bg-primary/[0.03]" : ""}`}>
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  colocacao === 1 ? "bg-amber-400/20 text-amber-600" : colocacao === 2 ? "bg-slate-400/20 text-slate-600" : colocacao === 3 ? "bg-orange-400/20 text-orange-600" : "bg-muted text-muted-foreground"
                }`}>
                  {colocacao}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{item.nome}</span>
                <span className="text-right">
                  <strong className="block text-lg tabular-nums">{item.pontos}</strong>
                  <small className="text-xs text-muted-foreground">pontos</small>
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
