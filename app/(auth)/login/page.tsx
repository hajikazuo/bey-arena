"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { PasswordField } from "@/components/password-field";
import { GlobalToast } from "@/components/ui/global-toast";
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, type LoginState } from "./actions";

const initialState: LoginState = {
    error: null,
};

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, initialState);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <GlobalToast message={state.error} type="error" />
            <form action={formAction}>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        Insira seu e-mail abaixo para acessar sua conta.
                    </CardDescription>
                    <CardAction>
                        <Button variant="link">
                            <Link href="/cadastro">Criar uma conta</Link>
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
                    </div>

                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Entrando..." : "Login"}
                    </Button>
                </CardFooter>
            </Card>
            </form>
        </>
    );
}
