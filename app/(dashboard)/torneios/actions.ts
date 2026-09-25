"use server";

import { revalidatePath } from "next/cache";

import { validarRegrasTorneio } from "@/lib/domain/torneio";
import { createClient } from "@/lib/supabase/server";
import type { FormatoTorneio, RegrasTorneio } from "@/types/torneio";

export type CriarTorneioState = {
  error: string | null;
  success: boolean;
};

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
