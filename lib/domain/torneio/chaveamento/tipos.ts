import type { TipoChave, StatusPartida } from "@/types/partida";

export interface ParticipanteParaChaveamento { id: string; cabecaDeChave?: number; }
export interface PartidaGerada {
  chave: TipoChave; rodada: number; posicao: number;
  jogador1Id?: string; jogador2Id?: string;
  status: Extract<StatusPartida, "pendente" | "pronta" | "bye">;
}
export interface ChaveamentoGerado { tamanhoDaChave: number; partidas: PartidaGerada[]; }
export interface GeradorDeChaveamento { gerar(participantes: ParticipanteParaChaveamento[]): ChaveamentoGerado; }
