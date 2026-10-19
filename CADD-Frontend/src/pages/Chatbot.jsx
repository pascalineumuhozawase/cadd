import React, { useRef, useState } from "react";
import { chatRequest } from "../services/api";

const initialMessages = [{
  role: "assistant",
  text: "Hello. I can share general information about cassava diseases and practical next steps. What would you like to know?"
}];

export default function Chatbot() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesRef = useRef(null);

  async function handleSend(event) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    const nextMessages = [...messages, { role: "user", text: message }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const result = await chatRequest(message, nextMessages.map(({ role, text }) => ({ role, content: text })));
      const reply = result.reply || result.message || result.answer;
      if (!reply) throw new Error("The assistant returned an empty response.");
      setMessages((current) => [...current, { role: "assistant", text: reply }]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not connect to the CADD assistant. Check that the backend is running.");
    } finally {
      setLoading(false);
      messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
    }
  }

  return <div className="page">
    <div className="page-title-row">
      <div><div className="eyebrow">CADD ASSISTANT</div><h1>Ask an agronomist</h1><p>Get general cassava disease information and practical guidance.</p></div>
      <span className="assistant-online">Assistant available</span>
    </div>
    <div className="chat-layout">
      <section className="panel chat-main" aria-label="Conversation">
        <header className="chat-header"><div><h2>Cassava health assistant</h2><p>For diagnosis, upload a leaf photo on the New diagnosis page.</p></div><span className="assistant-online">Online</span></header>
        <div className="messages-area" ref={messagesRef} aria-live="polite">
          {messages.map((item, index) => <div key={`${item.role}-${index}`} className={`message ${item.role === "user" ? "user-message" : "assistant-message"}`}>
            <span className="message-sender">{item.role === "user" ? "You" : "CADD assistant"}</span>
            <p>{item.text}</p>
          </div>)}
          {loading && <div className="message assistant-message"><span className="message-sender">CADD assistant</span><p>Preparing a response...</p></div>}
        </div>
        <form className="chat-compose" onSubmit={handleSend}>
          {error && <div className="error-message" role="alert">{error}</div>}
          <label className="field-label" htmlFor="chat-message">Your question</label>
          <div className="chat-input-row"><input id="chat-message" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about CMD, CBSD, or crop care..." maxLength={2000} disabled={loading} /><button className="button button-primary" type="submit" disabled={loading || !input.trim()}>{loading ? "Sending..." : "Send"}</button></div>
        </form>
      </section>
      <aside className="panel chat-side"><h2>Topics to ask about</h2><p>Cassava mosaic disease (CMD)</p><p>Brown streak disease (CBSD)</p><p>Bacterial blight (CBB)</p><p>Green mottle (CGM)</p><div className="notice"><p>AI guidance is informational. Confirm diagnoses and treatment decisions with a trained agronomist.</p></div></aside>
    </div>
  </div>;
}