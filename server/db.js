import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'gotham.db');
export const db = new DatabaseSync(dbPath);

// Initialize Tables
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    department TEXT NOT NULL DEFAULT 'IT & DESIGN',
    designation TEXT DEFAULT 'Member',
    role_type TEXT NOT NULL DEFAULT 'MEMBER',
    role_title TEXT DEFAULT 'Member',
    induction_message TEXT,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    has_acknowledged_welcome INTEGER DEFAULT 0,
    acknowledged_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    last_login_at TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    session_token TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    FOREIGN KEY(member_id) REFERENCES members(member_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department TEXT NOT NULL DEFAULT 'IT & DESIGN',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_type TEXT NOT NULL DEFAULT 'GENERAL',
    target_member_id TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Add missing columns if upgrading existing database
try {
  const tableInfo = db.prepare('PRAGMA table_info(members)').all();
  const columnNames = tableInfo.map(col => col.name);

  if (!columnNames.includes('designation')) {
    db.exec("ALTER TABLE members ADD COLUMN designation TEXT DEFAULT 'Member'");
  }
  if (!columnNames.includes('role_type')) {
    db.exec("ALTER TABLE members ADD COLUMN role_type TEXT DEFAULT 'MEMBER'");
  }
  if (!columnNames.includes('induction_message')) {
    db.exec("ALTER TABLE members ADD COLUMN induction_message TEXT");
  }

  // Migrate announcements table
  const announceInfo = db.prepare('PRAGMA table_info(announcements)').all();
  const announceCols = announceInfo.map(col => col.name);
  if (!announceCols.includes('target_type')) {
    db.exec("ALTER TABLE announcements ADD COLUMN target_type TEXT NOT NULL DEFAULT 'GENERAL'");
  }
  if (!announceCols.includes('target_member_id')) {
    db.exec("ALTER TABLE announcements ADD COLUMN target_member_id TEXT DEFAULT NULL");
  }
} catch (err) {
  console.warn('Database schema migration note:', err.message);
}

console.log('Database initialized successfully at:', dbPath);
