"use client";

import { FormEvent, useState } from "react";

interface ResumeInsights {
  candidateSummary: string;
  primarySkills: string[];
  projectHighlights: string[];
  interviewFocusAreas: string[];
}

const ResumeParserPanel = () => {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [insights, setInsights] = useState<ResumeInsights | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resumeText.trim()) {
      setError("Please paste your resume text before parsing.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/resume/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to parse resume right now.");
      }

      setInsights(data.data);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to parse resume right now.";
      setError(message);
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card-border mt-8">
      <div className="card p-6 sm:p-8 flex flex-col gap-4">
        <h3>Resume Parsing (AI)</h3>
        <p className="text-sm text-light-100">
          Paste your resume content to extract skills and prepare focused mock
          interview topics.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            className="w-full min-h-44 rounded-2xl border border-input bg-dark-200 p-4 text-sm text-white placeholder:text-light-400"
            placeholder="Paste resume text here..."
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
          />

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Parsing..." : "Parse Resume"}
          </button>
        </form>

        {error && <p className="text-destructive-100 text-sm">{error}</p>}

        {insights && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-primary-100">Summary</h4>
              <p className="mt-1 text-sm">{insights.candidateSummary}</p>
            </div>

            <div>
              <h4 className="font-semibold text-primary-100">Primary Skills</h4>
              <ul className="mt-1 text-sm">
                {insights.primarySkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-primary-100">Project Highlights</h4>
              <ul className="mt-1 text-sm">
                {insights.projectHighlights.map((project) => (
                  <li key={project}>{project}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-primary-100">Interview Focus</h4>
              <ul className="mt-1 text-sm">
                {insights.interviewFocusAreas.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResumeParserPanel;
