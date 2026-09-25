import type { SupabaseClient } from "@supabase/supabase-js";

export interface PerfilInicial { id: string; nome: string; }
export async function criarPerfilInicial(supabase: SupabaseClient, perfil: PerfilInicial): Promise<void> {
  const { error } = await supabase.from("perfis_usuarios").insert(perfil);
  if (error && error.code !== "23505") throw new Error(`Não foi possível criar o perfil: ${error.message}`);
}
