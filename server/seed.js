import { db } from './db.js';
import { hashPassword } from './auth.js';

export function seedDatabase() {
  console.log('Synchronizing Gotham Collage accounts...');

  // --- Seed Administrator ---
  const adminExists = db.prepare("SELECT * FROM members WHERE UPPER(member_id) = 'ADMIN' OR UPPER(member_id) = 'GC-ADM-001'").get();
  if (!adminExists) {
    const { salt, hash } = hashPassword('gotham2026!');
    db.prepare(`
      INSERT INTO members (
        member_id, full_name, email, department, designation, role_type, role_title,
        induction_message, password_hash, salt, has_acknowledged_welcome
      )
      VALUES ('GC-ADM-001', 'Administrator', 'admin@gothamcollage.com', 'ADMIN', 'Studio Administrator', 'HEAD', 'Studio Administrator', 'Studio Admin', ?, ?, 1)
    `).run(hash, salt);
    console.log('Seeded initial Administrator account: GC-ADM-001');
  }

  // --- Seed existing members (preserves data across Railway redeploys) ---
  const membersToSeed = [
    {
      member_id: 'KHUSHI123',
      full_name: 'khushi gautam',
      email: 'khushi123@gothamcollage.com',
      department: 'MEMBER',
      designation: 'Member',
      role_type: 'MEMBER',
      password: 'gotham2026!',
      induction_message: 'welcome to gautam collage',
    },
  ];

  const insertStmt = db.prepare(`
    INSERT INTO members (
      member_id, full_name, email, department, designation, role_type, role_title, 
      induction_message, password_hash, salt, has_acknowledged_welcome
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    ON CONFLICT(member_id) DO NOTHING
  `);

  for (const m of membersToSeed) {
    const { salt, hash } = hashPassword(m.password);
    insertStmt.run(
      m.member_id,
      m.full_name,
      m.email,
      m.department,
      m.designation,
      m.role_type,
      m.designation,
      m.induction_message,
      hash,
      salt
    );
    console.log(`Seeded: [${m.role_type}] ${m.member_id} - ${m.full_name}`);
  }

  console.log('Gotham Collage member registry ready.');
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
