"use client";

import { useState, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState("application/pdf");
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function upload() {
    if (!file) return setStatus("Please choose a file first.");
    setLoading(true);
    setStatus(null);
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      // optionally send prompt as a header/query param later

      const res = await fetch(`${API_URL}/api/v1/datasources/`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const text = await res.text();
        setStatus(`Upload failed: ${res.status} ${text}`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStatus(`Uploaded: ${data.file_name} (id=${data.id})`);
    } catch (err: any) {
      setStatus(`Error: ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="upload-card max-w-2xl w-full mx-auto rounded-2xl border border-transparent bg-white/[0.6] dark:bg-black/[0.28] p-8 backdrop-blur-md backdrop-saturate-125">
      <h2 className="text-2xl font-semibold mb-2">Upload data to analyze</h2>
      <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-6">Drop files or use the button to select (PDF, image, CSV, TXT).</p>

      <div className="flex flex-col gap-4">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Optional prompt (e.g., show milk transactions)"
          className="rounded-lg border border-white/[0.5] bg-transparent px-4 py-3 outline-none text-sm placeholder:text-zinc-500"
        />

        <div className="flex items-center gap-3">
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="rounded-lg border border-white/[0.5] bg-transparent px-3 py-2 text-sm"
          >
            <option value="application/pdf">PDF</option>
            <option value="text/plain">TXT</option>
            <option value="text/csv">CSV</option>
            <option value="application/json">JSON</option>
            <option value="image/png">Image (PNG/JPG)</option>
          </select>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/[0.5] px-3 py-2 text-sm">
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.csv,.json,.png,.jpg,.jpeg"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                if (f) setFileType(f.type || "application/octet-stream");
              }}
              className="hidden"
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 3v12" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 7l4-4 4 4" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 21H3" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">{file ? file.name : "Choose file"}</span>
          </label>

          <button
            onClick={upload}
            disabled={loading}
            className="ml-auto flex items-center gap-2 rounded-full bg-indigo-100/70 px-4 py-2 text-sm font-medium text-indigo-900 hover:bg-indigo-200/80 disabled:opacity-60"
          >
            {loading ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="10" stroke="#111827" strokeWidth="2" strokeDasharray="31.4 31.4" fill="none"></circle>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M22 2L11 13" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <span>{loading ? "Uploading..." : "Send"}</span>
          </button>
        </div>

        {status && <div className="mt-3 text-sm text-zinc-700 dark:text-zinc-200">{status}</div>}
      </div>
    </div>
  );
}
