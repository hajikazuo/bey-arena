import { Grupo, GrupoRow, mapearGrupo, type PapelMembroGrupo } from "@/types/grupo";
import { createClient } from "@/lib/supabase/server";

type ListarGruposResult = {
    data: (Grupo & { papel?: PapelMembroGrupo })[];
    error: string | null;
};

export async function listarGrupos(): Promise<ListarGruposResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from("grupos")
        .select("id, nome, descricao, criado_por, criado_em, atualizado_em")
        .order("criado_em", { ascending: false });


    if (error) {
        console.error("Erro ao carregar grupos:", error);

        return {
            data: [],
            error: "Não foi possível carregar os grupos. Tente novamente mais tarde.",
        };
    }

    const { data: membros } = user
        ? await supabase.from("membros_grupos").select("grupo_id, papel").eq("usuario_id", user.id)
        : { data: [] };
    const papeis = new Map((membros ?? []).map((membro) => [membro.grupo_id, membro.papel as PapelMembroGrupo]));

    return {
        data: (data ?? []).map((row) => ({ ...mapearGrupo(row as GrupoRow), papel: papeis.get(row.id) })),
        error: null,
    };
}
