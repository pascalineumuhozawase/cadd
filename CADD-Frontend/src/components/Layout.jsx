import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Overview", icon: "⌂", end: true },
  { to: "/diagnose", label: "New diagnosis", icon: "◎" },
  { to: "/history", label: "My records", icon: "▤" },
  { to: "/chatbot", label: "Ask an agronomist", icon: "✳" }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = user?.name || user?.fullName || user?.email?.split("@")[0] || "Farmer";
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">C</span>
          <span><b>CADD</b><small>Cassava health</small></span>
        </NavLink>
        <div className="side-caption">WORKSPACE</div>
        <nav className="side-nav">
          {links.map(link => <NavLink key={link.to} to={link.to} end={link.end} className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}>
            <span className="nav-icon">{link.icon}</span>{link.label}
          </NavLink>)}
        </nav>
        <div className="sidebar-help">
          <div className="help-icon">✦</div>
          <b>Need a second opinion?</b>
          <p>Chat with the CADD assistant for practical next steps.</p>
          <NavLink to="/chatbot" className="help-link">Ask a question →</NavLink>
        </div>
        <div className="sidebar-bottom">
          <div className="avatar">{name.slice(0,1).toUpperCase()}</div>
          <div className="user-meta"><b>{name}</b><small>{user?.role || "Member"}</small></div>
          <button className="icon-button logout-button" title="Log out" onClick={() => { logout(); navigate("/login"); }}>↪</button>
        </div>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">C</span><b>CADD</b></div>
          <div className="breadcrumb">Workspace <span>/</span> <b>Plant health</b></div>
          <div className="topbar-right"><span className="status-dot"></span><span>Plant health assistant</span><div className="avatar small-avatar">{name.slice(0,1).toUpperCase()}</div></div>
        </header>
        <div className="page-content"><Outlet /></div>
        <footer className="footer">CADD · Supporting healthier cassava crops in Rwanda <span>AI suggestions should be confirmed by an agronomist.</span></footer>
      </main>
    </div>
  );
}
