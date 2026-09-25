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