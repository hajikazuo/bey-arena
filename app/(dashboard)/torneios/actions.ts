"use server";

import { revalidatePath } from "next/cache";

import {
  EliminacaoDupla,
  EliminacaoSimples,
  validarRegrasTorneio,
} from "@/lib/domain/torneio";
import { createClient } from "@/lib/supabase/server";
import type { FormatoTorneio, RegrasTorneio } from "@/types/torneio";

export type CriarTorneioState = {
  error: string | null;
  success: boolean;
};

async function obterUsuario() {
  const supabase = await createClient();
  const {
    data: { user: usuario },
  } = await supabase.auth.getUser();

  return { supabase, usuario };
}

function lerInteiro(formData: FormData, campo: string): number | null {
  const valor = Number(formData.get(campo));
  return Number.isInteger(valor) ? valor : null;
}

function lerDadosTorneio(formData: FormData):
  | { dados: { grupoId: string; nome: string; descricao: string | null; formato: FormatoTorneio; regras: RegrasTorneio }; error: null }
  | { dados: null; error: string } {
  const grupoId = String(formData.get("grupoId") ?? "").trim();
  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const formato = String(formData.get("formato") ?? "");

  if (!grupoId) return { dados: null, error: "Selecione um grupo para o torneio." };
  if (!nome || nome.length > 160) return { dados: null, error: "Informe um nome entre 1 e 160 caracteres." };
  if (formato !== "eliminacao_simples" && formato !== "eliminacao_dupla") {
    return { dados: null, error: "Selecione um formato de torneio válido." };
  }

  const regras: RegrasTorneio = {
    pontosParaVencer: lerInteiro(formData, "pontosParaVencer") ?? 0,
    pontosSpinFinish: lerInteiro(formData, "pontosSpinFinish") ?? -1,
    pontosOverFinish: lerInteiro(formData, "pontosOverFinish") ?? -1,
    pontosBurstFinish: lerInteiro(formData, "pontosBurstFinish") ?? -1,
    pontosExtremeFinish: lerInteiro(formData, "pontosExtremeFinish") ?? -1,
  };

  try {
    validarRegrasTorneio(regras);
  } catch (error) {
    return { dados: null, error: error instanceof Error ? error.message : "As regras do torneio são inválidas." };
  }

  return { dados: { grupoId, nome, descricao: descricao || null, formato, regras }, error: null };
}

export async function criarTorneio(_previousState: CriarTorneioState, formData: FormData): Promise<CriarTorneioState> {
  const resultado = lerDadosTorneio(formData);
  if (!resultado.dados) return { error: resultado.error, success: false };

  const { dados } = resultado;
  const supabase = await createClient();
  const { data: { user: usuario } } = await supabase.auth.getUser();
  if (!usuario) return { error: "Sua sessão expirou. Entre novamente para criar um torneio.", success: false };

  const { error } = await supabase.from("torneios").insert({
    grupo_id: dados.grupoId,
    nome: dados.nome,
    descricao: dados.descricao,
    formato: dados.formato,
    status: "rascunho",
    pontos_para_vencer: dados.regras.pontosParaVencer,
    pontos_spin_finish: dados.regras.pontosSpinFinish,
    pontos_over_finish: dados.regras.pontosOverFinish,
    pontos_burst_finish: dados.regras.pontosBurstFinish,
    pontos_extreme_finish: dados.regras.pontosExtremeFinish,
    criado_por: usuario.id,
  });

  if (error) {
    console.error("Erro ao criar torneio:", error);
    return { error: "Não foi possível criar o torneio. Verifique se você participa do grupo selecionado.", success: false };
  }

  revalidatePath("/torneios");
  return { error: null, success: true };
}

export async function adicionarParticipantes(
  _previousState: CriarTorneioState,
  formData: FormData,
): Promise<CriarTorneioState> {
  const torneioId = String(formData.get("torneioId") ?? "").trim();
  const usuarioIds = formData
    .getAll("usuarioId")
    .map((valor) => String(valor).trim())
    .filter(Boolean);

  if (!torneioId) {
    return { error: "Torneio inválido.", success: false };
  }

  if (usuarioIds.length === 0) {
    return { error: "Selecione pelo menos um participante.", success: false };
  }

  const { supabase, usuario } = await obterUsuario();

  if (!usuario) {
    return {
      error: "Sua sessão expirou. Entre novamente para adicionar participantes.",
      success: false,
    };
  }

  const { data: torneio, error: erroTorneio } = await supabase
    .from("torneios")
    .select("id, grupo_id, criado_por, status")
    .eq("id", torneioId)
    .maybeSingle();

  if (erroTorneio || !torneio) {
    return { error: "Torneio não encontrado.", success: false };
  }

  if (torneio.criado_por !== usuario.id) {
    return {
      error: "Somente o dono do torneio pode adicionar participantes.",
      success: false,
    };
  }

  if (torneio.status !== "rascunho" && torneio.status !== "inscricoes") {
    return {
      error: "Não é possível adicionar participantes neste status do torneio.",
      success: false,
    };
  }

  const { data: membros, error: erroMembros } = await supabase
    .from("membros_grupos")
    .select("usuario_id")
    .eq("grupo_id", torneio.grupo_id)
    .in("usuario_id", usuarioIds);

  if (erroMembros) {
    return { error: "Não foi possível validar os membros selecionados.", success: false };
  }

  const membrosValidos = new Set(
    (membros ?? []).map((membro: { usuario_id: string }) => membro.usuario_id),
  );
  const usuarioForaDoGrupo = usuarioIds.some((usuarioId) => !membrosValidos.has(usuarioId));

  if (usuarioForaDoGrupo) {
    return {
      error: "Todos os participantes precisam ser membros do grupo do torneio.",
      success: false,
    };
  }

  const participantes = usuarioIds.map((usuarioId) => {
    const valorSeed = String(formData.get(`cabecaDeChave_${usuarioId}`) ?? "").trim();
    const cabecaDeChave = valorSeed ? Number(valorSeed) : null;

    return {
      torneio_id: torneioId,
      usuario_id: usuarioId,
      cabeca_de_chave: cabecaDeChave,
    };
  });

  const possuiSeedInvalida = participantes.some(
    (participante) =>
      participante.cabeca_de_chave !== null &&
      (!Number.isInteger(participante.cabeca_de_chave) || participante.cabeca_de_chave <= 0),
  );

  if (possuiSeedInvalida) {
    return {
      error: "As cabeças de chave devem ser números inteiros maiores que zero.",
      success: false,
    };
  }

  const seeds = participantes
    .map((participante) => participante.cabeca_de_chave)
    .filter((seed): seed is number => seed !== null);

  if (new Set(seeds).size !== seeds.length) {
    return { error: "Não é possível repetir uma cabeça de chave.", success: false };
  }

  const { error } = await supabase.from("participantes_torneios").insert(participantes);

  if (error) {
    console.error("Erro ao adicionar participantes:", error);

    return {
      error:
        error.code === "23505"
          ? "Um dos participantes selecionados já está inscrito no torneio."
          : "Não foi possível adicionar os participantes.",
      success: false,
    };
  }

  if (torneio.status === "rascunho") {
    const { error: erroStatus } = await supabase
      .from("torneios")
      .update({
        status: "inscricoes",
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", torneioId)
      .eq("status", "rascunho");

    if (erroStatus) {
      console.error("Erro ao atualizar status do torneio:", erroStatus);

      return {
        error:
          "Os participantes foram adicionados, mas não foi possível atualizar o status do torneio.",
        success: false,
      };
    }
  }

  revalidatePath(`/torneios/${torneioId}`);
  revalidatePath("/torneios");

  return { error: null, success: true };
}

export async function iniciarTorneio(
  _previousState: CriarTorneioState,
  formData: FormData,
): Promise<CriarTorneioState> {
  const torneioId = String(formData.get("torneioId") ?? "").trim();

  if (!torneioId) {
    return { error: "Torneio inválido.", success: false };
  }

  const { supabase, usuario } = await obterUsuario();

  if (!usuario) {
    return {
      error: "Sua sessão expirou. Entre novamente para iniciar o torneio.",
      success: false,
    };
  }

  const { data: torneio, error: erroTorneio } = await supabase
    .from("torneios")
    .select("id, formato, criado_por, status")
    .eq("id", torneioId)
    .maybeSingle();

  if (erroTorneio || !torneio) {
    return { error: "Torneio não encontrado.", success: false };
  }

  if (torneio.criado_por !== usuario.id) {
    return {
      error: "Somente o dono do torneio pode iniciá-lo.",
      success: false,
    };
  }

  if (torneio.status !== "rascunho" && torneio.status !== "inscricoes") {
    return {
      error: "Este torneio não pode ser iniciado no status atual.",
      success: false,
    };
  }

  const { data: participantes, error: erroParticipantes } = await supabase
    .from("participantes_torneios")
    .select("id, cabeca_de_chave")
    .eq("torneio_id", torneioId)
    .order("criado_em", { ascending: true });

  if (erroParticipantes) {
    return {
      error: "Não foi possível carregar os participantes do torneio.",
      success: false,
    };
  }

  if ((participantes ?? []).length < 2) {
    return {
      error: "Adicione pelo menos dois participantes antes de iniciar o torneio.",
      success: false,
    };
  }

  const { data: partidasExistentes, error: erroPartidas } = await supabase
    .from("partidas_torneios")
    .select("id")
    .eq("torneio_id", torneioId)
    .limit(1);

  if (erroPartidas) {
    return {
      error: "Não foi possível verificar o chaveamento existente.",
      success: false,
    };
  }

  if ((partidasExistentes ?? []).length > 0) {
    return {
      error: "O chaveamento deste torneio já foi gerado.",
      success: false,
    };
  }

  const participantesParaChaveamento = (participantes ?? []).map((participante) => ({
    id: participante.id,
    cabecaDeChave: participante.cabeca_de_chave ?? undefined,
  }));

  let chaveamento;

  try {
    const gerador =
      torneio.formato === "eliminacao_simples"
        ? new EliminacaoSimples()
        : new EliminacaoDupla();

    chaveamento = gerador.gerar(participantesParaChaveamento);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o chaveamento.",
      success: false,
    };
  }

  const partidas = chaveamento.partidas.map((partida) => ({
    id: crypto.randomUUID(),
    torneio_id: torneioId,
    chave: partida.chave,
    rodada: partida.rodada,
    posicao: partida.posicao,
    jogador1_id: partida.jogador1Id ?? null,
    jogador2_id: partida.jogador2Id ?? null,
    status: partida.status,
  }));

  const { error: erroInsercao } = await supabase
    .from("partidas_torneios")
    .insert(partidas);

  if (erroInsercao) {
    console.error("Erro ao gerar partidas do torneio:", erroInsercao);

    return {
      error: "Não foi possível salvar o chaveamento do torneio.",
      success: false,
    };
  }

  const { error: erroStatus } = await supabase
    .from("torneios")
    .update({
      status: "em_andamento",
      iniciado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", torneioId)
    .eq("status", torneio.status);

  if (erroStatus) {
    console.error("Erro ao atualizar status do torneio:", erroStatus);

    return {
      error:
        "O chaveamento foi criado, mas não foi possível atualizar o status do torneio.",
      success: false,
    };
  }

  revalidatePath(`/torneios/${torneioId}`);
  revalidatePath("/torneios");

  return { error: null, success: true };
}
