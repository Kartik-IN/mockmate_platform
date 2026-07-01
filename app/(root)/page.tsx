import Link from "next/link";
import Image from "next/image"

import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getLatestInterviews } from "@/lib/actions/interview.action";


const Page = async () => {
    const user = await getCurrentUser();
    const interviews = user
        ? await getLatestInterviews({ userId: user.id, limit: 6 })
        : [];

    const completedInterviews = interviews.filter((interview) => interview.feedback);
    const pendingInterviews = interviews.filter((interview) => !interview.feedback);

    return (
      <>
          <section className="card-cta">
              <div className="flex flex-col gap-6 max-w-lg">
                  <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
                  <p className="text-lg">
                      Generate personalized questions, run a voice interview, and get instant feedback on your performance.
                  </p>
                  <button className="btn-primary max-sm:w-full">
                      <Link href="/interview">Start an Interview</Link>
                  </button>
              </div>
              <Image src="/robot.png" alt="robo-dude" width={400} height={400} className="max-sm:hidden" />
          </section>
          <section className="flex flex-col gap-6 mt-8">
              <h2>Your Interviews</h2>
              <div className="interviews-section">
                  {user && interviews.length === 0 && (
                      <p>You haven&apos;t generated an interview yet. Create one to see it here.</p>
                  )}
                  {!user && (
                      <p>Sign in to save interviews, see feedback, and build a real practice history.</p>
                  )}
                  {interviews.map((interview) => (
                      <InterviewCard {...interview} key={interview.id}/>
                  ))}
              </div>
          </section>
          <section className="flex flex-col gap-6 mt-8">
              <h2>Next Best Step</h2>
              <div className="interviews-section">
                  {pendingInterviews.length > 0 &&
                      pendingInterviews.map((interview) => (
                          <InterviewCard {...interview} key={interview.id}/>
                      ))}
                  {pendingInterviews.length === 0 && completedInterviews.length > 0 &&
                      completedInterviews.map((interview) => (
                          <InterviewCard {...interview} key={interview.id}/>
                      ))}
                  {interviews.length === 0 && (
                      <div className="card-border w-full">
                          <div className="card-interview">
                              <div className="flex flex-col gap-3">
                                  <h3>Create your first personalized mock interview</h3>
                                  <p>
                                      Add your role, stack, company target, and resume highlights so the AI interviewer can challenge you with more realistic questions.
                                  </p>
                              </div>
                              <Link href="/interview" className="btn-primary">
                                  Generate Interview
                              </Link>
                          </div>
                      </div>
                  )}
              </div>
          </section>
      </>
    )
}
export default Page
