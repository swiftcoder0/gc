import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UserPlus, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  Users, 
  Save, 
  LogOut,
  Bell,
  Plus,
  KeyRound
} from 'lucide-react';

export default function AdminDashboard() {
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('members'); // 'members', 'create', 'announcements', 'security'
  const [members, setMembers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Admin Credential Change State
  const [credentialForm, setCredentialForm] = useState({
    current_password: '',
    new_username: '',
    new_password: '',
    confirm_password: '',
  });

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    designation: 'Member',
    role_type: 'MEMBER',
    induction_message: '',
    password: '',
  });

  // Create Member Form State
  const [createForm, setCreateForm] = useState({
    full_name: '',
    member_id: '',
    password: '',
    designation: 'Member',
    role_type: 'MEMBER',
    induction_message: '',
  });

  // Announcement Form State
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
  });

  // Fetch all members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/members');
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchAnnouncements();
  }, []);

  // Create Member
  const handleCreateMember = async (e) => {
    e.preventDefault();
    setNotification(null);
    try {
      setLoading(true);
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.message || 'Failed to create member' });
        return;
      }

      setNotification({ type: 'success', message: `Member ${createForm.member_id} successfully created.` });
      setCreateForm({
        full_name: '',
        member_id: '',
        password: '',
        designation: 'UI/UX Designer',
        role_type: 'MEMBER',
        induction_message: '',
      });
      await fetchMembers();
      setActiveTab('members');
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to communicate with server.' });
    } finally {
      setLoading(false);
    }
  };

  // Start Editing Member
  const startEditing = (m) => {
    setEditingMember(m);
    setEditForm({
      full_name: m.full_name,
      designation: m.designation || m.role_title,
      role_type: m.role_type || 'MEMBER',
      induction_message: m.induction_message || '',
      password: '',
    });
  };

  // Save Member Edits
  const handleSaveMemberEdit = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/members/${encodeURIComponent(editingMember.member_id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();

      if (data.success) {
        setNotification({ type: 'success', message: `Induction message and details for ${editingMember.member_id} updated.` });
        setEditingMember(null);
        await fetchMembers();
      } else {
        setNotification({ type: 'error', message: data.message || 'Error updating member.' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset Welcome Letter Status
  const handleResetWelcome = async (memberId) => {
    try {
      const res = await fetch('/api/admin/members/reset-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: `Induction letter reset to pending for ${memberId}. On next login, induction screen will trigger.` });
        await fetchMembers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Member
  const handleDeleteMember = async (memberId) => {
    if (!window.confirm(`Delete member ${memberId} from registry?`)) return;
    try {
      const res = await fetch(`/api/admin/members/${encodeURIComponent(memberId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: `Member ${memberId} removed.` });
        await fetchMembers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) return;
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementForm),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: 'Announcement created.' });
        setAnnouncementForm({ title: '', message: '' });
        await fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: 'Announcement deleted.' });
        await fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Admin Credentials
  const handleChangeCredentials = async (e) => {
    e.preventDefault();
    setNotification(null);

    if (credentialForm.new_password && credentialForm.new_password.length < 6) {
      setNotification({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }

    if (credentialForm.new_password && credentialForm.new_password !== credentialForm.confirm_password) {
      setNotification({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/admin/change-credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: credentialForm.current_password,
          new_username: credentialForm.new_username,
          new_password: credentialForm.new_password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.message || 'Failed to update admin credentials.' });
        return;
      }

      setNotification({ 
        type: 'success', 
        message: `Admin credentials updated successfully! New Username: "${data.new_username || 'admin'}". Use your updated credentials for future logins.` 
      });

      setCredentialForm({
        current_password: '',
        new_username: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error updating credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="rounded-xl border border-[#2B2E3D] bg-[#0E0F14] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-black border border-white/20 p-1 flex items-center justify-center shrink-0">
            <img 
              src="/assets/images/gotham-logo.jpg" 
              alt="Gotham Logo" 
              className="w-full h-full object-contain" 
              onError={(e) => { e.currentTarget.src = '/assets/gotham-logo.jpg'; }}
            />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-wider uppercase text-white">
              ADMIN
            </h1>
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded border border-red-950/50 hover:border-red-800 bg-red-950/20 text-xs font-mono text-red-300 transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Admin</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#20222F] flex space-x-6 overflow-x-auto whitespace-nowrap pb-1">
        <button
          onClick={() => { setActiveTab('members'); setNotification(null); setEditingMember(null); }}
          className={`pb-3 text-xs font-mono tracking-wider uppercase border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'members'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-[#6D7184] hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Members List ({members.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('create'); setNotification(null); setEditingMember(null); }}
          className={`pb-3 text-xs font-mono tracking-wider uppercase border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'create'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-[#6D7184] hover:text-white'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create Member</span>
        </button>

        <button
          onClick={() => { setActiveTab('announcements'); setNotification(null); setEditingMember(null); }}
          className={`pb-3 text-xs font-mono tracking-wider uppercase border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'announcements'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-[#6D7184] hover:text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Announcements ({announcements.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('security'); setNotification(null); setEditingMember(null); }}
          className={`pb-3 text-xs font-mono tracking-wider uppercase border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'security'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-[#6D7184] hover:text-white'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Change Credentials</span>
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${
          notification.type === 'error'
            ? 'border-red-900/60 bg-red-950/30 text-red-200'
            : 'border-emerald-900/60 bg-emerald-950/30 text-emerald-200'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {/* TAB 1: MEMBERS */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            {editingMember ? (
              /* Inline Edit Member */
              <form onSubmit={handleSaveMemberEdit} className="p-6 rounded-xl border border-white/20 bg-[#12131A] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#222430]">
                  <div>
                    <h3 className="font-serif text-sm font-bold uppercase text-white">
                      Edit Member & Personalised Induction Letter
                    </h3>
                    <p className="text-[11px] font-mono text-[#8C90A2]">
                      Member ID: <strong className="text-white">{editingMember.member_id}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="text-xs font-mono text-[#8C90A2] hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-[#8C90A2]">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-[#08080B] border border-[#272938] text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-[#8C90A2]">
                      Update Password (optional)
                    </label>
                    <input
                      type="password"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      placeholder="Leave empty to keep existing"
                      className="w-full px-3 py-2 rounded bg-[#08080B] border border-[#272938] text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-amber-200 font-bold flex items-center justify-between">
                    <span>Special Message from Admin</span>
                    <span className="text-[9px] text-[#A69372] lowercase font-normal">(renders on member's induction letter)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={editForm.induction_message}
                    onChange={(e) => setEditForm({ ...editForm, induction_message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded bg-[#08080B] border border-[#3E382A] text-xs text-white focus:outline-none font-serif leading-relaxed"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 rounded text-xs font-mono text-[#8C90A2] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center space-x-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Members Table */
              <div className="border border-[#222430] rounded-xl overflow-hidden bg-[#0A0B0E]">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-[#222430] bg-[#12131A] text-[#7A7F92]">
                      <th className="py-2.5 px-3">Member ID</th>
                      <th className="py-2.5 px-3">Full Name</th>
                      <th className="py-2.5 px-3">Special Message</th>
                      <th className="py-2.5 px-3 text-center">First Login</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1E28]">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-[#13141D] transition-colors">
                        <td className="py-3 px-3 font-bold text-white tracking-wider">
                          {m.member_id}
                        </td>
                        <td className="py-3 px-3 font-sans text-xs text-[#E2E4EC]">
                          {m.full_name}
                        </td>
                        <td className="py-3 px-3 text-[#9CA3AF] text-[11px] truncate max-w-[220px]" title={m.induction_message}>
                          {m.induction_message ? `"${m.induction_message.slice(0, 45)}${m.induction_message.length > 45 ? '...' : ''}"` : '—'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {m.has_acknowledged_welcome ? (
                            <span className="text-[10px] text-emerald-400">✓ Acknowledged</span>
                          ) : (
                            <span className="text-[10px] text-amber-300">⏳ Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5">
                          <button
                            onClick={() => startEditing(m)}
                            className="px-2 py-1 rounded bg-[#181A24] hover:bg-[#252838] border border-[#2B2E3E] text-[10px] text-zinc-300 hover:text-white transition-colors"
                            title="Edit details and induction message"
                          >
                            <Edit3 className="w-3 h-3 inline mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleResetWelcome(m.member_id)}
                            className="px-2 py-1 rounded bg-[#181A24] hover:bg-[#252838] border border-[#2B2E3E] text-[10px] text-amber-200 hover:text-white transition-colors"
                            title="Reset first-login status"
                          >
                            <RotateCcw className="w-3 h-3 inline" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(m.member_id)}
                            className="p-1 rounded hover:bg-red-950/40 text-[#6B7082] hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CREATE MEMBER */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateMember} className="max-w-xl mx-auto space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#8A8F9E]">Member ID *</label>
                <input
                  type="text"
                  required
                  value={createForm.member_id}
                  onChange={(e) => setCreateForm({ ...createForm, member_id: e.target.value })}
                  placeholder="e.g. GC-MEM-001"
                  className="w-full px-3 py-2 rounded bg-[#08080B] border border-[#262836] text-xs font-mono text-white focus:outline-none uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#8A8F9E]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  placeholder="e.g. Bruce Wayne"
                  className="w-full px-3 py-2 rounded bg-[#08080B] border border-[#262836] text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#8A8F9E]">Password *</label>
              <input
                type="password"
                required
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Assign password for member"
                className="w-full px-3 py-2 rounded bg-[#08080B] border border-[#262836] text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-amber-200 font-bold flex items-center justify-between">
                <span>Special Message from Admin *</span>
                <span className="text-[9px] text-[#A69372] lowercase font-normal">(renders on member's induction letter)</span>
              </label>
              <textarea
                rows={4}
                required
                value={createForm.induction_message}
                onChange={(e) => setCreateForm({ ...createForm, induction_message: e.target.value })}
                placeholder="Write the special message from admin here. This will be displayed in the member's induction letter under 'A Special Message from Admin'."
                className="w-full px-3.5 py-2.5 rounded bg-[#08080B] border border-[#3E382A] text-xs text-white focus:outline-none font-serif leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded bg-white text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-zinc-200 transition-all flex items-center justify-center space-x-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Member</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-5">
            <form onSubmit={handleCreateAnnouncement} className="p-4 rounded-xl border border-[#262838] bg-[#0A0B0E] space-y-3">
              <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-white">
                Create Announcement
              </h3>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#8A8F9E]">Title</label>
                <input
                  type="text"
                  required
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  placeholder="e.g. Studio Maintenance"
                  className="w-full px-3 py-2 rounded bg-[#08080B] border border-[#262836] text-xs text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#8A8F9E]">Message</label>
                <textarea
                  rows={3}
                  required
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  placeholder="Enter message..."
                  className="w-full px-3 py-2 rounded bg-[#08080B] border border-[#262836] text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-zinc-200"
                >
                  Publish Announcement
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {announcements.map((item) => (
                <div key={item.id} className="p-3.5 rounded-lg border border-[#20222D] bg-[#12131A] flex items-start justify-between">
                  <div>
                    <h5 className="font-serif text-sm font-bold text-white">{item.title}</h5>
                    <p className="text-xs text-[#9599AB] mt-1">{item.message}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(item.id)}
                    className="p-1 text-[#7B8094] hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CHANGE CREDENTIALS */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangeCredentials} className="max-w-md mx-auto space-y-4 py-3 animate-fade-in">
            <div className="p-4 rounded-xl border border-[#262836] bg-[#0E0F14] space-y-1">
              <h3 className="font-serif text-sm font-bold uppercase text-white tracking-wider flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-amber-300" />
                <span>Admin Credentials & Security</span>
              </h3>
              <p className="text-[11px] font-mono text-[#8C90A2]">
                Update your admin username and password. After saving, use these new credentials for future logins.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#8A8F9E]">Current Password *</label>
              <input
                type="password"
                required
                value={credentialForm.current_password}
                onChange={(e) => setCredentialForm({ ...credentialForm, current_password: e.target.value })}
                placeholder="Enter current password"
                className="w-full px-3 py-2.5 rounded bg-[#08080B] border border-[#262836] text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#8A8F9E]">New Username (optional)</label>
              <input
                type="text"
                value={credentialForm.new_username}
                onChange={(e) => setCredentialForm({ ...credentialForm, new_username: e.target.value })}
                placeholder="Leave blank to keep current username"
                className="w-full px-3 py-2.5 rounded bg-[#08080B] border border-[#262836] text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#8A8F9E]">New Password *</label>
              <input
                type="password"
                required
                value={credentialForm.new_password}
                onChange={(e) => setCredentialForm({ ...credentialForm, new_password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2.5 rounded bg-[#08080B] border border-[#262836] text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#8A8F9E]">Confirm New Password *</label>
              <input
                type="password"
                required
                value={credentialForm.confirm_password}
                onChange={(e) => setCredentialForm({ ...credentialForm, confirm_password: e.target.value })}
                placeholder="Re-enter new password"
                className="w-full px-3 py-2.5 rounded bg-[#08080B] border border-[#262836] text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded bg-white text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-zinc-200 transition-all flex items-center justify-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save New Credentials</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
