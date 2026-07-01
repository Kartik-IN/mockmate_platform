"use server";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import { revalidatePath } from "next/cache";

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, feedbackId } = params;

    try {
        const formattedTranscript = transcript
            .map(
                (sentence: { role: string; content: string }) =>
                    `- ${sentence.role}: ${sentence.content}\n`
            )
            .join("");

        // Simple scoring logic based on transcript length
        const transcriptLength = formattedTranscript.length;

        const baseScore = Math.min(90, Math.max(60, Math.floor(transcriptLength / 20)));

        const feedbackObject = feedbackSchema.parse({
            totalScore: baseScore,
            categoryScores: [
                {
                    name: "Communication Skills",
                    score: baseScore - 5,
                    comment: "Your answers were understandable and mostly structured.",
                },
                {
                    name: "Technical Knowledge",
                    score: baseScore - 8,
                    comment: "You showed the fundamentals, with room for deeper technical detail.",
                },
                {
                    name: "Problem Solving",
                    score: baseScore - 6,
                    comment: "You demonstrated logical thinking, but some answers could be more methodical.",
                },
                {
                    name: "Cultural Fit",
                    score: baseScore - 4,
                    comment: "Your collaboration mindset came through clearly in the conversation.",
                },
                {
                    name: "Confidence and Clarity",
                    score: baseScore - 7,
                    comment: "You were clear overall, though a few responses could sound more decisive.",
                },
            ],
            strengths: [
                "Demonstrates clear communication in responses.",
                "Shows understanding of core concepts.",
                "Maintains structured answers during discussion.",
            ],
            areasForImprovement: [
                "Could provide more detailed technical explanations.",
                "Improve confidence while answering complex questions.",
                "Add more real-world examples to strengthen responses.",
            ],
            finalAssessment:
                "The candidate shows solid foundational knowledge and communication skills. With deeper technical elaboration and stronger confidence, performance can significantly improve.",
        });

        const feedback = {
            interviewId,
            userId,
            ...feedbackObject,
            createdAt: new Date().toISOString(),
        };

        let feedbackRef;

        if (feedbackId) {
            feedbackRef = db.collection("feedback").doc(feedbackId);
        } else {
            feedbackRef = db.collection("feedback").doc();
        }

        await feedbackRef.set(feedback);

        revalidatePath("/");
        revalidatePath(`/interview/${interviewId}`);
        revalidatePath(`/interview/${interviewId}/feedback`);

        return { success: true, feedbackId: feedbackRef.id };
    } catch (error) {
        console.error("Error saving feedback:", error);
        return { success: false };
    }
}
