"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useState } from "react";
import { ResumeUpload } from "@/components/resume-upload";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [showUploadModal, setShowUploadModal] = useState(false);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect("/sign-in");
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

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user.firstName}!</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your resumes and job applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Resume Section */}
            <div className="p-8 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h2 className="text-2xl font-bold mb-4">📄 Resumes</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upload and manage your resumes
              </p>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                Upload Resume
              </button>
            </div>

            {/* Applications Section */}
            <div className="p-8 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h2 className="text-2xl font-bold mb-4">💼 Applications</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Track your job applications
              </p>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                New Application
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Upload Resume</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">
                ×
              </button>
            </div>
            <ResumeUpload />
          </div>
        </div>
      )}
    </div>
  );
}
