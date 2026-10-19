import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

function createToken(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw Object.assign(new Error("JWT_SECRET must be configured with at least 32 characters."), { status: 500 });
  }
  return jwt.sign(
    { email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { subject: String(user.id), expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, district: user.district };
}

export async function register(req, res, next) {
  try {
    const { email, password, role = "farmer", district = null } = req.body;
    const name = req.body.name ?? req.body.full_name;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters." });
    const allowedRoles = new Set(["farmer", "agronomist", "researcher"]);
    if (!allowedRoles.has(role)) return res.status(400).json({ message: "Invalid account role." });

    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, district)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, district`,
      [name.trim(), normalizedEmail, passwordHash, role, district?.trim() || null]
    );
    const user = result.rows[0];
    return res.status(201).json({ message: "Account created.", token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ message: "An account with this email already exists." });
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) return res.status(400).json({ message: "Email and password are required." });
    const result = await pool.query(
      "SELECT id, name, email, password_hash, role, district FROM users WHERE email = $1",
      [email.trim().toLowerCase()]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    return res.json({ message: "Signed in successfully.", token: createToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

export async function me(req, res, next) {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, district FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: "User account not found." });
    res.json({ user: publicUser(result.rows[0]) });
  } catch (error) { next(error); }
}
