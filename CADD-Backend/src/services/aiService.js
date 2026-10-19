import fs from "node:fs";
import path from "node:path";

const baseUrl = (process.env.AI_SERVICE_URL || "http://localhost:8000").replace(/\/+$/, "");
const timeoutMs = Number(process.env.AI_SERVICE_TIMEOUT_MS || 60000);

async function requestWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    let body;
    try { body = text ? JSON.parse(text) : {}; } catch { body = { detail: text }; }
    if (!response.ok) {
      const message = body.detail || body.message || `AI service returned HTTP ${response.status}`;
      throw Object.assign(new Error(message), { status: response.status === 422 ? 422 : 502 });
    }
    return body;
  } catch (error) {
    if (error.name === "AbortError") throw Object.assign(new Error("AI service timed out. Please try again."), { status: 504 });
    if (error.status) throw error;
    throw Object.assign(new Error(`Cannot connect to AI service at ${baseUrl}. Confirm the AI service is running.`), { status: 502 });
  } finally { clearTimeout(timer); }
}

export async function predictImage(filePath, originalName, mimeType) {
  // The default AI contract expects multipart field "file". Change this if your FastAPI
  // endpoint uses a different field name or path.
  const fileBuffer = fs.readFileSync(filePath);
  const form = new FormData();
  const blob = new Blob([fileBuffer], { type: mimeType });
  form.append("file", blob, path.basename(originalName || filePath));
  return requestWithTimeout(`${baseUrl}/predict`, { method: "POST", body: form });
}

export async function askAiAssistant(message, history = []) {
  // Expected AI service contract: POST /chat with { message, history }.
  return requestWithTimeout(`${baseUrl}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history })
  });
}
