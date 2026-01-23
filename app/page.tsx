"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ResumeUpload } from "@/components/resume-upload";
import { ArrowRight, Zap, Shield, Sparkles, CheckCircle2, Play, Workflow, User, ChevronDown, ChevronUp } from "lucide-react";
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
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());

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
      title: "Download ResAid Assistant",
      description: "Get the ResAid Assistant plugin and apply to jobs 10x smarter and faster.",
      step: 3,
    },
    {
      title: "Get smart answers",
      description: "Answer open-ended questions with AI suggestions grounded in your resume.",
      step: 4,
    },
  ];

  const toggleFaq = (idx: number) => {
    const newOpenFaqs = new Set(openFaqs);
    if (newOpenFaqs.has(idx)) {
      newOpenFaqs.delete(idx);
    } else {
      newOpenFaqs.add(idx);
    }
    setOpenFaqs(newOpenFaqs);
  };

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
            <Button
              variant="outline"
              className="hidden sm:flex border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 active:scale-95"
              onClick={() => router.push("/sign-in")}
            >
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300" onClick={() => router.push("/sign-up")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="about" className="relative overflow-hidden pt-20 pb-32 px-6 sm:pt-32 sm:pb-40">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
          <div className="absolute -bottom-8 right-10 w-72 h-72 bg-primary/15 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" />
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
              >
                <span className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm font-semibold text-primary">
                  Stop struggling. Start applying smarter.
                </span>
              </motion.div>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              Apply{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Smarter.
              </span>
              <br />
              Answer{" "}
              <span className="bg-gradient-to-r from-primary/80 via-primary to-primary/60 bg-clip-text text-transparent">
                Better.
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
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-all text-base"
              onClick={() => router.push("/sign-up")}
            >
              Get Started Free <ArrowRight size={18} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 active:scale-95"
              onClick={() => router.push("/sign-in")}
            >
              <User size={18} /> Login
            </Button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="pt-8 text-sm text-gray-600 dark:text-gray-400"
          >
            Sign up now and get your dream job.
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
                          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
                          : "bg-muted hover:bg-muted/80"
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
                          <p className={activeDemo === idx ? "text-primary-foreground/90" : "text-gray-600 dark:text-gray-300"}>{demo.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Demo Preview */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="relative"
                >
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl">
                    <div className="bg-slate-800 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-primary/50 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="text-center text-white/80">
                      <p className="text-sm">Interactive demo coming soon</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                  Everything you need to apply smarter
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Powerful features designed for modern job seekers
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
                    color: "from-primary to-primary/80",
                  },
                  {
                    icon: Sparkles,
                    title: "AI-Powered",
                    description: "Intelligent answers tailored to each job posting.",
                    color: "from-primary/80 to-primary/60",
                  },
                  {
                    icon: Shield,
                    title: "Always Honest",
                    description: "Grounded in your resume. Never exaggerate or lie.",
                    color: "from-green-600 to-emerald-600",
                  },
                  {
                    icon: Workflow,
                    title: "Smart Matching",
                    description: "AI analyzes job requirements and matches your experience perfectly.",
                    color: "from-purple-600 to-violet-600",
                  },
                  {
                    icon: CheckCircle2,
                    title: "Quality Assurance",
                    description: "Built-in checks ensure your applications are complete and professional.",
                    color: "from-blue-600 to-cyan-600",
                  },
                  {
                    icon: ArrowRight,
                    title: "One-Click Apply",
                    description: "Submit applications instantly with pre-filled, optimized responses.",
                    color: "from-orange-600 to-red-600",
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

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center mb-12"
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="space-y-4"
          >
            {[
              {
                q: "What is ResAid and how does it work?",
                a: "ResAid is an AI-powered job application assistant that helps you apply faster and smarter. You upload your resume once, and ResAid reads job descriptions, autofills repetitive application fields, and helps draft strong, relevant answers to application questions using your resume and the role requirements. It also scores how well your resume matches each job and tracks the applications you've completed—so you can stay organized and focus on opportunities where you have the best chance. You always review and stay in control of everything before submitting.",
              },
              {
                q: "Can ResAid help me land a job?",
                a: "Yes! ResAid is designed to help you land a job faster, but not by guessing or doing the work for you. It is NOT an AI generating apply application and is intended to be an assistant during the application process. It speeds up the application process by autofilling forms, reducing repetitive typing, and generating thoughtful, role-relevant answers based on your actual resume and the job description. It also gives you a fit score that helps you prioritize roles where you're a strong match and tracks your applications so you stay organized. By saving you time and helping your applications be more targeted and consistent, ResAid lets you apply to more jobs with better quality, ultimately increasing your chances of getting interviews and offers.",
              },
              {
                q: "What features does it offer?",
                a: (
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Resume upload & analysis:</strong> Upload your resume once and let ResAid securely analyze your experience, skills, and background.</li>
                    <li><strong>Application autofill:</strong> Automatically fills repetitive fields like name, contact info, work history, and education.</li>
                    <li><strong>Job description detection:</strong> Reads and understands job descriptions directly from job postings.</li>
                    <li><strong>AI-assisted answers:</strong> Drafts tailored responses to application questions using your resume and the job requirements.</li>
                    <li><strong>Resume-job fit score:</strong> Shows how well your resume matches a role, with clear breakdowns and improvement suggestions.</li>
                    <li><strong>Application tracking:</strong> Keeps track of the jobs you've applied to so nothing falls through the cracks.</li>
                    <li><strong>Full user control:</strong> You review, edit, and approve everything before submitting any application.</li>
                  </ul>
                ),
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
                q: "Can employers tell if I used AI to write my application?",
                a: "No, ResAid does not submit applications on your behalf or generate generic, copy-paste answers. It helps draft responses based on your actual resume and the job description, which you review and edit before submitting. Employers typically evaluate applications based on relevance, clarity, and experience, and not whether AI was involved. ResAid is designed to assist, not replace your voice. It is also designed to be as human-like as possible. Lastly, when you personalize the suggestions and submit them yourself, your application reads as authentic and professional, not automated like other AI tools.",
              },
              {
                q: "What if I'm not satisfied with ResAid? Can I cancel or get a refund?",
                a: "Subscriptions may be canceled at any time. Refunds are issued at the discretion of ResAid within 30 days of purchase; please contact support for assistance.",
              },
              {
                q: "Who is ResAid for?",
                a: "ResAid is for job seekers who are actively applying and want to move faster with more confidence. It's built for students, early-career professionals, experienced candidates, and career switchers across industries who are tired of re-entering the same information, guessing how well they fit a role, and rewriting answers from scratch. ResAid helps turn one resume into many high-quality applications by autofilling forms, reading job descriptions, scoring fit, drafting role-specific answers, and tracking applications—so you can apply smarter while staying fully in control.",
              },
              {
                q: "How is ResAid different from other AI Resume Applications?",
                a: "ResAid is designed to be an assistant where the user has a lot of control while doing the application. It also uses language and grammar that is seen more common from top resumes. It gives the user guidance on if a job is suitable and what changes are necessary to meet the employer's needs. Finally, it offers a searchable Job history of what jobs you have applied for.",
              },
              {
                q: "Is my data safe with ResAid?",
                a: "Yes. AIApply encrypts your information, doesn't sell your data, and only uses it to deliver the services you request. You control who sees your documents (even shareable links can be disabled anytime) and you can delete files or your account whenever you like. We comply with privacy regulations and host our infrastructure on secure, enterprise-grade cloud providers. Review the Privacy Policy for full details.",
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-6 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 cursor-pointer"
                onClick={() => toggleFaq(idx)}
              >
                <h3 className="font-bold text-lg mb-2 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-primary" />
                    {faq.q}
                  </span>
                  {openFaqs.has(idx) ? (
                    <ChevronUp size={20} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </h3>
                {openFaqs.has(idx) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-600 dark:text-gray-300 ml-7"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
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
                <li><a href="#features" className="hover:text-gray-900 dark:hover:text-gray-200">Features</a></li>
                <li><a href="/pricing" className="hover:text-gray-900 dark:hover:text-gray-200">Pricing</a></li>
                <li><a href="#faq" className="hover:text-gray-900 dark:hover:text-gray-200">FAQ</a></li>
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
