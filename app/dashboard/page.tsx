"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { ResumeUpload } from "@/components/resume-upload";
import Link from "next/link";

interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  skills: string[];
  experience: Array<{ title: string | null; organization: string | null; startDate: string | null; endDate: string | null; location: string | null; bullets: string[] }>;
  education: Array<{ credential: string | null; institution: string | null; field: string | null; startDate: string | null; endDate: string | null }>;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await fetch("/api/resumes");
        if (response.ok) {
          const data = await response.json();
          setResumes(data.resumes || []);
        }
      } catch (error) {
        console.error("Failed to fetch resumes:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchApiKey = async () => {
      try {
        const response = await fetch("/api/user/api-key");
        if (response.ok) {
          const data = await response.json();
          setApiKey(data.apiKey);
        }
      } catch (error) {
        console.error("Failed to fetch API key:", error);
      } finally {
        setApiKeyLoading(false);
      }
    };

    if (user) {
      fetchResumes();
      fetchApiKey();
    }
  }, [user]);

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
              
              {loading ? (
                <p className="text-gray-500">Loading resumes...</p>
              ) : resumes.length === 0 ? (
                <>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Upload and manage your resumes
                  </p>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                    Upload Resume
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  {resumes.map((resume) => (
                    <div key={resume.id} className="p-4 bg-blue-50 dark:bg-slate-700 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">{resume.fileName}</h3>
                      
                      {resume.skills.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {resume.skills.slice(0, 5).map((skill, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-sm rounded">
                                {skill}
                              </span>
                            ))}
                            {resume.skills.length > 5 && (
                              <span className="text-sm text-gray-600">+{resume.skills.length - 5} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {resume.experience.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience:</p>
                          <div className="space-y-1">
                            {resume.experience.slice(0, 2).map((exp, i) => (
                              <p key={i} className="text-sm text-gray-600 dark:text-gray-400">
                                {exp.title || "Job Title"} {exp.organization && `at ${exp.organization}`}
                              </p>
                            ))}
                            {resume.experience.length > 2 && (
                              <p className="text-sm text-gray-600">+{resume.experience.length - 2} more roles</p>
                            )}
                          </div>
                        </div>
                      )}

                      {resume.education.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Education:</p>
                          <div className="space-y-1">
                            {resume.education.slice(0, 2).map((edu, i) => (
                              <p key={i} className="text-sm text-gray-600 dark:text-gray-400">
                                {edu.credential || "Degree"} {edu.field && `in ${edu.field}`}
                              </p>
                            ))}
                            {resume.education.length > 2 && (
                              <p className="text-sm text-gray-600">+{resume.education.length - 2} more degrees</p>
                            )}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-500">
                        Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                      <Link
                        href={`/dashboard/resume/${resume.id}`}
                        className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                      >
                        View & Edit →
                      </Link>
                    </div>
                  ))}
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                    Upload Another Resume
                  </button>
                </div>
              )}
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

          {/* Chrome Extension API Key Section */}
          <div className="p-8 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h2 className="text-2xl font-bold mb-2">🔑 Chrome Extension API Key</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Use this key to authenticate your ResAid Chrome extension for intelligent job application autofill
            </p>
            
            {apiKeyLoading ? (
              <p className="text-gray-500">Loading API key...</p>
            ) : apiKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 flex items-center justify-between">
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">{apiKey}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(apiKey);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="ml-4 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition whitespace-nowrap flex-shrink-0"
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
                  <li>Copy your API key above</li>
                  <li>Go to the ResAid Chrome extension settings</li>
                  <li>Paste the key in the API Key field</li>
                  <li>Save and start using autofill!</li>
                </ol>
              </div>
            ) : (
              <p className="text-red-600 dark:text-red-400">Failed to load API key. Please try refreshing the page.</p>
            )}
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
