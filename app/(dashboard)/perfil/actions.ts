"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PerfilState = {
  error: string | null;
  success: string | null;
  toastKey?: number | null;
};

export async function editarPerfil(_previousState: PerfilState, formData: FormData): Promise<PerfilState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const apelido = String(formData.get("apelido") ?? "").trim();

  if (nome.length < 1 || nome.length > 120) return { error: "Informe um nome entre 1 e 120 caracteres.", success: null, toastKey: Date.now() };
  if (apelido.length > 60) return { error: "O apelido deve ter no máximo 60 caracteres.", success: null, toastKey: Date.now() };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sua sessão expirou. Entre novamente para editar o perfil.", success: null, toastKey: Date.now() };

  const { error } = await supabase.from("perfis_usuarios").upsert(
    { id: user.id, nome, apelido: apelido || null, atualizado_em: new Date().toISOString() },
    { onConflict: "id" },
  );
  if (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { error: "Não foi possível atualizar seus dados de perfil.", success: null, toastKey: Date.now() };
  }

  const { error: metadataError } = await supabase.auth.updateUser({ data: { nome } });
  if (metadataError) {
    console.error("Erro ao atualizar dados da conta:", metadataError);
    return { error: "O perfil foi salvo, mas não foi possível atualizar os dados da conta.", success: null, toastKey: Date.now() };
  }

  revalidatePath("/perfil");
  revalidatePath("/dashboard");
  return { error: null, success: "Perfil atualizado com sucesso.", toastKey: Date.now() };
}

export async function editarSenha(_previousState: PerfilState, formData: FormData): Promise<PerfilState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 6) return { error: "A nova senha deve ter pelo menos 6 caracteres.", success: null, toastKey: Date.now() };
  if (password !== confirmPassword) return { error: "As senhas não coincidem.", success: null, toastKey: Date.now() };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sua sessão expirou. Entre novamente para editar a senha.", success: null, toastKey: Date.now() };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("Erro ao atualizar senha:", error);
    return { error: "Não foi possível atualizar sua senha.", success: null, toastKey: Date.now() };
  }

  return { error: null, success: "Senha atualizada com sucesso.", toastKey: Date.now() };
}
