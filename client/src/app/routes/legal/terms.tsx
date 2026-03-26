import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { paths } from '@/config/paths';

export const TermsRoute = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          to={paths.home.getHref()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 26, 2026</p>

        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service ("Terms") govern your use of Get Granted, a web application operated by Thibault Herv&eacute; ("we", "us", "our"), an individual based in France. By creating an account or using the Service, you agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of the Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Get Granted is a <strong className="text-foreground">personal tracking tool</strong> that helps Working Holiday Visa (subclass 417) holders in Australia track their work days, hours, and progress toward visa eligibility requirements.
            </p>
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50 p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                Important Disclaimer
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Get Granted is an informational tracking tool only. It does <strong>not</strong> provide legal, tax, immigration, or professional advice. Visa rules and eligibility criteria may change at any time. Always verify your visa requirements directly with the <strong>Australian Department of Home Affairs</strong> (homeaffairs.gov.au) or a registered migration agent.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is available to anyone aged 18 or older. By using the Service, you confirm that you are at least 18 years old.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">You are responsible for:</p>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li>Providing accurate information when creating your account</li>
              <li>Keeping your login credentials secure and confidential</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us at contact@getgranted.com if you suspect unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">You agree <strong className="text-foreground">not</strong> to:</p>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to access other users' data or accounts</li>
              <li>Reverse-engineer, decompile, or disassemble the Service</li>
              <li>Use automated scripts, bots, or scrapers</li>
              <li>Interfere with or disrupt the Service's infrastructure</li>
              <li>Upload malicious code or attempt to exploit vulnerabilities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service, including its design, code, features, and content, is the intellectual property of Thibault Herv&eacute;. All rights reserved.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              You retain full ownership of the data you enter into the Service. We claim no ownership over your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided on an "as-is" and "as-available" basis. We do not guarantee uninterrupted or error-free availability. We may modify or discontinue the Service at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Pricing</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is currently <strong className="text-foreground">free of charge</strong>. If we introduce paid features in the future, we will notify you in advance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Account Deletion</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may delete your account at any time. Upon deletion, all your personal data will be permanently and irreversibly deleted, including your account, visa data, employer data, and work entries.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by applicable law, the Service is provided without warranty of any kind. We shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of the Service. We are not responsible for any immigration decisions, visa applications, or legal consequences based on information provided by the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by the laws of France. Any dispute shall be subject to the exclusive jurisdiction of the courts of France, except where mandatory consumer protection laws of your country of residence provide otherwise.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              EU consumers may also use the European Online Dispute Resolution platform at{' '}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                ec.europa.eu/consumers/odr
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Changes to These Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. Significant changes will be notified via email or through the Service. Continued use after changes take effect constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any questions: <strong className="text-foreground">contact@getgranted.com</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
