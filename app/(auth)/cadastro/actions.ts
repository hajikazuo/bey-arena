"use server";

import { createClient } from "@/lib/supabase/server";
import { criarPerfilInicial } from "@/lib/infrastructure/supabase/perfilRepository";

export type SignupState = {
  error: string | null;
  success: string | null;
};

export async function signup(_previousState: SignupState, formData: FormData): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password !== confirmPassword) {
    return {
      error: "As senhas não coincidem.",
      success: null,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Erro ao criar conta:", error);

    return {
      error: "Não foi possível criar a conta. Verifique os dados informados.",
      success: null,
    };
  }

  // O perfil pertence ao domínio da aplicação, não à migration do banco.
  if (data.user && data.session) {
    try {
      await criarPerfilInicial(supabase, {
        id: data.user.id,
        nome: email.split("@")[0] || "Usuário",
      });
    } catch (perfilError) {
      console.error("Erro ao criar perfil:", perfilError);
      return {
        error: "A conta foi criada, mas não foi possível preparar seu perfil.",
        success: null,
      };
    }
  }

  return {
    error: null,
    success: "Conta criada! Agora você já pode entrar.",
  };
}
