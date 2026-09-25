import { redirect } from "next/navigation";

import { DashboardBreadcrumb } from "@/components/app-breadcrumb";
import { ProfileForm } from "@/components/perfil/profile-form";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis_usuarios")
    .select("nome, apelido")
    .eq("id", user.id)
    .maybeSingle();

  const nome = perfil?.nome ?? user.user_metadata?.nome ?? user.email?.split("@")[0] ?? "Usuário";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <DashboardBreadcrumb title="Perfil" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Editar perfil</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus dados pessoais e sua senha.</p>
        </div>
      </div>
      <ProfileForm idUsuario={user.id} email={user.email ?? ""} nome={nome} apelido={perfil?.apelido ?? ""} />
    </div>
  );
}
