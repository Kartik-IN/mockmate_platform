"use server";

import { db } from "@/firebase/admin";
import { unstable_noStore as noStore } from "next/cache";

export async function getInterviewById(params: GetInterviewByIdParams) {
    noStore();

    const { interviewId, userId } = params;

    try {
        const interviewDoc = await db.collection("interviews").doc(interviewId).get();

        if (!interviewDoc.exists) return null;

        const interview = interviewDoc.data() as Interview;

        if (interview.userId !== userId) return null;

        return {
            ...interview,
            id: interviewDoc.id,
        };
    } catch (error) {
        console.error("Error fetching interview:", error);
        return null;
    }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams) {
    noStore();

    const { interviewId, userId } = params;

    try {
        const feedbackSnapshot = await db
            .collection("feedback")
            .where("interviewId", "==", interviewId)
            .where("userId", "==", userId)
            .limit(1)
            .get();

        if (feedbackSnapshot.empty) return null;

        const feedbackDoc = feedbackSnapshot.docs[0];
        const feedback = feedbackDoc.data() as Omit<Feedback, "id">;

        return {
            id: feedbackDoc.id,
            ...feedback,
        };
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return null;
    }
}

export async function getLatestInterviews(params: GetLatestInterviewsParams) {
    noStore();

    const { userId, limit = 6 } = params;

    try {
        const snapshot = await db
            .collection("interviews")
            .where("userId", "==", userId)
            .get();

        const interviews = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const interview = doc.data() as Interview;
                const feedback = await getFeedbackByInterviewId({
                    interviewId: doc.id,
                    userId,
                });

                return {
                    ...interview,
                    id: doc.id,
                    feedback,
                } satisfies InterviewWithFeedback;
            })
        );

        return interviews
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, limit);
    } catch (error) {
        console.error("Error fetching latest interviews:", error);
        return [];
    }
}
