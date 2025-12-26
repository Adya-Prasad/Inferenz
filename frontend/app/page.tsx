import Image from "next/image";
import UploadCard from "./components/UploadCard";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen w-full font-sans main-page">
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-8 px-6 container">
        <div className="flex items-center gap-4">
          <div className="rounded-full w-10 h-10 bg-gradient-to-br from-indigo-200 to-pink-200 flex items-center justify-center text-lg font-bold">AI</div>
          <div>
            <h1 className="text-lg font-semibold text-white">Inferenz</h1>
            <p className="text-xs text-zinc-200">AI data analysis for everyone</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex w-full flex-1 items-start justify-center px-6 pb-20 container">
        <div className="w-full max-w-3xl">
          <a className="gift-card-btn" href="#">
            <span className="gift-icon">🎁</span>
            <span>Try the demo — 3 free credits</span>
          </a>

          <h1 className="main-title">Welcome to Inferenz <span className="heart">❤️</span></h1>
          <p className="subtitle">Upload a file and ask a question — our agents will respond with insights and a summary.</p>

          <div className="chat-box">
            <div className="input-wrapper">
              <input className="main-input" placeholder="Ask a question or type a command" />
              <div className="status-indicators">
                <div className="status-dot">A</div>
              </div>
            </div>

            <div className="controls">
              <div className="left-controls">
                <button className="icon-btn">Attach</button>
                <button className="icon-btn">Options</button>
              </div>
              <div className="right-controls">
                <button className="icon-btn send-btn">Send</button>
              </div>
            </div>

            <div className="mt-6">
              <UploadCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
