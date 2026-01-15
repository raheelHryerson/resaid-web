"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type GeneratedAnswer = {
  question: string;
  answer: string;
  pointers: string[];
};

export default function ResumeAnswersPage() {
  const params = useParams();
  const resumeId = params?.resumeId as string;

  const [jobDescription, setJobDescription] = useState("");
  const [questionsText, setQuestionsText] = useState("");
  const [tone, setTone] = useState<"neutral" | "concise" | "detailed">("neutral");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<GeneratedAnswer[]>([]);
  const [model, setModel] = useState<string>("");

  useEffect(() => {
    setError(null);
  }, [resumeId]);

  async function onGenerate() {
    setLoading(true);
    setError(null);
    setAnswers([]);
    try {
      const questions = questionsText
        .split(/\r?\n/)
        .map((q) => q.trim())
        .filter(Boolean);

      const res = await fetch(`/api/resumes/${resumeId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, questions, tone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate answers");
      }

      setAnswers(data.answers || []);
      setModel(data.model || "");
    } catch (e: any) {
      setError(e?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">AI Answer Generation</h1>
      <p className="text-sm text-gray-600">
        Provide a job description and the questions you want answered.
      </p>

      <div className="space-y-2">
        <label className="text-sm font-medium">Job Description</label>
        <textarea
          className="w-full border rounded p-2 h-40"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Questions (one per line)</label>
        <textarea
          className="w-full border rounded p-2 h-32"
          value={questionsText}
          onChange={(e) => setQuestionsText(e.target.value)}
          placeholder={"e.g.\nWhy do you want this role?\nDescribe a project that fits this position."}
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Tone</label>
        <select
          className="border rounded p-2"
          value={tone}
          onChange={(e) => setTone(e.target.value as any)}
        >
          <option value="neutral">Neutral</option>
          <option value="concise">Concise</option>
          <option value="detailed">Detailed</option>
        </select>
        <button
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          onClick={onGenerate}
          disabled={loading}
        >
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      {error && (
        <div className="p-3 border border-red-300 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {model && (
        <p className="text-xs text-gray-500">Model: {model}</p>
      )}

      <div className="space-y-4">
        {answers.map((a, idx) => (
          <div key={idx} className="border rounded p-4">
            <div className="font-medium">Q{idx + 1}. {a.question}</div>
            <div className="mt-2 whitespace-pre-wrap">{a.answer}</div>
            {a.pointers?.length > 0 && (
              <ul className="mt-3 list-disc pl-5 text-sm text-gray-700">
                {a.pointers.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
