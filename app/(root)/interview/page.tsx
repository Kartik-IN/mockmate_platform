import { redirect } from "next/navigation";

import InterviewSetupForm from "@/components/InterviewSetupForm";
import ResumeParserPanel from "@/components/ResumeParserPanel";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/sign-in");
    }

    return (
        <section className="flex flex-col gap-8">
            <div className="max-w-2xl">
                <h3>Interview Generation</h3>
                <p className="mt-3 text-lg">
                    Parse your resume for sharper practice topics, then generate a
                    tailored mock interview for your target role.
                </p>
            </div>

            <ResumeParserPanel />
            <InterviewSetupForm user={user} />
        </section>
    );
};

export default Page;
