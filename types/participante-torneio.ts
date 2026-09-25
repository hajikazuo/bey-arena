export interface ParticipanteTorneio {
  id: string;

  torneioId: string;
  usuarioId: string;

  cabecaDeChave?: number;
  colocacaoFinal?: number;

  criadoEm: string;
}