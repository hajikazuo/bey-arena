export type FormatoTorneio =
  | "eliminacao_simples"
  | "eliminacao_dupla";

export type StatusTorneio =
  | "rascunho"
  | "inscricoes"
  | "em_andamento"
  | "finalizado"
  | "cancelado";

export interface RegrasTorneio {
  pontosParaVencer: number;

  pontosSpinFinish: number;
  pontosOverFinish: number;
  pontosBurstFinish: number;
  pontosExtremeFinish: number;
}

export const REGRAS_BEYBLADE_X_PADRAO: RegrasTorneio = {
  pontosParaVencer: 4,

  pontosSpinFinish: 1,
  pontosOverFinish: 2,
  pontosBurstFinish: 2,
  pontosExtremeFinish: 3,
};

export interface Torneio {
  id: string;

  grupoId: string;

  nome: string;
  descricao?: string;

  formato: FormatoTorneio;
  status: StatusTorneio;

  regras: RegrasTorneio;

  criadoPor: string;

  iniciadoEm?: string;
  finalizadoEm?: string;

  criadoEm: string;
  atualizadoEm: string;
}