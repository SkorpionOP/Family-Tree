import React, { useState, useEffect } from 'react';
import { X, Shield, Key, Mail, Check, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

const RolesModal = ({
  isOpen,
  onClose,
  nodes,
  treeId,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState('invite'); // 'invite' | 'requests' | 'members'
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Sub-Admin'); // default to Sub-Admin
  const [nodeId, setNodeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Join Requests states
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState({}); // requestId -> nodeId

  // Manage Members states
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editNodeId, setEditNodeId] = useState('');

  const fetchJoinRequests = async () => {
    if (!treeId) return;
    setLoadingRequests(true);
    try {
      const reqs = await api.trees.listJoinRequests(treeId);
      setJoinRequests(reqs);
    } catch (err) {
      console.error('Failed to load join requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchMembers = async () => {
    if (!treeId) return;
    setLoadingMembers(true);
    try {
      const data = await api.trees.listMembers(treeId);
      setMembers(data);
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setRole('Sub-Admin');
      setNodeId('');
      setError('');
      setSuccess('');
      setSelectedNodeIds({});
      setEditingMember(null);
      // Fetch both requests and members in background
      fetchJoinRequests();
      fetchMembers();
    }
  }, [isOpen, treeId]);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'requests') {
        fetchJoinRequests();
      } else if (activeTab === 'members') {
        fetchMembers();
      }
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (role === 'Standard' && !nodeId) {
        throw new Error('Standard users must be linked to a specific node');
      }

      await onSubmit(email, role, role === 'Standard' ? nodeId : null);
      setSuccess(`User ${email} successfully assigned to role: ${role}`);
      setEmail('');
      setNodeId('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    const assignedNodeId = selectedNodeIds[requestId];
    if (!assignedNodeId) {
      alert('Please select a Family Member Node to link this user.');
      return;
    }

    try {
      await api.trees.approveJoinRequest(treeId, requestId, assignedNodeId);
      alert('User request approved successfully!');
      fetchJoinRequests();
    } catch (err) {
      alert(err.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this join request?')) return;
    try {
      await api.trees.rejectJoinRequest(treeId, requestId);
      alert('User request rejected.');
      fetchJoinRequests();
    } catch (err) {
      alert(err.message || 'Failed to reject request');
    }
  };

  const handleEditClick = (member) => {
    if (member.isCreator) {
      alert('Creator role cannot be modified.');
      return;
    }
    setEditingMember(member);
    setEditRole(member.role);
    setEditNodeId(member.nodeId || '');
  };

  const handleUpdateMember = async (e, memberEmail) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (editRole === 'Standard' && !editNodeId) {
        throw new Error('Standard users must be linked to a specific node');
      }
      await onSubmit(memberEmail, editRole, editRole === 'Standard' ? editNodeId : null);
      setSuccess(`Updated permissions for ${memberEmail}`);
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Shield size={18} />
            <h2 className="text-base font-bold text-slate-100">Roles & Access Control</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 bg-slate-850 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-855 bg-slate-955/20 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('invite')}
            className={`pb-2.5 text-xs font-bold border-b-2 mr-6 transition-all ${
              activeTab === 'invite' ? 'border-emerald-500 text-slate-100' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Invite Member
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`pb-2.5 text-xs font-bold border-b-2 mr-6 transition-all flex items-center ${
              activeTab === 'requests' ? 'border-emerald-500 text-slate-100' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>Join Requests</span>
            {joinRequests.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-extrabold bg-emerald-600 text-white rounded-full leading-none">
                {joinRequests.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'members' ? 'border-emerald-500 text-slate-100' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Manage Members
          </button>
        </div>

        {/* Tab 1: Invite Member Form */}
        {activeTab === 'invite' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2">
                <Check size={14} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Email input */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">User Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            {/* Role selector */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Access Role</label>
              <div className="grid grid-cols-3 gap-2">
                {['Admin', 'Sub-Admin', 'Standard'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      role === r
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Node selection for Standard role */}
            {role === 'Standard' && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Link to Tree Node</label>
                <select
                  value={nodeId}
                  onChange={(e) => setNodeId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-350 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                >
                  <option value="">Select a Family Member Node</option>
                  {nodes.map((node) => (
                    <option key={node._id} value={node._id}>
                      {node.name} (Gen: {node.generationLevel}, Parity: {node.parity})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  Standard Users can view the family tree graph, but can only edit this specific node's profile details.
                </p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-850 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-slate-200 text-xs font-semibold rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4.5 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/10 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Assigning...' : 'Assign Role'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Join Requests */}
        {activeTab === 'requests' && (
          <div className="p-6 space-y-4">
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-1 space-y-3.5">
              {loadingRequests ? (
                <div className="text-center py-8 text-xs text-slate-500 animate-pulse">
                  Loading requests...
                </div>
              ) : joinRequests.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 italic">
                  No pending join requests found.
                </div>
              ) : (
                joinRequests.map((req) => (
                  <div key={req._id} className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-2xl flex flex-col space-y-2.5">
                    <div className="flex items-center justify-between min-w-0">
                      <span className="text-xs font-bold text-slate-200 truncate pr-2" title={req.userId.email}>
                        {req.userId.email}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase shrink-0">Pending</span>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Link request to family member</span>
                      <select
                        value={selectedNodeIds[req._id] || ''}
                        onChange={(e) => setSelectedNodeIds(prev => ({ ...prev, [req._id]: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-350 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer"
                      >
                        <option value="">Select Node to Link</option>
                        {nodes.filter(node => !node.linkedUserId).map((node) => (
                          <option key={node._id} value={node._id}>
                            {node.name} (Gen: {node.generationLevel})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex space-x-2.5 pt-1.5">
                      <button
                        type="button"
                        onClick={() => handleRejectRequest(req._id)}
                        className="flex-1 py-2 border border-slate-850 hover:border-slate-750 hover:bg-red-950/15 text-red-450 hover:text-red-400 text-xs font-semibold rounded-xl transition-all cursor-pointer active:scale-95"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveRequest(req._id)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer active:scale-95"
                      >
                        Approve & Link
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-850 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-slate-200 text-xs font-semibold rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Manage Members */}
        {activeTab === 'members' && (
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2">
                <Check size={14} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-1 space-y-3">
              {loadingMembers ? (
                <div className="text-center py-8 text-xs text-slate-500 animate-pulse">
                  Loading members...
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 italic">
                  No tree members found.
                </div>
              ) : (
                members.map((member) => {
                  const isEditing = editingMember && editingMember.userId === member.userId;
                  return (
                    <div key={member.userId || member.email} className="bg-slate-950/40 border border-slate-850/60 p-3.5 rounded-2xl flex flex-col space-y-2.5">
                      <div className="flex items-center justify-between min-w-0">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-200 truncate" title={member.email}>
                            {member.email}
                          </span>
                          <span className="text-[9px] text-slate-500 leading-none mt-1">
                            {member.isCreator ? (
                              <span className="text-amber-500/80 font-semibold">Creator • Owner</span>
                            ) : member.role === 'Standard' ? (
                              <span>Linked Node: <strong className="text-slate-350">{member.nodeName || 'None'}</strong></span>
                            ) : (
                              <span>Admin Access</span>
                            )}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                          member.role === 'Admin'
                            ? 'bg-red-950/45 text-red-400 border-red-500/10'
                            : member.role === 'Sub-Admin'
                            ? 'bg-blue-950/45 text-blue-400 border-blue-500/10'
                            : 'bg-emerald-950/45 text-emerald-400 border-emerald-500/10'
                        }`}>
                          {member.role}
                        </span>
                      </div>

                      {isEditing ? (
                        <form onSubmit={(e) => handleUpdateMember(e, member.email)} className="border-t border-slate-850/80 pt-3.5 space-y-3">
                          {/* Edit Role */}
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Access Role</label>
                            <div className="grid grid-cols-3 gap-2">
                              {['Admin', 'Sub-Admin', 'Standard'].map((r) => (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => setEditRole(r)}
                                  className={`py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                                    editRole === r
                                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/50'
                                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                                  }`}
                                >
                                  {r}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Edit Node ID for Standard */}
                          {editRole === 'Standard' && (
                            <div className="space-y-1">
                              <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Reassign Tree Node</label>
                              <select
                                value={editNodeId}
                                onChange={(e) => setEditNodeId(e.target.value)}
                                required
                                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-350 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer"
                              >
                                <option value="">Select Node to Link</option>
                                {nodes.map((node) => (
                                  <option key={node._id} value={node._id}>
                                    {node.name} (Gen: {node.generationLevel})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div className="flex space-x-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingMember(null)}
                              className="flex-1 py-1.5 border border-slate-850 hover:border-slate-750 text-slate-400 text-xs font-semibold rounded-xl transition-all cursor-pointer active:scale-95"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={loading}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer active:scale-95"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      ) : (
                        !member.isCreator && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => handleEditClick(member)}
                              className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 bg-slate-950 border border-slate-850 px-3 py-1 rounded-xl transition-all hover:bg-slate-900 active:scale-95 cursor-pointer"
                            >
                              Reassign / Edit
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-slate-850 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-slate-200 text-xs font-semibold rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RolesModal;
