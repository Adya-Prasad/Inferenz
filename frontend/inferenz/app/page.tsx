import Image from "next/image";
import UploadCard from "./components/UploadCard";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen w-full font-sans">
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-8 px-6">
        <div className="flex items-center gap-4">
          <div className="rounded-full w-10 h-10 bg-gradient-to-br from-indigo-200 to-pink-200 flex items-center justify-center text-lg font-bold">AI</div>
          <div>
            <h1 className="text-lg font-semibold">Inferenz</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">AI data analysis for everyone</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex w-full flex-1 items-start justify-center px-6 pb-20">
        <div className="w-full max-w-3xl">
          <h2 className="text-3xl font-semibold mb-2 text-center">Upload your data</h2>
          <p className="text-center text-sm mb-6 text-zinc-700 dark:text-zinc-300">Choose a file and optionally enter a prompt. Our agents will extract, analyze and return insights.</p>

          <UploadCard />
        </div>
      </main>
    </div>
  );
}
