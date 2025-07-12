"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup } from "@/app/actions";
import { useEffect, useState, useActionState } from "react";
import { toast } from "sonner";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const [isSignup, setIsSignup] = useState(false);

    const authReducer = async (
        state: { error: string } | null,
        formData: FormData
    ) => {
        if (isSignup) {
            return await signup(formData);
        } else {
            return await login(formData);
        }
    };

    const [state, formAction] = useActionState(authReducer, null);

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

    const handleSubmit = (action: "login" | "signup") => {
        setIsSignup(action === "signup");
    };

    return (
        <form
            action={formAction}
            className={cn("flex flex-col gap-6", className)}
            {...props}
        >
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">
                    {isSignup ? "Create your account" : "Login to your account"}
                </h1>
            </div>
            <div className="grid gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                    />
                </div>
                <div className="grid gap-3">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        {!isSignup && (
                            <a
                                href="#"
                                className="ml-auto text-sm underline-offset-4 hover:underline"
                            >
                                Forgot your password?
                            </a>
                        )}
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Button
                        type="submit"
                        className="w-full"
                        onClick={() => handleSubmit("login")}
                    >
                        Login
                    </Button>
                    <Button
                        type="submit"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleSubmit("signup")}
                    >
                        Sign Up
                    </Button>
                </div>
            </div>
        </form>
    );
}
