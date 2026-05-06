import type { Metadata } from "next";
import Link from "next/link";

import { PublicLegalFooter } from "@/components/legal/public-legal-footer";
import { fallbackSchoolDisplayName, fetchSchoolSettings } from "@/lib/school-settings";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Política de privacidade — Films Dutra",
  description:
    "Informações sobre tratamento de dados pessoais em conformidade com a LGPD (Lei nº 13.709/2018).",
};

export default async function PrivacidadePage() {
  const supabase = createServerSupabaseClient();
  const branding = await fetchSchoolSettings(supabase);
  const schoolName = fallbackSchoolDisplayName(branding);
  const contactEmail = branding?.contact_email?.trim();

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <article className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.22px] text-muted-foreground">
          {schoolName}
        </p>
        <h1 className="mt-2 text-3xl font-normal tracking-tight">Política de privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: maio de 2026. Este texto é um modelo operacional para o MVP; o responsável
          pela escola deve revisar com assessoria jurídica antes da produção.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section aria-labelledby="priv-1">
            <h2 id="priv-1" className="text-base font-medium text-foreground">
              1. Quem somos
            </h2>
            <p className="mt-2">
              Esta plataforma é operada por <strong className="font-medium text-foreground">{schoolName}</strong>
              {contactEmail ? (
                <>
                  . Para questões sobre dados pessoais, entre em contato em{" "}
                  <a className="text-primary underline-offset-4 hover:underline" href={`mailto:${contactEmail}`}>
                    {contactEmail}
                  </a>
                  .
                </>
              ) : (
                <> — utilize os canais informados pela escola para contato sobre proteção de dados.</>
              )}
            </p>
          </section>

          <section aria-labelledby="priv-2">
            <h2 id="priv-2" className="text-base font-medium text-foreground">
              2. Dados que tratamos
            </h2>
            <p className="mt-2">
              Podemos tratar identificação e contato (nome, e-mail, telefone, endereço quando informado),
              dados relacionados às aulas e evolução no esporte, informações de saúde ou equipamento quando
              você os informar voluntariamente no cadastro, dados de agenda e inscrições em atividades
              (como surf trips), e registros técnicos necessários à segurança da conta (logs mínimos do
              provedor de hospedagem e autenticação).
            </p>
          </section>

          <section aria-labelledby="priv-3">
            <h2 id="priv-3" className="text-base font-medium text-foreground">
              3. Finalidades e bases legais (LGPD)
            </h2>
            <p className="mt-2">
              Tratamos dados para execução do contrato ou procedimentos preliminares (gestão de alunos,
              agenda, comunicações operacionais), cumprimento de obrigação legal ou regulatória quando
              aplicável, legítimo interesse quando compatível com seus direitos (melhorias de segurança e
              prevenção a fraudes, sempre em conformidade com a LGPD), e consentimento quando exigido —
              incluindo o aceite no formulário de cadastro (onboarding), quando aplicável.
            </p>
          </section>

          <section aria-labelledby="priv-4">
            <h2 id="priv-4" className="text-base font-medium text-foreground">
              4. Compartilhamento
            </h2>
            <p className="mt-2">
              Utilizamos prestadores de infraestrutura em nuvem (por exemplo, hospedagem da aplicação e
              serviço de banco/autenticação) sob contratos que impõem obrigações de confidencialidade e
              segurança. Não vendemos seus dados pessoais.
            </p>
          </section>

          <section aria-labelledby="priv-5">
            <h2 id="priv-5" className="text-base font-medium text-foreground">
              5. Seus direitos
            </h2>
            <p className="mt-2">
              Nos termos da LGPD, você pode solicitar confirmação de tratamento, acesso, correção,
              anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade quando aplicável,
              informação sobre compartilhamentos e revisão de decisões automatizadas. Para exercer seus
              direitos, use o contato da escola indicado acima ou, quando disponível na plataforma, os fluxos
              de atualização de dados.
            </p>
          </section>

          <section aria-labelledby="priv-6">
            <h2 id="priv-6" className="text-base font-medium text-foreground">
              6. Retenção e segurança
            </h2>
            <p className="mt-2">
              Mantemos dados pelo tempo necessário para as finalidades descritas e para cumprimento legal.
              Adotamos medidas técnicas e administrativas razoáveis de proteção; nenhum sistema é
              totalmente isento de risco.
            </p>
          </section>

          <section aria-labelledby="priv-7">
            <h2 id="priv-7" className="text-base font-medium text-foreground">
              7. Cookies e tecnologias similares
            </h2>
            <p className="mt-2">
              A autenticação pode usar cookies ou armazenamento de sessão estritamente necessários ao
              funcionamento seguro do painel. Não utilizamos cookies de publicidade comportamental neste MVP.
            </p>
          </section>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 border-t border-border pt-8">
          <Link className="text-sm text-primary underline-offset-4 hover:underline" href="/login">
            Voltar ao login
          </Link>
          <PublicLegalFooter />
        </div>
      </article>
    </main>
  );
}
