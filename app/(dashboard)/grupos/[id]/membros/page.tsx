import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardBreadcrumb } from "@/components/app-breadcrumb";
import { MemberForm } from "@/components/grupos/member-form";
import { MemberDeleteButton } from "@/components/grupos/member-delete-button";
import { MemberRoleForm } from "@/components/grupos/member-role-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buscarGrupo } from "@/lib/infrastructure/supabase/grupoRepository";
import { listarMembrosGrupo } from "./queries";

export default async function MembrosGrupoPage({ params }: PageProps<"/grupos/[id]/membros">) {
  const { id } = await params;
  const grupo = await buscarGrupo(id);
  if (!grupo) notFound();
  const { data: membros, error } = await listarMembrosGrupo(id);
  return <div className="space-y-6"><div className="flex items-center justify-between"><div className="space-y-2"><DashboardBreadcrumb title="Membros" /><h1 className="text-2xl font-semibold">Membros de {grupo.nome}</h1></div><Button nativeButton={false} variant="outline" render={<Link href="/grupos" />}>Voltar</Button></div><MemberForm idGrupo={id} />{error ? <Card><CardContent className="py-8 text-center text-sm text-destructive">{error}</CardContent></Card> : <Card><CardHeader><CardTitle>Membros cadastrados</CardTitle></CardHeader><CardContent className="space-y-3">{membros.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum membro encontrado.</p> : membros.map((membro) => { const perfil = Array.isArray(membro.perfil) ? membro.perfil[0] : membro.perfil; return <div key={membro.id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div><p className="font-medium">{perfil?.apelido || perfil?.nome || membro.usuario_id}</p><p className="text-xs text-muted-foreground">{membro.usuario_id}</p></div><div className="flex items-center gap-3"><MemberRoleForm idMembro={membro.id} idGrupo={id} papel={membro.papel} />{membro.papel !== "dono" && <MemberDeleteButton idMembro={membro.id} idGrupo={id} />}</div></div>; })}</CardContent></Card>}</div>;
}
