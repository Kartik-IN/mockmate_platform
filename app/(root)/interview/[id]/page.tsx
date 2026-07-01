import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
    getFeedbackByInterviewId,
    getInterviewById,
} from "@/lib/actions/interview.action";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const interview = await getInterviewById({
        interviewId: id,
        userId: user.id,
    });

    if (!interview) {
        notFound();
    }

    const feedback = await getFeedbackByInterviewId({
        interviewId: id,
        userId: user.id,
    });

    const interviewContext = [
        `Role: ${interview.role}`,
        `Level: ${interview.level}`,
        `Interview type: ${interview.type}`,
        interview.company ? `Company style: ${interview.company}` : "",
        interview.focus ? `Focus area: ${interview.focus}` : "",
        interview.resumeHighlights
            ? `Resume highlights: ${interview.resumeHighlights}`
            : "",
    ]
        .filter(Boolean)
        .join("\n");

    return (
        <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-3 text-sm text-light-400">
                    <span>{interview.level}</span>
                    <span>{interview.type}</span>
                    {interview.company && <span>{interview.company}</span>}
                </div>
                <h3>{interview.role} Interview</h3>
                <p className="text-lg">
                    Your question set is ready. Start the voice interview when you
                    feel ready, and MockMate will score the session afterward.
                </p>
                {feedback && (
                    <Link
                        href={`/interview/${id}/feedback`}
                        className="btn-secondary w-fit"
                    >
                        View Latest Feedback
                    </Link>
                )}
            </div>

            <div className="card-border w-full">
                <div className="card p-6 sm:p-8">
                    <div className="grid gap-3">
                        <p className="text-sm uppercase tracking-[0.3em] text-primary-200">
                            Generated Questions
                        </p>
                        <ul className="space-y-2">
                            {interview.questions.map((question) => (
                                <li key={question}>{question}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <Agent
                interviewId={interview.id}
                interviewContext={interviewContext}
                questions={interview.questions}
                type="interview"
                userId={user.id}
                userName={user.name}
            />
        </section>
    );
};

export default Page;
