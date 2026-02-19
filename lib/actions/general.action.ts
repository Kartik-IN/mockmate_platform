"use server";



import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

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

        const feedbackObject = {
            totalScore: baseScore,
            categoryScores: {
                communicationSkills: baseScore - 5,
                technicalKnowledge: baseScore - 8,
                problemSolving: baseScore - 6,
                culturalFit: baseScore - 4,
                confidence: baseScore - 7,
            },
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
        };

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

        return { success: true, feedbackId: feedbackRef.id };
    } catch (error) {
        console.error("Error saving feedback:", error);
        return { success: false };
    }
}