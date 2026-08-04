import Link from "next/link";
import { getCurrentUser } from "@/lib/multi-tenancy";
import {
  CalendarDays,
  ClipboardPlus,
  Users,
  Wallet,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Zap,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
            C
          </div>
          <span className="font-semibold tracking-tight">Clínica SaaS</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Criar conta</Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-16 md:pt-24">
        <section className="text-center">
          <Badge variant="secondary" className="mb-6">
            Multi-empresa · Multi-tenancy · Open Source
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            Gestão completa para clínicas{" "}
            <span className="bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
              e consultórios
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            Agenda, pacientes, prontuário eletrônico, financeiro e relatórios
            em uma única plataforma — rápida, segura e personalizável por
            clínica.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link href="/app/dashboard">
                <Button size="lg">
                  Ir para o painel <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg">
                  Começar grátis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </section>

        <section className="mt-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: CalendarDays,
              title: "Agenda inteligente",
              desc: "Visual diário, semanal e mensal, drag & drop, agenda por profissional, sala e especialidade.",
            },
            {
              icon: Users,
              title: "Pacientes",
              desc: "Cadastro completo, histórico, anexos, tags, busca instantânea e lista de espera.",
            },
            {
              icon: Wallet,
              title: "Financeiro",
              desc: "Fluxo de caixa, PIX, cartão, comissões, relatórios e dashboard financeiro.",
            },
            {
              icon: ClipboardPlus,
              title: "Prontuário",
              desc: "Anamnese, evolução, receitas, exames e documentos com histórico completo.",
            },
            {
              icon: BarChart3,
              title: "Relatórios",
              desc: "Pacientes, consultas, cancelamentos e no-show com exportação PDF e Excel.",
            },
            {
              icon: ShieldCheck,
              title: "Seguro por padrão",
              desc: "RBAC, rate limiting, auditoria, proteção XSS/CSRF e SQL injection.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border bg-card p-6 shadow-sm transition-colors hover:border-primary/40"
            >
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Performance",
              desc: "Server Components, streaming, cache e otimização de imagens.",
            },
            {
              icon: Palette,
              title: "Personalizável",
              desc: "Identidade visual, configurações e dados por clínica.",
            },
            {
              icon: ShieldCheck,
              title: "Pronto para produção",
              desc: "Docker, CI/CD, testes automatizados e documentação completa.",
            },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <f.icon className="mx-auto h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Clínica SaaS — Software livre para clínicas.</p>
      </footer>
    </div>
  );
}