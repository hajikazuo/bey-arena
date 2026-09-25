export type PapelMembroGrupo = "dono" | "admin" | "membro";

export interface GrupoRow {
  id: string;
  nome: string;
  descricao: string | null;
  criado_por: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Grupo {
  id: string;
  nome: string;
  descricao: string;
  criadoPor: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface MembroGrupoRow {
  id: string;
  grupo_id: string;
  usuario_id: string;
  papel: PapelMembroGrupo;
  entrou_em: string;
}

export interface MembroGrupo {
  id: string;
  grupoId: string;
  usuarioId: string;
  papel: PapelMembroGrupo;
  entrouEm: string;
}

export function mapearGrupo(row: GrupoRow): Grupo {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao ?? "Sem descrição",
    criadoPor: row.criado_por,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

export function mapearMembroGrupo(row: MembroGrupoRow): MembroGrupo {
  return {
    id: row.id,
    grupoId: row.grupo_id,
    usuarioId: row.usuario_id,
    papel: row.papel,
    entrouEm: row.entrou_em,
  };
}
