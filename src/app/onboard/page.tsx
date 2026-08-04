import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrganization } from "@/lib/multi-tenancy";
import { OnboardForm } from "./onboard-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OnboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const current = await getCurrentOrganization();
  if (current) redirect("/app/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
          C
        </div>
        <span className="text-lg font-semibold tracking-tight">
          Clínica SaaS
        </span>
      </div>
      <div className="w-full max-w-md">
        <OnboardForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Entrar com outra conta
          </Link>
        </p>
      </div>
    </div>
  );
}