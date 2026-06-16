import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { TreeDeciduous, Users, Link2, Trash2, Key, RefreshCw, AlertTriangle, Shield, CheckCircle } from 'lucide-react';

const SuperAdminDashboard = () => {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [reassigningTreeId, setReassigningTreeId] = useState(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [submittingReassign, setSubmittingReassign] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingTree, setDeletingTree] = useState(false);

  const fetchTrees = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.superadmin.listTrees();
      setTrees(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load system trees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrees();
  }, []);

  const handleReassignSubmit = async (e, treeId) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    setSubmittingReassign(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.superadmin.reassignAdmin(treeId, newAdminEmail.trim());
      setSuccessMsg(res.message);
      setReassigningTreeId(null);
      setNewAdminEmail('');
      await fetchTrees();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to reassign admin.');
    } finally {
      setSubmittingReassign(false);
    }
  };

  const handleDeleteTree = async (treeId) => {
    setDeletingTree(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.superadmin.deleteTree(treeId);
      setSuccessMsg(res.message);
      setConfirmDeleteId(null);
      await fetchTrees();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete tree.');
    } finally {
      setDeletingTree(false);
    }
  };

  return (
    <div className="flex-1 bg-[#020617] p-6 md:p-10 overflow-y-auto text-slate-100 flex justify-center">
      <div className="w-full max-w-6xl space-y-8 animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-purple-400 flex items-center space-x-2.5">
              <Shield size={28} />
              <span>SuperAdmin Control Panel</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Global system monitoring: delete any family tree, track administrators, and reassign primary ownership.
            </p>
          </div>
          <button
            onClick={fetchTrees}
            disabled={loading}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2.5 rounded-xl transition cursor-pointer text-slate-300 hover:text-slate-100 active:scale-95"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
            <span className="hidden md:inline text-xs font-semibold">Refresh</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl flex items-center space-x-3 text-sm font-medium">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center space-x-3 text-sm font-medium">
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {loading && trees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="animate-spin text-purple-500" size={32} />
            <span className="text-slate-400 text-sm">Loading database trees...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trees.map((tree) => {
              const creatorEmail = tree.createdBy?.email || 'Unknown';
              const adminEmails = tree.admins?.map(a => a.email).join(', ') || 'None';

              return (
                <div key={tree._id} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-5 flex flex-col justify-between backdrop-blur-md hover:border-slate-700/80 transition duration-300">
                  <div className="space-y-3">
                    
                    {/* Title */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 text-purple-300">
                        <TreeDeciduous size={18} />
                        <h4 className="font-bold text-base tracking-wide truncate max-w-[170px]">{tree.treeName}</h4>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {tree._id.slice(-6)}</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-850">
                      <div className="text-center">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">Nodes</span>
                        <span className="text-sm font-extrabold text-slate-300">{tree.nodeCount}</span>
                      </div>
                      <div className="text-center border-l border-slate-850">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">Relations</span>
                        <span className="text-sm font-extrabold text-slate-300">{tree.edgeCount}</span>
                      </div>
                    </div>

                    {/* Ownership Details */}
                    <div className="text-xs space-y-1 bg-slate-950/30 p-2.5 rounded-xl">
                      <div>
                        <span className="text-slate-500 block font-semibold">Created By:</span>
                        <span className="text-slate-300 truncate block font-mono">{creatorEmail}</span>
                      </div>
                      <div className="pt-1 border-t border-slate-850/60">
                        <span className="text-slate-500 block font-semibold">Active Admins:</span>
                        <span className="text-slate-300 truncate block font-mono">{adminEmails}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-850/60">
                    
                    {/* Reassign Row */}
                    {reassigningTreeId === tree._id ? (
                      <form onSubmit={(e) => handleReassignSubmit(e, tree._id)} className="space-y-2">
                        <input
                          type="email"
                          required
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="Enter new admin email"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none transition"
                        />
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            disabled={submittingReassign}
                            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition active:scale-95 cursor-pointer"
                          >
                            Confirm Reassign
                          </button>
                          <button
                            type="button"
                            onClick={() => { setReassigningTreeId(null); setNewAdminEmail(''); }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : confirmDeleteId === tree._id ? (
                      <div className="bg-red-950/20 border border-red-500/20 p-2.5 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-red-400 block leading-tight">Delete tree & all connected nodes/relations?</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteTree(tree._id)}
                            disabled={deletingTree}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold py-1 rounded-lg transition cursor-pointer"
                          >
                            Yes, Delete Tree
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => { setReassigningTreeId(tree._id); setConfirmDeleteId(null); }}
                          className="flex-1 flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 font-semibold text-xs py-2 rounded-xl transition cursor-pointer active:scale-95"
                        >
                          <Key size={12} className="text-purple-400" />
                          <span>Reassign Admin</span>
                        </button>
                        <button
                          onClick={() => { setConfirmDeleteId(tree._id); setReassigningTreeId(null); }}
                          className="bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 p-2 rounded-xl transition cursor-pointer active:scale-95"
                          title="Delete Tree"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default SuperAdminDashboard;
