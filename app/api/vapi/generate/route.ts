import OpenAI from "openai";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/firebase/admin";

const generateInterviewSchema = z.object({
    role: z.string().trim().min(2),
    level: z.string().trim().min(2),
    type: z.enum(["technical", "behavioral", "mixed"]),
    techstack: z.union([z.string(), z.array(z.string())]),
    amount: z.coerce.number().int().min(4).max(10),
    userid: z.string().trim().min(1),
    company: z.string().trim().optional().default(""),
    focus: z.string().trim().optional().default(""),
    resumeHighlights: z.string().trim().optional().default(""),
});

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

const buildFallbackQuestions = ({
    role,
    type,
    level,
    techstack,
    amount,
    company,
    focus,
    resumeHighlights,
}: Omit<GenerateInterviewParams, "userid">) => {
    const primaryTech = techstack[0] || "your primary stack";
    const personalizedContext = company
        ? ` for a ${company} style interview`
        : "";
    const focusSuffix = focus ? ` with extra attention on ${focus}` : "";
    const resumeSuffix = resumeHighlights
        ? ` based on the candidate's background: ${resumeHighlights}`
        : "";

    const technicalQuestions = [
        `Walk me through how you would design and build a ${level} ${role} project using ${primaryTech}${personalizedContext}.`,
        `What trade-offs do you consider when choosing architecture and libraries for a ${role} application${focusSuffix}?`,
        `Describe a production issue you might face in ${primaryTech} and how you would debug it step by step.`,
        `How would you improve performance, maintainability, and scalability in a ${role} codebase?`,
        `Explain how you test, review, and safely ship changes in a modern ${role} workflow.`,
        `Tell me about a project where you used ${techstack.join(", ") || primaryTech}${resumeSuffix}. What was your contribution?`,
        `If you were asked to mentor a junior teammate on this stack, what concepts would you prioritize first?`,
    ];

    const behavioralQuestions = [
        `Tell me about yourself and why you're targeting ${role} opportunities at the ${level} level${personalizedContext}.`,
        `Describe a challenging project you worked on${resumeSuffix} and how you handled pressure or ambiguity.`,
        `Tell me about a time you received tough feedback. What changed afterward?`,
        `How do you communicate trade-offs and progress to teammates or stakeholders?`,
        `Describe a situation where you had to learn a new technology quickly to deliver results.`,
        `What kind of team environment helps you do your best work, and how do you contribute to it?`,
        `Why are you a strong fit for this ${role} role${focusSuffix}?`,
    ];

    const mixedQuestions = [
        technicalQuestions[0],
        behavioralQuestions[0],
        technicalQuestions[2],
        behavioralQuestions[1],
        technicalQuestions[4],
        behavioralQuestions[3],
        technicalQuestions[5],
        behavioralQuestions[6],
    ];

    const questionPool =
        type === "technical"
            ? technicalQuestions
            : type === "behavioral"
              ? behavioralQuestions
              : mixedQuestions;

    return questionPool.slice(0, amount);
};

const extractJSONArray = (value: string) => {
    const match = value.match(/\[[\s\S]*\]/);
    return match ? match[0] : value;
};

const generateQuestionsWithAI = async (
    params: Omit<GenerateInterviewParams, "userid">
) => {
    if (!openai) {
        return buildFallbackQuestions(params);
    }

    const prompt = [
        "Generate polished mock interview questions as a JSON array of strings.",
        `Role: ${params.role}`,
        `Level: ${params.level}`,
        `Interview type: ${params.type}`,
        `Tech stack: ${params.techstack.join(", ") || "Not provided"}`,
        `Target company style: ${params.company || "General"}`,
        `Special focus: ${params.focus || "Balanced assessment"}`,
        `Resume highlights: ${params.resumeHighlights || "Not provided"}`,
        `Question count: ${params.amount}`,
        "Rules:",
        "- Return valid JSON only.",
        "- Do not number the questions.",
        "- Keep each question specific and interview-ready.",
        "- Mix conceptual, experience-based, and follow-up style questions.",
        "- Personalize at least half the questions using the provided stack, company, focus, or resume highlights when available.",
        "- Avoid repeating the same wording.",
    ].join("\n");

    try {
        const response = await openai.responses.create({
            model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
            input: prompt,
        });

        const parsed = z.array(z.string().min(12)).parse(
            JSON.parse(extractJSONArray(response.output_text))
        );

        const cleanedQuestions = parsed
            .map((question) => question.trim())
            .filter(Boolean)
            .slice(0, params.amount);

        if (cleanedQuestions.length >= params.amount) {
            return cleanedQuestions;
        }
    } catch (error) {
        console.error("Error generating questions with OpenAI:", error);
    }

    return buildFallbackQuestions(params);
};

export async function POST(request: Request) {
    try {
        const payload = generateInterviewSchema.parse(await request.json());

        const techstack = Array.isArray(payload.techstack)
            ? payload.techstack
            : payload.techstack
                  .split(",")
                  .map((tech) => tech.trim())
                  .filter(Boolean);

        const questions = await generateQuestionsWithAI({
            role: payload.role,
            level: payload.level,
            type: payload.type,
            techstack,
            amount: payload.amount,
            company: payload.company,
            focus: payload.focus,
            resumeHighlights: payload.resumeHighlights,
        });

        const interview = {
            role: payload.role,
            type: payload.type,
            level: payload.level,
            techstack,
            questions,
            userId: payload.userid,
            finalized: true,
            company: payload.company,
            focus: payload.focus,
            resumeHighlights: payload.resumeHighlights,
            generatedBy: openai ? "openai" : "fallback",
            createdAt: new Date().toISOString(),
        };

        const interviewRef = db.collection("interviews").doc();
        await interviewRef.set(interview);

        revalidatePath("/");
        revalidatePath(`/interview/${interviewRef.id}`);

        return Response.json({
            success: true,
            interviewId: interviewRef.id,
            questions,
        });
    } catch (error) {
        console.error("Error generating interview:", error);

        return Response.json(
            {
                success: false,
                message: "Unable to generate interview questions right now.",
            },
            { status: 500 }
        );
    }
}
