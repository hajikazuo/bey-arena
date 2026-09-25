import { notFound } from "next/navigation";

import { DashboardBreadcrumb } from "@/components/app-breadcrumb";
import { GroupForm } from "@/components/grupos/group-form";
import { createClient } from "@/lib/supabase/server";
import { editarGrupo } from "../../actions";

export default async function EditarGrupoPage({ params }: PageProps<"/grupos/[id]/editar">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: grupo } = await supabase.from("grupos").select("id, nome, descricao").eq("id", id).maybeSingle();
  if (!grupo) notFound();

  return <div className="space-y-6">
    <DashboardBreadcrumb title="Editar grupo" />
    <GroupForm action={editarGrupo} id={grupo.id} nome={grupo.nome} descricao={grupo.descricao ?? ""} title="Editar grupo" description="Atualize os dados do grupo." submitLabel="Salvar alterações" />
  </div>;
}
