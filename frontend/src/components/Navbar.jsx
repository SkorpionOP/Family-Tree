import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GitBranch, LogOut, Plus, Shield, Menu, ChevronDown, TreeDeciduous } from 'lucide-react';

const Navbar = ({
  trees,
  activeTreeId,
  onSelectTree,
  onCreateTree,
  onJoinTree,
  onAddNode,
  onOpenManageRoles,
  onToggleSidebar, // Added callback for toggling sidebar on mobile
  pendingRequestsCount = 0,
  currentView = 'tree',
  onSelectView = () => {}
}) => {
  const { user, logout } = useAuth();

  const activeTree = trees.find((t) => t._id === activeTreeId);
  const userRole = activeTree ? activeTree.userRole : null;

  return (
    <nav className="glass-heavy border-b border-slate-700/30 px-4 md:px-6 py-0 flex items-center justify-between sticky top-0 z-30 h-[60px]">
      
      {/* Brand Logo & Mobile Menu Toggle */}
      <div className="flex items-center space-x-2.5">
        {user && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-slate-400 hover:text-emerald-400 p-2 bg-slate-800/50 border border-slate-700/30 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center"
            title="Menu options"
            aria-label="Toggle sidebar"
          >
            <Menu size={17} />
          </button>
        )}
        <div className="bg-emerald-950/50 p-1.5 rounded-xl border border-emerald-500/25 flex items-center justify-center overflow-hidden w-8 h-8 md:w-9 md:h-9 shadow-glow-sm">
          <img src="/fist.png" alt="Sangam Roots Logo" className="w-full h-full object-contain" />
        </div>
        <div className="hidden sm:block">
          <h1 className="font-extrabold text-xs md:text-sm tracking-wide gradient-text-brand leading-tight uppercase">
            Sangam Roots
          </h1>
          <span className="text-[8px] text-slate-500 font-medium block uppercase tracking-[0.12em] -mt-0.5">
            Family Heritage
          </span>
        </div>
      </div>

      {/* View Selector Tabs */}
      {user && (
        <div className="flex items-center bg-slate-800/30 border border-slate-700/30 p-0.5 rounded-xl">
          {[
            { key: 'tree', label: 'Kinship Tree' },
            { key: 'profile', label: 'My Profile' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => onSelectView(tab.key)}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                currentView === tab.key
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {user.role === 'SuperAdmin' && (
            <button
              onClick={() => onSelectView('superadmin')}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                currentView === 'superadmin'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'text-purple-400 hover:text-purple-200'
              }`}
            >
              SuperAdmin
            </button>
          )}
        </div>
      )}

      {/* Tree Selector / Actions (Desktop Only) */}
      {user && (
        <div className="hidden md:flex items-center space-x-2.5">
          <div className="flex items-center space-x-2">
            <GitBranch size={14} className="text-slate-500" />
            <select
              value={activeTreeId || ''}
              onChange={(e) => onSelectTree(e.target.value)}
              className="bg-slate-800/50 border border-slate-700/30 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer min-w-[160px] transition-all"
            >
              <option value="" disabled>Select Family Tree</option>
              {trees.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.treeName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onCreateTree}
            className="btn-primary flex items-center space-x-1.5 text-xs px-3 py-1.5"
          >
            <Plus size={13} />
            <span>New Tree</span>
          </button>

          <button
            onClick={onJoinTree}
            className="btn-secondary flex items-center space-x-1.5 text-xs px-3 py-1.5"
          >
            <GitBranch size={13} className="text-emerald-400" />
            <span>Join Tree</span>
          </button>

          {activeTree && (userRole === 'Admin' || userRole === 'Sub-Admin') && (
            <button
              onClick={onAddNode}
              className="btn-primary flex items-center space-x-1.5 text-xs px-3 py-1.5"
            >
              <Plus size={13} />
              <span>Add Node</span>
            </button>
          )}

          {activeTree && userRole === 'Admin' && (
            <button
              onClick={onOpenManageRoles}
              className="relative btn-secondary flex items-center space-x-1.5 text-xs px-3 py-1.5"
            >
              <Shield size={13} className="text-emerald-400" />
              <span>Roles</span>
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 text-[8px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full leading-none animate-bounce shadow-glow-sm">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}
        </div>
      )}

      {/* User Info / Logout (Desktop Only) */}
      {user ? (
        <div className="hidden md:flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block leading-tight">Logged in as</span>
            <span className="text-[11px] font-semibold text-slate-300 block truncate max-w-[140px]">{user.email}</span>
          </div>

          {activeTree && userRole && (
            <div className={`badge ${
              userRole === 'Admin' 
                ? 'badge-admin' 
                : userRole === 'Sub-Admin'
                ? 'badge-subadmin'
                : 'badge-standard'
            }`}>
              {userRole}
            </div>
          )}

          <button
            onClick={logout}
            className="flex items-center text-slate-400 hover:text-red-400 bg-slate-800/30 hover:bg-red-500/10 border border-slate-700/30 p-2 rounded-xl transition-all duration-300 cursor-pointer"
            title="Log Out"
            aria-label="Log out"
          >
            <LogOut size={15} />
          </button>
        </div>
      ) : (
        <div className="text-xs font-semibold text-slate-500">
          Sign In required
        </div>
      )}
    </nav>
  );
};

export default Navbar;
