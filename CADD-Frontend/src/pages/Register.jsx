import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    role: "farmer",
    district: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.full_name,
        email: form.email,
        role: form.role,
        district: form.district,
        password: form.password,
      });
      navigate("/", { replace: true });
    } catch (err) {
      // 👇 Print the REAL error to the console so you can debug
      console.error("Registration error:", err.response?.data || err.message);

      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        (typeof err.response?.data === "string" ? err.response.data : null);

      if (err.response) {
        setError(`Registration failed (${err.response.status}): ${serverMsg || "Server error"}`);
      } else if (err.request) {
        setError("Cannot reach the backend. Is it running on http://localhost:5000 ?");
      } else {
        setError("Registration failed. " + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-visual">
        <Link to="/login" className="brand auth-brand">
          <span className="brand-mark">C</span>
          <span>
            <b>CADD</b>
            <small>Cassava health</small>
          </span>
        </Link>
        <div className="auth-visual-content">
          <div className="eyebrow light">JOIN THE COMMUNITY</div>
          <h1>
            Better insight.
            <br />
            Stronger harvests.
          </h1>
          <p>
            Create an account to record leaf diagnoses, track previous checks, and get
            crop-care guidance.
          </p>
          <div className="register-points">
            <div>
              <span>✓</span> Save diagnosis history
            </div>
            <div>
              <span>✓</span> Ask cassava health questions
            </div>
            <div>
              <span>✓</span> Support farmers and agronomists
            </div>
          </div>
          <div className="auth-leaf-art">
            <div className="auth-leaf a1"></div>
            <div className="auth-leaf a2"></div>
            <div className="auth-leaf a3"></div>
            <div className="auth-stem"></div>
          </div>
        </div>
        <div className="auth-visual-footer">CADD · Cassava Disease Detection</div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap register-wrap">
          <div className="auth-mobile-mark">
            <span className="brand-mark">C</span>
            <b>CADD</b>
          </div>
          <div className="eyebrow">GET STARTED</div>
          <h2>Create your account</h2>
          <p className="auth-subtitle">Tell us a little about yourself.</p>

          <form onSubmit={submit} className="auth-form">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="full_name"
              required
              value={form.full_name}
              onChange={update}
              placeholder="Your full name"
            />

            <label htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={update}
              placeholder="you@example.com"
            />

            <div className="form-two-col">
              <div>
                <label htmlFor="role">I am a</label>
                <select id="role" name="role" value={form.role} onChange={update}>
                  <option value="farmer">Farmer</option>
                  <option value="agronomist">Agronomist</option>
                  {/* ✅ researcher removed — DB only allows farmer/agronomist/admin */}
                </select>
              </div>
              <div>
                <label htmlFor="district">
                  District <span>Optional</span>
                </label>
                <input
                  id="district"
                  name="district"
                  value={form.district}
                  onChange={update}
                  placeholder="e.g. Huye"
                />
              </div>
            </div>

            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={update}
              placeholder="At least 8 characters"
            />

            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={form.confirmPassword}
              onChange={update}
              placeholder="Enter password again"
            />

            {error && <div className="error-message">{error}</div>}

            <button
              className="button button-primary full-button"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>

          <p className="auth-switch">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}