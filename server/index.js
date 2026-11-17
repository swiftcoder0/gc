import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';
import { hashPassword, verifyPassword, createSession, deleteSession, authenticate, getOptionalMember, logAudit } from './auth.js';
import { seedDatabase } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize seed data if empty
seedDatabase();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Serve public static assets (including official Gotham images, audio, video)
app.use('/assets', express.static(path.resolve(__dirname, '../public/assets'), {
  maxAge: '1d',
  setHeaders: (res) => {
    res.setHeader('Accept-Ranges', 'bytes');
  },
}));

// --- AUTHENTICATION ROUTES ---

// 1. Member Login (Member ID & Password)
app.post('/api/auth/login', (req, res) => {
  const { member_id, password } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!member_id || !password) {
    return res.status(400).json({
      success: false,
      message: 'Both Member ID and Password are required.',
    });
  }

  const cleanMemberId = member_id.trim().toUpperCase();

  const stmt = db.prepare('SELECT * FROM members WHERE UPPER(member_id) = ?');
  const member = stmt.get(cleanMemberId);

  if (!member) {
    logAudit(cleanMemberId, 'LOGIN_FAILED', 'Member ID not found', ipAddress);
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Member ID does not exist in Gotham Collage registry.',
    });
  }

  // Verify password
  const isValidPassword = verifyPassword(password, member.salt, member.password_hash);
  if (!isValidPassword) {
    logAudit(member.member_id, 'LOGIN_FAILED', 'Incorrect password attempt', ipAddress);
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Incorrect password for Member ID.',
    });
  }

  // Update last login
  const now = new Date().toISOString();
  db.prepare('UPDATE members SET last_login_at = ? WHERE id = ?').run(now, member.id);

  // Create session
  const { sessionToken, expiresAt } = createSession(member.member_id);

  // Set HTTP-Only Cookie
  res.cookie('gotham_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logAudit(member.member_id, 'LOGIN_SUCCESS', `Member authenticated: ${member.full_name}`, ipAddress);

  return res.json({
    success: true,
    token: sessionToken,
    expiresAt,
    isAdmin: false,
    member: {
      id: member.id,
      member_id: member.member_id,
      full_name: member.full_name,
      email: member.email,
      department: member.department || 'IT & DESIGN',
      designation: member.designation || member.role_title || 'Member',
      role_type: member.role_type || 'MEMBER',
      role_title: member.designation || member.role_title || 'Member',
      induction_message: member.induction_message || "Welcome to Gotham Collage. We are delighted to have you shaping what's next with us.",
      has_acknowledged_welcome: Boolean(member.has_acknowledged_welcome),
      acknowledged_at: member.acknowledged_at,
      created_at: member.created_at,
      last_login_at: now,
    },
  });
});

// 2. Admin Login
app.post('/api/auth/admin-login', (req, res) => {
  const { username, password } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and Password are required.' });
  }

  const cleanUser = username.trim().toLowerCase();

  // Find admin user in SQLite (matches username and department='ADMIN')
  let adminRecord = db.prepare(`
    SELECT * FROM members 
    WHERE (LOWER(member_id) = ? OR LOWER(member_id) = 'admin' OR LOWER(member_id) = 'gc-adm-001')
      AND department = 'ADMIN'
  `).get(cleanUser);

  // If no admin in database yet, seed the default admin
  if (!adminRecord && (cleanUser === 'admin' || cleanUser === 'gc-adm-001')) {
    const { salt, hash } = hashPassword('gotham2026!');
    db.prepare(`
      INSERT INTO members (member_id, full_name, email, department, designation, role_type, role_title, induction_message, password_hash, salt, has_acknowledged_welcome)
      VALUES ('admin', 'Studio Administrator', 'admin@gothamcollage.com', 'ADMIN', 'System Administrator', 'HEAD', 'System Administrator', 'Studio Admin', ?, ?, 1)
    `).run(hash, salt);
    adminRecord = db.prepare("SELECT * FROM members WHERE department = 'ADMIN' LIMIT 1").get();
  }

  if (!adminRecord) {
    logAudit(username, 'ADMIN_LOGIN_FAILED', 'Admin user not found', ipAddress);
    return res.status(401).json({ success: false, message: 'Invalid Admin credentials.' });
  }

  // Cryptographic password verification with Scrypt
  const isValid = verifyPassword(password.trim(), adminRecord.salt, adminRecord.password_hash);
  if (!isValid) {
    logAudit(username, 'ADMIN_LOGIN_FAILED', 'Invalid password attempt', ipAddress);
    return res.status(401).json({ success: false, message: 'Invalid Admin credentials.' });
  }

  // Update last login
  const now = new Date().toISOString();
  db.prepare('UPDATE members SET last_login_at = ? WHERE id = ?').run(now, adminRecord.id);

  const { sessionToken, expiresAt } = createSession(adminRecord.member_id);
  res.cookie('gotham_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logAudit(adminRecord.member_id, 'ADMIN_LOGIN_SUCCESS', 'Administrator logged in', ipAddress);

  return res.json({
    success: true,
    isAdmin: true,
    token: sessionToken,
    expiresAt,
    member: {
      id: adminRecord.id,
      member_id: adminRecord.member_id,
      full_name: adminRecord.full_name,
      department: 'ADMIN',
      designation: 'System Administrator',
      role_type: 'HEAD',
      role_title: 'System Administrator',
      has_acknowledged_welcome: true,
    },
  });
});

// 3. Current Authenticated Session
app.get('/api/auth/me', authenticate, (req, res) => {
  return res.json({
    success: true,
    member: req.member,
    isAdmin: req.member.department === 'ADMIN' || req.member.member_id.toLowerCase() === 'admin' || req.member.member_id === 'GC-ADM-001',
  });
});

// 3.5. Update Admin Credentials (Username and/or Password)
app.put('/api/admin/change-credentials', authenticate, (req, res) => {
  const isAdmin = req.member.department === 'ADMIN' || req.member.member_id.toLowerCase() === 'admin' || req.member.member_id === 'GC-ADM-001';
  if (!isAdmin) {
    return res.status(403).json({ success: false, message: 'Unauthorized. Admin privilege required.' });
  }

  const { current_password, new_username, new_password } = req.body;

  if (!current_password) {
    return res.status(400).json({ success: false, message: 'Current password is required to verify identity.' });
  }

  const adminRecord = db.prepare('SELECT * FROM members WHERE id = ?').get(req.member.id);
  if (!adminRecord) {
    return res.status(404).json({ success: false, message: 'Admin record not found.' });
  }

  const isMatch = verifyPassword(current_password.trim(), adminRecord.salt, adminRecord.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password does not match.' });
  }

  let updatedMemberId = adminRecord.member_id;
  if (new_username && new_username.trim()) {
    const cleanNewUser = new_username.trim();
    if (cleanNewUser.toLowerCase() !== adminRecord.member_id.toLowerCase()) {
      const exists = db.prepare('SELECT id FROM members WHERE LOWER(member_id) = LOWER(?) AND id != ?').get(cleanNewUser, adminRecord.id);
      if (exists) {
        return res.status(400).json({ success: false, message: `Username "${cleanNewUser}" is already taken.` });
      }
      updatedMemberId = cleanNewUser;
    }
  }

  let updatedHash = adminRecord.password_hash;
  let updatedSalt = adminRecord.salt;
  if (new_password && new_password.trim()) {
    if (new_password.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }
    const hashed = hashPassword(new_password.trim());
    updatedHash = hashed.hash;
    updatedSalt = hashed.salt;
  }

  // Update in SQLite
  db.prepare(`
    UPDATE members 
    SET member_id = ?, password_hash = ?, salt = ?
    WHERE id = ?
  `).run(updatedMemberId, updatedHash, updatedSalt, adminRecord.id);

  if (updatedMemberId !== adminRecord.member_id) {
    db.prepare('UPDATE sessions SET member_id = ? WHERE member_id = ?').run(updatedMemberId, adminRecord.member_id);
  }

  logAudit(updatedMemberId, 'ADMIN_CREDENTIALS_CHANGED', `Admin credentials updated: ${updatedMemberId}`, req.ip);

  return res.json({
    success: true,
    message: 'Admin credentials successfully updated.',
    new_username: updatedMemberId,
  });
});

// 4. Acknowledge First-Login Induction Letter
app.post('/api/auth/acknowledge-welcome', authenticate, (req, res) => {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE members 
    SET has_acknowledged_welcome = 1, acknowledged_at = ? 
    WHERE member_id = ?
  `).run(now, req.member.member_id);

  logAudit(req.member.member_id, 'INDUCTION_ACKNOWLEDGED', 'Induction letter acknowledged', req.ip);

  req.member.has_acknowledged_welcome = true;
  req.member.acknowledged_at = now;

  return res.json({
    success: true,
    message: 'Induction letter acknowledged successfully.',
    member: req.member,
  });
});

// 5. Logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies?.gotham_session || req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  if (token) {
    deleteSession(token);
  }
  res.clearCookie('gotham_session');
  return res.json({ success: true, message: 'Successfully signed out of Gotham Collage.' });
});

// --- ANNOUNCEMENTS ROUTES ---

// Get announcements (personalized for member, all for admin, general for public)
app.get('/api/announcements', (req, res) => {
  try {
    const currentMember = getOptionalMember(req);
    const isAdmin = currentMember && (
      currentMember.department === 'ADMIN' ||
      currentMember.member_id.toLowerCase() === 'admin' ||
      currentMember.member_id.toLowerCase() === 'gc-adm-001'
    );

    let list;
    if (isAdmin) {
      // Admin sees ALL announcements (with target member name joined if personal)
      list = db.prepare(`
        SELECT a.*, m.full_name as target_member_name
        FROM announcements a
        LEFT JOIN members m ON UPPER(a.target_member_id) = UPPER(m.member_id)
        ORDER BY a.id DESC
      `).all();
    } else if (currentMember) {
      // Logged-in Member sees:
      // 1. General announcements
      // 2. Personal announcements specifically sent to their member_id
      list = db.prepare(`
        SELECT * FROM announcements
        WHERE target_type = 'GENERAL'
           OR target_type IS NULL
           OR UPPER(target_member_id) = UPPER(?)
        ORDER BY id DESC
      `).all(currentMember.member_id);
    } else {
      // Unauthenticated / public: only general
      list = db.prepare(`
        SELECT * FROM announcements
        WHERE target_type = 'GENERAL' OR target_type IS NULL
        ORDER BY id DESC
      `).all();
    }

    return res.json({ success: true, announcements: list });
  } catch (err) {
    console.error('Error retrieving announcements:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving announcements.' });
  }
});

// --- ADMIN ROUTES ---

// 1. Get all members
app.get('/api/admin/members', (req, res) => {
  const members = db.prepare(`
    SELECT id, member_id, full_name, email, department, designation, role_type, role_title,
           induction_message, has_acknowledged_welcome, acknowledged_at, created_at, last_login_at
    FROM members 
    WHERE UPPER(member_id) != 'GC-ADM-001' AND UPPER(member_id) != 'ADMIN'
    ORDER BY id ASC
  `).all();

  return res.json({
    success: true,
    members: members.map(m => ({
      ...m,
      has_acknowledged_welcome: Boolean(m.has_acknowledged_welcome),
    })),
  });
});

// 2. Create new member (Admin only)
app.post('/api/admin/members', (req, res) => {
  const { full_name, member_id, password, designation, role_type, induction_message } = req.body;

  if (!full_name || !member_id || !password) {
    return res.status(400).json({
      success: false,
      message: 'Full Name, Member ID, and Password are required.',
    });
  }

  const cleanMemberId = member_id.trim().toUpperCase();
  const assignedRoleType = (role_type === 'HEAD') ? 'HEAD' : 'MEMBER';
  const cleanDesignation = (designation && designation.trim()) || 'Member';
  const cleanMessage = (induction_message || '').trim() || `Welcome to Gotham Collage. We look forward to seeing your vision shape what is next.`;

  // Check uniqueness
  const existing = db.prepare('SELECT id FROM members WHERE UPPER(member_id) = ?').get(cleanMemberId);
  if (existing) {
    return res.status(400).json({
      success: false,
      message: `Member ID "${cleanMemberId}" already exists in the database.`,
    });
  }

  const { salt, hash } = hashPassword(password.trim());
  const email = `${cleanMemberId.toLowerCase()}@gothamcollage.com`;

  try {
    const result = db.prepare(`
      INSERT INTO members (
        member_id, full_name, email, department, designation, role_type, role_title,
        induction_message, password_hash, salt, has_acknowledged_welcome
      )
      VALUES (?, ?, ?, 'MEMBER', ?, ?, ?, ?, ?, ?, 0)
    `).run(
      cleanMemberId,
      full_name.trim(),
      email,
      cleanDesignation,
      assignedRoleType,
      cleanDesignation,
      cleanMessage,
      hash,
      salt
    );

    logAudit('ADMIN', 'MEMBER_CREATED', `Created member: ${cleanMemberId} (${cleanDesignation})`, req.ip);

    return res.json({
      success: true,
      message: `Member ${cleanMemberId} successfully registered.`,
      member: {
        id: result.lastInsertRowid,
        member_id: cleanMemberId,
        full_name: full_name.trim(),
        designation: cleanDesignation,
        role_type: assignedRoleType,
        induction_message: cleanMessage,
        has_acknowledged_welcome: false,
      },
    });
  } catch (err) {
    console.error('Error creating member:', err);
    return res.status(500).json({ success: false, message: 'Database error creating member.' });
  }
});

// 3. Update member's induction message or details (Admin)
app.put('/api/admin/members/:member_id', (req, res) => {
  const { member_id } = req.params;
  const { full_name, designation, role_type, induction_message, password } = req.body;
  const cleanId = member_id.trim().toUpperCase();

  const existing = db.prepare('SELECT * FROM members WHERE UPPER(member_id) = ?').get(cleanId);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Member not found.' });
  }

  const newName = full_name ? full_name.trim() : existing.full_name;
  const newDesignation = designation ? designation.trim() : existing.designation;
  const newRoleType = (role_type === 'HEAD') ? 'HEAD' : (role_type === 'MEMBER' ? 'MEMBER' : existing.role_type);
  const newMessage = induction_message !== undefined ? induction_message.trim() : existing.induction_message;

  if (password && password.trim()) {
    const { salt, hash } = hashPassword(password.trim());
    db.prepare(`
      UPDATE members 
      SET full_name = ?, designation = ?, role_type = ?, role_title = ?, induction_message = ?, password_hash = ?, salt = ?
      WHERE UPPER(member_id) = ?
    `).run(newName, newDesignation, newRoleType, newDesignation, newMessage, hash, salt, cleanId);
  } else {
    db.prepare(`
      UPDATE members 
      SET full_name = ?, designation = ?, role_type = ?, role_title = ?, induction_message = ?
      WHERE UPPER(member_id) = ?
    `).run(newName, newDesignation, newRoleType, newDesignation, newMessage, cleanId);
  }

  logAudit('ADMIN', 'MEMBER_UPDATED', `Updated details for ${cleanId}`, req.ip);

  return res.json({
    success: true,
    message: `Member ${cleanId} profile & induction letter updated successfully.`,
  });
});

// 4. Reset welcome status (allows re-testing first-login induction letter)
app.post('/api/admin/members/reset-welcome', (req, res) => {
  const { member_id } = req.body;
  if (!member_id) {
    return res.status(400).json({ success: false, message: 'Member ID required.' });
  }

  db.prepare(`
    UPDATE members 
    SET has_acknowledged_welcome = 0, acknowledged_at = NULL 
    WHERE UPPER(member_id) = ?
  `).run(member_id.trim().toUpperCase());

  logAudit('ADMIN', 'WELCOME_RESET', `Reset induction status for ${member_id}`, req.ip);

  return res.json({
    success: true,
    message: `Induction letter status for ${member_id} reset to pending.`,
  });
});

// 5. Delete member
app.delete('/api/admin/members/:member_id', (req, res) => {
  const { member_id } = req.params;
  const cleanId = member_id.trim().toUpperCase();

  db.prepare('DELETE FROM members WHERE UPPER(member_id) = ?').run(cleanId);
  logAudit('ADMIN', 'MEMBER_DELETED', `Deleted member ${cleanId}`, req.ip);

  return res.json({
    success: true,
    message: `Member ${cleanId} removed from registry.`,
  });
});

// 6. Announcements Management (Admin)
app.post('/api/admin/announcements', (req, res) => {
  const { title, message, target_type, target_member_id } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required.' });
  }

  const cleanTargetType = (target_type === 'PERSONAL') ? 'PERSONAL' : 'GENERAL';
  let cleanTargetMemberId = null;

  if (cleanTargetType === 'PERSONAL') {
    if (!target_member_id || !target_member_id.trim()) {
      return res.status(400).json({ success: false, message: 'A specific member must be selected for personal announcements.' });
    }
    const cleanId = target_member_id.trim().toUpperCase();
    const targetMember = db.prepare('SELECT member_id, full_name FROM members WHERE UPPER(member_id) = ?').get(cleanId);
    if (!targetMember) {
      return res.status(404).json({ success: false, message: `Member ${cleanId} does not exist.` });
    }
    cleanTargetMemberId = targetMember.member_id;
  }

  const result = db.prepare(`
    INSERT INTO announcements (department, title, message, target_type, target_member_id, created_at, updated_at)
    VALUES ('GENERAL', ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(title.trim(), message.trim(), cleanTargetType, cleanTargetMemberId);

  return res.json({
    success: true,
    message: cleanTargetType === 'PERSONAL' 
      ? `Personal announcement sent to ${cleanTargetMemberId}.` 
      : 'General announcement published to all members.',
    id: result.lastInsertRowid,
  });
});

app.put('/api/admin/announcements/:id', (req, res) => {
  const { id } = req.params;
  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message required.' });
  }

  db.prepare(`
    UPDATE announcements 
    SET title = ?, message = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(title.trim(), message.trim(), id);

  return res.json({ success: true, message: 'Announcement updated.' });
});

app.delete('/api/admin/announcements/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
  return res.json({ success: true, message: 'Announcement deleted.' });
});

// Serve frontend in production
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/assets')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`[GOTHAM COLLAGE] Venture Studio Server active on http://localhost:${PORT}`);
});
