"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ResumeUpload } from "@/components/resume-upload";
import { ArrowRight, Zap, Shield, Sparkles, CheckCircle2, Play, Workflow } from "lucide-react";
import { useState } from "react";
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

export default function Home() {
  const router = useRouter();
  const [activeDemo, setActiveDemo] = useState(0);

  const demos = [
    {
      title: "Upload your resume",
      description: "Drag and drop your resume in any format. We'll parse it instantly.",
      step: 1,
    },
    {
      title: "AI analyzes & learns",
      description: "Our AI extracts skills, experience, and achievements from your resume.",
      step: 2,
    },
    {
      title: "Autofill applications",
      description: "Apply to jobs 10x faster with intelligent autofill powered by your data.",
      step: 3,
    },
    {
      title: "Get smart answers",
      description: "Answer open-ended questions with AI suggestions grounded in your resume.",
      step: 4,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ResAid
            </span>
          </motion.div>
          <div className="flex gap-3">
            <Button variant="ghost" className="hidden sm:flex" onClick={() => router.push("/sign-in")}>
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all" onClick={() => router.push("/sign-up")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-6 sm:pt-32 sm:pb-40">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-8 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="inline-block">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              >
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  AI-Powered Job Applications
                </span>
              </motion.div>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              Apply{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                faster.
              </span>
              <br />
              Answer{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                better.
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Stop spending hours on applications. ResAid uses AI grounded in your
              resume to autofill forms and generate honest, tailored answers in
              seconds.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/25 transition-all text-base"
              onClick={() => router.push("/sign-up")}
            >
              Get Started Free <ArrowRight size={18} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-2 hover:bg-gray-50 dark:hover:bg-slate-900"
            >
              <Play size={18} /> Watch Demo
            </Button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="pt-8 text-sm text-gray-600 dark:text-gray-400"
          >
            No credit card required. Free trial includes 5 applications.
          </motion.div>
        </motion.div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-blue-50/50 to-transparent dark:via-blue-950/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">How ResAid Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              4 simple steps to transform your job search
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Steps */}
            <div className="space-y-4">
              {demos.map((demo, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setActiveDemo(idx)}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`w-full p-6 rounded-xl text-left transition-all ${
                    activeDemo === idx
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/25"
                      : "bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                        activeDemo === idx
                          ? "bg-white/20"
                          : "bg-gray-300 dark:bg-slate-600"
                      }`}
                    >
                      {demo.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{demo.title}</h3>
                      <p
                        className={
                          activeDemo === idx
                            ? "text-blue-100"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        {demo.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Demo Visualization */}
            <motion.div
              key={activeDemo}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 min-h-96 flex items-center justify-center"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center">
                  <Workflow size={40} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{demos[activeDemo].title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {demos[activeDemo].description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Everything you need to apply smarter
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Apply to jobs in minutes, not hours. Autofill with one click.",
                color: "from-blue-600 to-cyan-600",
              },
              {
                icon: Sparkles,
                title: "AI-Powered",
                description: "Intelligent answers tailored to each job posting.",
                color: "from-purple-600 to-pink-600",
              },
              {
                icon: Shield,
                title: "Always Honest",
                description: "Grounded in your resume. Never exaggerate or lie.",
                color: "from-green-600 to-emerald-600",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="group relative p-8 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid sm:grid-cols-3 gap-8 text-center"
          >
            {[
              { number: "10x", label: "Faster applications" },
              { number: "92%", label: "Higher acceptance rate" },
              { number: "50k+", label: "Jobs filled" },
            ].map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <p className="text-blue-100">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Resume Upload Section */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl font-bold mb-2">Start Your Free Trial</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Upload your resume to get started
            </p>
          </motion.div>
          <ResumeUpload />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center mb-12"
          >
            Questions?
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="space-y-4"
          >
            {[
              {
                q: "Is my data secure?",
                a: "Yes. We encrypt all data in transit and at rest. Your resume is never shared with third parties.",
              },
              {
                q: "What formats do you support?",
                a: "PDF, DOCX, and DOC files. Max 10MB per resume.",
              },
              {
                q: "Can I edit the AI-generated answers?",
                a: "Absolutely. All suggestions are editable before you submit.",
              },
              {
                q: "Do you offer team plans?",
                a: "Yes. Contact sales for enterprise pricing and team features.",
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-6 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600"
              >
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-blue-600" />
                  {faq.q}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 ml-7">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center space-y-8"
        >
          <h2 className="text-4xl sm:text-5xl font-bold">
            Ready to apply smarter?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Join thousands of job seekers using ResAid to land their dream jobs.
          </p>
          <Button className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/25" onClick={() => router.push("/sign-up")}>
            Get Started Free
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No credit card required • Free trial includes 5 applications
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 py-12 px-6 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
                <span className="font-bold">ResAid</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Apply faster. Answer better.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-200">Features</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-200">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-200">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-200">About</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-200">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-200">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-200">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-200">Terms</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-gray-200">Contact</a></li>
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
