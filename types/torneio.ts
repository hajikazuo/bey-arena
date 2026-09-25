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

export interface TorneioRow {
  id: string;
  grupo_id: string;
  nome: string;
  descricao: string | null;
  formato: FormatoTorneio;
  status: StatusTorneio;
  pontos_para_vencer: number;
  pontos_spin_finish: number;
  pontos_over_finish: number;
  pontos_burst_finish: number;
  pontos_extreme_finish: number;
  criado_por: string;
  iniciado_em: string | null;
  finalizado_em: string | null;
  criado_em: string;
  atualizado_em: string;
}

export function mapearTorneio(row: TorneioRow): Torneio {
  return {
    id: row.id,
    grupoId: row.grupo_id,
    nome: row.nome,
    descricao: row.descricao ?? undefined,
    formato: row.formato,
    status: row.status,
    regras: {
      pontosParaVencer: Number(row.pontos_para_vencer),
      pontosSpinFinish: Number(row.pontos_spin_finish),
      pontosOverFinish: Number(row.pontos_over_finish),
      pontosBurstFinish: Number(row.pontos_burst_finish),
      pontosExtremeFinish: Number(row.pontos_extreme_finish),
    },
    criadoPor: row.criado_por,
    iniciadoEm: row.iniciado_em ?? undefined,
    finalizadoEm: row.finalizado_em ?? undefined,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}
