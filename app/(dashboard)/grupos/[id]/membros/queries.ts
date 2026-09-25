import { createClient } from "@/lib/supabase/server";

export async function listarMembrosGrupo(idGrupo: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("membros_grupos").select("id, usuario_id, papel, entrou_em, perfil:perfis_usuarios(nome, apelido)").eq("grupo_id", idGrupo).order("entrou_em", { ascending: true });
  if (error) return { data: [], papelAtual: null, error: "Não foi possível carregar os membros." };
  const membroAtual = user ? (data ?? []).find((membro) => membro.usuario_id === user.id) : undefined;
  return { data: data ?? [], papelAtual: membroAtual?.papel ?? null, error: null };
}
