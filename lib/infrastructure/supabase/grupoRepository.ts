import { createClient } from "@/lib/supabase/server";
import { Grupo, GrupoRow, mapearGrupo } from "@/types/grupo";

type ListarGruposResult = {
  data: Grupo[];
  error: string | null;
};

export async function listarGrupos(): Promise<ListarGruposResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grupos")
    .select("id, nome, descricao, criado_por, criado_em, atualizado_em")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao carregar grupos:", error);
    return { data: [], error: "Não foi possível carregar os grupos. Tente novamente mais tarde." };
  }

  return { data: (data ?? []).map((row) => mapearGrupo(row as GrupoRow)), error: null };
}

export async function buscarGrupo(id: string): Promise<Grupo | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grupos")
    .select("id, nome, descricao, criado_por, criado_em, atualizado_em")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapearGrupo(data as GrupoRow);
}
