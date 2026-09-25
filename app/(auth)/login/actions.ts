"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { criarPerfilInicial } from "@/lib/infrastructure/supabase/perfilRepository";

export type LoginState = {
  error: string | null;
};

export async function login(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Erro ao fazer login:", error);

    return {
      error: "Não foi possível entrar. Verifique seu e-mail e sua senha.",
    };
  }

  if (data.user) {
    await criarPerfilInicial(supabase, {
      id: data.user.id,
      nome: data.user.user_metadata?.nome || email.split("@")[0] || "Usuário",
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
