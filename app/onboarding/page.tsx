"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ResumeUpload } from "@/components/resume-upload";
import { OnboardingCommonInfo } from "@/components/onboarding-common-info";
import { motion } from "framer-motion";

type OnboardingStep = "resume" | "info" | "extension";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("resume");
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadResumes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/resumes", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setResumes(data.resumes || []);
      }
    } catch (_) { /* ignore */ }
    finally { 
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadResumes();
  }, []);

  const handleMoveToInfoStep = () => {
    setCurrentStep("info");
  };

  const handleMoveToExtensionStep = () => {
    setCurrentStep("extension");
  };

  const handleCompleteOnboarding = () => {
    router.replace("/dashboard");
  };

  const handleResumeUploadSuccess = async () => {
    // Reload resumes immediately when one is uploaded
    await loadResumes();
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
            <span className="text-xl font-bold">ResAid</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 min-h-[calc(100vh-80px)]">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all ${currentStep === "resume" ? "bg-blue-600 text-white" : "bg-green-600 text-white"}`}>
                ✓
              </div>
              <span className="font-medium">Upload Resume</span>
            </div>
            <div className={`w-12 h-1 transition-all ${["info", "extension"].includes(currentStep) ? "bg-blue-600" : "bg-gray-300"}`} />
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all ${currentStep === "info" ? "bg-blue-600 text-white" : ["extension"].includes(currentStep) ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"}`}>
                {["extension"].includes(currentStep) ? "✓" : "2"}
              </div>
              <span className={currentStep !== "resume" ? "font-medium" : "text-gray-500"}>Complete Profile</span>
            </div>
            <div className={`w-12 h-1 transition-all ${currentStep === "extension" ? "bg-blue-600" : "bg-gray-300"}`} />
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all ${currentStep === "extension" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}>
                3
              </div>
              <span className={currentStep === "extension" ? "font-medium" : "text-gray-500"}>Download Extension</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold">Welcome, {user?.firstName}! 🎉</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentStep === "resume" 
                ? "Let's get started by uploading your resume." 
                : currentStep === "info"
                ? "Now let's complete your profile information."
                : "Finally, install the Chrome extension to start autofilling job applications."}
            </p>
          </div>

          {/* Step 1: Resume Upload */}
          {currentStep === "resume" && (
            <motion.div
              key="resume-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <h2 className="text-2xl font-bold mb-4">📄 Upload Your Resume</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Upload your resume. We'll analyze it to extract your skills, experience, and education.
                </p>
                <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {loading ? 'Checking resumes...' : resumes.length === 0 ? 'No resumes uploaded yet.' : `${resumes.length} resume(s) uploaded. Ready to continue!`}
                </div>
                <button
                  onClick={handleMoveToInfoStep}
                  disabled={loading || resumes.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Common Info */}
          {currentStep === "info" && (
            <motion.div
              key="info-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <OnboardingCommonInfo 
                resumes={resumes}
                onComplete={handleMoveToExtensionStep}
              />
            </motion.div>
          )}

          {/* Step 3: Download Extension */}
          {currentStep === "extension" && (
            <motion.div
              key="extension-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="p-8 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <h2 className="text-2xl font-bold mb-4">🔌 Install Chrome Extension</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  The ResAid Chrome extension automatically fills job applications with your information. Install it now to get started!
                </p>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">How it works:</h3>
                  <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li>✓ Upload your resume (already done!)</li>
                    <li>✓ Install the ResAid extension from the Chrome Web Store</li>
                    <li>✓ Visit any job application page</li>
                    <li>✓ Click the ResAid icon to autofill your information</li>
                  </ul>
                </div>

                <a
                  href="https://chromewebstore.google.com/detail/resaid/placeholder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Get Extension on Chrome Store →
                </a>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  You can skip this for now and download later from your dashboard
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCompleteOnboarding}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                  >
                    Skip for Now
                  </button>
                  <button
                    onClick={handleCompleteOnboarding}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                  >
                    Go to Dashboard →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
