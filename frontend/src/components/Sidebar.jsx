import React, { useState, useEffect } from 'react';
import { Search, Filter, X, User, Heart, Compass, Smartphone, Calendar, Link as LinkIcon, Compass as CompassIcon, RefreshCw, Layers, GitBranch, Plus, Shield, LogOut, Trash2 } from 'lucide-react';

const Sidebar = ({
  nodes,
  selectedNode,
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onResetFilters,
  relationSource,
  relationTarget,
  onClearRelation,
  onCheckRelation,
  relationResult,
  loadingRelation,
  
  // Mobile-only props
  trees = [],
  activeTreeId,
  onSelectTree,
  onCreateTree,
  onJoinTree,
  onAddNode,
  onOpenManageRoles,
  onDeleteTree,
  userRole,
  logout,
  pendingRequestsCount = 0,

  // Logs props
  logs = [],
  loadingLogs = false,
  fetchLogs,
  onRevertLog,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'history'

  useEffect(() => {
    if (activeTab === 'history' && fetchLogs) {
      fetchLogs();
    }
  }, [activeTab, activeTreeId]);

  // Get unique list of gotrams and blood groups for select dropdowns
  const uniqueGotrams = [...new Set(nodes.map(n => n.gotram).filter(Boolean))];
  const uniqueBloodGroups = [...new Set(nodes.map(n => n.bloodGroup).filter(Boolean))];
  const uniqueGenerations = [...new Set(nodes.map(n => n.generationLevel))].sort((a, b) => a - b);

  // Calculate age from DOB
  const getAge = (dobString) => {
    if (!dobString) return 'N/A';
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} years old`;
  };

  const getDobFormatted = (dobString) => {
    if (!dobString) return 'N/A';
    return new Date(dobString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const activeTree = trees.find((t) => t._id === activeTreeId);

  return (
    <div className="w-full md:w-80 bg-slate-950/95 border-r border-slate-900/50 flex flex-col h-full text-slate-200 overflow-y-auto border-r-slate-800/40 shadow-xl">
      
      {/* Mobile-only Tree Selector & Actions */}
      <div className="md:hidden p-4 border-b border-slate-900/80 bg-slate-950/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Family Tree</span>
          {logout && (
            <button
              onClick={logout}
              className="text-slate-400 hover:text-red-400 p-1.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95"
              title="Log Out"
            >
              <LogOut size={12} />
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <GitBranch size={14} className="text-slate-500" />
          <select
            value={activeTreeId || ''}
            onChange={(e) => onSelectTree(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            <option value="" disabled>Select Family Tree</option>
            {trees.map((t) => (
              <option key={t._id} value={t._id}>
                {t.treeName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCreateTree}
            className="flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl py-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={12} />
            <span>New Tree</span>
          </button>

          <button
            onClick={onJoinTree}
            className="flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs rounded-xl py-2 transition-all active:scale-95 cursor-pointer"
          >
            <GitBranch size={12} className="text-emerald-400" />
            <span>Join Tree</span>
          </button>
          
          {activeTree && (userRole === 'Admin' || userRole === 'Sub-Admin') && (
            <button
              onClick={onAddNode}
              className="col-span-2 flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl py-2 transition-all active:scale-95 cursor-pointer animate-in fade-in"
            >
              <Plus size={12} />
              <span>Add Member Node</span>
            </button>
          )}

          {activeTree && userRole === 'Admin' && (
            <>
              <button
                onClick={onOpenManageRoles}
                className="col-span-2 flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs rounded-xl py-2 transition-all active:scale-95 cursor-pointer"
              >
                <Shield size={12} className="text-emerald-400" />
                <span>Access Roles</span>
              </button>
              <button
                onClick={onDeleteTree}
                className="col-span-2 flex items-center justify-center space-x-1.5 bg-red-950/40 hover:bg-red-900 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-white font-semibold text-xs rounded-xl py-2 transition-all active:scale-95 cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Delete Family Tree</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-slate-900 flex-shrink-0">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'members'
              ? 'border-emerald-500 text-slate-200 bg-emerald-950/10'
              : 'border-transparent text-slate-500 hover:text-slate-350 hover:bg-slate-900/20'
          }`}
        >
          Members & Details
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'border-emerald-500 text-slate-200 bg-emerald-950/10'
              : 'border-transparent text-slate-500 hover:text-slate-350 hover:bg-slate-900/20'
          }`}
        >
          Activity History
        </button>
      </div>

      {activeTab === 'members' ? (
        <>
          {/* 1. SEARCH & FILTERS SECTION */}
          <div className="p-4 border-b border-slate-900 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search family members..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                  showFilters || Object.values(filters).some(Boolean)
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Filter size={12} />
                <span>Filters</span>
              </button>

              {Object.values(filters).some(Boolean) && (
                <button
                  onClick={onResetFilters}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1"
                >
                  <RefreshCw size={10} />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Filter Details Accordion */}
            {showFilters && (
              <div className="bg-slate-900/50 border border-slate-900 p-3 rounded-xl space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Gotram Filter */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Gotram</label>
                  <select
                    value={filters.gotram}
                    onChange={(e) => onFilterChange('gotram', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    <option value="">All Gotrams</option>
                    {uniqueGotrams.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Blood Group Filter */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Blood Group</label>
                  <select
                    value={filters.bloodGroup}
                    onChange={(e) => onFilterChange('bloodGroup', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    <option value="">All Blood Groups</option>
                    {uniqueBloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                {/* Generation Level Filter */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Generation Level</label>
                  <select
                    value={filters.generationLevel}
                    onChange={(e) => onFilterChange('generationLevel', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    <option value="">All Generations</option>
                    {uniqueGenerations.map(gen => (
                      <option key={gen} value={gen}>Generation {gen}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 2. TREE INFORMATION SECTION */}
          {activeTree && (
            <div className="p-4 border-b border-slate-900 space-y-3.5 bg-slate-950/20 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Tree Information</span>
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                  userRole === 'Admin' 
                    ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                    : userRole === 'Sub-Admin'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                }`}>
                  {userRole || 'Viewer'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block leading-none font-semibold">Tree Name</span>
                  <span className="text-slate-200 block mt-1 font-bold">{activeTree.treeName}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block leading-none font-semibold mb-1">Tree ID</span>
                  <div className="flex items-center space-x-1 bg-slate-950/60 p-2 rounded-xl border border-slate-850">
                    <span className="font-mono text-[10px] text-slate-400 truncate flex-1 select-all">{activeTree._id}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeTree._id);
                        alert('Tree ID copied to clipboard!');
                      }}
                      className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[9px] text-emerald-400 font-bold rounded hover:bg-slate-850 active:scale-95 cursor-pointer transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block leading-none font-semibold">Creator</span>
                  <span className="text-slate-355 block mt-0.5 truncate" title={activeTree.createdBy?.email || 'N/A'}>
                    {activeTree.createdBy?.email || 'N/A'}
                  </span>
                </div>

                {activeTree.admins && activeTree.admins.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-500 block leading-none font-semibold">Admins</span>
                    <span className="text-slate-355 block mt-0.5 truncate" title={activeTree.admins.map(a => a.email).join(', ')}>
                      {activeTree.admins.map(a => a.email).join(', ')}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-[10px] text-slate-500 block leading-none font-semibold">Created At</span>
                  <span className="text-slate-355 block mt-0.5">
                    {activeTree.createdAt ? new Date(activeTree.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>

                {userRole === 'Admin' && pendingRequestsCount > 0 && (
                  <div className="bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-400 mt-3 animate-pulse">
                    <span className="font-semibold">{pendingRequestsCount} Pending Request(s)</span>
                    <button
                      onClick={onOpenManageRoles}
                      className="px-2 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 text-[10px] font-bold active:scale-95 cursor-pointer transition-colors"
                    >
                      Review
                    </button>
                  </div>
                )}

                {userRole === 'Admin' && (
                  <div className="pt-2 border-t border-slate-900/60 mt-3 flex justify-end">
                    <button
                      onClick={onDeleteTree}
                      className="flex items-center space-x-1.5 bg-red-950/30 hover:bg-red-900/50 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 text-[11px] font-bold px-3 py-2 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Delete Family Tree</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b border-slate-900 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Activity History</span>
            <button
              onClick={fetchLogs}
              disabled={loadingLogs}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={10} className={loadingLogs ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
            {loadingLogs ? (
              <div className="text-center py-8 text-xs text-slate-500">Loading activity history...</div>
            ) : !logs || logs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No activity logs recorded yet.</div>
            ) : (
              logs.map((log) => {
                const canRevert = (userRole === 'Admin' || userRole === 'Sub-Admin') && !log.isReverted;
                return (
                  <div 
                    key={log._id} 
                    className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                      log.isReverted 
                        ? 'bg-slate-950/30 border-slate-900/40 opacity-60' 
                        : 'bg-slate-900 border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between space-x-2">
                      <p className="font-semibold text-slate-200 leading-snug">{log.description}</p>
                      {log.isReverted && (
                        <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-slate-800 text-slate-400 rounded uppercase tracking-wider flex-shrink-0">
                          Reverted
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>By: {log.userName}</span>
                      <span>{new Date(log.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>

                    {canRevert && onRevertLog && (
                      <button
                        onClick={() => onRevertLog(log._id)}
                        className="w-full py-1.5 bg-red-950/30 hover:bg-red-900/50 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer mt-1"
                      >
                        Revert Change
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
