import React, { useEffect, useState } from "react";
import { historyRequest } from "../services/api";

function displayDate(value) {
  if (!value) return "Date not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    historyRequest().then(setItems).catch(e => setError(e.response?.data?.message || "Could not load your records. Confirm the backend is running.")).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(item => {
    const name = item.disease_name || item.disease || item.predicted_class || item.class_name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return <div className="page">
    <div className="page-title-row"><div><div className="eyebrow">YOUR ACTIVITY</div><h1>Diagnosis history</h1><p>Review previous leaf checks and follow changes in your crop health.</p></div><div className="record-count"><b>{items.length}</b><span>saved records</span></div></div>
    <div className="panel history-panel">
      <div className="history-toolbar"><div><h2>All records</h2><p>Records saved to your account</p></div><div className="search-box"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search disease..." /></div></div>
      {loading ? <div className="empty-state"><div className="spinner dark-spinner"></div><p>Loading your records...</p></div> :
       error ? <div className="error-message">{error}</div> :
       filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">▤</div><h3>{items.length ? "No matching records" : "No diagnoses saved yet"}</h3><p>{items.length ? "Try another search term." : "Your diagnosis history will appear here after you analyze a leaf."}</p></div> :
       <div className="table-wrap"><table className="records-table"><thead><tr><th>DIAGNOSIS</th><th>CONFIDENCE</th><th>DATE</th><th>STATUS</th></tr></thead><tbody>{filtered.map((item, i) => {
         const name = item.disease_name || item.disease || item.predicted_class || item.class_name || "Unknown";
         const raw = Number(item.confidence ?? item.confidence_score ?? 0);
         const pct = raw <= 1 ? raw * 100 : raw;
         const healthy = /healthy/i.test(name);
         const lowConfidence = !Number.isFinite(pct) || pct < 60;
         const status = lowConfidence ? "Low confidence" : healthy ? "Healthy" : "Review advised";
         return <tr key={item.id || item.prediction_id || i}><td><div className="table-disease"><span className={healthy ? "mini-status good" : "mini-status alert"}>{healthy ? "✓" : "!"}</span><div><b>{name}</b><small>Leaf image analysis</small></div></div></td><td>{raw ? `${pct.toFixed(1)}%` : "—"}</td><td>{displayDate(item.created_at || item.createdAt || item.date)}</td><td><span className={`status-badge ${!lowConfidence && healthy ? "badge-good" : "badge-review"}`}>{status}</span></td></tr>;
       })}</tbody></table></div>}
    </div>
    <div className="notice"><span>ⓘ</span><p>Low-confidence entries are uncertain model guesses. The AI only classifies among cassava categories and does not verify plant species; confirm the leaf is cassava and consult an agronomist before acting.</p></div>
  </div>;
}
