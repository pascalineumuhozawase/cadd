import React from "react";

export default function ResultCard({ result }) {
  if (!result) return null;
  const disease = result.disease_name || result.disease || result.predicted_class || result.class_name || "Diagnosis completed";
  const confidence = Number(result.confidence ?? result.confidence_score ?? 0);
  const confidencePct = confidence <= 1 ? confidence * 100 : confidence;
  const healthy = /healthy/i.test(disease);
  const advice = result.recommendation || result.advice || result.treatment || "Keep monitoring the plant and ask a local agronomist to confirm the diagnosis before applying treatment.";
  return <section className="result-card">
    <div className="result-heading">
      <div className={`result-status ${healthy ? "healthy" : "warning"}`}>{healthy ? "✓" : "!"}</div>
      <div><div className="eyebrow">AI ANALYSIS</div><h2>{disease}</h2><p>{healthy ? "No disease pattern detected in this image." : "Possible disease pattern detected. Please confirm with an agronomist."} The model does not verify that the plant is cassava.</p></div>
    </div>
    <div className="confidence-row"><span>Model confidence</span><b>{Number.isFinite(confidencePct) ? `${confidencePct.toFixed(1)}%` : "Not provided"}</b></div>
    <div className="progress-track"><div className="progress-fill" style={{width: `${Math.min(100, Math.max(0, confidencePct || 0))}%`}} /></div>
    <div className="advice-box"><b>Recommended next step</b><p>{advice}</p></div>
    {result.id && <div className="result-foot">Record reference: {result.id}</div>}
  </section>;
}
