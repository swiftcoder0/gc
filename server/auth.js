import crypto from 'node:crypto';
import { db } from './db.js';

const KEY_LEN = 64;
const SCRYPT_OPTIONS = {
  N: 16384,
  r: 8,
  p: 1,
};

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, KEY_LEN, SCRYPT_OPTIONS);
  return {
    salt,
    hash: derivedKey.toString('hex'),
  };
}

export function verifyPassword(password, salt, expectedHash) {
  const derivedKey = crypto.scryptSync(password, salt, KEY_LEN, SCRYPT_OPTIONS);
  const derivedBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  if (derivedBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(derivedBuffer, expectedBuffer);
}

export function createSession(memberId) {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  // Expires in 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const insert = db.prepare(`
    INSERT INTO sessions (session_token, member_id, expires_at)
    VALUES (?, ?, ?)
  `);
  insert.run(sessionToken, memberId, expiresAt);
  
  return { sessionToken, expiresAt };
}

export function deleteSession(sessionToken) {
  const del = db.prepare('DELETE FROM sessions WHERE session_token = ?');
  del.run(sessionToken);
}

export function authenticate(req, res, next) {
  const token = req.cookies?.gotham_session || req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No session token found.' });
  }

  const stmt = db.prepare(`
    SELECT s.session_token, s.expires_at, m.id, m.member_id, m.full_name, m.email, 
           m.department, m.designation, m.role_type, m.role_title, m.induction_message,
           m.has_acknowledged_welcome, m.acknowledged_at, m.created_at, m.last_login_at
    FROM sessions s
    JOIN members m ON s.member_id = m.member_id
    WHERE s.session_token = ?
  `);
  
  const row = stmt.get(token);
  
  if (!row) {
    return res.status(401).json({ success: false, message: 'Invalid session or session expired.' });
  }

  // Check expiration
  if (new Date(row.expires_at) < new Date()) {
    deleteSession(token);
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }

  req.member = {
    id: row.id,
    member_id: row.member_id,
    full_name: row.full_name,
    email: row.email,
    department: row.department || 'IT & DESIGN',
    designation: row.designation || row.role_title || 'Member',
    role_type: row.role_type || 'MEMBER',
    role_title: row.designation || row.role_title || 'Member',
    induction_message: row.induction_message,
    has_acknowledged_welcome: Boolean(row.has_acknowledged_welcome),
    acknowledged_at: row.acknowledged_at,
    created_at: row.created_at,
    last_login_at: row.last_login_at,
  };
  req.sessionToken = token;

  next();
}

export function getOptionalMember(req) {
  const token = req.cookies?.gotham_session || req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  try {
    const stmt = db.prepare(`
      SELECT s.session_token, s.expires_at, m.id, m.member_id, m.full_name, m.email, 
             m.department, m.designation, m.role_type, m.role_title, m.induction_message,
             m.has_acknowledged_welcome, m.acknowledged_at, m.created_at, m.last_login_at
      FROM sessions s
      JOIN members m ON s.member_id = m.member_id
      WHERE s.session_token = ?
    `);
    const row = stmt.get(token);
    if (!row) return null;
    if (new Date(row.expires_at) < new Date()) {
      deleteSession(token);
      return null;
    }
    return {
      id: row.id,
      member_id: row.member_id,
      full_name: row.full_name,
      email: row.email,
      department: row.department || 'IT & DESIGN',
      designation: row.designation || row.role_title || 'Member',
      role_type: row.role_type || 'MEMBER',
      role_title: row.designation || row.role_title || 'Member',
    };
  } catch (e) {
    return null;
  }
}

export function logAudit(memberId, action, details, ipAddress) {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (member_id, action, details, ip_address)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(memberId, action, details, ipAddress || '127.0.0.1');
  } catch (err) {
    console.error('Audit log error:', err);
  }
}
