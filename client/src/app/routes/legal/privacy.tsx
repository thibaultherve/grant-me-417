import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { paths } from '@/config/paths';

export const PrivacyRoute = () => {
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

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 26, 2026</p>

        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              ReGranted ("we", "us", "our") is a free web application operated by Thibault Herv&eacute;, an individual based in France. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use our Service.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We are committed to protecting your privacy in compliance with the European General Data Protection Regulation (GDPR), the Australian Privacy Act 1988, and other applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Data Controller</h2>
            <ul className="text-muted-foreground space-y-1">
              <li><strong className="text-foreground">Name:</strong> Thibault Herv&eacute;</li>
              <li><strong className="text-foreground">Email:</strong> privacy@getgranted.com</li>
              <li><strong className="text-foreground">Location:</strong> France</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Data We Collect</h2>

            <h3 className="text-base font-medium mt-4 mb-2">3.1 Account Data</h3>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Email address</strong> — to identify your account and communicate with you</li>
              <li><strong className="text-foreground">Password</strong> — stored as a cryptographic hash (bcrypt); we never store or access your plain-text password</li>
              <li><strong className="text-foreground">First name and last name</strong> (optional) — for display purposes only</li>
            </ul>

            <h3 className="text-base font-medium mt-4 mb-2">3.2 Profile Data</h3>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Nationality</strong> (country code) — to determine WHV 417 visa eligibility rules</li>
              <li><strong className="text-foreground">UK citizen exemption status</strong> — to apply specific visa rules</li>
            </ul>

            <h3 className="text-base font-medium mt-4 mb-2">3.3 Visa Data</h3>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li>Visa type (1st, 2nd, or 3rd Working Holiday Visa)</li>
              <li>Arrival date in Australia</li>
              <li>Days required, days worked, and progress (calculated by the Service)</li>
            </ul>

            <h3 className="text-base font-medium mt-4 mb-2">3.4 Employer Data</h3>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li>Employer name</li>
              <li>Industry type (e.g., farming, mining, construction)</li>
              <li>Employer location (Australian suburb and postcode)</li>
              <li>Eligibility status for WHV 417 specified work</li>
            </ul>

            <h3 className="text-base font-medium mt-4 mb-2">3.5 Work Entry Data</h3>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li>Dates worked</li>
              <li>Hours worked per day</li>
              <li>Associated employer</li>
            </ul>

            <h3 className="text-base font-medium mt-4 mb-2">3.6 Technical Data</h3>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Authentication tokens</strong> — to keep you securely logged in (stored as hashed values)</li>
              <li><strong className="text-foreground">Server logs</strong> — IP address, browser type, and access timestamps (retained for security purposes)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. How We Use Your Data</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We use your data exclusively to:</p>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li>Provide and maintain the Service — <em>Performance of contract (Art. 6(1)(b))</em></li>
              <li>Calculate visa progress and eligibility — <em>Performance of contract (Art. 6(1)(b))</em></li>
              <li>Authenticate your account and ensure security — <em>Legitimate interest (Art. 6(1)(f))</em></li>
              <li>Send essential service communications — <em>Performance of contract (Art. 6(1)(b))</em></li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong className="text-foreground">We do NOT</strong> sell your data, use it for advertising, share it with third parties for their own purposes, or make automated decisions that affect you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We only share your data with <strong className="text-foreground">Railway</strong> (cloud hosting provider, Helsinki, Finland — EU) as strictly necessary to operate the Service. We do not share your data with any other third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Storage and Security</h2>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li>Data is stored on servers in Helsinki, Finland (European Union)</li>
              <li>All data is encrypted in transit (TLS/HTTPS) and at rest</li>
              <li>Passwords are stored using bcrypt hashing</li>
              <li>JWT-based authentication with short-lived access tokens (15 minutes) and refresh token rotation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li>Account, visa, employer, and work entry data — retained until you delete your account</li>
              <li>Authentication tokens — automatically expired (7 days for refresh tokens)</li>
              <li>Server logs — 90 days</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-2">
              When you delete your account, all your personal data is permanently deleted. This action is irreversible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
            <h3 className="text-base font-medium mt-4 mb-2">Under GDPR (EU/EEA residents)</h3>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li>Right of access — request a copy of your personal data</li>
              <li>Right to rectification — correct inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to data portability</li>
              <li>Right to restrict processing</li>
              <li>Right to object</li>
              <li>Right to withdraw consent</li>
              <li>Right to lodge a complaint with the CNIL (France) or your local DPA</li>
            </ul>

            <h3 className="text-base font-medium mt-4 mb-2">Under Australian Privacy Act</h3>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li>Right of access to your personal information</li>
              <li>Right to correction of inaccurate data</li>
              <li>Right to complain to the OAIC</li>
            </ul>

            <p className="text-muted-foreground leading-relaxed mt-3">
              To exercise your rights, contact us at <strong className="text-foreground">privacy@getgranted.com</strong>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored in the European Union (Helsinki, Finland). If you access the Service from outside the EU, your data is transferred to and stored in the EU, which provides a high standard of data protection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is not intended for children under 16. We do not knowingly collect personal data from children under 16. If you believe a child has provided us with personal data, please contact us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service uses only strictly necessary cookies for authentication. We do not use tracking, advertising, or analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Significant changes will be notified via email or through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any questions: <strong className="text-foreground">privacy@getgranted.com</strong>
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For GDPR complaints: <strong className="text-foreground">CNIL</strong> — www.cnil.fr
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
