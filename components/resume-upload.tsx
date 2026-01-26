"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ResumeUploadProps {
  onUploadSuccess?: () => void;
}

export function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
      setUploadStatus("idle");
    } else {
      setUploadStatus("error");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
      setUploadStatus("idle");
    } else {
      setUploadStatus("error");
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    return validTypes.includes(file.type) && file.size < 10 * 1024 * 1024;
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Upload error:", data.error);
        setUploadStatus("error");
        return;
      }

      setUploadStatus("success");
      console.log("Resume uploaded:", data.resume);
      
      // Call the success callback to notify parent component
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div
        className={`relative rounded-2xl transition-all duration-300 overflow-hidden border-2 ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
            : uploadStatus === "success"
            ? "border-green-500/30 bg-green-50 dark:bg-green-950/20"
            : uploadStatus === "error"
            ? "border-red-500/30 bg-red-50 dark:bg-red-950/20"
            : "border-dashed border-gray-300 dark:border-slate-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Background gradient decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 pointer-events-none" />

        <div className="relative p-8 sm:p-12 space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center"
          >
            {uploadStatus === "success" ? (
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            ) : uploadStatus === "error" ? (
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
            ) : (
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center"
              >
                <Upload className="w-8 h-8 text-white" />
              </motion.div>
            )}
          </motion.div>

          <div className="text-center space-y-2">
            {uploadStatus === "success" ? (
              <>
                <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
                  Resume uploaded!
                </h2>
                <p className="text-green-700 dark:text-green-300">
                  Ready to analyze your resume
                </p>
              </>
            ) : uploadStatus === "error" ? (
              <>
                <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">
                  Invalid file
                </h2>
                <p className="text-red-700 dark:text-red-300">
                  Please upload a PDF or Word document (max 10MB)
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">Upload your resume</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Drag and drop or click to select
                </p>
              </>
            )}
          </div>

          <div className="flex items-center justify-center">
            <input
              type="file"
              id="resume-input"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label htmlFor="resume-input" className="cursor-pointer">
              <Button
                asChild
                variant="outline"
                className="border-2 border-gray-400 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400"
              >
                <span>Browse Files</span>
              </Button>
            </label>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            PDF, DOCX, or DOC (max 10MB)
          </p>

          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-gray-200 dark:border-slate-600"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)}MB
                  </p>
                </div>
                {uploadStatus === "success" && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
              </div>
            </motion.div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={!file || isLoading || uploadStatus === "success"}
            className="w-full py-6 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadStatus === "success" ? (
              "Resume Analyzed ✓"
            ) : isLoading ? (
              <motion.span
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Analyzing...
              </motion.span>
            ) : (
              "Analyze Resume"
            )}
          </Button>

          {isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              This may take up to 1 minute
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
