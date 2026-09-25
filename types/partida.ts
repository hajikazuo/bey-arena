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

export interface PartidaTorneioRow {
  id: string;
  torneio_id: string;
  chave: TipoChave;
  rodada: number;
  posicao: number;
  jogador1_id: string | null;
  jogador2_id: string | null;
  pontos_jogador1: number;
  pontos_jogador2: number;
  vencedor_id: string | null;
  perdedor_id: string | null;
  proxima_partida_vencedor_id: string | null;
  slot_vencedor: 1 | 2 | null;
  proxima_partida_perdedor_id: string | null;
  slot_perdedor: 1 | 2 | null;
  status: StatusPartida;
  iniciada_em: string | null;
  finalizada_em: string | null;
  criada_em: string;
}

export function mapearPartidaTorneio(row: PartidaTorneioRow): PartidaTorneio {
  return {
    id: row.id,
    torneioId: row.torneio_id,
    chave: row.chave,
    rodada: row.rodada,
    posicao: row.posicao,
    jogador1Id: row.jogador1_id ?? undefined,
    jogador2Id: row.jogador2_id ?? undefined,
    pontosJogador1: Number(row.pontos_jogador1),
    pontosJogador2: Number(row.pontos_jogador2),
    vencedorId: row.vencedor_id ?? undefined,
    perdedorId: row.perdedor_id ?? undefined,
    proximaPartidaVencedorId: row.proxima_partida_vencedor_id ?? undefined,
    slotVencedor: row.slot_vencedor ?? undefined,
    proximaPartidaPerdedorId: row.proxima_partida_perdedor_id ?? undefined,
    slotPerdedor: row.slot_perdedor ?? undefined,
    status: row.status,
    iniciadaEm: row.iniciada_em ?? undefined,
    finalizadaEm: row.finalizada_em ?? undefined,
    criadaEm: row.criada_em,
  };
}
