export type PapelUsuario =
  | "superadmin"
  | "admin"
  | "usuario";

export interface PerfilUsuario {
  id: string;
  nome: string;
  apelido?: string;
  papel: PapelUsuario;
  criadoEm: string;
  atualizadoEm: string;
}

export interface PerfilUsuarioRow {
  id: string;
  nome: string;
  apelido: string | null;
  papel: PapelUsuario;
  criado_em: string;
  atualizado_em: string;
}

export function mapearPerfilUsuario(row: PerfilUsuarioRow): PerfilUsuario {
  return {
    id: row.id,
    nome: row.nome,
    apelido: row.apelido ?? undefined,
    papel: row.papel,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}
