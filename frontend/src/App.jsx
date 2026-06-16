import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './utils/api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import NodeModal from './components/NodeModal';
import RolesModal from './components/RolesModal';
import Profile from './components/Profile';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import MailVerification from './components/MailVerification';
import { 
  TreeDeciduous, 
  GitBranch, 
  Plus, 
  LayoutGrid, 
  Settings2, 
  Unlock, 
  Mail, 
  Lock, 
  ChevronRight, 
  Heart,
  Eye,
  EyeOff,
  UserCheck,
  X,
  User,
  Calendar,
  Smartphone,
  Link2,
  Compass,
  UserPlus,
  Edit2,
  Trash2
} from 'lucide-react';

const App = () => {
  const { user, loading: authLoading, login, loginWithGoogle, register, reloadUser, logout, needVerification, forgotPassword } = useAuth();
  
  // App states
  const [currentView, setCurrentView] = useState('tree'); // 'tree' | 'profile' | 'superadmin'
  const [trees, setTrees] = useState([]);
  const [activeTreeId, setActiveTreeId] = useState(null);
  const [graphCenterNodeId, setGraphCenterNodeId] = useState(null);
  const [rawNodes, setRawNodes] = useState([]);
  const [rawEdges, setRawEdges] = useState([]);
  const [userRole, setUserRole] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    gotram: '',
    bloodGroup: '',
    generationLevel: '',
  });

  // Selected Node in tree
  const [selectedNode, setSelectedNode] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  
  // Relationship states
  const [relationSource, setRelationSource] = useState(null);
  const [relationTarget, setRelationTarget] = useState(null);
  const [relationResult, setRelationResult] = useState(null);
  const [loadingRelation, setLoadingRelation] = useState(false);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'add_child' | 'add_spouse' | 'edit_profile' | 'link_user'
  const [modalTargetId, setModalTargetId] = useState(null);
  
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Activity History states
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchLogs = async () => {
    if (!activeTreeId) return;
    setLoadingLogs(true);
    try {
      const data = await api.kinship.getLogs(activeTreeId);
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load activity logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleRevertLog = async (logId) => {
    if (!activeTreeId) return;
    const confirmRevert = window.confirm('Are you sure you want to revert this change? This will restore previous data or remove created items.');
    if (!confirmRevert) return;
    
    try {
      setError('');
      const response = await api.kinship.revertLog(activeTreeId, logId);
      alert(response.message || 'Change reverted successfully');
      
      // Refresh tree graph and logs list
      await fetchGraph();
      await fetchLogs();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to revert change');
    }
  };

  // Auto-close sidebar on mobile when active tree changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [activeTreeId]);

  // Layout direction
  const [layoutDirection, setLayoutDirection] = useState('TB'); // 'TB' or 'LR'

  // Auth Page states
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authProcess, setAuthProcess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Fetch trees list when user logs in
  useEffect(() => {
    if (user) {
      fetchTrees();
    } else {
      setTrees([]);
      setActiveTreeId(null);
      setRawNodes([]);
      setRawEdges([]);
    }
  }, [user]);

  // Fetch graph details when active tree changes
  useEffect(() => {
    if (activeTreeId) {
      setGraphCenterNodeId(null);
      fetchGraph(null);
      // Clear selected nodes and relation result when switching trees (persisting source & target)
      setSelectedNode(null);
      setRelationResult(null);
    }
  }, [activeTreeId]);

  const fetchTrees = async () => {
    try {
      const data = await api.trees.list();
      setTrees(data);
      if (data.length > 0 && !activeTreeId) {
        // Default to first tree
        setActiveTreeId(data[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch family trees');
    }
  };

  const fetchGraph = async (centerId = null) => {
    if (!activeTreeId) return;
    setLoading(true);
    try {
      const targetCenterId = centerId !== null ? centerId : graphCenterNodeId;
      const data = await api.kinship.getGraph(activeTreeId, targetCenterId);
      setRawNodes(data.nodes);
      setRawEdges(data.edges);
      setUserRole(data.userRole);

      // Fetch pending requests count if user is Admin of the active tree
      if (data.userRole === 'Admin') {
        const reqs = await api.trees.listJoinRequests(activeTreeId);
        setPendingRequestsCount(reqs.length);
      } else {
        setPendingRequestsCount(0);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load tree graph data');
    } finally {
      setLoading(false);
    }
  };

  // Auth submit handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthProcess(true);

    try {
      if (isLoginTab) {
        await login(authEmail, authPassword);
      } else {
        await register(authEmail, authPassword);
      }
    } catch (err) {
      if (err.message === 'unverified') {
        setAuthError('Your email address is not verified. Please verify your email first.');
      } else {
        setAuthError(err.message || 'Authentication failed');
      }
    } finally {
      setAuthProcess(false);
    }
  };

  // Forgot password submit handler
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthProcess(true);
    setResetSent(false);
    try {
      await forgotPassword(authEmail);
      setResetSent(true);
    } catch (err) {
      setAuthError(err.message || 'Failed to send password reset email');
    } finally {
      setAuthProcess(false);
    }
  };

  // Create tree handler
  const handleCreateTree = async () => {
    const treeName = prompt('Enter a name for the new family tree:');
    if (!treeName || !treeName.trim()) return;

    try {
      const newTree = await api.trees.create(treeName.trim());
      await reloadUser(); // reload user activeTrees array
      await fetchTrees();
      setActiveTreeId(newTree._id);
    } catch (err) {
      alert(err.message || 'Failed to create tree');
    }
  };

  // Join tree handler
  const handleJoinTree = async () => {
    const treeId = prompt('Enter the Unique Database ID of the family tree you wish to join:');
    if (!treeId || !treeId.trim()) return;

    try {
      const response = await api.trees.joinRequest(treeId.trim());
      alert(response.message || 'Request to join tree submitted successfully! Please wait for the administrator to approve.');
    } catch (err) {
      alert(err.message || 'Failed to submit join request');
    }
  };

  // Delete tree handler
  const handleDeleteTree = async () => {
    if (!activeTreeId) return;
    const treeToDelete = trees.find(t => t._id === activeTreeId);
    if (!treeToDelete) return;
    
    const confirmDelete = window.confirm(`Are you absolutely sure you want to delete the family tree "${treeToDelete.treeName}"? This action CANNOT be undone, and will delete all members and relationships in this tree.`);
    if (!confirmDelete) return;

    try {
      setError('');
      await api.trees.delete(activeTreeId);
      
      // Refresh trees list
      const updatedTrees = await api.trees.list();
      setTrees(updatedTrees);
      
      if (updatedTrees.length > 0) {
        setActiveTreeId(updatedTrees[0]._id);
      } else {
        setActiveTreeId(null);
        setRawNodes([]);
        setRawEdges([]);
      }
      setSelectedNode(null);
      setRelationSource(null);
      setRelationTarget(null);
      setRelationResult(null);
      
      alert('Family tree deleted successfully.');
    } catch (err) {
      alert(err.message || 'Failed to delete the family tree');
    }
  };

  // Manage roles handler
  const handleManageRole = async (email, role, nodeId) => {
    if (!activeTreeId) return;
    await api.trees.manageRole(activeTreeId, email, role, nodeId);
    // Reload graph in case user details changed
    fetchGraph();
  };

  // Node submissions handler
  const handleNodeSubmit = async (data) => {
    if (!activeTreeId) return;
    
    if (modalMode === 'add_child') {
      if (data.modeType === 'existing_child') {
        await api.kinship.createParentChild(activeTreeId, data.parentId, data.childId);
      } else {
        await api.kinship.createNode(activeTreeId, data);
      }
    } else if (modalMode === 'add_parent') {
      if (data.modeType === 'existing_parent') {
        await api.kinship.createParentChild(activeTreeId, data.parentId, data.childId);
      } else {
        await api.kinship.createNode(activeTreeId, data);
      }
    } else if (modalMode === 'add_spouse') {
      if (data.modeType === 'existing') {
        // Link pre-existing nodes in marriage
        await api.kinship.createMarriage(activeTreeId, data.targetNodeId, data.spouseNodeId);
      } else if (data.modeType === 'cross_tree') {
        // Link cross-tree node
        await api.kinship.createSpouse(activeTreeId, {
          existingNodeId: data.targetNodeId,
          crossTreeNodeId: data.crossTreeNodeId
        });
      } else {
        // Create new spouse node
        await api.kinship.createSpouse(activeTreeId, data);
      }
    } else if (modalMode === 'edit_profile') {
      await api.kinship.updateNode(activeTreeId, modalTargetId, data);
      // If the currently selected node was edited, update selectedNode profile view
      if (selectedNode && selectedNode._id === modalTargetId) {
        setSelectedNode(prev => ({ ...prev, ...data }));
      }
    }
    
    // Refresh graph
    fetchGraph();
  };

  // Node actions from CustomNode dropdown
  const handleAddChildClick = (id) => {
    setModalMode('add_child');
    setModalTargetId(id);
    setModalOpen(true);
  };

  const handleAddSpouseClick = (id) => {
    setModalMode('add_spouse');
    setModalTargetId(id);
    setModalOpen(true);
  };

  const handleAddParentClick = (id) => {
    setModalMode('add_parent');
    setModalTargetId(id);
    setModalOpen(true);
  };

  const handleEditProfileClick = (id) => {
    const node = rawNodes.find(n => n._id === id);
    setModalMode('edit_profile');
    setModalTargetId(id);
    setSelectedNode(node); // Sync selection
    setModalOpen(true);
  };

  const handleDeleteNodeClick = async (id) => {
    if (!activeTreeId) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this family member? All their relationships will be removed.');
    if (!confirmDelete) return;

    try {
      await api.kinship.deleteNode(activeTreeId, id);
      if (selectedNode && selectedNode._id === id) {
        setSelectedNode(null);
      }
      if (relationSource && relationSource._id === id) setRelationSource(null);
      if (relationTarget && relationTarget._id === id) setRelationTarget(null);
      fetchGraph();
    } catch (err) {
      alert(err.message || 'Failed to delete node');
    }
  };

  const handleCheckRelationClick = (id, roleType) => {
    const node = rawNodes.find(n => n._id === id);
    if (roleType === 'source') {
      setRelationSource(node);
      setRelationResult(null); // Clear old results
    } else {
      setRelationTarget(node);
      setRelationResult(null); // Clear old results
    }
    setSelectedNode(null); // Auto-close profile panel when set as source/target
  };

  const handleClearRelation = (roleType) => {
    if (roleType === 'source') {
      setRelationSource(null);
    } else {
      setRelationTarget(null);
    }
    setRelationResult(null);
  };

  // Calculate kinship terms
  const handleCheckRelation = async () => {
    if (!activeTreeId || !relationSource || !relationTarget) return;
    setLoadingRelation(true);
    try {
      const data = await api.kinship.getRelation(activeTreeId, relationSource._id, relationTarget._id);
      setRelationResult(data);
    } catch (err) {
      alert(err.message || 'Error computing relation path');
    } finally {
      setLoadingRelation(false);
    }
  };



  const [pendingSelectNodeId, setPendingSelectNodeId] = useState(null);

  // Handle auto-selecting pending cross-tree node after graph loads
  useEffect(() => {
    if (pendingSelectNodeId && rawNodes.length > 0) {
      const matched = rawNodes.find(n => n._id === pendingSelectNodeId);
      if (matched) {
        setSelectedNode(matched);
        setPendingSelectNodeId(null);
      }
    }
  }, [rawNodes, pendingSelectNodeId]);

  const handleViewCrossTree = async (crossTreeLinkId) => {
    try {
      setError('');
      const response = await api.kinship.getNodeTree(crossTreeLinkId);
      if (response && response.treeId) {
        setPendingSelectNodeId(crossTreeLinkId);
        setActiveTreeId(response.treeId);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to locate linked family tree');
    }
  };

  // Canvas node click selection
  const handleNodeClick = (event, node) => {
    const matched = rawNodes.find(n => n._id === node.id);
    if (matched) {
      setSelectedNode(matched);
    }
  };

  // Sidebar filters
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      gotram: '',
      bloodGroup: '',
      generationLevel: '',
    });
  };

  // Calculate age from DOB (or age at death if deceased)
  const getAge = (dobString, dodString = null, isDeceased = false) => {
    if (!dobString) return 'N/A';
    const birthDate = new Date(dobString);
    const endDate = isDeceased && dodString ? new Date(dodString) : new Date();
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const m = endDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return isDeceased ? `${age} yrs (at death)` : `${age} years old`;
  };

  const getDobFormatted = (dobString) => {
    if (!dobString) return 'N/A';
    return new Date(dobString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Apply filters (excluding search, since search highlights nodes instead of hiding them)
  const filteredNodes = rawNodes.filter(node => {
    if (filters.gotram && node.gotram !== filters.gotram) return false;
    if (filters.bloodGroup && node.bloodGroup !== filters.bloodGroup) return false;
    if (filters.generationLevel !== '' && node.generationLevel !== parseInt(filters.generationLevel)) return false;
    return true;
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n._id));
  const filteredEdges = rawEdges.filter(edge => 
    filteredNodeIds.has(edge.sourceNodeId) && filteredNodeIds.has(edge.targetNodeId)
  );

  // loading splash screen
  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <TreeDeciduous size={48} className="text-emerald-500 animate-bounce mb-4" />
        <h2 className="text-sm font-semibold tracking-widest text-slate-400 uppercase">Sangam Roots</h2>
        <span className="text-xs text-slate-600 mt-1.5">Find your roots along with us</span>
      </div>
    );
  }

  // Mail verification page check
  if (needVerification) {
    return <MailVerification />;
  }

  // Auth login/register view
  if (!user) {
    return (
      <div className="min-h-screen w-screen bg-[#020617] flex items-center justify-center font-sans relative overflow-hidden px-4">
        
        {/* Decorative Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10">
          
          {/* Logo panel */}
          <div className="bg-slate-950/60 px-8 py-8 border-b border-slate-850 text-center flex flex-col items-center">
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-2xl text-emerald-400 mb-3.5 shadow-lg shadow-emerald-500/5">
              <TreeDeciduous size={32} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent uppercase">
              Sangam Roots
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-0.5 animate-pulse">
              {showForgotPassword ? 'Reset your password' : 'Find your roots along with us'}
            </p>
          </div>

          {showForgotPassword ? (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPasswordSubmit} className="p-8 space-y-5">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-200">Forgot Password</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your email address below and we'll send you a link to reset your password.
                </p>
              </div>

              {authError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-xl">
                  {authError}
                </div>
              )}

              {resetSent && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-3 rounded-xl">
                  Password reset email sent! Check your inbox.
                </div>
              )}

              {/* Email input */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-slate-650"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={authProcess}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/10 active:scale-98 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {authProcess ? 'Processing...' : 'Send Reset Email'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setResetSent(false); setAuthError(''); }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
                  style={{ background: 'none', border: 'none' }}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            /* Standard Login / Register Form */
            <form onSubmit={handleAuthSubmit} className="p-8 space-y-5">
              {/* Tabs */}
              <div className="flex border-b border-slate-800 mb-2">
                <button
                  type="button"
                  onClick={() => { setIsLoginTab(true); setAuthError(''); }}
                  className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                    isLoginTab ? 'border-emerald-500 text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-350'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLoginTab(false); setAuthError(''); }}
                  className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                    !isLoginTab ? 'border-emerald-500 text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-350'
                  }`}
                >
                  Register
                </button>
              </div>

              {authError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-xl">
                  {authError}
                </div>
              )}

              {/* Email input */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-slate-650"
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Password</label>
                  {isLoginTab && (
                    <button
                      type="button"
                      onClick={() => { setShowForgotPassword(true); setAuthError(''); }}
                      className="text-[10px] text-emerald-500 hover:text-emerald-450 font-bold tracking-wider uppercase transition-colors cursor-pointer"
                      style={{ background: 'none', border: 'none' }}
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-slate-650"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-350 cursor-pointer"
                    style={{ background: 'none', border: 'none' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

               {/* Submit */}
              <button
                type="submit"
                disabled={authProcess}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/10 active:scale-98 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {authProcess ? 'Processing...' : isLoginTab ? 'Sign In to Account' : 'Create New Account'}
              </button>

              {/* Google Sign-In */}
              <div className="flex flex-col items-center mt-4 pt-4 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3">Or continue with</span>
                <button
                  type="button"
                  onClick={async () => {
                    setAuthProcess(true);
                    setAuthError('');
                    try {
                      await loginWithGoogle();
                    } catch (err) {
                      setAuthError(err.message || 'Google Sign-In failed.');
                    } finally {
                      setAuthProcess(false);
                    }
                  }}
                  disabled={authProcess}
                  className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-200 font-bold text-xs py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2.5 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.94 5.94 0 0 1 8 12.57c0-3.3 2.682-5.97 5.99-5.97 1.487 0 2.846.542 3.896 1.436l3.12-3.12C19.043 3.102 16.711 2 13.99 2 8.167 2 3.42 6.736 3.42 12.57S8.167 23.14 13.99 23.14c5.78 0 10.155-4.06 10.155-10.3 0-.61-.05-1.2-.15-1.78l-11.755-.775Z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    );
  }

  // Authenticated View
  return (
    <div className="h-screen w-screen bg-[#020617] flex flex-col font-sans overflow-hidden">
      
      {/* 1. TOP NAVBAR */}
      <Navbar
        trees={trees}
        activeTreeId={activeTreeId}
        onSelectTree={setActiveTreeId}
        onCreateTree={handleCreateTree}
        onJoinTree={handleJoinTree}
        onAddNode={() => handleAddChildClick(null)}
        onOpenManageRoles={() => setRolesModalOpen(true)}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        pendingRequestsCount={pendingRequestsCount}
        currentView={currentView}
        onSelectView={setCurrentView}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {currentView === 'profile' ? (
          <Profile />
        ) : currentView === 'superadmin' ? (
          <SuperAdminDashboard />
        ) : (
          <>
        
        {/* 2. SIDEBAR (Collapsible drawer on mobile, side panel on desktop) */}
        <div 
          className={`
            fixed md:relative top-[73px] md:top-0 left-0 z-20 md:z-auto h-[calc(100vh-73px)] md:h-auto 
            transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col flex-shrink-0
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <Sidebar
            nodes={rawNodes}
            selectedNode={selectedNode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            relationSource={relationSource}
            relationTarget={relationTarget}
            onClearRelation={handleClearRelation}
            onCheckRelation={handleCheckRelation}
            relationResult={relationResult}
            loadingRelation={loadingRelation}
            
            // Mobile-only props
            trees={trees}
            activeTreeId={activeTreeId}
            onSelectTree={setActiveTreeId}
            onCreateTree={handleCreateTree}
            onJoinTree={handleJoinTree}
            onAddNode={() => handleAddChildClick(null)}
            onOpenManageRoles={() => setRolesModalOpen(true)}
            onDeleteTree={handleDeleteTree}
            userRole={userRole}
            logout={logout}
            pendingRequestsCount={pendingRequestsCount}

            // Logs props
            logs={logs}
            loadingLogs={loadingLogs}
            fetchLogs={fetchLogs}
            onRevertLog={handleRevertLog}
          />
        </div>

        {/* Mobile Sidebar overlay backdrop */}
        {mobileSidebarOpen && (
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-10 top-[73px] cursor-pointer"
          />
        )}

        {/* 3. MAIN CANVAS AREA */}
        <div className="flex-1 h-full relative">
          
          {activeTreeId ? (
            <>


              {/* Floating Selected Node Profile View */}
              {selectedNode && (() => {
                const isCurrentUser = selectedNode.linkedUserId && user && selectedNode.linkedUserId.toString() === user._id.toString();
                const canEdit = userRole === 'Admin' || userRole === 'Sub-Admin' || (userRole === 'Standard' && isCurrentUser);
                const canAdd = userRole === 'Admin' || userRole === 'Sub-Admin';
                const canDelete = userRole === 'Admin';
                return (
                  <div className="absolute top-[88px] right-4 z-10 w-[calc(100vw-32px)] sm:w-80 bg-slate-900/85 border border-slate-800 backdrop-blur-md rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-200 text-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Member Profile</h3>
                      <button
                        onClick={() => setSelectedNode(null)}
                        className="text-slate-500 hover:text-slate-300 p-1 bg-slate-950/40 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {/* Avatar & Header */}
                      <div className="flex items-center space-x-3">
                        {selectedNode.profilePictureUrl ? (
                          <img
                            src={selectedNode.profilePictureUrl}
                            alt={selectedNode.name}
                            className={`w-12 h-12 rounded-full object-cover border cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200 ${selectedNode.isDeceased ? 'grayscale border-slate-650' : 'border-slate-800'}`}
                            onClick={() => setPreviewImageUrl(selectedNode.profilePictureUrl)}
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                            selectedNode.isDeceased ? 'bg-slate-950 border-slate-650 text-slate-400 grayscale' :
                            (selectedNode.gender === 1 ? 'bg-blue-950/40 border-blue-500/20 text-blue-400' : 'bg-pink-950/40 border-pink-500/20 text-pink-400')
                          }`}>
                            <User size={22} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-100 leading-tight truncate flex items-center">
                            <span className="truncate">{selectedNode.name}</span>
                            {selectedNode.isDeceased && (
                              <span className="ml-1.5 px-1 py-0.2 text-[8px] font-extrabold bg-slate-700 text-slate-300 rounded border border-slate-600 flex-shrink-0">
                                Deceased
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {selectedNode.gender === 1 ? 'Male' : 'Female'} • Gen Level {selectedNode.generationLevel}
                          </p>
                        </div>
                      </div>

                      {/* Profile fields */}
                      <div className="space-y-2.5 text-xs pt-1 border-t border-slate-800/40">
                        <div className="flex items-start space-x-2">
                          <Calendar size={13} className="text-slate-500 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-slate-500 block leading-none font-semibold">Date of Birth</span>
                            <span className="text-slate-300 block mt-0.5">{getDobFormatted(selectedNode.dob)} ({getAge(selectedNode.dob, selectedNode.dateOfDeath, selectedNode.isDeceased)})</span>
                          </div>
                        </div>

                        {selectedNode.isDeceased && (
                          <div className="flex items-start space-x-2 animate-in fade-in slide-in-from-top-1 duration-150">
                            <Calendar size={13} className="text-rose-500 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-rose-450 block leading-none font-semibold">Date of Death</span>
                              <span className="text-slate-350 block mt-0.5">{getDobFormatted(selectedNode.dateOfDeath)}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start space-x-2">
                          <Compass size={13} className="text-slate-500 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-slate-500 block leading-none font-semibold">Gotram</span>
                            <span className="text-slate-300 block mt-0.5">{selectedNode.gotram || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Heart size={13} className="text-slate-500 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-slate-500 block leading-none font-semibold">Blood Group</span>
                            <span className="text-slate-300 block mt-0.5">{selectedNode.bloodGroup || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Smartphone size={13} className="text-slate-500 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-slate-500 block leading-none font-semibold">Mobile Number</span>
                            <span className="text-slate-300 block mt-0.5">{selectedNode.mobileNumber || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Mail size={13} className="text-slate-500 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-slate-500 block leading-none font-semibold">Email Address</span>
                            <span className="text-slate-300 block mt-0.5">{selectedNode.email || 'N/A'}</span>
                          </div>
                        </div>

                        {selectedNode.socialLinks && selectedNode.socialLinks.length > 0 && (
                          <div className="flex items-start space-x-2">
                            <Link2 size={13} className="text-slate-500 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] text-slate-500 block leading-none font-semibold mb-1">Social Profiles</span>
                              <div className="space-y-0.5">
                                {selectedNode.socialLinks.map((link, idx) => (
                                  <a
                                    key={idx}
                                    href={link.startsWith('http') ? link : `https://${link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-400 hover:underline block truncate"
                                  >
                                    {link}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 flex justify-between items-center text-[10px] font-mono mt-1">
                          <span className="text-slate-500 font-bold uppercase">Kinship Parity</span>
                          <span className={`px-2 py-0.5 rounded font-extrabold ${selectedNode.parity === 1 ? 'bg-indigo-950 text-indigo-400 border border-indigo-500/10' : 'bg-amber-950 text-amber-400 border border-amber-500/10'}`}>
                            STATE {selectedNode.parity}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons inside Profile panel */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
                        {/* Relationship Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setRelationTarget(selectedNode);
                              setRelationResult(null);
                              setSelectedNode(null); // Auto-close profile panel when set as target
                            }}
                            className={`flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all active:scale-95 cursor-pointer ${
                              relationTarget && relationTarget._id === selectedNode._id
                                ? 'bg-purple-950/50 border-purple-500/50 text-purple-400 shadow-md shadow-purple-500/5'
                                : 'bg-slate-950 border-slate-800 hover:border-purple-500/30 text-slate-350 hover:text-purple-400'
                            }`}
                          >
                            <span>Set as Target</span>
                          </button>
                          <button
                            onClick={() => {
                              setRelationSource(selectedNode);
                              setRelationResult(null);
                              setSelectedNode(null); // Auto-close profile panel when set as source
                            }}
                            className={`flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all active:scale-95 cursor-pointer ${
                              relationSource && relationSource._id === selectedNode._id
                                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/5'
                                : 'bg-slate-950 border-slate-800 hover:border-emerald-500/30 text-slate-350 hover:text-emerald-400'
                            }`}
                          >
                            <span>Set as Source</span>
                          </button>
                        </div>

                        {/* Expand Graph Action */}
                        {selectedNode.hasUnloadedRelatives && (
                          <button
                            onClick={() => {
                              setGraphCenterNodeId(selectedNode._id);
                              fetchGraph(selectedNode._id);
                            }}
                            className="w-full flex items-center justify-center space-x-1.5 bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-xs py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-650/20 active:scale-95 cursor-pointer"
                          >
                            <Compass size={13} className="animate-pulse" />
                            <span>Expand Tree from Here</span>
                          </button>
                        )}
                        
                        {/* Node Manipulation Actions */}
                        {(canAdd || canEdit || canDelete) && (
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            {canAdd && (
                              <button
                                onClick={() => handleAddChildClick(selectedNode._id)}
                                className="bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-350 px-2 py-1.5 rounded-xl flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer"
                              >
                                <Plus size={11} className="text-emerald-500" />
                                <span>Add Child</span>
                              </button>
                            )}
                            {canAdd && (
                              <button
                                onClick={() => handleAddSpouseClick(selectedNode._id)}
                                disabled={rawEdges.some(e => e.relationshipType === 'spouse' && (e.sourceNodeId === selectedNode._id || e.targetNodeId === selectedNode._id))}
                                className="bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-350 px-2 py-1.5 rounded-xl flex items-center justify-center space-x-1 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <UserPlus size={11} className="text-pink-500" />
                                <span>Add Spouse</span>
                              </button>
                            )}
                            {canAdd && (
                              <button
                                onClick={() => handleAddParentClick(selectedNode._id)}
                                disabled={rawEdges.filter(e => e.relationshipType === 'parent_child' && e.targetNodeId === selectedNode._id).length >= 2}
                                className="bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-350 px-2 py-1.5 rounded-xl flex items-center justify-center space-x-1 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <Plus size={11} className="text-blue-500" />
                                <span>Add Parent</span>
                              </button>
                            )}
                            {canEdit && (
                              <button
                                onClick={() => handleEditProfileClick(selectedNode._id)}
                                className="bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-350 px-2 py-1.5 rounded-xl flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer"
                              >
                                <Edit2 size={11} className="text-blue-500" />
                                <span>Edit Profile</span>
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteNodeClick(selectedNode._id)}
                                className="col-span-2 bg-slate-950 border border-slate-855 hover:border-red-900/30 hover:bg-red-950/20 text-red-400 px-2 py-1.5 rounded-xl flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer"
                              >
                                <Trash2 size={11} />
                                <span>Delete Member</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })()}

              {previewImageUrl && (
                <div 
                  className="absolute top-[88px] left-4 md:left-auto md:right-[352px] z-20 w-64 bg-slate-900/95 border border-slate-800 backdrop-blur-md rounded-2xl p-3 shadow-2xl animate-in fade-in slide-in-from-top-4 md:slide-in-from-right-4 duration-200 text-slate-200"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Photo Preview</span>
                    <button
                      onClick={() => setPreviewImageUrl(null)}
                      className="text-slate-500 hover:text-slate-300 p-1 bg-slate-950/40 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-slate-950">
                    <img 
                      src={previewImageUrl} 
                      alt="Profile Enlarged" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Floating bottom Kinship Calculator division */}
              {relationTarget && (
                <div className="absolute bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-10 w-[calc(100vw-32px)] sm:min-w-[450px] sm:max-w-xl bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col space-y-3 text-slate-200 animate-in slide-in-from-bottom-20 md:slide-in-from-bottom-6 fade-in duration-200">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kinship Calculator</span>
                    <button
                      onClick={() => {
                        setRelationSource(null);
                        setRelationTarget(null);
                        setRelationResult(null);
                      }}
                      className="text-slate-500 hover:text-slate-300 p-1 bg-slate-950/40 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {/* Selection Status & Calculate Layout */}
                  {!relationSource ? (
                    <div className="flex flex-col items-center justify-center py-2.5 space-y-2.5">
                      <div className="flex items-center space-x-2 bg-purple-950/40 border border-purple-500/20 px-4 py-2 rounded-xl">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Target selected:</span>
                        <span className="text-xs font-bold text-purple-400">{relationTarget.name}</span>
                        <button
                          onClick={() => {
                            setRelationTarget(null);
                            setRelationResult(null);
                          }}
                          className="text-slate-500 hover:text-red-400 ml-1.5 cursor-pointer"
                          title="Clear target"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-450 animate-pulse text-center">
                        Select another family member node and click <span className="text-emerald-400 font-semibold">"Set as Source"</span> to check their kinship relationship.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Both target and source are selected */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {/* Source */}
                        <div className="bg-slate-950/50 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between min-h-[38px]">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 uppercase font-bold">Source</span>
                            <span className="font-bold text-emerald-400 truncate max-w-[130px] sm:max-w-[180px]">{relationSource.name}</span>
                          </div>
                          <button onClick={() => handleClearRelation('source')} className="text-slate-500 hover:text-red-400">
                            <X size={12} />
                          </button>
                        </div>

                        {/* Target */}
                        <div className="bg-slate-950/50 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between min-h-[38px]">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 uppercase font-bold">Target</span>
                            <span className="font-bold text-purple-400 truncate max-w-[130px] sm:max-w-[180px]">{relationTarget.name}</span>
                          </div>
                          <button onClick={() => handleClearRelation('target')} className="text-slate-500 hover:text-red-400">
                            <X size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Calculate Button */}
                      {!relationResult && (
                        <button
                          onClick={handleCheckRelation}
                          disabled={loadingRelation}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2 rounded-xl shadow-lg transition-all duration-300 active:scale-98 disabled:opacity-50 cursor-pointer"
                        >
                          {loadingRelation ? 'Computing Relationship Path...' : 'Check Relationship'}
                        </button>
                      )}

                      {/* Relationship Result & Lineage Path */}
                      {relationResult && (
                        <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl space-y-2.5 animate-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-bold leading-none">Relationship Term</span>
                              <span className="text-sm font-extrabold text-emerald-400 block mt-1">{relationResult.term}</span>
                            </div>
                            <button
                              onClick={handleCheckRelation}
                              disabled={loadingRelation}
                              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-[10px] font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                            >
                              Recalculate
                            </button>
                          </div>

                          {relationResult.path && relationResult.path.length > 0 && (
                            <div className="border-t border-slate-800/40 pt-2">
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-bold mb-1.5 leading-none">Lineage Path</span>
                              <div className="flex flex-wrap items-center gap-1.5 max-h-20 overflow-y-auto custom-scrollbar pr-1">
                                {relationResult.path.map((node, i) => (
                                  <React.Fragment key={node._id}>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono leading-none font-bold ${
                                      node._id === relationSource._id 
                                        ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/20'
                                        : node._id === relationTarget._id
                                        ? 'bg-purple-900/40 text-purple-300 border border-purple-500/20'
                                        : 'bg-slate-950 border border-slate-850 text-slate-400'
                                    }`}>
                                      {node.name}
                                    </span>
                                    {i < relationResult.path.length - 1 && (
                                      <span className="text-[9px] text-slate-600 font-bold">➔</span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Empty state when tree has no nodes */}
              {rawNodes.length === 0 && !loading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 px-6 text-center">
                  <div className="bg-emerald-950/40 border border-emerald-500/20 p-4 rounded-3xl text-emerald-400 mb-4 animate-bounce">
                    <TreeDeciduous size={36} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-100">Empty Family Tree</h2>
                  <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-normal">
                    This family tree does not have any members yet. As an administrator, you can initialize this tree by inserting the first root member!
                  </p>
                  <button
                    onClick={() => {
                      setModalMode('add_child');
                      setModalTargetId(null); // no parent since empty
                      setModalOpen(true);
                    }}
                    className="mt-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/10 active:scale-95 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create Root Member Node</span>
                  </button>
                </div>
              )}

              {/* Canvas viewport */}
              <Canvas
                rawNodes={filteredNodes}
                rawEdges={filteredEdges}
                userRole={userRole}
                activeUserId={user._id}
                onAddChild={handleAddChildClick}
                onAddSpouse={handleAddSpouseClick}
                onEditProfile={handleEditProfileClick}
                onCheckRelation={handleCheckRelationClick}
                onDeleteNode={handleDeleteNodeClick}
                searchQuery={searchQuery}
                relationSource={relationSource}
                relationTarget={relationTarget}
                onNodeClick={handleNodeClick}
                layoutDirection={layoutDirection}
                onViewImage={(url) => setPreviewImageUrl(url)}
                onViewCrossTree={handleViewCrossTree}
              />
              {graphCenterNodeId && (
                <button
                  onClick={() => {
                    setGraphCenterNodeId(null);
                    fetchGraph(null);
                  }}
                  className="absolute bottom-6 left-6 z-10 flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 font-semibold text-xs px-3.5 py-2 rounded-xl transition duration-350 active:scale-95 shadow-2xl cursor-pointer"
                >
                  <RefreshCw size={12} className="text-emerald-400" />
                  <span>Reset to Home Node</span>
                </button>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-6">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md text-center shadow-2xl flex flex-col items-center">
                <GitBranch size={40} className="text-slate-600 mb-3" />
                <h2 className="text-base font-bold text-slate-200">No Family Tree Selected</h2>
                <p className="text-xs text-slate-450 mt-2 leading-relaxed">
                  Please select an existing family tree from the header selector or click "New Tree" to build a fresh lineages path from scratch.
                </p>
              </div>
            </div>
          )}
          
        </div>
          </>
        )}
      </div>

      {/* 4. MODALS */}
      <NodeModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setModalMode(null); setModalTargetId(null); }}
        mode={modalMode}
        targetNodeId={modalTargetId}
        nodeData={modalMode === 'edit_profile' ? selectedNode : null}
        nodes={rawNodes}
        edges={rawEdges}
        trees={trees}
        treeId={activeTreeId}
        onSubmit={handleNodeSubmit}
      />

      <RolesModal
        isOpen={rolesModalOpen}
        onClose={() => {
          setRolesModalOpen(false);
          fetchGraph();
        }}
        nodes={rawNodes}
        treeId={activeTreeId}
        onSubmit={handleManageRole}
      />



    </div>
  );
};

export default App;
