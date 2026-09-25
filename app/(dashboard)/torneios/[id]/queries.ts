import { createClient } from "@/lib/supabase/server";
import { mapearParticipanteTorneio } from "@/types/participante-torneio";
import { mapearTorneio, type TorneioRow } from "@/types/torneio";

export async function buscarTorneio(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("torneios")
    .select(
      "id, grupo_id, nome, descricao, formato, status, pontos_para_vencer, pontos_spin_finish, pontos_over_finish, pontos_burst_finish, pontos_extreme_finish, criado_por, iniciado_em, finalizado_em, criado_em, atualizado_em",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapearTorneio(data as TorneioRow);
}

export async function listarParticipantesDoTorneio(idTorneio: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("participantes_torneios")
    .select(
      "id, torneio_id, usuario_id, cabeca_de_chave, colocacao_final, criado_em, perfil:perfis_usuarios(nome, apelido)",
    )
    .eq("torneio_id", idTorneio)
    .order("cabeca_de_chave", { ascending: true, nullsFirst: false })
    .order("criado_em", { ascending: true });

  if (error) {
    return {
      data: [],
      error: "Não foi possível carregar os participantes.",
    };
  }

  return {
    data: (data ?? []).map((row) => ({
      ...mapearParticipanteTorneio(row),
      perfil: Array.isArray(row.perfil) ? row.perfil[0] : row.perfil,
    })),
    error: null,
  };
}

export async function listarMembrosDisponiveis(
  idGrupo: string,
  idsInscritos: string[],
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("membros_grupos")
    .select("usuario_id, perfil:perfis_usuarios(nome, apelido)")
    .eq("grupo_id", idGrupo)
    .order("entrou_em", { ascending: true });

  if (error) {
    return {
      data: [],
      error: "Não foi possível carregar os membros do grupo.",
    };
  }

  const inscritos = new Set(idsInscritos);

  return {
    data: (data ?? []).map((membro) => ({
      usuarioId: membro.usuario_id,
      inscrito: inscritos.has(membro.usuario_id),
      perfil: Array.isArray(membro.perfil) ? membro.perfil[0] : membro.perfil,
    })),
    error: null,
  };
}
