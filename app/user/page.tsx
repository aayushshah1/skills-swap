import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/ui/header";

export default async function Home() {
    const supabase = await createClient();

    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (error || !session?.user) {
        redirect("/login");
    }

    const token = session.access_token;

    const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
    );

    const role = payload.user_role || "unknown";
    const { email } = session.user;

    return (
        <>
            <Header />
            <div className="p-4">
                <h1>Hello, {email}</h1>
                <p>
                    Your role is: <strong>{role}</strong>
                </p>
            </div>
        </>
    );
}
