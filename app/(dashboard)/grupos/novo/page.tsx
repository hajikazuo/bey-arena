import { DashboardBreadcrumb } from "@/components/app-breadcrumb";
import { GroupForm } from "@/components/grupos/group-form";
import { criarGrupo } from "../actions";

export default function NovoGrupoPage() {
  return <div className="space-y-6">
    <DashboardBreadcrumb title="Novo grupo" />
    <GroupForm action={criarGrupo} title="Criar grupo" description="Crie um grupo para organizar seus torneios." submitLabel="Criar grupo" />
  </div>;
}
