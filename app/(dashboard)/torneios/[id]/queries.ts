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

export async function listarPartidasDoTorneio(idTorneio: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("partidas_torneios")
    .select(
      "id, chave, rodada, posicao, jogador1_id, jogador2_id, vencedor_id, status, pontos_jogador1, pontos_jogador2",
    )
    .eq("torneio_id", idTorneio)
    .order("rodada", { ascending: true })
    .order("posicao", { ascending: true });

  if (error) {
    return {
      data: [],
      error: "Não foi possível carregar as partidas do torneio.",
    };
  }

  return {
    data: data ?? [],
    error: null,
  };
}

export async function listarBatalhasDoTorneio(idTorneio: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("batalhas_partidas")
    .select("id, partida_id, sequencia, vencedor_id, tipo_finalizacao, pontos_concedidos, partida:partidas_torneios!inner(torneio_id)")
    .eq("partida.torneio_id", idTorneio)
    .order("sequencia", { ascending: true });

  return {
    data: data ?? [],
    error: error ? "Não foi possível carregar as pontuações." : null,
  };
}
