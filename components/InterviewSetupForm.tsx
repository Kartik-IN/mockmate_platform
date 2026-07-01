"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const defaultFormState = {
    role: "",
    level: "Mid-Level",
    type: "mixed" as GenerateInterviewParams["type"],
    techstack: "",
    amount: 6,
    company: "",
    focus: "",
    resumeHighlights: "",
};

const InterviewSetupForm = ({ user }: { user: User }) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [formState, setFormState] = useState(defaultFormState);

    const handleChange = (
        field: keyof typeof defaultFormState,
        value: string | number
    ) => {
        setFormState((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        startTransition(async () => {
            try {
                const response = await fetch("/api/vapi/generate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...formState,
                        userid: user.id,
                    }),
                });

                const data = await response.json();

                if (!response.ok || !data.success || !data.interviewId) {
                    toast.error(data.message ?? "Unable to generate the interview.");
                    return;
                }

                toast.success("Interview generated. Your AI interviewer is ready.");
                router.push(`/interview/${data.interviewId}`);
            } catch (error) {
                console.error(error);
                toast.error("Something went wrong while generating the interview.");
            }
        });
    };

    return (
        <div className="card-border w-full">
            <div className="card p-8 sm:p-10 w-full">
                <div className="flex flex-col gap-3 max-w-2xl">
                    <p className="text-sm uppercase tracking-[0.3em] text-primary-200">
                        AI Interview Studio
                    </p>
                    <h2>Build a personalized interview that feels real</h2>
                    <p className="text-lg">
                        Tell MockMate what role you are targeting, what stack you use,
                        and what you want to be challenged on. We&apos;ll generate the
                        question set before Vapi starts the interview.
                    </p>
                </div>

                <form className="form mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="label" htmlFor="role">
                                Target role
                            </label>
                            <Input
                                id="role"
                                className="input"
                                placeholder="Frontend Developer"
                                value={formState.role}
                                onChange={(event) =>
                                    handleChange("role", event.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="label" htmlFor="level">
                                Experience level
                            </label>
                            <select
                                id="level"
                                className="input"
                                value={formState.level}
                                onChange={(event) =>
                                    handleChange("level", event.target.value)
                                }
                            >
                                <option value="Intern">Intern</option>
                                <option value="Junior">Junior</option>
                                <option value="Mid-Level">Mid-Level</option>
                                <option value="Senior">Senior</option>
                                <option value="Lead">Lead</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="label" htmlFor="type">
                                Interview style
                            </label>
                            <select
                                id="type"
                                className="input"
                                value={formState.type}
                                onChange={(event) =>
                                    handleChange(
                                        "type",
                                        event.target.value as GenerateInterviewParams["type"]
                                    )
                                }
                            >
                                <option value="mixed">Mixed</option>
                                <option value="technical">Technical</option>
                                <option value="behavioral">Behavioral</option>
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <label className="label" htmlFor="amount">
                                Question count
                            </label>
                            <Input
                                id="amount"
                                className="input"
                                min={4}
                                max={10}
                                type="number"
                                value={formState.amount}
                                onChange={(event) =>
                                    handleChange(
                                        "amount",
                                        Number(event.target.value || 6)
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="label" htmlFor="techstack">
                            Tech stack
                        </label>
                        <Input
                            id="techstack"
                            className="input"
                            placeholder="React, Next.js, TypeScript, Firebase"
                            value={formState.techstack}
                            onChange={(event) =>
                                handleChange("techstack", event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="label" htmlFor="company">
                                Company style
                            </label>
                            <Input
                                id="company"
                                className="input"
                                placeholder="Google, startup, product company"
                                value={formState.company}
                                onChange={(event) =>
                                    handleChange("company", event.target.value)
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="label" htmlFor="focus">
                                Focus area
                            </label>
                            <Input
                                id="focus"
                                className="input"
                                placeholder="System design, React depth, communication"
                                value={formState.focus}
                                onChange={(event) =>
                                    handleChange("focus", event.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="label" htmlFor="resumeHighlights">
                            Resume highlights
                        </label>
                        <textarea
                            id="resumeHighlights"
                            className="input min-h-32 resize-y rounded-3xl px-5 py-4"
                            placeholder="Paste projects, impact points, tools, or leadership wins so the interview feels more personal."
                            value={formState.resumeHighlights}
                            onChange={(event) =>
                                handleChange("resumeHighlights", event.target.value)
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-light-400">
                            Signed in as {user.name}. The generated interview will be
                            saved to your dashboard.
                        </p>
                        <Button
                            className="btn-primary w-full sm:w-auto"
                            disabled={isPending}
                            type="submit"
                        >
                            {isPending ? "Generating..." : "Generate Interview"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InterviewSetupForm;
