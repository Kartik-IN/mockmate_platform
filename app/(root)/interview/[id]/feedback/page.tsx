import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbackByInterviewId } from "@/lib/actions/interview.action";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const feedback = await getFeedbackByInterviewId({
        interviewId: id,
        userId: user.id,
    });

    if (!feedback) {
        notFound();
    }

    return (
        <section className="section-feedback">
            <div className="flex flex-col gap-3">
                <p className="text-sm uppercase tracking-[0.3em] text-primary-200">
                    Interview Feedback
                </p>
                <h2>{feedback.totalScore}/100 Overall Score</h2>
                <p>{feedback.finalAssessment}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {feedback.categoryScores.map((category) => (
                    <div className="card-border w-full" key={category.name}>
                        <div className="card p-5 flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-4">
                                <h3 className="text-xl">{category.name}</h3>
                                <span className="text-primary-200 font-semibold">
                                    {category.score}/100
                                </span>
                            </div>
                            <p>{category.comment}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="card-border w-full">
                    <div className="card p-5 flex flex-col gap-3">
                        <h3 className="text-xl">Strengths</h3>
                        <ul className="space-y-2">
                            {feedback.strengths.map((strength) => (
                                <li key={strength}>{strength}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="card-border w-full">
                    <div className="card p-5 flex flex-col gap-3">
                        <h3 className="text-xl">Areas to Improve</h3>
                        <ul className="space-y-2">
                            {feedback.areasForImprovement.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="buttons">
                <Link className="btn-secondary" href="/">
                    Back to Dashboard
                </Link>
                <Link className="btn-primary" href={`/interview/${id}`}>
                    Retake Interview
                </Link>
            </div>
        </section>
    );
};

export default Page;
