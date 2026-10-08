import { useState, useRef, useEffect } from 'react';

export default function Users() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Dr. Priya Raman', email: 'priya.raman@hospital.edu', role: 'Doctor', status: 'Active', lastSignIn: 'Today' },
    { id: 2, name: 'Arun Kumar', email: 'arun.kumar@hospital.edu', role: 'Nurse', status: 'Active', lastSignIn: 'Yesterday' },
    { id: 3, name: 'Meera Joseph', email: 'meera.joseph@hospital.edu', role: 'Admin', status: 'Active', lastSignIn: '2 days ago' },
    { id: 4, name: 'Karthik S', email: 'karthik.s@hospital.edu', role: 'Nurse', status: 'Deactivated', lastSignIn: '3 weeks ago' },
  ]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [tempPass, setTempPass] = useState('au-882f-km91');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [newUser, setNewUser] = useState({ fullName: '', email: '', role: 'doctor' });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setActiveDropdown(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const generatePass = () => {
    const rand = () => Math.random().toString(36).substring(2, 6);
    setTempPass(`au-${rand()}-${rand()}`);
  };

  const handleSaveUser = () => {
    if (!newUser.fullName.trim()) return;
    setUsers(prev => [
      {
        id: Date.now(),
        name: newUser.fullName,
        email: newUser.email,
        role: newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1),
        status: 'Active',
        lastSignIn: 'Never'
      },
      ...prev
    ]);
    setIsDrawerOpen(false);
    setNewUser({ fullName: '', email: '', role: 'doctor' });
  };

  return (
    <div className="flex flex-col w-full relative page-enter">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Users</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Create and manage clinical staff accounts.</p>
        </div>
        <div>
          <button 
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center justify-center gap-2 h-[44px] px-5 bg-primary-container text-on-primary font-body-md text-[13px] font-semibold tracking-wide rounded-[6px] border border-primary-container hover:bg-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add user</span>
          </button>
        </div>
      </div>

      {/* Primary Tabular Ledger Panel */}
      <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-[8px] p-6">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/80">
                <th className="py-3 px-3 font-label-caps text-label-caps uppercase text-on-surface-variant">Name</th>
                <th className="py-3 px-3 font-label-caps text-label-caps uppercase text-on-surface-variant">Email</th>
                <th className="py-3 px-3 font-label-caps text-label-caps uppercase text-on-surface-variant">Role</th>
                <th className="py-3 px-3 font-label-caps text-label-caps uppercase text-on-surface-variant">Status</th>
                <th className="py-3 px-3 font-label-caps text-label-caps uppercase text-on-surface-variant">Last sign-in</th>
                <th className="py-3 px-3 font-label-caps text-label-caps uppercase text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {users.map(u => (
                <tr key={u.id} className="h-[52px] hover:bg-surface-container-low/70 transition-colors">
                  <td className="py-2 px-3 font-body-md text-[14px] text-on-surface font-semibold">
                    {u.name}
                  </td>
                  <td className="py-2 px-3 font-data-tabular text-[13px] text-on-surface-variant">
                    {u.email}
                  </td>
                  <td className="py-2 px-3 font-body-md text-[14px] text-on-surface">
                    {u.role}
                  </td>
                  <td className="py-2 px-3">
                    {u.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#E4F1E9] text-[#2F7D4F] font-body-sm text-[12px] font-medium leading-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D4F]"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#EDEBE6] text-[#5B625F] font-body-sm text-[12px] font-medium leading-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5B625F]"></span>
                        Deactivated
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-data-tabular text-[13px] text-on-surface-variant">
                    {u.lastSignIn}
                  </td>
                  <td className="py-2 px-3 text-right relative">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === u.id ? null : u.id);
                      }}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-[4px] text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                    </button>
                    
                    {/* Contextual Action Dropdown */}
                    {activeDropdown === u.id && (
                      <div className="absolute right-3 top-10 w-44 bg-surface-container-lowest border border-outline-variant/90 rounded-[6px] py-1 z-20 text-left shadow-lg">
                        <button type="button" className="w-full text-left px-3.5 py-2 font-body-md text-[13px] text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-between">
                          <span>Edit role</span>
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">edit</span>
                        </button>
                        <button type="button" className="w-full text-left px-3.5 py-2 font-body-md text-[13px] text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-between">
                          <span>Reset password</span>
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">lock_reset</span>
                        </button>
                        <div className="h-[1px] bg-outline-variant/60 my-1"></div>
                        <button type="button" className="w-full text-left px-3.5 py-2 font-body-md text-[13px] text-error hover:bg-error-container/30 transition-colors flex items-center justify-between">
                          <span>{u.status === 'Active' ? 'Deactivate' : 'Reactivate'}</span>
                          <span className="material-symbols-outlined text-[16px] text-error">block</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ledger Pagination / Metadata Footer */}
        <div className="flex items-center justify-between pt-5 mt-3 border-t border-outline-variant/60">
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            Showing {users.length} active and archived clinical accounts
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Directory verification: 08:30 UTC</span>
          </div>
        </div>
      </div>

      {/* Slide-in Drawer Backdrop */}
      <div 
        className={`fixed inset-0 bg-[#1B1F1E]/20 z-40 transition-opacity duration-200 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsDrawerOpen(false)}
      ></div>

      {/* "Add user" Slide-in Drawer */}
      <aside 
        className={`fixed top-0 right-0 w-full max-w-[420px] h-full bg-surface-container-lowest border-l border-outline-variant/80 z-50 flex flex-col justify-between transition-transform duration-200 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-outline-variant/60">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">Add user</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Provision a new staff account and assign permission levels.
              </p>
            </div>
            <button 
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="w-8 h-8 -mr-1 -mt-1 inline-flex items-center justify-center rounded-[4px] text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/60 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Drawer Form Body */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-body-md text-[13px] font-semibold text-on-surface">Full name</label>
            <input 
              type="text" 
              className="h-[44px] px-3.5 bg-surface-container-lowest border border-outline-variant rounded-[6px] font-body-md text-[13px] text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary-container focus:outline-none transition-colors"
              placeholder="e.g. Dr. Marcus Cole"
              value={newUser.fullName}
              onChange={e => setNewUser({...newUser, fullName: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body-md text-[13px] font-semibold text-on-surface">Email</label>
            <input 
              type="email" 
              className="h-[44px] px-3.5 bg-surface-container-lowest border border-outline-variant rounded-[6px] font-body-md text-[13px] text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary-container focus:outline-none transition-colors"
              placeholder="e.g. m.cole@hospital.edu"
              value={newUser.email}
              onChange={e => setNewUser({...newUser, email: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body-md text-[13px] font-semibold text-on-surface">Role</label>
            <div className="relative">
              <select 
                className="w-full h-[44px] px-3.5 pr-10 appearance-none bg-surface-container-lowest border border-outline-variant rounded-[6px] font-body-md text-[13px] text-on-surface focus:border-primary-container focus:outline-none transition-colors cursor-pointer"
                value={newUser.role}
                onChange={e => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="admin">Admin</option>
              </select>
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body-md text-[13px] font-semibold text-on-surface">Temporary password</label>
            <div className="relative flex items-center">
              <input 
                type="text" 
                className="w-full h-[44px] pl-3.5 pr-24 bg-surface-container-low/60 border border-outline-variant rounded-[6px] font-data-tabular text-[13px] text-on-surface focus:outline-none cursor-default select-all"
                readOnly
                value={tempPass}
              />
              <button 
                type="button"
                onClick={generatePass}
                className="absolute right-2 px-2.5 py-1 text-primary-container hover:text-primary font-label-caps text-label-caps uppercase transition-colors"
              >
                Generate
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              User will be prompted to change this on initial sign-in.
            </p>
          </div>

          <div className="mt-2 p-3.5 bg-surface-container-low/50 border border-outline-variant/60 rounded-[6px]">
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Authorization Scope</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Assigned role governs diagnostic validation clearance, readmission assessment authorizations, and patient record export privileges.
            </p>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t border-outline-variant/60 bg-surface-container-lowest flex items-center gap-3">
          <button 
            type="button"
            onClick={handleSaveUser}
            className="flex-1 inline-flex items-center justify-center h-[44px] px-5 bg-primary-container text-on-primary font-body-md text-[13px] font-semibold tracking-wide rounded-[6px] border border-primary-container hover:bg-primary transition-colors cursor-pointer"
          >
            Create user
          </button>
          <button 
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="inline-flex items-center justify-center h-[44px] px-5 bg-surface-container-lowest text-on-surface font-body-md text-[13px] font-medium border border-outline-variant rounded-[6px] hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </aside>
    </div>
  );
}
