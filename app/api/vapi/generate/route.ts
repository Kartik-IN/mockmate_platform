export async function POST(request: Request) {
    const { type, role, level, techstack, amount, userid } =
        await request.json();

    try {
        const techs = techstack.split(",");

        const technicalQuestions = [
            `Explain how you would optimize performance in a ${role} application.`,
            `How does state management work in ${techs[0] || "modern frontend frameworks"}?`,
            `Describe how you handle API integration in ${techs[0] || "your stack"}.`,
            `How would you improve scalability in a ${role} system?`,
            `What are best practices for error handling in ${techs[0] || "applications"}?`,
            `How do you approach debugging complex production issues?`,
            `Explain how you would design a maintainable component architecture.`,
        ];

        const behaviouralQuestions = [
            `Tell me about a challenging project you worked on as a ${role}.`,
            `How do you handle tight deadlines?`,
            `Describe a time you resolved a team conflict.`,
            `How do you stay updated with new technologies?`,
            `Describe a situation where you improved a process.`,
            `How do you handle feedback from peers or managers?`,
            `What motivates you in your role as a ${role}?`,
        ];

        const pool =
            type === "technical"
                ? technicalQuestions
                : behaviouralQuestions;

        const questions = pool.slice(0, Number(amount));

        const interview = {
            role,
            type,
            level,
            techstack: techs,
            questions,
            userId: userid,
            finalized: true,
            createdAt: new Date().toISOString(),
        };

        return Response.json({ success: true, questions });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false }, { status: 500 });
    }
}
