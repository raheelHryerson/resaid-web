"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ResumeUpload } from "@/components/resume-upload";
import Link from "next/link";

interface Application {
  id: string;
  jobUrl: string;
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  status: string;
  createdAt: string;
  resume: {
    fileName: string;
  };
}

interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  parsedData?: any; // JSON field from Prisma
  skills: string[];
  experience: Array<{ title: string | null; organization: string | null; startDate: string | null; endDate: string | null; location: string | null; bullets: string[] }>;
  education: Array<{ credential: string | null; institution: string | null; field: string | null; startDate: string | null; endDate: string | null }>;
  createdAt: string;
}

export default function DashboardPage() {
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "applications" | "profile" | "resume-rating" | "achievements" | "api-key">("overview");

  const handleApplicationUpdate = async (id: string, updates: Partial<Application>) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (response.ok) {
        const result = await response.json();
        setApplications(prev => prev.map(app => 
          app.id === id ? result.application : app
        ));
      } else {
        console.error('Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch resumes
        const resumeResponse = await fetch("/api/resumes");
        if (resumeResponse.ok) {
          const resumeData = await resumeResponse.json();
          setResumes(resumeData.resumes || []);
        }

        // Fetch applications
        const applicationsResponse = await fetch("/api/applications");
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          setApplications(applicationsData.applications || []);
        }

        // Fetch saved profile data
        const profileResponse = await fetch("/api/user/profile");
        if (profileResponse.ok) {
          const responseData = await profileResponse.json();
          const profileData = responseData.profile || {};
          setProfileData({
            firstName: profileData.firstName || "",
            lastName: profileData.lastName || "",
            email: profileData.email || "",
            phone: profileData.phone || "",
            city: profileData.city || "",
            state: profileData.province || "",
            country: profileData.country || "",
          });        } else {
          // Fallback to Clerk data if profile API fails
          setProfileData({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.primaryEmailAddress?.emailAddress || "",
            phone: "",
            city: "",
            state: "",
            country: "",
          });        }

        // Fetch API key
        const apiKeyResponse = await fetch("/api/user/api-key");
        if (apiKeyResponse.ok) {
          const apiKeyData = await apiKeyResponse.json();
          setApiKey(apiKeyData.apiKey || "");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Profile data is now loaded in fetchData useEffect above

  // Handle URL parameters for tab selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'api-key') {
      setActiveTab('api-key');
    }
  }, []);

  // Handle redirects client-side to avoid using server-only redirect()
  useEffect(() => {
    if (isLoaded && !user) {
      router.replace("/sign-in");
    }
  }, [isLoaded, user, router]);

  // Gate onboarding: if user is loaded and resumes list is empty, go to onboarding
  useEffect(() => {
    if (isLoaded && user && !loading && resumes.length === 0) {
      router.replace("/onboarding");
    }
  }, [isLoaded, user, loading, resumes, router]);

  const copyApiKey = async () => {
    if (!apiKey) return;
    
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy API key:", error);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background dark:from-background dark:via-primary/10 dark:to-background">
      <nav className="sticky top-0 z-50 bg-background/80 dark:bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <img src="/icons/ResAid_logo.png" alt="ResAid Logo" className="h-8" />
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-foreground border-b-2 border-primary pb-1"
              >
                Dashboard
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground pb-1 hover:border-b-2 hover:border-primary/50 transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.firstName || 'User'}!</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your resumes and job applications
          </p>
        </div>

        {/* Sidebar Layout */}
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2 sticky top-24">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "overview"
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "applications"
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Applications
              </button>
              <button
                onClick={() => setActiveTab("resume-rating")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "resume-rating"
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Resume Rating
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "profile"
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "achievements"
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Achievements
              </button>
              <button
                onClick={() => setActiveTab("api-key")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "api-key"
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                API Key
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
          {/* Tab Content: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
            {/* Resume Section */}
            <div className="p-8 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h2 className="text-2xl font-bold mb-4">Resumes</h2>
              
              {loading ? (
                <p className="text-gray-500">Loading resumes...</p>
              ) : resumes.length === 0 ? (
                <>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Upload and manage your resumes
                  </p>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:shadow-lg transition-all">
                    Upload Resume
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  {resumes.slice(0, 3).map((resume) => (
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
                        className="mt-3 inline-block px-4 py-2 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 transition"
                      >
                        View & Edit →
                      </Link>
                    </div>
                  ))}
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:shadow-lg transition-all">
                    Upload Another Resume
                  </button>
                </div>
              )}
            </div>

            {/* Applications Section */}
            <div className="p-8 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h2 className="text-2xl font-bold mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Applications</span>
                  <span className="font-bold text-2xl">{applications.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">In Progress</span>
                  <span className="font-bold text-2xl text-primary">{applications.filter(app => ['draft', 'in-progress', 'applied', 'submitted'].includes(app.status)).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="font-bold text-2xl text-green-600">{applications.filter(app => ['accepted', 'rejected', 'withdrawn', 'completed'].includes(app.status)).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chrome Extension Info */}
          <div className="p-8 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h2 className="text-2xl font-bold mb-2">🔌 Chrome Extension</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The ResAid Chrome extension now works fully locally — no API key required. Use onboarding or the Dashboard to upload a resume, then enable autofill from the extension popup.
            </p>
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Chrome Extension →
            </a>
          </div>
        </div>
      )}

      {/* Tab Content: Applications */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h2 className="text-2xl font-bold mb-4">Job Applications Tracker</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Track all your job applications in one place
            </p>

            {applications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Applications will be automatically tracked when you use the Chrome extension</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <ApplicationCard 
                    key={application.id} 
                    application={application} 
                    onUpdate={handleApplicationUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Resume Rating */}
      {activeTab === "resume-rating" && (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h2 className="text-2xl font-bold mb-4">Resume Rating & Analysis</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get AI-powered feedback on your resume to improve your chances
            </p>
            
            {resumes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Upload a resume first to get it rated</p>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:shadow-lg transition-all"
                >
                  Upload Resume
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <h3 className="font-semibold text-primary mb-2">Coming Soon!</h3>
                  <p className="text-sm text-primary/80">
                    Resume rating and AI-powered analysis will be available soon. Stay tuned!
                  </p>
                </div>
                
                {resumes.map((resume) => (
                  <div key={resume.id} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{resume.fileName}</h3>
                      <p className="text-sm text-gray-500">Ready for analysis</p>
                    </div>
                    <button 
                      disabled
                      className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
                    >
                      Rate Resume (Coming Soon)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Achievements */}
      {activeTab === "achievements" && (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h2 className="text-2xl font-bold mb-4">Achievements</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Unlock accomplishments as you progress in your job search journey
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* First Resume Upload */}
              <div className={`p-6 rounded-lg border-2 ${
                resumes.length > 0 
                  ? "border-green-500 bg-green-50 dark:bg-green-950/30" 
                  : "border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/30 opacity-60"
              }`}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{resumes.length > 0 ? "🎯" : "🔒"}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">First Steps</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Upload your first resume
                    </p>
                    {resumes.length > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">Unlocked!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Completion */}
              <div className="p-6 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/30 opacity-60">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🔒</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Profile Master</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Complete your profile settings
                    </p>
                  </div>
                </div>
              </div>

              {/* First Application */}
              <div className="p-6 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/30 opacity-60">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🔒</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Job Hunter</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Track your first job application
                    </p>
                  </div>
                </div>
              </div>

              {/* 10 Applications */}
              <div className="p-6 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/30 opacity-60">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🔒</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Go-Getter</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Track 10 job applications
                    </p>
                  </div>
                </div>
              </div>

              {/* Resume Rating */}
              <div className="p-6 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/30 opacity-60">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🔒</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Resume Expert</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get your first resume rated
                    </p>
                  </div>
                </div>
              </div>

              {/* Extension Download */}
              <div className="p-6 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/30 opacity-60">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🔒</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Power User</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Install the Chrome extension
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 Complete achievements to unlock badges and track your job search progress!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: API Key */}
      {activeTab === "api-key" && (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h2 className="text-2xl font-bold mb-4">API Key</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect your Chrome extension to sync data with your account
            </p>
            
            <div className="space-y-6">
              <div className="p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to Connect Your Extension</h3>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                  <li>Open your Chrome extension settings</li>
                  <li>Enter your API endpoint: <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded text-xs">{typeof window !== 'undefined' ? window.location.origin : 'https://your-resaid-app.vercel.app'}</code></li>
                  <li>Copy the API key below and paste it in the extension</li>
                  <li>Click "Load from Account" in the extension to sync your profile</li>
                </ol>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={apiKey}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                      placeholder="Loading..."
                    />
                    <button
                      onClick={copyApiKey}
                      disabled={!apiKey}
                      className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Keep this key secure. It allows access to your account data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Profile Settings */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Manage your personal information and preferences
            </p>
            
            <div className="space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="San Francisco"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State/Province</label>
                    <input
                      type="text"
                      value={profileData.state}
                      onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="California"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input
                      type="text"
                      value={profileData.country}
                      onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="United States"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Work Experience - Multiple Entries */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Work Experience</h3>
                {Array.isArray(resumes[0]?.parsedData?.experience) && resumes[0].parsedData.experience.length > 0 ? (
                  resumes[0].parsedData.experience.map((exp: any, idx: number) => (
                    <div key={idx} className="mb-8 p-4 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Employer</label>
                          <input
                            type="text"
                            defaultValue={exp.organization || ""}
                            placeholder="Company Name"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Job Title</label>
                          <input
                            type="text"
                            defaultValue={exp.title || ""}
                            placeholder="Software Engineer"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Employment Start Date</label>
                          <input
                            type="text"
                            defaultValue={exp.startDate || ""}
                            placeholder="MM/YYYY"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Employment End Date</label>
                          <input
                            type="text"
                            defaultValue={exp.endDate || "Present"}
                            placeholder="MM/YYYY or Present"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <label className="block text-sm font-medium mb-1">Description / Responsibilities</label>
                      <textarea
                        defaultValue={Array.isArray(exp.bullets) ? exp.bullets.join("\n") : ""}
                        placeholder="Enter job responsibilities or bullet points"
                        rows={6}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No work experience found in resume.</p>
                )}
              </div>

              {/* Years of Experience & Currently Employed - moved to bottom */}
              <div className="grid md:grid-cols-2 gap-4 mt-8">
                <div>
                  <label className="block text-sm font-medium mb-1">Years of Experience</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currently Employed?</label>
                  <select
                    defaultValue={resumes[0]?.parsedData?.experience?.[0]?.endDate ? "no" : "yes"}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Education</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Degree</label>
                    <select
                      defaultValue={resumes[0]?.parsedData?.education?.[0]?.credential || ""}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select...</option>
                      <option value="High School">High School</option>
                      <option value="Associate">Associate</option>
                      <option value="Bachelor's">Bachelor's</option>
                      <option value="Master's">Master's</option>
                      <option value="PhD">PhD</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">University/Institution</label>
                    <input
                      type="text"
                      defaultValue={resumes[0]?.parsedData?.education?.[0]?.institution || ""}
                      placeholder="University Name"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Field of Study</label>
                    <input
                      type="text"
                      defaultValue={resumes[0]?.parsedData?.education?.[0]?.field || ""}
                      placeholder="Computer Science"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Graduation Date</label>
                    <input
                      type="text"
                      defaultValue={resumes[0]?.parsedData?.education?.[0]?.endDate || ""}
                      placeholder="MM/YYYY"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <button className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                  Cancel
                </button>
                {!profileSaved ? (
                  <button
                    className="px-6 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={async () => {
                      setSavingProfile(true);
                      try {
                        const response = await fetch('/api/user/profile', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            firstName: profileData.firstName,
                            lastName: profileData.lastName,
                            email: profileData.email,
                            phone: profileData.phone,
                            location: `${profileData.city}, ${profileData.state}, ${profileData.country}`.replace(/, ,/g, '').replace(/^,|,$/g, '').trim(),
                          }),
                        });

                        if (response.ok) {
                          setProfileSaved(true);
                          setTimeout(() => setProfileSaved(false), 3000);
                        } else {
                          console.error('Failed to save profile');
                          alert('Failed to save profile. Please try again.');
                        }
                      } catch (error) {
                        console.error('Error saving profile:', error);
                        alert('Error saving profile. Please try again.');
                      } finally {
                        setSavingProfile(false);
                      }
                    }}
                    disabled={savingProfile}
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                ) : (
                  <span className="px-6 py-2 text-green-600 font-semibold">Saved!</span>
                )}
              </div>
            </div>
          </div>
        </div>
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

function ApplicationCard({ application, onUpdate }: { 
  application: Application; 
  onUpdate: (id: string, updates: Partial<Application>) => void; 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    jobTitle: application.jobTitle,
    companyName: application.companyName,
    status: application.status
  });

  const handleSave = () => {
    onUpdate(application.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      jobTitle: application.jobTitle,
      companyName: application.companyName,
      status: application.status
    });
    setIsEditing(false);
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        {isEditing ? (
          <input
            type="text"
            value={editData.jobTitle}
            onChange={(e) => setEditData(prev => ({ ...prev, jobTitle: e.target.value }))}
            className="font-semibold text-lg bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded px-2 py-1 w-full"
          />
        ) : (
          <h3 className="font-semibold text-lg">{application.jobTitle}</h3>
        )}
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <select
              value={editData.status}
              onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
              className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600"
            >
              <option value="draft">Draft</option>
              <option value="in-progress">In Progress</option>
              <option value="applied">Applied</option>
              <option value="submitted">Submitted</option>
              <option value="interviewing">Interviewing</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="completed">Completed</option>
            </select>
          ) : (
            <span className={`px-2 py-1 text-xs rounded-full ${
              application.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              application.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
              application.status === 'submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
              application.status === 'interviewing' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
              application.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              application.status === 'applied' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
              application.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}>
              {application.status}
            </span>
          )}
          
          {isEditing ? (
            <div className="flex gap-1">
              <button
                onClick={handleSave}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <input
          type="text"
          value={editData.companyName}
          onChange={(e) => setEditData(prev => ({ ...prev, companyName: e.target.value }))}
          className="text-gray-600 dark:text-gray-400 mb-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded px-2 py-1 w-full"
        />
      ) : (
        <p className="text-gray-600 dark:text-gray-400 mb-2">{application.companyName}</p>
      )}
      
      <p className="text-sm text-gray-500 mb-2">Resume: {application.resume.fileName}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
        <a
          href={application.jobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80"
        >
          View Job →
        </a>
      </div>
    </div>
  );
}
