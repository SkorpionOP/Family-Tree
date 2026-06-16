import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GitBranch, LogOut, Plus, TreeDeciduous, Shield, Menu } from 'lucide-react';

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
    <nav className="bg-slate-950/80 border-b border-slate-800/80 px-4 md:px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
      
      {/* Brand Logo & Mobile Menu Toggle */}
      <div className="flex items-center space-x-2 md:space-x-3 text-emerald-400">
        {user && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-slate-400 hover:text-emerald-400 p-2 bg-slate-900 border border-slate-800 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center mr-0.5"
            title="Menu options"
          >
            <Menu size={18} />
          </button>
        )}
        <div className="bg-emerald-950/50 p-1 rounded-xl border border-emerald-500/30 flex items-center justify-center overflow-hidden w-9 h-9 md:w-10 md:h-10">
          <img src="/fist.png" alt="Sangam Roots Logo" className="w-full h-full object-contain animate-pulse" />
        </div>
        <div>
          <h1 className="font-extrabold text-xs sm:text-sm md:text-base tracking-wide bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-none uppercase">
            Sangam Roots
          </h1>
          <span className="text-[9px] text-slate-500 font-medium block -mt-0.5 uppercase tracking-widest">
            Find your roots along with us
          </span>
        </div>
      </div>

      {/* View Selector Tabs */}
      {user && (
        <div className="flex items-center space-x-1 bg-slate-900/60 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => onSelectView('tree')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              currentView === 'tree' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kinship Tree
          </button>
          <button
            onClick={() => onSelectView('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              currentView === 'profile' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Profile
          </button>
          {user.role === 'SuperAdmin' && (
            <button
              onClick={() => onSelectView('superadmin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                currentView === 'superadmin' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-400 hover:text-purple-200'
              }`}
            >
              SuperAdmin
            </button>
          )}
        </div>
      )}

      {/* Tree Selector / Actions (Desktop Only) */}
      {user && (
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-2 mr-1">
            <GitBranch size={16} className="text-slate-400" />
            <select
              value={activeTreeId || ''}
              onChange={(e) => onSelectTree(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer min-w-[180px]"
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
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl px-3.5 py-2 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/20 active:scale-95 cursor-pointer"
          >
            <Plus size={14} />
            <span>New Tree</span>
          </button>

          <button
            onClick={onJoinTree}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs rounded-xl px-3.5 py-2 transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <GitBranch size={14} className="text-emerald-400" />
            <span>Join Tree</span>
          </button>

          {activeTree && (userRole === 'Admin' || userRole === 'Sub-Admin') && (
            <button
              onClick={onAddNode}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl px-3.5 py-2 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/20 active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Node</span>
            </button>
          )}

          {activeTree && userRole === 'Admin' && (
            <button
              onClick={onOpenManageRoles}
              className="relative flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs rounded-xl px-3.5 py-2 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <Shield size={14} className="text-emerald-400" />
              <span>Roles & Access</span>
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none animate-bounce">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}
        </div>
      )}

      {/* User Info / Logout (Desktop Only) */}
      {user ? (
        <div className="hidden md:flex items-center space-x-5">
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Logged in as</span>
            <span className="text-xs font-semibold text-slate-300 block">{user.email}</span>
          </div>

          {activeTree && userRole && (
            <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${
              userRole === 'Admin' 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : userRole === 'Sub-Admin'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}>
              {userRole}
            </div>
          )}

          <button
            onClick={logout}
            className="flex items-center space-x-1 text-slate-400 hover:text-red-400 bg-slate-900/40 hover:bg-red-500/10 border border-slate-850 p-2 rounded-xl transition-all duration-300 cursor-pointer"
            title="Log Out"
          >
            <LogOut size={16} />
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

