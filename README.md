# GOTHAM COLLAGE — MEMBER & ADMIN PORTAL

A premium, minimal member authentication and induction portal for **GOTHAM COLLAGE**, a venture studio.

**Tagline**: *"Building What's Next."*

---

## 🏛️ Two Login Sections (No Department Selection)

On the entry screen, members and administrators choose their respective portal:

1. **MEMBER**
   - Click to open **Member Sign In**.
   - Input: **Member ID** & **Password**.
   - Validates against member records in SQLite.
   - If first login: displays the formal **Induction Letter**.
   - If already acknowledged: opens the **Simple Member Profile**.

2. **ADMIN**
   - Click to open **Admin Sign In**.
   - Input: **Admin Username** (`admin`) & **Password** (`gotham2026!`).
   - Authenticates into the **Admin Portal** where the administrator can:
     - View all registered members.
     - Create new member accounts with designation, role type (`HEAD`/`MEMBER`), and **Personalised Induction Message**.
     - Edit induction messages or designations at any time.
     - Reset first-login status to re-test the induction scroll.
     - Manage announcements.

---

## 📜 Personalised Induction Letter
- Retains the exact formal, parchment-style document aesthetic.
- Displays:
  - Official **Gotham Collage Logo**.
  - **Member Full Name**.
  - **Designation**.
  - Small role badge: **HEAD** or **MEMBER**.
  - **Personalised Induction Message** (the unique message written by the admin).
  - Formal signature and wax seal stamp.
  - **DOWNLOAD INDUCTION LETTER** button (generates personalized PDF).

---

## 👤 Simple Member Profile
- Minimalist profile section.
- **Member Name written in elegant cursive on the side profile**.
- Designation, Member ID, and `HEAD`/`MEMBER` badge.
- Button to view/download induction letter anytime.
- **Sign Out** button.
- **ANNOUNCEMENTS** section: Kept completely clean and blank for now.

---

## 🔑 Login Credentials

### Admin Login
- **Username**: `admin`
- **Password**: `gotham2026!`

### Member Logins
All accounts use password: `gotham2026!`

| Member ID | Name | Designation | Role Badge |
| :--- | :--- | :--- | :--- |
| **`GC-DES-001`** | Marcus Chen | Creative Lead & Design Director | `HEAD` |
| **`GC-DES-002`** | Aria Kovacs | UI/UX Designer | `MEMBER` |
| **`GC-DES-003`** | Leo Sterling | Frontend Developer | `MEMBER` |

---

## 🚀 Running the Portal
```bash
npm start
```
Access at **[http://localhost:5000](http://localhost:5000)**.
