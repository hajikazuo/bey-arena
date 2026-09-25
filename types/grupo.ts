export type PapelMembroGrupo =
  | "dono"
  | "admin"
  | "membro";

export interface Grupo {
  id: string;

  nome: string;
  descricao?: string;

  criadoPor: string;

  criadoEm: string;
  atualizadoEm: string;
}

export interface MembroGrupo {
  id: string;

  grupoId: string;
  usuarioId: string;

  papel: PapelMembroGrupo;

  entrouEm: string;
}