"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

interface ParsedResume {
  personal: {
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
  };
  experience: Array<{
    title: string | null;
    organization: string | null;
    startDate: string | null;
    endDate: string | null;
    location: string | null;
    bullets: string[];
  }>;
  education: Array<{
    credential: string | null;
    institution: string | null;
    field: string | null;
    startDate: string | null;
    endDate: string | null;
  }>;
  skills: string[];
}

interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  parsedData: ParsedResume;
  isDefault: boolean;
  createdAt: string;
}

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export default function ResumeReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const resumeId = params.resumeId as string;

  const [resume, setResume] = useState<Resume | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState<ParsedResume | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch(`/api/resumes/${resumeId}`);
        if (response.ok) {
          const data = await response.json();
          setResume(data.resume);
          setEditedData(data.resume.parsedData);

          // Fetch autofill data for validation
          const autofillResponse = await fetch(
            `/api/resumes/${resumeId}/autofill`
          );
          if (autofillResponse.ok) {
            const autofillData = await autofillResponse.json();
            setValidation(autofillData.validation);
          }
        }
      } catch (error) {
        console.error("Failed to fetch resume:", error);
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchResume();
    }
  }, [resumeId]);

  const handleSave = async () => {
    if (!editedData) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parsedData: editedData }),
      });

      if (response.ok) {
        setResume((prev) =>
          prev ? { ...prev, parsedData: editedData } : null
        );
        setEditing(false);
        alert("Resume updated successfully!");
      }
    } catch (error) {
      console.error("Failed to save resume:", error);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading resume...</div>;
  }

  if (!resume || !editedData) {
    return <div className="p-8">Resume not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-primary hover:text-primary/80">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold mt-2">{resume.fileName}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Uploaded {new Date(resume.createdAt).toLocaleDateString()}
            </p>
          </div>
          <UserButton />
        </div>
      </div>

      {/* Validation Alerts */}
      {validation && !validation.valid && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Missing Information
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              {validation.missing.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {validation && validation.warnings.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Suggestions
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              {validation.warnings.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="mb-6 flex gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Edit Parsed Data
              </button>
              <Link
                href={`/dashboard/resume/${resumeId}/versions`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 inline-block"
              >
                View Versions
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setEditedData(resume.parsedData);
                  setEditing(false);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Personal Information */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            {editing ? (
              <>
                <input
                  type="text"
                  placeholder="Name"
                  value={editedData.personal.name || ""}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      personal: { ...editedData.personal, name: e.target.value },
                    })
                  }
                  className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editedData.personal.email || ""}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      personal: {
                        ...editedData.personal,
                        email: e.target.value,
                      },
                    })
                  }
                  className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={editedData.personal.phone || ""}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      personal: {
                        ...editedData.personal,
                        phone: e.target.value,
                      },
                    })
                  }
                  className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={editedData.personal.location || ""}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      personal: {
                        ...editedData.personal,
                        location: e.target.value,
                      },
                    })
                  }
                  className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                />
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Name
                  </p>
                  <p className="font-semibold">
                    {resume.parsedData.personal?.name || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Email
                  </p>
                  <p className="font-semibold">
                    {resume.parsedData.personal?.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="font-semibold">
                    {resume.parsedData.personal?.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Location
                  </p>
                  <p className="font-semibold">
                    {resume.parsedData.personal?.location || "Not provided"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Skills ({editedData.skills.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {editedData.skills.map((skill, i) => (
              editing ? (
                <div key={i} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => {
                      const updated = [...editedData.skills];
                      updated[i] = e.target.value;
                      setEditedData({
                        ...editedData,
                        skills: updated,
                      });
                    }}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const updated = editedData.skills.filter((_, idx) => idx !== i);
                      setEditedData({
                        ...editedData,
                        skills: updated,
                      });
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  {skill}
                </span>
              )
            ))}
            {editing && (
              <button
                onClick={() => {
                  setEditedData({
                    ...editedData,
                    skills: [...editedData.skills, ""],
                  });
                }}
                className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800"
              >
                + Add Skill
              </button>
            )}
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Experience ({editedData.experience.length})
          </h2>
          <div className="space-y-4">
            {editedData.experience.map((exp, i) => (
              <div key={i} className="border-l-4 border-blue-500 pl-4">
                <div className="font-semibold">
                  {editing ? (
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.title || ""}
                      onChange={(e) => {
                        const updated = [...editedData.experience];
                        updated[i].title = e.target.value;
                        setEditedData({
                          ...editedData,
                          experience: updated,
                        });
                      }}
                      className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                    />
                  ) : (
                    exp.title || "Job Title Not Found"
                  )}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {editing ? (
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.organization || ""}
                      onChange={(e) => {
                        const updated = [...editedData.experience];
                        updated[i].organization = e.target.value;
                        setEditedData({
                          ...editedData,
                          experience: updated,
                        });
                      }}
                      className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                    />
                  ) : (
                    exp.organization || "Company Not Found"
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {editing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Start Date"
                        value={exp.startDate || ""}
                        onChange={(e) => {
                          const updated = [...editedData.experience];
                          updated[i].startDate = e.target.value;
                          setEditedData({
                            ...editedData,
                            experience: updated,
                          });
                        }}
                        className="p-1 border rounded text-sm dark:bg-slate-700 dark:border-slate-600"
                      />
                      <span>-</span>
                      <input
                        type="text"
                        placeholder="End Date"
                        value={exp.endDate || ""}
                        onChange={(e) => {
                          const updated = [...editedData.experience];
                          updated[i].endDate = e.target.value;
                          setEditedData({
                            ...editedData,
                            experience: updated,
                          });
                        }}
                        className="p-1 border rounded text-sm dark:bg-slate-700 dark:border-slate-600"
                      />
                    </div>
                  ) : (
                    `${exp.startDate || ""} - ${exp.endDate || "Present"}`
                  )}
                </div>
                <div className="mt-2">
                  {editing ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Bullets:</span>
                        <button
                          onClick={() => {
                            const updated = [...editedData.experience];
                            updated[i].bullets = [...(updated[i].bullets || []), ""];
                            setEditedData({
                              ...editedData,
                              experience: updated,
                            });
                          }}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          + Add Bullet
                        </button>
                      </div>
                      {exp.bullets.map((bullet, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Bullet point"
                            value={bullet}
                            onChange={(e) => {
                              const updated = [...editedData.experience];
                              updated[i].bullets[j] = e.target.value;
                              setEditedData({
                                ...editedData,
                                experience: updated,
                              });
                            }}
                            className="flex-1 p-1 border rounded text-sm dark:bg-slate-700 dark:border-slate-600"
                          />
                          <button
                            onClick={() => {
                              const updated = [...editedData.experience];
                              updated[i].bullets = updated[i].bullets.filter((_, idx) => idx !== j);
                              setEditedData({
                                ...editedData,
                                experience: updated,
                              });
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    exp.bullets.length > 0 && (
                      <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {exp.bullets.map((bullet, j) => (
                          <li key={j}>• {bullet}</li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Education ({editedData.education.length})
          </h2>
          <div className="space-y-4">
            {editedData.education.map((edu, i) => (
              <div key={i} className="border-l-4 border-green-500 pl-4">
                <div className="font-semibold">
                  {editing ? (
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.credential || ""}
                      onChange={(e) => {
                        const updated = [...editedData.education];
                        updated[i].credential = e.target.value;
                        setEditedData({
                          ...editedData,
                          education: updated,
                        });
                      }}
                      className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                    />
                  ) : (
                    edu.credential || "Degree Not Found"
                  )}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {editing ? (
                    <input
                      type="text"
                      placeholder="School"
                      value={edu.institution || ""}
                      onChange={(e) => {
                        const updated = [...editedData.education];
                        updated[i].institution = e.target.value;
                        setEditedData({
                          ...editedData,
                          education: updated,
                        });
                      }}
                      className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                    />
                  ) : (
                    edu.institution || "School Not Found"
                  )}
                </div>
                {edu.field && (
                  <div className="text-sm text-gray-500">
                    {editing ? (
                      <input
                        type="text"
                        placeholder="Field of Study"
                        value={edu.field || ""}
                        onChange={(e) => {
                          const updated = [...editedData.education];
                          updated[i].field = e.target.value;
                          setEditedData({
                            ...editedData,
                            education: updated,
                          });
                        }}
                        className="w-full p-1 border rounded text-sm dark:bg-slate-700 dark:border-slate-600"
                      />
                    ) : (
                      edu.field
                    )}
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  {editing ? (
                    <div className="flex gap-2 items-center">
                      <span>Graduation:</span>
                      <input
                        type="text"
                        placeholder="End Date"
                        value={edu.endDate || ""}
                        onChange={(e) => {
                          const updated = [...editedData.education];
                          updated[i].endDate = e.target.value;
                          setEditedData({
                            ...editedData,
                            education: updated,
                          });
                        }}
                        className="p-1 border rounded text-sm dark:bg-slate-700 dark:border-slate-600"
                      />
                    </div>
                  ) : (
                    edu.endDate && `Graduated: ${edu.endDate}`
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
