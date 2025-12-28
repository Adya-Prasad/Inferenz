
"use client";
import { useEffect, useState } from "react";
import UploadCard from "./components/UploadCard";
import AnimatedWords from "./components/AnimatedWords";

export default function Home() {
  // initializes a React state variable named: theme: dark
  const [theme, setTheme] = useState<string>("dark");
  //  flag to know when the component has successfully mounted on the client-side
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    //  Checks if a theme preference (either "light" or "dark") has been previously saved in the user's browser localStorage.
    const stored = localStorage.getItem("theme");
    const init = stored || "dark";
    setTheme(init);
    document.documentElement.setAttribute("data-theme", init);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    // saves the new theme choice to localStorage, so the browser will remember it for the user's next visit.
    if (typeof window !== "undefined") localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <div className="min-h-screen w-full font-sans main-page">
      <header className="site-header">
        <div className="site-brand">
          <div className="site-logo"><Logo/></div>
          <div className="site-title">Inferenz</div>
        </div>

        <nav className="site-nav">
          <a href="#docs">Docs</a>
          <button aria-label="Account" className="icon-btn" style={{ borderRadius: 999 }}>
            <ProfileIcon/>
          </button>

          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="icon-btn"
            title={theme === "light" ? "Switch to dark" : "Switch to light"}
          >
            {mounted ? (theme === "light" ? <LightThemIcon /> : <DarkThemeIcon />) : <LightThemIcon />}
          </button>
        </nav>
      </header>

      <main className="hero" role="main">
        <h1>
          Extract <span className="animated-word"><AnimatedWords words={["Insights", "Visualization", "Prediction"]} /></span> from your unstructured data
        </h1>
        <p className="subtitle">Upload Your Structured and Unstructured Data of Any Format: Images, Ledgers, PDFs, Screenshot, Excel, CSV or JSON to Get its Analysis, Insights, Visualization, Storytellings and Predicttions</p>

        <div><UploadCard/></div>
        
      </main>
    </div>
  );
}
const Logo = () => (
  <svg className="site-logo" viewBox="0 0 24 24" fill="none" width="24" height="24" aria-hidden="true">
    <circle cx="16" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth={2} />
    <path d="M21,15l-2.83-2.83M13,10a3,3,0,1,0,3-3A3,3,0,0,0,13,10Zm0,7H7m2-4H7" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17,17v3a1,1,0,0,1-1,1H4a1,1,0,0,1-1-1V4A1,1,0,0,1,4,3H16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
<path d="M22 12C22 6.49 17.51 2 12 2C6.49 2 2 6.49 2 12C2 14.9 3.25 17.51 5.23 19.34C5.23 19.35 5.23 19.35 5.22 19.36C5.32 19.46 5.44 19.54 5.54 19.63C5.6 19.68 5.65 19.73 5.71 19.77C5.89 19.92 6.09 20.06 6.28 20.2C6.35 20.25 6.41 20.29 6.48 20.34C6.67 20.47 6.87 20.59 7.08 20.7C7.15 20.74 7.23 20.79 7.3 20.83C7.5 20.94 7.71 21.04 7.93 21.13C8.01 21.17 8.09 21.21 8.17 21.24C8.39 21.33 8.61 21.41 8.83 21.48C8.91 21.51 8.99 21.54 9.07 21.56C9.31 21.63 9.55 21.69 9.79 21.75C9.86 21.77 9.93 21.79 10.01 21.8C10.29 21.86 10.57 21.9 10.86 21.93C10.9 21.93 10.94 21.94 10.98 21.95C11.32 21.98 11.66 22 12 22C12.34 22 12.68 21.98 13.01 21.95C13.05 21.95 13.09 21.94 13.13 21.93C13.42 21.9 13.7 21.86 13.98 21.8C14.05 21.79 14.12 21.76 14.2 21.75C14.44 21.69 14.69 21.64 14.92 21.56C15 21.53 15.08 21.5 15.16 21.48C15.38 21.4 15.61 21.33 15.82 21.24C15.9 21.21 15.98 21.17 16.06 21.13C16.27 21.04 16.48 20.94 16.69 20.83C16.77 20.79 16.84 20.74 16.91 20.7C17.11 20.58 17.31 20.47 17.51 20.34C17.58 20.3 17.64 20.25 17.71 20.2C17.91 20.06 18.1 19.92 18.28 19.77C18.34 19.72 18.39 19.67 18.45 19.63C18.56 19.54 18.67 19.45 18.77 19.36C18.77 19.35 18.77 19.35 18.76 19.34C20.75 17.51 22 14.9 22 12ZM16.94 16.97C14.23 15.15 9.79 15.15 7.06 16.97C6.62 17.26 6.26 17.6 5.96 17.97C4.44 16.43 3.5 14.32 3.5 12C3.5 7.31 7.31 3.5 12 3.5C16.69 3.5 20.5 7.31 20.5 12C20.5 14.32 19.56 16.43 18.04 17.97C17.75 17.6 17.38 17.26 16.94 16.97Z" fill="currentColor"/>
<path d="M12 6.92969C9.93 6.92969 8.25 8.60969 8.25 10.6797C8.25 12.7097 9.84 14.3597 11.95 14.4197C11.98 14.4197 12.02 14.4197 12.04 14.4197C12.06 14.4197 12.09 14.4197 12.11 14.4197C12.12 14.4197 12.13 14.4197 12.13 14.4197C14.15 14.3497 15.74 12.7097 15.75 10.6797C15.75 8.60969 14.07 6.92969 12 6.92969Z" fill="currentColor"/>
</svg>
);

const LightThemIcon = () => (
  <svg viewBox="0 0 64 32" width="40" height="25"><rect x="2" y="2" width="60" height="28" rx="14" ry="14"         fill="none" stroke="currentColor" strokeWidth="2"/><g transform="translate(16, 16)"><circle cx="0" cy="0" r="5" 
fill="currentColor" stroke="currentColor" strokeWidth="1.5"/><line x1="0" y1="-8.5" x2="0" y2="-9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="6.01" y1="-6.01" x2="6.72" y2="-6.72" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="8.5" y1="0" x2="9.5" y2="0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="6.01" y1="6.01" x2="6.72" y2="6.72" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="0" y1="8.5" x2="0" y2="9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="-6.01" y1="6.01" x2="-6.72" y2="6.72" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="-8.5" y1="0" x2="-9.5" y2="0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="-6.01" y1="-6.01" x2="-6.72" y2="-6.72" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></g></svg>
);

const DarkThemeIcon = () => (
  <svg viewBox="0 0 64 32" width="40" height="32"><rect x="2" y="2" width="60" height="28" rx="14" ry="14" fill="none" stroke="currentColor" strokeWidth="2"/><g transform="translate(48, 16)"><path d="M -2,-8 C 1,-8 3.5,-6 5,-3 C 2,-4.5 -1,-3.5 -1,0 C -1,3.5 2,4.5 5,3 C 3.5,6 1,8 -2,8 C -6.4,8 -10,4.4 -10,0 C -10,-4.4 -6.4,-8 -2,-8 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></g></svg>
)