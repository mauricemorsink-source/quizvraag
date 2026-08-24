import { prisma } from "@/lib/prisma";
import QuestionList from "@/components/QuestionList";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const questions = await prisma.question.findMany({ orderBy: { createdAt: "desc" } });
  const categories = Array.from(new Set(questions.map((q) => q.category))).sort();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Quizvraag</h1>
          <p className="text-sm text-neutral-500">Je persoonlijke vragenbank voor pubquizzen.</p>
        </div>
        <LogoutButton />
      </header>

      <QuestionList
        initialQuestions={JSON.parse(JSON.stringify(questions))}
        initialCategories={categories}
      />
    </main>
  );
}
