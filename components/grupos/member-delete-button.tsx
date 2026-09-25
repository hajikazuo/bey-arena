"use client";
import { useTransition } from "react";
import { removerMembro } from "@/app/(dashboard)/grupos/[id]/membros/actions";
import { Button } from "@/components/ui/button";
export function MemberDeleteButton({ idMembro, idGrupo }: { idMembro: string; idGrupo: string }) { const [isPending, startTransition] = useTransition(); return <Button type="button" variant="destructive" size="sm" disabled={isPending} onClick={() => { if (window.confirm("Deseja remover este membro?")) startTransition(() => { void removerMembro(idMembro, idGrupo); }); }}>{isPending ? "Removendo..." : "Remover"}</Button>; }
