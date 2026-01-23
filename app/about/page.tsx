"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Code, Target, Heart } from "lucide-react";
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
  visible: { opacity: 1, y: 0 },
};

export default function About() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background dark:from-background dark:via-primary/10 dark:to-background">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/icons/ResAid_logo.png" alt="ResAid Logo" className="h-6" />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 active:scale-95"
                onClick={() => router.push("/sign-in")}
              >
                Sign In
              </Button>
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300" onClick={() => router.push("/sign-up")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              Meet the <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">ResAid</span> Team
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              A small, passionate team of engineers, career coaches, and recruiters building the future of job applications
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Story Section */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              ResAid was born from a simple frustration: job applications take too long and don't showcase candidates effectively.
              We saw too many talented people getting passed over because they couldn't keep up with the volume of applications
              required in today's competitive job market.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={itemVariants}
              className="text-center p-6 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Engineers</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Building robust, secure, and intelligent systems that make job applications faster and more effective.
                Our engineering team focuses on AI-driven solutions that understand both technical requirements and human needs.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="text-center p-6 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Career Coaches</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Former career advisors who understand the psychology of job searching and what employers really look for.
                They ensure our AI suggestions are not just technically sound, but strategically effective.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="text-center p-6 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Recruiters</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ex-recruiters with years of experience reviewing thousands of applications. They know exactly what makes
                a candidate stand out and ensure ResAid helps users present their best selves.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              To democratize access to better job opportunities by making the application process more efficient,
              effective, and fair. We believe that talent should be judged on merit, not on who has the most time
              to fill out repetitive forms.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                onClick={() => router.push("/sign-up")}
              >
                Join ResAid
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 py-12 px-6 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <img src="/icons/ResAid_logo.png" alt="ResAid Logo" className="h-8" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Apply faster. Answer better.
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="/#features" className="hover:text-gray-900 dark:hover:text-gray-200">Features</a></li>
                <li><a href="/pricing" className="hover:text-gray-900 dark:hover:text-gray-200">Pricing</a></li>
                <li><a href="/#faq" className="hover:text-gray-900 dark:hover:text-gray-200">FAQ</a></li>
              </ul>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-200">Privacy</a></li>
                <li><a href="/terms" className="hover:text-gray-900 dark:hover:text-gray-200">Terms</a></li>
                <li><a href="mailto:customersupport@resaid.ai" className="hover:text-gray-900 dark:hover:text-gray-200">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-slate-800 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2026 ResAid. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}