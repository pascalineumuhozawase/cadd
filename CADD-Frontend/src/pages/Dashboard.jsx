import React from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";

const diseases = [
  { code: "CMD", name: "Cassava Mosaic Disease", detail: "Look for mosaic patterns, leaf distortion and stunted growth.", color: "lavender" },
  { code: "CBSD", name: "Cassava Brown Streak Disease", detail: "Check for yellowing and brown necrotic lesions in roots or stems.", color: "peach" },
  { code: "CBB", name: "Cassava Bacterial Blight", detail: "Watch for angular leaf spots, wilting and stem dieback.", color: "blue" },
  { code: "CGM", name: "Cassava Green Mite", detail: "Look for leaf speckling, distortion and reduced shoot growth.", color: "green" }
];

export default function Dashboard() {
  const { user } = useAuth();
  const name = user?.name || user?.fullName || user?.email?.split("@")[0] || "there";
  return <div className="dashboard-page">
    <section className="welcome-banner">
      <div className="welcome-copy">
        <div className="eyebrow light">CASSAVA DISEASE DETECTION</div>
        <h1>Good day, {name} <span>👋</span></h1>
        <p>Check your cassava leaves early, understand possible risks, and keep your crop healthy.</p>
        <div className="welcome-actions"><Link to="/diagnose" className="button button-light">Start a diagnosis <span>→</span></Link><Link to="/history" className="text-link-light">View past records</Link></div>
      </div>
      <div className="leaf-art" aria-hidden="true"><div className="sun-orb"></div><div className="leaf leaf-one"></div><div className="leaf leaf-two"></div><div className="leaf leaf-three"></div><div className="leaf-stem"></div></div>
      <div className="banner-bubble bubble-one">Early detection</div><div className="banner-bubble bubble-two">Healthier harvests</div>
    </section>
    <div className="section-heading"><div><div className="eyebrow">YOUR FARM AT A GLANCE</div><h2>Plant health overview</h2></div><span className="muted-text">Your recent activity appears here</span></div>
    <div className="stats-grid">
      <StatCard label="Diagnoses made" value="—" note="Connect your account history" icon="◎" tone="stat-green" />
      <StatCard label="Diseases identified" value="—" note="Based on saved results" icon="⌁" tone="stat-orange" />
      <StatCard label="Latest check" value="Not yet" note="Upload a leaf image to begin" icon="◷" tone="stat-blue" />
    </div>
    <div className="section-heading disease-heading"><div><div className="eyebrow">QUICK REFERENCE</div><h2>Diseases to watch for</h2></div><Link to="/diagnose" className="plain-link">Check a leaf →</Link></div>
    <div className="disease-grid">{diseases.map(d => <article className="disease-card" key={d.code}><div className={`disease-symbol ${d.color}`}>{d.code}</div><div><h3>{d.name}</h3><p>{d.detail}</p></div><span className="card-arrow">↗</span></article>)}</div>
    <div className="notice"><span>ⓘ</span><p><b>Remember:</b> An AI result is a screening aid, not a definitive diagnosis. If symptoms are severe or spreading, contact an agricultural extension officer.</p></div>
  </div>;
}
