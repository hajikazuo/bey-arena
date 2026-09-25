"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PapelMembroGrupo } from "@/types/grupo";

export type MembroGrupoState = { error: string | null; success: boolean };
const papeis: PapelMembroGrupo[] = ["admin", "membro"];

async function obterUsuario() {
  const supabase = await createClient();
  const {
    data: { user: usuario },
  } = await supabase.auth.getUser();
  return { supabase, usuario };
}

function lerId(valor: FormDataEntryValue | null) {
  return String(valor ?? "").trim();
}

export async function adicionarMembro(
  _previousState: MembroGrupoState,
  formData: FormData
): Promise<MembroGrupoState> {
  const idGrupo = lerId(formData.get("grupoId"));
  const idUsuario = lerId(formData.get("usuarioId"));
  const papel = String(formData.get("papel") ?? "membro") as PapelMembroGrupo;

  if (!idGrupo || !idUsuario)
    return { error: "Informe o grupo e o usuário.", success: false };

  if (!papeis.includes(papel))
    return { error: "Selecione um papel válido.", success: false };

  const { supabase, usuario } = await obterUsuario();

  if (!usuario)
    return {
      error: "Sua sessão expirou. Faça login novamente.",
      success: false,
    };

  const { error } = await supabase
    .from("membros_grupos")
    .insert({ grupo_id: idGrupo, usuario_id: idUsuario, papel });

  if (error)
    return {
      error:
        error.code === "23505"
          ? "Este usuário já participa do grupo."
          : "Não foi possível adicionar o membro.",
      success: false,
    };

  revalidatePath(`/grupos/${idGrupo}/membros`);
  return { error: null, success: true };
}

export async function editarMembro(
  _previousState: MembroGrupoState,
  formData: FormData
): Promise<MembroGrupoState> {
  const idGrupo = lerId(formData.get("grupoId"));
  const idMembro = lerId(formData.get("membroId"));
  const papel = String(formData.get("papel") ?? "") as PapelMembroGrupo;
  if (!idGrupo || !idMembro || !papeis.includes(papel))
    return { error: "Dados do membro inválidos.", success: false };

  const { supabase, usuario } = await obterUsuario();

  if (!usuario)
    return {
      error: "Sua sessão expirou. Faça login novamente.",
      success: false,
    };

  const { data, error } = await supabase
    .from("membros_grupos")
    .update({ papel })
    .eq("id", idMembro)
    .eq("grupo_id", idGrupo)
    .select("id")
    .maybeSingle();

  if (error)
    return {
      error: "Não foi possível alterar o papel do membro.",
      success: false,
    };

  if (!data)
    return { error: "Membro não encontrado ou sem permissão.", success: false };
  revalidatePath(`/grupos/${idGrupo}/membros`);
  return { error: null, success: true };
}

export async function removerMembro(
  idMembro: string,
  idGrupo: string
): Promise<MembroGrupoState> {
  const id = idMembro.trim();
  if (!id || !idGrupo.trim())
    return { error: "Membro inválido.", success: false };

  const { supabase, usuario } = await obterUsuario();

  if (!usuario)
    return {
      error: "Sua sessão expirou. Faça login novamente.",
      success: false,
    };

  const { data, error } = await supabase
    .from("membros_grupos")
    .delete()
    .eq("id", id)
    .eq("grupo_id", idGrupo)
    .select("id")
    .maybeSingle();

  if (error)
    return { error: "Não foi possível remover o membro.", success: false };

  if (!data)
    return { error: "Membro não encontrado ou sem permissão.", success: false };

  revalidatePath(`/grupos/${idGrupo}/membros`);
  return { error: null, success: true };
}
