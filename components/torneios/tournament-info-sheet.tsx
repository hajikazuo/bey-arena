"use client";

import { useState } from "react";
import { Medal, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { RankingItem } from "@/components/torneios/bracket";

type ParticipanteInfo = {
  id: string;
  nome: string;
  usuarioId: string;
  cabecaDeChave?: number;
};

export function TournamentInfoSheet({ participantes, ranking, exibirRanking }: { participantes: ParticipanteInfo[]; ranking: RankingItem[]; exibirRanking: boolean }) {
  const [aberto, setAberto] = useState(false);
  const [aba, setAba] = useState<"participantes" | "ranking">("participantes");

  function abrir(abaSelecionada: "participantes" | "ranking") {
    setAba(abaSelecionada);
    setAberto(true);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => abrir("participantes")}>
          <Users data-icon="inline-start" /> Participantes ({participantes.length})
        </Button>
        {exibirRanking && (
          <Button type="button" variant="outline" size="sm" onClick={() => abrir("ranking")}>
            <Medal data-icon="inline-start" /> Ranking
          </Button>
        )}
      </div>

      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader className="border-b pb-3">
            <SheetTitle>{aba === "participantes" ? "Participantes inscritos" : "Ranking do torneio"}</SheetTitle>
            <SheetDescription>
              {aba === "participantes" ? "Veja os jogadores e suas posições na chave." : "Classificação final por pontos conquistados nas partidas."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex gap-2 px-4">
            <Button type="button" variant={aba === "participantes" ? "secondary" : "ghost"} size="sm" onClick={() => setAba("participantes")}>
              <Users data-icon="inline-start" /> Participantes
            </Button>
            {exibirRanking && (
              <Button type="button" variant={aba === "ranking" ? "secondary" : "ghost"} size="sm" onClick={() => setAba("ranking")}>
                <Medal data-icon="inline-start" /> Ranking
              </Button>
            )}
          </div>

          <div className="px-4 pb-6">
            {aba === "participantes" ? (
              <div className="divide-y rounded-xl border">
                {participantes.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">Nenhum participante foi adicionado ainda.</p>
                ) : participantes.map((participante) => (
                  <div key={participante.id} className="flex items-center gap-3 p-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {participante.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{participante.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{participante.usuarioId}</p>
                    </div>
                    {participante.cabecaDeChave && <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">Seed {participante.cabecaDeChave}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y rounded-xl border">
                {ranking.map((item, index) => (
                  <div key={item.participanteId} className="flex items-center gap-3 p-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{item.nome}</span>
                    <span className="text-right"><strong className="block text-lg tabular-nums">{item.pontos}</strong><small className="text-xs text-muted-foreground">pontos</small></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
