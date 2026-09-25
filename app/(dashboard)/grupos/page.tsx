import { DashboardBreadcrumb } from "@/components/app-breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listarGrupos } from "./queries";
import { GrupoDeleteButton } from "@/components/grupos/group-delete-button";
import { GroupForm } from "@/components/grupos/group-form";
import { UsersRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function GruposPage() {
  const { data: grupos, error } = await listarGrupos();
  const dateFormatter = new Intl.DateTimeFormat("pt-BR");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2"><DashboardBreadcrumb title="Grupos" /><div><h1 className="text-2xl font-semibold tracking-tight">Grupos</h1><p className="text-sm text-muted-foreground">Organize seus torneios e participantes.</p></div></div>
        <GroupForm />
      </div>

      {error ? (
        <Card><CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent></Card>
      ) : grupos.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Você ainda não participa de nenhum grupo.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {grupos.map((grupo) => (
            <Card key={grupo.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-1">
                  {grupo.nome}

                  <span className="text-xs text-muted-foreground">
                    Criado em: {dateFormatter.format(new Date(grupo.criadoEm))}
                  </span>
                </CardTitle>
                <CardDescription>
                  {grupo.descricao ?? "Sem descrição"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-end gap-3">
                <GroupForm grupo={{ id: grupo.id, nome: grupo.nome, descricao: grupo.descricao === "Sem descrição" ? null : grupo.descricao }} />
                <Button nativeButton={false} variant="ghost" size="icon" render={<Link href={`/grupos/${grupo.id}/membros`} />} aria-label="Membros" title="Membros">
                  <UsersRound />
                </Button>
                <GrupoDeleteButton grupoId={grupo.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
