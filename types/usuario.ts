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