import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try { await login(email, password); navigate("/", { replace: true }); }
    catch (err) { setError(err.response?.data?.message || "Login failed. Check your details and confirm the backend is running."); }
    finally { setLoading(false); }
  }

  return <div className="auth-screen"><div className="auth-visual"><Link to="/login" className="brand auth-brand"><span className="brand-mark">C</span><span><b>CADD</b><small>Cassava health</small></span></Link><div className="auth-visual-content"><div className="eyebrow light">HEALTHIER CROPS START HERE</div><h1>Help your cassava thrive.</h1><p>AI-supported leaf screening designed to help farmers and agronomists notice possible disease symptoms earlier.</p><div className="auth-leaf-art"><div className="auth-leaf a1"></div><div className="auth-leaf a2"></div><div className="auth-leaf a3"></div><div className="auth-leaf a4"></div><div className="auth-stem"></div></div><div className="auth-quote">“Early observation can make a real difference to crop health.”</div></div><div className="auth-visual-footer">CADD · Cassava Disease Detection</div></div>
    <div className="auth-form-side"><div className="auth-form-wrap"><div className="auth-mobile-mark"><span className="brand-mark">C</span><b>CADD</b></div><div className="eyebrow">WELCOME BACK</div><h2>Sign in to your account</h2><p className="auth-subtitle">Enter your details to continue to your workspace.</p>
      <form onSubmit={submit} className="auth-form"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" />{error && <div className="error-message">{error}</div>}<button className="button button-primary full-button" disabled={loading}>{loading ? "Signing in..." : "Sign in →"}</button></form>
      <p className="auth-switch">New to CADD? <Link to="/register">Create an account</Link></p><p className="auth-footnote">By continuing, you agree to use AI predictions as guidance and verify uncertain diagnoses with an agronomist.</p></div></div></div>;
}
