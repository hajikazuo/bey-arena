"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { GlobalToast } from "@/components/ui/global-toast";
import { Button } from "@/components/ui/button"
import { PasswordField } from "@/components/password-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { signup, type SignupState } from "./actions";

const initialState: SignupState = {
  error: null,
  success: null,
};

export default function CadastroPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <GlobalToast message={state.error} type="error" />
      <GlobalToast message={state.success} type="success" />
      <form action={formAction}>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardAction>
            <Button variant="link">
              <Link href="/login">Já tenho uma conta</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@exemplo.com"
                required
              />
            </div>
            <PasswordField
              id="password"
              name="password"
              label="Senha"
              visible={showPassword}
              onToggle={() => setShowPassword((visible) => !visible)}
            />
            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirmar senha"
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((visible) => !visible)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </CardFooter>
      </Card>
      </form>
    </>
  );
}

