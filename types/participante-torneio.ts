export interface ParticipanteTorneio {
  id: string;

  torneioId: string;
  usuarioId: string;

  cabecaDeChave?: number;
  colocacaoFinal?: number;

  criadoEm: string;
}

export interface ParticipanteTorneioRow {
  id: string;
  torneio_id: string;
  usuario_id: string;
  cabeca_de_chave: number | null;
  colocacao_final: number | null;
  criado_em: string;
}

export function mapearParticipanteTorneio(row: ParticipanteTorneioRow): ParticipanteTorneio {
  return {
    id: row.id,
    torneioId: row.torneio_id,
    usuarioId: row.usuario_id,
    cabecaDeChave: row.cabeca_de_chave ?? undefined,
    colocacaoFinal: row.colocacao_final ?? undefined,
    criadoEm: row.criado_em,
  };
}
