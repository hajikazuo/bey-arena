"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type CriarGrupoState = {
  error: string | null
  success: boolean;
};

type DadosGrupo = {
  nome: string;
  descricao: string | null;
};

function lerDadosGrupo(formData: FormData):
  | { dados: DadosGrupo; error: null }
  | { dados: null; error: string } {
  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();

  if (!nome || nome.length > 120) {
    return { dados: null, error: "Informe um nome entre 1 e 120 caracteres." };
  }

  return { dados: { nome, descricao: descricao || null }, error: null };
}

async function obterUsuario() {
  const supabase = await createClient();
  const { data: { user: usuario } } = await supabase.auth.getUser();
  return { supabase, usuario };
}

export async function criarGrupo(_previousState: CriarGrupoState, formData: FormData): Promise<CriarGrupoState> {
  const resultado = lerDadosGrupo(formData);
  if (!resultado.dados) return { error: resultado.error, success: false };

  const { dados } = resultado;
  const { supabase, usuario } = await obterUsuario();
  if (!usuario) return { error: "Sua sessão expirou. Entre novamente para criar um grupo.", success: false };

  const idGrupo = crypto.randomUUID();
  const { error: erroGrupo } = await supabase
    .from("grupos")
    .insert({ id: idGrupo, nome: dados.nome, descricao: dados.descricao, criado_por: usuario.id });

  if (erroGrupo) {
    console.error("Erro ao criar grupo:", erroGrupo);
    return { error: "Não foi possível criar o grupo.", success: false };
  }

  const { error: erroMembro } = await supabase.from("membros_grupos").insert({
    grupo_id: idGrupo,
    usuario_id: usuario.id,
    papel: "dono",
  });

  if (erroMembro) {
    console.error("Erro ao vincular dono ao grupo:", erroMembro);
    return { error: "O grupo foi criado, mas não foi possível vincular você como dono.", success: false };
  }

  revalidatePath("/grupos");
  return { error: null, success: true };
}

export async function editarGrupo(_previousState: CriarGrupoState, formData: FormData): Promise<CriarGrupoState> {
  const idGrupo = String(formData.get("id") ?? "").trim();
  const resultado = lerDadosGrupo(formData);
  if (!resultado.dados) return { error: resultado.error, success: false };
  if (!idGrupo) return { error: "Grupo inválido.", success: false };

  const { dados } = resultado;
  const { supabase, usuario } = await obterUsuario();
  if (!usuario) return { error: "Sua sessão expirou. Entre novamente para editar o grupo.", success: false };

  const { data, error } = await supabase
    .from("grupos")
    .update({ nome: dados.nome, descricao: dados.descricao, atualizado_em: new Date().toISOString() })
    .eq("id", idGrupo)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Erro ao editar grupo:", error);
    return { error: "Não foi possível editar o grupo. Verifique se você é administrador.", success: false };
  }

  if (!data) return { error: "Grupo não encontrado ou sem permissão para editá-lo.", success: false };

  revalidatePath("/grupos");
  return { error: null, success: true };
}

export async function excluirGrupo(idGrupo: string): Promise<CriarGrupoState> {
  const idGrupoLimpo = idGrupo.trim();
  if (!idGrupoLimpo) return { error: "Grupo inválido.", success: false };

  const { supabase, usuario } = await obterUsuario();
  if (!usuario) return { error: "Sua sessão expirou. Entre novamente para excluir o grupo.", success: false };

  const { data, error } = await supabase.from("grupos").delete().eq("id", idGrupoLimpo).select("id").maybeSingle();
  if (error) {
    console.error("Erro ao excluir grupo:", error);
    return { error: "Não foi possível excluir o grupo.", success: false };
  }

  if (!data) return { error: "Grupo não encontrado ou sem permissão para excluí-lo.", success: false };

  revalidatePath("/grupos");
  return { error: null, success: true };
}
