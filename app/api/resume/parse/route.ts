import OpenAI from "openai";
import { z } from "zod";

const resumeInsightsSchema = z.object({
  candidateSummary: z.string(),
  primarySkills: z.array(z.string()).max(8),
  projectHighlights: z.array(z.string()).max(5),
  interviewFocusAreas: z.array(z.string()).max(5),
});

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const extractJSONObject = (value: string) => {
  const match = value.match(/\{[\s\S]*\}/);
  return match ? match[0] : value;
};

export async function POST(request: Request) {
  try {
    const { resumeText } = await request.json();

    if (!resumeText || typeof resumeText !== "string") {
      return Response.json(
        { success: false, error: "resumeText is required" },
        { status: 400 }
      );
    }

    if (!openai) {
      return Response.json(
        { success: false, error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const prompt = `You are a resume parser for mock interview preparation.
Extract concise and accurate insights from this resume.

Resume:
${resumeText}

Rules:
- Keep candidateSummary to 2-3 sentences.
- Include practical, interview-relevant skills only.
- Project highlights should be short bullets.
- Interview focus areas should be actionable topics interviewers can ask about.
- Return valid JSON only with these keys: candidateSummary, primarySkills, projectHighlights, interviewFocusAreas.`;

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      input: prompt,
    });

    const object = resumeInsightsSchema.parse(
      JSON.parse(extractJSONObject(response.output_text))
    );

    return Response.json({ success: true, data: object }, { status: 200 });
  } catch (error) {
    console.error("Resume parse error", error);
    return Response.json(
      { success: false, error: "Unable to parse resume" },
      { status: 500 }
    );
  }
}
