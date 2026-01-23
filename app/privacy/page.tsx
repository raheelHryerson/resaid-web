"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background dark:from-background dark:via-primary/10 dark:to-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 dark:bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <img src="/icons/ResAid_logo.png" alt="ResAid Logo" className="h-8" />
          </motion.div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push("/")}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Last updated: January 20, 2026
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="prose prose-lg dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We collect information you provide directly to us, such as when you create an account, upload your resume, or use our services. This includes:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  <li><strong>Account Information:</strong> Name, email address, and account credentials</li>
                  <li><strong>Resume Data:</strong> Your resume content, work experience, education, and skills</li>
                  <li><strong>Application Data:</strong> Job applications you create, responses you generate, and application tracking information</li>
                  <li><strong>Usage Data:</strong> How you interact with our service, features used, and performance metrics</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process and analyze your resume for job matching</li>
                  <li>Generate personalized application suggestions and responses</li>
                  <li>Track your applications and provide insights</li>
                  <li>Communicate with you about your account and our services</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">3. Information Sharing and Disclosure</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  <li><strong>With your consent:</strong> When you explicitly agree to share information</li>
                  <li><strong>Service providers:</strong> With trusted third-party services that help us operate (under strict confidentiality agreements)</li>
                  <li><strong>Legal requirements:</strong> When required by law, court order, or government request</li>
                  <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>Safety and security:</strong> To protect the rights, property, or safety of our users or the public</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We implement industry-standard security measures to protect your personal information:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and employee training</li>
                  <li>Secure cloud infrastructure with enterprise-grade providers</li>
                  <li>Regular backups and disaster recovery procedures</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">5. AI Processing and Data Usage</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Our AI systems process your resume and job application data to provide personalized assistance. This processing:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  <li>Is performed securely within our controlled environment</li>
                  <li>Does not train external AI models with your personal data</li>
                  <li>Generates suggestions that you can review and modify</li>
                  <li>Helps analyze job requirements and match them to your experience</li>
                  <li>Improves service quality while maintaining your privacy</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Typically:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  <li>Account data is retained while your account is active</li>
                  <li>Resume and application data may be retained for up to 90 days after account deletion</li>
                  <li>Usage data is anonymized and retained for service improvement</li>
                  <li>Legal and regulatory data is retained as required by law</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">7. Your Rights and Choices</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                  <li><strong>Portability:</strong> Request transfer of your data in a structured format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Account deletion:</strong> Delete your account and associated data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">8. Cookies and Tracking</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized features. You can control cookie preferences through your browser settings, though this may affect service functionality.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">9. International Data Transfers</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during international transfers, including standard contractual clauses and adequacy decisions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will delete it immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">11. Changes to This Privacy Policy</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by email or through a prominent notice on our service. Your continued use of the service after such changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">12. Contact Us</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg mt-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Email: customersupport@resaid.ai
                  </p>
                </div>
              </section>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}