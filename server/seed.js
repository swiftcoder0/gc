import { db } from './db.js';
import { hashPassword } from './auth.js';

export function seedDatabase() {
  console.log('Synchronizing IT & DESIGN accounts in Gotham database...');

  const membersToSeed = [
    {
      member_id: 'GC-DES-001',
      full_name: 'Marcus Chen',
      email: 'marcus.chen@gothamcollage.com',
      department: 'IT & DESIGN',
      designation: 'Creative Lead & Design Director',
      role_type: 'HEAD',
      password: 'gotham2026!',
      induction_message: "Welcome to Gotham Collage as Head of IT & Design. As our Creative Lead, you hold the stewardship of our studio's haute aesthetic identity and design systems. We look forward to seeing your vision shape every venture that emerges from our foundry.",
    },
    {
      member_id: 'GC-DES-002',
      full_name: 'Aria Kovacs',
      email: 'aria.kovacs@gothamcollage.com',
      department: 'IT & DESIGN',
      designation: 'UI/UX Designer',
      role_type: 'MEMBER',
      password: 'gotham2026!',
      induction_message: "We are delighted to formally induct you into Gotham Collage's IT & Design team. Your craft in digital interfaces and obsessive eye for minimal typography will define the foundational products of our next cohort of studio ventures.",
    },
    {
      member_id: 'GC-DES-003',
      full_name: 'Leo Sterling',
      email: 'leo.sterling@gothamcollage.com',
      department: 'IT & DESIGN',
      designation: 'Frontend Developer',
      role_type: 'MEMBER',
      password: 'gotham2026!',
      induction_message: "Welcome to the Gotham Collage venture collective. Your engineering depth and precision with fluid, tactile interactions will bring our highest-stakes venture interfaces to life. Welcome to building what's next.",
    },
  ];

  const insertStmt = db.prepare(`
    INSERT INTO members (
      member_id, full_name, email, department, designation, role_type, role_title, 
      induction_message, password_hash, salt, has_acknowledged_welcome
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    ON CONFLICT(member_id) DO UPDATE SET
      full_name = excluded.full_name,
      designation = excluded.designation,
      role_type = excluded.role_type,
      role_title = excluded.designation,
      induction_message = excluded.induction_message,
      password_hash = excluded.password_hash,
      salt = excluded.salt
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
    console.log(`Seeded: [${m.role_type}] ${m.member_id} - ${m.full_name} (${m.designation})`);
  }

  // Seed default administrator account if missing
  const adminExists = db.prepare("SELECT * FROM members WHERE UPPER(member_id) = 'ADMIN' OR UPPER(member_id) = 'GC-ADM-001'").get();
  if (!adminExists) {
    const { salt, hash } = hashPassword('gotham2026!');
    db.prepare(`
      INSERT INTO members (
        member_id, full_name, email, department, designation, role_type, role_title,
        induction_message, password_hash, salt, has_acknowledged_welcome
      )
      VALUES ('admin', 'Studio Administrator', 'admin@gothamcollage.com', 'ADMIN', 'System Administrator', 'HEAD', 'System Administrator', 'Studio Admin', ?, ?, 1)
    `).run(hash, salt);
    console.log('Seeded initial Administrator account: admin');
  }

  // Seed default announcements for IT & DESIGN
  const existingAnnouncements = db.prepare("SELECT COUNT(*) as count FROM announcements WHERE department = 'IT & DESIGN'").get();
  if (existingAnnouncements.count === 0) {
    console.log('Seeding initial IT & DESIGN announcements...');
    const insertAnnounce = db.prepare(`
      INSERT INTO announcements (department, title, message, created_at)
      VALUES (?, ?, ?, ?)
    `);

    insertAnnounce.run(
      'IT & DESIGN',
      'Design Tokens & Typography System v2.4 Released',
      'The revised high-contrast typography tokens and minimal grid layouts are now published. All IT & Design members should reference the new design spec for upcoming venture builds.',
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    );

    insertAnnounce.run(
      'IT & DESIGN',
      'Weekly Design Critique & Prototype Review',
      'Join us this Thursday at 16:00 UTC for the bi-weekly IT & Design sprint critique. Please have your Figma components and interactive prototypes queued.',
      new Date().toISOString()
    );
  }

  console.log('Gotham Collage IT & DESIGN registry ready.');
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
