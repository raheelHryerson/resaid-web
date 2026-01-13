"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

interface VersionEntry {
  id: string;
  version: number;
  parsingEngine: string;
  parsedData: any;
  createdAt: string;
}

export default function VersionsPage() {
  const params = useParams();
  const { user } = useUser();
  const resumeId = params.resumeId as string;

  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<VersionEntry | null>(
    null
  );

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch(`/api/resumes/${resumeId}/versions`);
        if (response.ok) {
          const data = await response.json();
          setVersions(data.versions);
          if (data.versions.length > 0) {
            setSelectedVersion(data.versions[data.versions.length - 1]); // Latest
          }
        }
      } catch (error) {
        console.error("Failed to fetch versions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchVersions();
    }
  }, [resumeId]);

  if (loading) {
    return <div className="p-8">Loading versions...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link
            href={`/dashboard/resume/${resumeId}`}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Resume
          </Link>
          <h1 className="text-2xl font-bold mt-2">Version History</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {versions.length} version{versions.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Versions List */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Versions</h2>
            <div className="space-y-2">
              {versions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => setSelectedVersion(version)}
                  className={`w-full text-left p-3 rounded border-l-4 transition ${
                    selectedVersion?.id === version.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <div className="font-semibold text-sm">
                    v{version.version}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {version.parsingEngine}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(version.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Version Details */}
          <div className="col-span-2">
            {selectedVersion ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <div className="mb-6 pb-6 border-b dark:border-slate-700">
                  <h2 className="text-xl font-semibold mb-2">
                    Version {selectedVersion.version}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedVersion.parsingEngine}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedVersion.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">
                    Skills ({selectedVersion.parsedData.skills?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVersion.parsedData.skills?.map(
                      (skill: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Experience Summary */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">
                    Experience (
                    {selectedVersion.parsedData.experience?.length || 0})
                  </h3>
                  <div className="space-y-2">
                    {selectedVersion.parsedData.experience?.map(
                      (exp: any, i: number) => (
                        <div
                          key={i}
                          className="text-sm border-l-2 border-gray-300 pl-3"
                        >
                          <div className="font-semibold">{exp.title}</div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {exp.organization}
                          </div>
                          <div className="text-xs text-gray-500">
                            {exp.startDate} - {exp.endDate}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Education Summary */}
                <div>
                  <h3 className="font-semibold mb-2">
                    Education (
                    {selectedVersion.parsedData.education?.length || 0})
                  </h3>
                  <div className="space-y-2">
                    {selectedVersion.parsedData.education?.map(
                      (edu: any, i: number) => (
                        <div
                          key={i}
                          className="text-sm border-l-2 border-green-300 pl-3"
                        >
                          <div className="font-semibold">
                            {edu.credential}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {edu.institution}
                          </div>
                          {edu.field && (
                            <div className="text-xs text-gray-500">
                              {edu.field}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center text-gray-600">
                Select a version to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
