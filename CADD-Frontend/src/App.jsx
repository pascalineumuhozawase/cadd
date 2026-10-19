import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Diagnose from "./pages/Diagnose";
import History from "./pages/History";
import Chatbot from "./pages/Chatbot";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="/diagnose" element={<Diagnose />} />
        <Route path="/history" element={<History />} />
        <Route path="/chatbot" element={<Chatbot />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
