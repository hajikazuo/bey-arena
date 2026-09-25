"use client";

import { useActionState, useState } from "react";
import { editarPerfil, editarSenha, type PerfilState } from "@/app/(dashboard)/perfil/actions";
import { PasswordField } from "@/components/password-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalToast } from "@/components/ui/global-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: PerfilState = { error: null, success: null, toastKey: null };

export function ProfileForm({ email, nome, apelido }: { email: string; nome: string; apelido: string }) {
  const [profileState, profileAction, isProfilePending] = useActionState(editarPerfil, initialState);
  const [passwordState, passwordAction, isPasswordPending] = useActionState(editarSenha, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <GlobalToast message={profileState.error} type="error" toastKey={profileState.toastKey} />
      <GlobalToast message={profileState.success} type="success" toastKey={profileState.toastKey} />
      <GlobalToast message={passwordState.error} type="error" toastKey={passwordState.toastKey} />
      <GlobalToast message={passwordState.success} type="success" toastKey={passwordState.toastKey} />
      <div className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-6 md:grid-cols-2">
        <form action={profileAction}>
          <Card>
            <CardHeader><CardTitle>Dados do perfil</CardTitle><CardDescription>Atualize as informações que aparecem na sua conta.</CardDescription></CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2"><Label htmlFor="nome">Nome</Label><Input id="nome" name="nome" defaultValue={nome} maxLength={120} required /></div>
              <div className="grid gap-2"><Label htmlFor="apelido">Apelido</Label><Input id="apelido" name="apelido" defaultValue={apelido} maxLength={60} placeholder="Como você quer ser chamado?" /></div>
              <div className="grid gap-2"><Label htmlFor="email">E-mail</Label><Input id="email" value={email} disabled readOnly /><p className="text-xs text-muted-foreground">O e-mail não pode ser alterado por esta tela.</p></div>
            </CardContent>
            <CardFooter className="justify-end"><Button type="submit" disabled={isProfilePending}>{isProfilePending ? "Salvando..." : "Salvar perfil"}</Button></CardFooter>
          </Card>
        </form>
        <form action={passwordAction}>
          <Card>
            <CardHeader><CardTitle>Alterar senha</CardTitle><CardDescription>Atualize sua senha de acesso separadamente dos dados do perfil.</CardDescription></CardHeader>
            <CardContent className="grid gap-5">
              <PasswordField id="password" name="password" label="Nova senha" visible={showPassword} minLength={6} onToggle={() => setShowPassword((visible) => !visible)} />
              <PasswordField id="confirmPassword" name="confirmPassword" label="Confirmar nova senha" visible={showConfirmPassword} minLength={6} onToggle={() => setShowConfirmPassword((visible) => !visible)} />
            </CardContent>
            <CardFooter className="justify-end"><Button type="submit" disabled={isPasswordPending}>{isPasswordPending ? "Salvando..." : "Alterar senha"}</Button></CardFooter>
          </Card>
        </form>
      </div>
    </>
  );
}
