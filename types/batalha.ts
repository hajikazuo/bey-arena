export type TipoFinalizacao =
  | "spin"
  | "over"
  | "burst"
  | "extreme";

export interface BatalhaPartida {
  id: string;

  partidaId: string;

  sequencia: number;

  vencedorId: string;

  tipoFinalizacao: TipoFinalizacao;
  pontosConcedidos: number;

  criadaEm: string;
}

export interface BatalhaPartidaRow {
  id: string;
  partida_id: string;
  sequencia: number;
  vencedor_id: string;
  tipo_finalizacao: TipoFinalizacao;
  pontos_concedidos: number;
  criada_em: string;
}

export function mapearBatalhaPartida(row: BatalhaPartidaRow): BatalhaPartida {
  return {
    id: row.id,
    partidaId: row.partida_id,
    sequencia: row.sequencia,
    vencedorId: row.vencedor_id,
    tipoFinalizacao: row.tipo_finalizacao,
    pontosConcedidos: Number(row.pontos_concedidos),
    criadaEm: row.criada_em,
  };
}
