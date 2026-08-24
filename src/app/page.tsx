import { prisma } from "@/lib/prisma";
import AppTabs from "@/components/AppTabs";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [questions, drafts] = await Promise.all([
    prisma.question.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.draft.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:py-10">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
          Q
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Quizvraag</h1>
          <p className="text-sm text-neutral-500">Je persoonlijke vragenbank voor pubquizzen.</p>
        </div>
      </header>

      <AppTabs
        initialQuestions={JSON.parse(JSON.stringify(questions))}
        initialDrafts={JSON.parse(JSON.stringify(drafts))}
      />
    </main>
  );
}
