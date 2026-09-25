export type TipoChave =
  | "vencedores"
  | "perdedores"
  | "grande_final";

export type StatusPartida =
  | "pendente"
  | "pronta"
  | "em_andamento"
  | "finalizada"
  | "bye";

export interface PartidaTorneio {
  id: string;

  torneioId: string;

  chave: TipoChave;

  rodada: number;
  posicao: number;

  jogador1Id?: string;
  jogador2Id?: string;

  pontosJogador1: number;
  pontosJogador2: number;

  vencedorId?: string;
  perdedorId?: string;

  proximaPartidaVencedorId?: string;
  slotVencedor?: 1 | 2;

  proximaPartidaPerdedorId?: string;
  slotPerdedor?: 1 | 2;

  status: StatusPartida;

  iniciadaEm?: string;
  finalizadaEm?: string;

  criadaEm: string;
}