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

export default function TermsOfService() {
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
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">Terms of Service</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Last updated: January 20, 2026
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="prose prose-lg dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  By accessing and using ResAid ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  ResAid is an AI-powered job application assistant that helps users create, manage, and optimize their job applications. The service includes resume analysis, application autofill, AI-assisted answer generation, and application tracking features.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  To use certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">4. Acceptable Use Policy</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on the rights of others</li>
                  <li>Submit false, misleading, or fraudulent information</li>
                  <li>Attempt to reverse engineer or compromise the Service</li>
                  <li>Use the Service for any commercial purpose without authorization</li>
                  <li>Distribute malware or engage in harmful activities</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">5. Content and Data</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  You retain ownership of all content and data you upload to the Service. By using the Service, you grant us a limited license to process, analyze, and store your data solely for the purpose of providing the Service. We implement industry-standard security measures to protect your data.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">6. AI-Generated Content</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  The Service uses AI to generate suggestions and content. While we strive for accuracy and quality, AI-generated content may contain errors. You are responsible for reviewing, editing, and ensuring the accuracy of all content before use. ResAid is an assistant tool and does not replace human judgment or professional advice.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">7. Subscription and Payment</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Some features require a paid subscription. Payment terms, billing cycles, and cancellation policies are outlined during the subscription process. Subscriptions automatically renew unless cancelled. Refunds are provided at our discretion within 30 days of purchase.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We reserve the right to terminate or suspend your account at any time for violations of these terms. Upon termination, your right to use the Service ceases immediately. We may retain your data as required by law or for legitimate business purposes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">9. Disclaimers</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  The Service is provided "as is" without warranties of any kind. We do not guarantee job placement, interview success, or any specific outcomes. The Service is not a substitute for professional career advice, legal counsel, or employment services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">10. Limitation of Liability</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  To the maximum extent permitted by law, ResAid shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount paid by you for the Service in the 12 months preceding the claim.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">11. Changes to Terms</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">12. Contact Information</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  If you have questions about these Terms of Service, please contact us at customersupport@resaid.ai.
                </p>
              </section>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}