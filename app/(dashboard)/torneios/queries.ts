import { createClient } from "@/lib/supabase/server";
import { mapearTorneio, type Torneio, type TorneioRow } from "@/types/torneio";

export type TorneioComGrupo = Torneio & { grupoNome: string };

export async function listarTorneios(): Promise<{ data: TorneioComGrupo[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("torneios")
    .select("id, grupo_id, nome, descricao, formato, status, pontos_para_vencer, pontos_spin_finish, pontos_over_finish, pontos_burst_finish, pontos_extreme_finish, criado_por, iniciado_em, finalizado_em, criado_em, atualizado_em, grupos(nome)")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao carregar torneios:", error);
    return { data: [], error: "Não foi possível carregar os torneios. Tente novamente mais tarde." };
  }

  return {
    data: (data ?? []).map((row) => {
      const registro = row as unknown as TorneioRow & { grupos?: { nome: string }[] | { nome: string } | null };
      const grupo = Array.isArray(registro.grupos) ? registro.grupos[0] : registro.grupos;
      return { ...mapearTorneio(registro), grupoNome: grupo?.nome ?? "Grupo não encontrado" };
    }),
    error: null,
  };
}
