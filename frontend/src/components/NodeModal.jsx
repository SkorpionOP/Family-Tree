import React, { useState, useEffect } from 'react';
import { X, Save, User, Heart, Smartphone, Calendar, Link2, Key, TreeDeciduous, Mail } from 'lucide-react';
import { api } from '../utils/api';

const NodeModal = ({
  isOpen,
  onClose,
  mode, // 'add_child' | 'add_spouse' | 'edit_profile' | 'link_user'
  targetNodeId, // parentId (child) or existingNodeId (spouse) or nodeId (edit/link)
  nodeData, // existing data if editing
  nodes, // current tree nodes
  edges, // current tree edges
  trees, // all trees list
  treeId, // active tree ID
  onSubmit, // submit handler
}) => {
  const [spouseType, setSpouseType] = useState('new'); // 'new' | 'existing' | 'cross_tree'
  const [childType, setChildType] = useState('new'); // 'new' | 'existing'
  const [parentType, setParentType] = useState('new'); // 'new' | 'existing'
  const [selectedCrossTreeId, setSelectedCrossTreeId] = useState('');
  const [crossTreeNodes, setCrossTreeNodes] = useState([]);
  const [crossTreeEdges, setCrossTreeEdges] = useState([]);
  const [loadingCrossNodes, setLoadingCrossNodes] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 1, // 1 = Male, 0 = Female
    bloodGroup: '',
    gotram: '',
    mobileNumber: '',
    email: '',
    socialLinks: '',
    profilePictureUrl: '',
    linkEmail: '',
    spouseNodeId: '',
    crossTreeNodeId: '',
    parentId: '',
    childNodeId: '',
    parentNodeId: '',
    isDeceased: false,
    dateOfDeath: '',
    marriageDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [crossTreeIdInput, setCrossTreeIdInput] = useState('');
  const [crossMemberSearchQuery, setCrossMemberSearchQuery] = useState('');
  const [parentSearchQuery, setParentSearchQuery] = useState('');

  const handleLoadCrossTree = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cleanId = crossTreeIdInput.trim();
    if (!cleanId) {
      setError('Please enter a valid Tree ID');
      return;
    }
    // Validate MongoDB ObjectId hex format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(cleanId)) {
      setError('Invalid Tree ID format. Must be a 24-character hexadecimal string.');
      return;
    }
    setError('');
    setSelectedCrossTreeId(cleanId);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setUploadError('');

    try {
      const targetTreeId = treeId || (nodes && nodes.length > 0 ? nodes[0].treeId : null);
      if (!targetTreeId) {
        throw new Error('No active family tree found for file upload');
      }

      const response = await api.kinship.uploadImage(targetTreeId, file);
      if (response && response.link) {
        setFormData((prev) => ({
          ...prev,
          profilePictureUrl: response.link,
        }));
      } else {
        throw new Error('Failed to obtain image upload link');
      }
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Failed to upload profile picture to Google Drive');
    } finally {
      setUploadingImage(false);
    }
  };

  // Find target node in current tree (the one we are adding spouse/child to)
  const targetNode = nodes && targetNodeId ? nodes.find((n) => n._id === targetNodeId) : null;

  const hasSpouse = mode === 'edit_profile' && nodeData && edges && edges.some(
    e => e.relationshipType === 'spouse' && (e.source === nodeData._id || e.target === nodeData._id)
  );

  // Sync edit data and reset states
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSpouseType('new');
      setChildType('new');
      setParentType('new');
      setSelectedCrossTreeId('');
      setCrossTreeNodes([]);
      setCrossTreeIdInput('');
      setCrossMemberSearchQuery('');
      setParentSearchQuery('');
      
      if (mode === 'edit_profile' && nodeData) {
        setFormData({
          name: nodeData.name || '',
          dob: nodeData.dob ? nodeData.dob.substring(0, 10) : '',
          gender: nodeData.gender !== undefined ? nodeData.gender : 1,
          bloodGroup: nodeData.bloodGroup || '',
          gotram: nodeData.gotram || '',
          mobileNumber: nodeData.mobileNumber || '',
          email: nodeData.email || '',
          socialLinks: nodeData.socialLinks ? nodeData.socialLinks.join(', ') : '',
          profilePictureUrl: nodeData.profilePictureUrl || '',
          linkEmail: '',
          spouseNodeId: '',
          crossTreeNodeId: '',
          parentId: '',
          childNodeId: '',
          parentNodeId: '',
          isDeceased: nodeData.isDeceased || false,
          dateOfDeath: nodeData.dateOfDeath ? nodeData.dateOfDeath.substring(0, 10) : '',
          marriageDate: nodeData.marriageDate ? nodeData.marriageDate.substring(0, 10) : '',
        });
      } else {
        let defaultGender = 1;
        if (mode === 'add_parent' && targetNodeId && edges && nodes) {
          const currentParents = edges.filter(e => e.relationshipType === 'parent_child' && e.targetNodeId === targetNodeId);
          if (currentParents.length > 0) {
            const parentNode = nodes.find(n => n._id === currentParents[0].sourceNodeId);
            if (parentNode) {
              defaultGender = parentNode.gender === 1 ? 0 : 1;
            }
          }
        }
        setFormData({
          name: '',
          dob: '',
          gender: defaultGender,
          bloodGroup: '',
          gotram: '',
          mobileNumber: '',
          email: '',
          socialLinks: '',
          profilePictureUrl: '',
          linkEmail: '',
          spouseNodeId: '',
          crossTreeNodeId: '',
          parentId: '',
          childNodeId: '',
          parentNodeId: '',
          isDeceased: false,
          dateOfDeath: '',
          marriageDate: '',
        });
      }
    }
  }, [isOpen, mode, nodeData, targetNodeId, edges, nodes]);

  // Fetch nodes from other tree for cross-tree linking
  useEffect(() => {
    if (spouseType === 'cross_tree' && selectedCrossTreeId) {
      setLoadingCrossNodes(true);
      setCrossTreeNodes([]);
      setCrossTreeEdges([]);
      api.kinship
        .getGraph(selectedCrossTreeId)
        .then((data) => {
          setCrossTreeNodes(data.nodes);
          setCrossTreeEdges(data.edges);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message || 'Failed to load nodes from the selected tree');
        })
        .finally(() => {
          setLoadingCrossNodes(false);
        });
    } else {
      setCrossTreeNodes([]);
      setCrossTreeEdges([]);
    }
  }, [spouseType, selectedCrossTreeId]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (val) => {
    setFormData((prev) => ({ ...prev, gender: val }));
  };

  // Helper to check if a node already has a spouse edge
  const isNodeMarried = (nodeId) => {
    if (!edges) return false;
    return edges.some(
      (e) =>
        e.relationshipType === 'spouse' &&
        (e.sourceNodeId === nodeId || e.targetNodeId === nodeId)
    );
  };

  // Filter valid spouse candidates in current tree
  // Spouses must: have different gender, opposite parity, generation delta <= 1, and not be married
  const getValidSpouseCandidates = () => {
    if (!targetNode || !nodes) return [];
    return nodes.filter(
      (node) =>
        node._id !== targetNode._id &&
        node.gender !== targetNode.gender &&
        node.parity !== targetNode.parity &&
        Math.abs(node.generationLevel - targetNode.generationLevel) <= 1 &&
        !isNodeMarried(node._id)
    );
  };

  const getValidChildCandidates = () => {
    if (!targetNode || !nodes) return [];
    const targetSpouses = edges
      ? edges.filter(e => e.relationshipType === 'spouse' && (e.sourceNodeId === targetNode._id || e.targetNodeId === targetNode._id))
             .map(e => e.sourceNodeId === targetNode._id ? e.targetNodeId : e.sourceNodeId)
      : [];
      
    return nodes.filter(node => {
      if (node._id === targetNode._id) return false;
      if (targetSpouses.includes(node._id)) return false;
      
      const existingParents = edges
        ? edges.filter(e => e.relationshipType === 'parent_child' && e.targetNodeId === node._id)
        : [];
      if (existingParents.length >= 2) return false;
      
      return true;
    });
  };

  const getValidParentCandidates = () => {
    if (!targetNode || !nodes) return [];
    
    const currentParentEdges = edges
      ? edges.filter(e => e.relationshipType === 'parent_child' && e.targetNodeId === targetNode._id)
      : [];
    const currentParentIds = currentParentEdges.map(e => e.sourceNodeId);
    
    let conflictGender = null;
    if (currentParentIds.length > 0) {
      const parent1 = nodes.find(n => n._id === currentParentIds[0]);
      if (parent1) {
        conflictGender = parent1.gender;
      }
    }
    
    return nodes.filter(node => {
      if (node._id === targetNode._id) return false;
      if (currentParentIds.includes(node._id)) return false;
      if (conflictGender !== null && node.gender === conflictGender) return false;
      
      return true;
    });
  };

  const getValidIndividualParents = () => {
    if (!targetNode || !nodes) return [];
    const currentParentEdges = edges
      ? edges.filter(e => e.relationshipType === 'parent_child' && e.targetNodeId === targetNode._id)
      : [];
    const currentParentIds = currentParentEdges.map(e => e.sourceNodeId);
    
    let conflictGender = null;
    if (currentParentIds.length > 0) {
      const parent1 = nodes.find(n => n._id === currentParentIds[0]);
      if (parent1) {
        conflictGender = parent1.gender;
      }
    }
    
    return nodes.filter(node => {
      // Cannot be child itself
      if (node._id === targetNode._id) return false;
      // Cannot be already linked
      if (currentParentIds.includes(node._id)) return false;
      // Cannot have same gender as existing parent
      if (conflictGender !== null && node.gender === conflictGender) return false;
      
      // Age constraint: parent must be at least 15 years older than child
      if (targetNode.dob && node.dob) {
        const childBirthYear = new Date(targetNode.dob).getFullYear();
        const parentBirthYear = new Date(node.dob).getFullYear();
        if (childBirthYear - parentBirthYear < 15) return false;
      }
      
      return true;
    });
  };

  const getValidParentCoupleCandidates = () => {
    if (!targetNode || !nodes) return [];
    
    const validIndividuals = getValidIndividualParents();
    const spouseEdges = edges ? edges.filter(e => e.relationshipType === 'spouse') : [];
    
    const couples = [];
    const processedIndividualIds = new Set();

    // Find couples where BOTH are in validIndividuals
    spouseEdges.forEach(edge => {
      const nodeA = validIndividuals.find(n => n._id === edge.sourceNodeId);
      const nodeB = validIndividuals.find(n => n._id === edge.targetNodeId);
      
      if (nodeA && nodeB) {
        const husband = nodeA.gender === 1 ? nodeA : nodeB;
        const wife = nodeA.gender === 1 ? nodeB : nodeA;
        couples.push({
          id: husband._id,
          label: `${husband.name} & ${wife.name} (Gotram: ${husband.gotram || 'N/A'} | Gen: ${husband.generationLevel})`,
          type: 'couple',
          husband,
          wife
        });
        processedIndividualIds.add(nodeA._id);
        processedIndividualIds.add(nodeB._id);
      }
    });

    // Add remaining/single individuals
    const individuals = [];
    validIndividuals.forEach(node => {
      if (!processedIndividualIds.has(node._id)) {
        individuals.push({
          id: node._id,
          label: `${node.name} (Gotram: ${node.gotram || 'N/A'} | Gen: ${node.generationLevel})`,
          type: 'individual',
          node
        });
      }
    });

    let combined = [...couples, ...individuals];

    if (parentSearchQuery.trim()) {
      const query = parentSearchQuery.trim().toLowerCase();
      combined = combined.filter(item => {
        if (item.type === 'couple') {
          return (
            item.husband.name.toLowerCase().includes(query) ||
            (item.husband.gotram && item.husband.gotram.toLowerCase().includes(query)) ||
            item.wife.name.toLowerCase().includes(query) ||
            (item.wife.gotram && item.wife.gotram.toLowerCase().includes(query))
          );
        } else {
          return (
            item.node.name.toLowerCase().includes(query) ||
            (item.node.gotram && item.node.gotram.toLowerCase().includes(query))
          );
        }
      });
    }

    return combined;
  };

  const getCoupleOptions = () => {
    if (!nodes || !edges) return [];
    const spouseEdges = edges.filter(e => e.relationshipType === 'spouse');
    
    return spouseEdges.map(edge => {
      const nodeA = nodes.find(n => n._id === edge.sourceNodeId);
      const nodeB = nodes.find(n => n._id === edge.targetNodeId);
      if (nodeA && nodeB) {
        const husband = nodeA.gender === 1 ? nodeA : nodeB;
        const wife = nodeA.gender === 1 ? nodeB : nodeA;
        return {
          id: husband._id,
          label: `${husband.name} & ${wife.name} (Gen: ${husband.generationLevel})`
        };
      }
      return null;
    }).filter(Boolean);
  };

  // Helper to check if a cross-tree node already has a spouse edge
  const isCrossNodeMarried = (nodeId) => {
    if (!crossTreeEdges) return false;
    return crossTreeEdges.some(
      (e) =>
        e.relationshipType === 'spouse' &&
        (e.sourceNodeId === nodeId || e.targetNodeId === nodeId)
    );
  };

  // Helper to calculate candidate age from DOB
  const getCandidateAge = (dobString) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Filter valid spouse candidates in cross tree
  // Must have opposite gender from targetNode, opposite parity (aligned), generation delta <= 1 (aligned), age >= 18, and not be married
  const getValidCrossCandidates = () => {
    if (!targetNode) return [];
    const spouseGender = targetNode.gender === 1 ? 0 : 1;

    let genOffset = null;
    let parityOffset = null;

    // Find if there is an existing cross-tree connection between these two trees to align coordinate systems
    if (nodes && crossTreeNodes) {
      for (const nodeA of nodes) {
        if (nodeA.crossTreeLinkId) {
          const nodeB = crossTreeNodes.find(n => n._id === nodeA.crossTreeLinkId);
          if (nodeB) {
            genOffset = nodeA.generationLevel - nodeB.generationLevel;
            parityOffset = (nodeA.parity + nodeB.parity) % 2;
            break;
          }
        }
      }
    }
    
    let candidates = crossTreeNodes.filter((node) => {
      // 1. Gender check (opposite gender)
      if (node.gender !== spouseGender) return false;
      
      // 2. Parity & Generation checks if trees are already connected
      if (genOffset !== null && parityOffset !== null) {
        const alignedParity = (node.parity + parityOffset) % 2;
        const alignedGen = node.generationLevel + genOffset;

        if (alignedParity === targetNode.parity) return false;
        if (Math.abs(alignedGen - targetNode.generationLevel) > 1) return false;
      }
      
      // 3. Age 18+ check
      const age = getCandidateAge(node.dob);
      if (age !== null && age < 18) return false;
      
      // 4. Marriage check (not married in their tree)
      if (isCrossNodeMarried(node._id)) return false;
      
      return true;
    });

    if (crossMemberSearchQuery.trim()) {
      const query = crossMemberSearchQuery.trim().toLowerCase();
      candidates = candidates.filter((node) =>
        node.name.toLowerCase().includes(query) ||
        (node.gotram && node.gotram.toLowerCase().includes(query))
      );
    }

    return candidates;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate dates
      if (formData.dob && new Date(formData.dob) > new Date()) {
        throw new Error('Date of birth cannot be in the future.');
      }
      if (formData.isDeceased && formData.dateOfDeath) {
        if (new Date(formData.dateOfDeath) > new Date()) {
          throw new Error('Date of death cannot be in the future.');
        }
        if (formData.dob && new Date(formData.dateOfDeath) < new Date(formData.dob)) {
          throw new Error('Date of death cannot be before date of birth.');
        }
      }
      if (mode === 'link_user') {
        if (!formData.linkEmail) {
          throw new Error('User email is required to establish linkage');
        }
        await onSubmit({ email: formData.linkEmail, nodeId: targetNodeId });
      } else if (mode === 'add_spouse') {
        if (spouseType === 'existing') {
          if (!formData.spouseNodeId) {
            throw new Error('Please select an existing member to link');
          }
          await onSubmit({
            modeType: 'existing',
            targetNodeId,
            spouseNodeId: formData.spouseNodeId,
            marriageDate: formData.marriageDate || null,
          });
        } else if (spouseType === 'cross_tree') {
          if (!formData.crossTreeNodeId) {
            throw new Error('Please select a member node from the other tree');
          }
          await onSubmit({
            modeType: 'cross_tree',
            targetNodeId,
            crossTreeNodeId: formData.crossTreeNodeId,
            marriageDate: formData.marriageDate || null,
          });
        } else {
          // New spouse node
          if (!formData.name) {
            throw new Error('Name is required');
          }
          const linksArr = formData.socialLinks
            ? formData.socialLinks.split(',').map((s) => s.trim()).filter(Boolean)
            : [];

          await onSubmit({
            modeType: 'new',
            name: formData.name,
            dob: formData.dob || null,
            bloodGroup: formData.bloodGroup,
            gotram: formData.gotram,
            mobileNumber: formData.mobileNumber,
            email: formData.email,
            socialLinks: linksArr,
            profilePictureUrl: formData.profilePictureUrl,
            existingNodeId: targetNodeId,
            isDeceased: formData.isDeceased,
            dateOfDeath: formData.isDeceased ? (formData.dateOfDeath || null) : null,
            marriageDate: formData.marriageDate || null,
          });
        }
      } else {
        // add_child, add_parent, or edit_profile
        if (mode === 'add_child' && childType === 'existing') {
          if (!formData.childNodeId) {
            throw new Error('Please select a child member to link');
          }
          await onSubmit({
            modeType: 'existing_child',
            parentId: targetNodeId || formData.parentId || null,
            childId: formData.childNodeId,
          });
        } else if (mode === 'add_parent' && parentType === 'existing') {
          if (!formData.parentNodeId) {
            throw new Error('Please select a parent member to link');
          }
          await onSubmit({
            modeType: 'existing_parent',
            parentId: formData.parentNodeId,
            childId: targetNodeId,
          });
        } else {
          // New profile: add_child, add_parent, or edit_profile
          if (!formData.name) {
            throw new Error('Name is required');
          }

          const linksArr = formData.socialLinks
            ? formData.socialLinks.split(',').map((s) => s.trim()).filter(Boolean)
            : [];

          const submitPayload = {
            name: formData.name,
            dob: formData.dob || null,
            bloodGroup: formData.bloodGroup,
            gotram: formData.gotram,
            mobileNumber: formData.mobileNumber,
            email: formData.email,
            socialLinks: linksArr,
            profilePictureUrl: formData.profilePictureUrl,
            isDeceased: formData.isDeceased,
            dateOfDeath: formData.isDeceased ? (formData.dateOfDeath || null) : null,
            marriageDate: formData.marriageDate || null,
          };

          if (mode === 'add_child') {
            submitPayload.gender = parseInt(formData.gender);
            submitPayload.parentId = targetNodeId || formData.parentId || null;
          } else if (mode === 'add_parent') {
            submitPayload.gender = parseInt(formData.gender);
            submitPayload.childId = targetNodeId;
          }

          await onSubmit(submitPayload);
        }
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Action execution failed');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'add_child': return 'Add Child Node';
      case 'add_parent': return 'Add Parent Node';
      case 'add_spouse': return 'Add Spouse Node';
      case 'edit_profile': return 'Edit Member Profile';
      case 'link_user': return 'Link Account Access';
      default: return 'Member Action';
    }
  };

  const validCandidates = getValidSpouseCandidates();
  const validCrossCandidates = getValidCrossCandidates();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/50">
          <h2 className="text-base font-bold text-slate-100">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 bg-slate-850 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {mode === 'link_user' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Enter the email address of the universal user account to grant them Standard User access. They will have read-only access to this tree, but can edit the profile details of this specific node.
              </p>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">User Email Address</label>
                <div className="relative">
                  <Key size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    name="linkEmail"
                    value={formData.linkEmail}
                    onChange={handleInputChange}
                    placeholder="user@example.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              
              {/* Spouse tab options */}
              {mode === 'add_spouse' && (
                <div className="col-span-2 border-b border-slate-800 pb-3 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setSpouseType('new')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      spouseType === 'new'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    New Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpouseType('existing')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      spouseType === 'existing'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Link Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpouseType('cross_tree')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      spouseType === 'cross_tree'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Link Other Tree
                  </button>
                </div>
              )}

              {/* Child tab options */}
              {mode === 'add_child' && nodes && nodes.length > 0 && (
                <div className="col-span-2 border-b border-slate-800 pb-3 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setChildType('new')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      childType === 'new'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    New Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setChildType('existing')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      childType === 'existing'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Link Existing
                  </button>
                </div>
              )}

              {/* Parent tab options */}
              {mode === 'add_parent' && nodes && nodes.length > 0 && (
                <div className="col-span-2 border-b border-slate-800 pb-3 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setParentType('new')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      parentType === 'new'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    New Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setParentType('existing')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      parentType === 'existing'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Link Existing
                  </button>
                </div>
              )}

              {/* RENDER FOR NEW PROFILE OR EDIT NODE OR CHILD OR PARENT */}
              {((mode === 'edit_profile') ||
                (mode === 'add_spouse' && spouseType === 'new') ||
                (mode === 'add_child' && childType === 'new') ||
                (mode === 'add_parent' && parentType === 'new')) && (
                <>
                  {/* Select Parent Node (Only shown when mode === 'add_child' and targetNodeId is null and nodes have length > 0) */}
                  {mode === 'add_child' && !targetNodeId && nodes && nodes.length > 0 && (
                    <div className="col-span-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Select Parents (Couple)</label>
                      <select
                        name="parentId"
                        value={formData.parentId}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-350 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                      >
                        <option value="">None (Unconnected/Floating Node)</option>
                        {getCoupleOptions().map((couple) => (
                          <option key={couple.id} value={couple.id}>
                            {couple.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Name */}
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Full Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Rama Rao"
                        required
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  {/* DOB */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Date of Birth</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-3.5 text-slate-500" />
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  {/* Gotram */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Gotram</label>
                    <input
                      type="text"
                      name="gotram"
                      value={formData.gotram}
                      onChange={handleInputChange}
                      placeholder="e.g. Bharadwaja"
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-350 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Mobile Number</label>
                    <div className="relative">
                      <Smartphone size={14} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        placeholder="e.g. +91 9999999999"
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. member@email.com"
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  {/* Gender (Shown in add_child and add_parent modes) */}
                  {(mode === 'add_child' || mode === 'add_parent') && (
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Gender</label>
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={() => handleGenderChange(1)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            formData.gender === 1
                              ? 'bg-blue-950/40 text-blue-400 border-blue-500/50 shadow-md shadow-blue-500/5'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGenderChange(0)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            formData.gender === 0
                              ? 'bg-pink-950/40 text-pink-400 border-pink-500/50 shadow-md shadow-pink-500/5'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          Female
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Profile Picture Uploader */}
                  <div className="col-span-2 border-t border-slate-800/60 pt-4 mt-2">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-2">Profile Picture</label>
                    <div className="flex items-center space-x-4">
                      {/* Preview Avatar */}
                      <div className="w-16 h-16 rounded-full border border-slate-700 bg-slate-950 overflow-hidden flex items-center justify-center flex-shrink-0 relative group">
                        {formData.profilePictureUrl ? (
                          <img
                            src={formData.profilePictureUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <User size={24} className="text-slate-600" />
                        )}
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <label className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                            uploadingImage
                              ? 'bg-slate-800 text-slate-500 border-slate-800'
                              : 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40 hover:border-emerald-500/50'
                          }`}>
                            {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                              className="hidden"
                            />
                          </label>
                          {formData.profilePictureUrl && (
                            <button
                              type="button"
                              onClick={() => setFormData(p => ({ ...p, profilePictureUrl: '' }))}
                              className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-950/20 text-red-400 border border-red-500/30 hover:bg-red-950/40 hover:border-red-500/50 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                          <span className="text-[10px] text-slate-500">Max size 5MB</span>
                        </div>
                        
                        <input
                          type="url"
                          name="profilePictureUrl"
                          value={formData.profilePictureUrl}
                          onChange={handleInputChange}
                          placeholder="Or paste image URL (e.g., https://example.com/pic.jpg)"
                          className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                        
                        {uploadError && (
                          <p className="text-[10px] text-red-400 font-medium">{uploadError}</p>
                        )}
                        <p className="text-[9px] text-slate-500 leading-none">
                          * Images are stored securely on Google Drive and linked in MongoDB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Deceased Status */}
                  <div className="col-span-2 border-t border-slate-800/60 pt-4 mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Deceased Status</label>
                        <p className="text-[9px] text-slate-500 mt-0.5">Mark if this person is deceased</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, isDeceased: !p.isDeceased }))}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 cursor-pointer ${
                          formData.isDeceased ? 'bg-rose-950 border border-rose-500/40' : 'bg-slate-950 border border-slate-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                            formData.isDeceased ? 'translate-x-6 bg-rose-500' : 'bg-slate-600'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Date of Death */}
                  {formData.isDeceased && (
                    <div className="col-span-2 animate-in fade-in slide-in-from-top-2 duration-150">
                      <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Date of Death</label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-3.5 text-slate-500" />
                        <input
                          type="date"
                          name="dateOfDeath"
                          value={formData.dateOfDeath}
                          onChange={handleInputChange}
                          required={formData.isDeceased}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                        />
                      </div>
                    </div>
                  )}

                  {/* Marriage Date */}
                  {(mode === 'add_spouse' || (mode === 'edit_profile' && hasSpouse)) && (
                    <div className="col-span-2 animate-in fade-in slide-in-from-top-2 duration-150">
                      <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Marriage Date</label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-3.5 text-slate-500" />
                        <input
                          type="date"
                          name="marriageDate"
                          value={formData.marriageDate}
                          onChange={handleInputChange}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Social Links (comma separated)</label>
                    <div className="relative">
                      <Link2 size={14} className="absolute left-3 top-3.5 text-slate-500" />
                      <input
                        type="text"
                        name="socialLinks"
                        value={formData.socialLinks}
                        onChange={handleInputChange}
                        placeholder="e.g. facebook.com/profile, linkedin.com/in/profile"
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* RENDER FOR LINKING AN EXISTING CHILD */}
              {mode === 'add_child' && childType === 'existing' && (
                <div className="col-span-2 space-y-4">
                  <p className="text-xs text-slate-400">
                    Select a member from the current tree to establish a child relationship with <span className="font-bold text-slate-200">{targetNode?.name || 'the selected parent'}</span>.
                  </p>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Select Child Node</label>
                    <select
                      name="childNodeId"
                      value={formData.childNodeId}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                    >
                      <option value="">Select Child Node</option>
                      {getValidChildCandidates().map((node) => (
                        <option key={node._id} value={node._id}>
                          {node.name} (Gotram: {node.gotram || 'N/A'} | Parity: {node.parity} | Gen: {node.generationLevel})
                        </option>
                      ))}
                    </select>
                    {getValidChildCandidates().length === 0 && (
                      <span className="text-[10px] text-amber-500 mt-1 block">
                        No valid child candidates found in this tree.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* RENDER FOR LINKING AN EXISTING PARENT */}
              {mode === 'add_parent' && parentType === 'existing' && (
                <div className="col-span-2 space-y-4">
                  <p className="text-xs text-slate-400">
                    Select a member or married couple from the current tree to establish a parent relationship with <span className="font-bold text-slate-200">{targetNode?.name || 'the selected child'}</span>. Linking a married couple links both parents simultaneously.
                  </p>

                  {/* Search Filter input */}
                  {(getValidParentCoupleCandidates().length > 0 || parentSearchQuery.trim() !== '') && (
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Search Parent Candidates</label>
                      <input
                        type="text"
                        value={parentSearchQuery}
                        onChange={(e) => setParentSearchQuery(e.target.value)}
                        placeholder="Type name or gotram to filter..."
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Select Parent Couple / Node</label>
                    <select
                      name="parentNodeId"
                      value={formData.parentNodeId}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                    >
                      <option value="">Select Parent Couple / Node</option>
                      {getValidParentCoupleCandidates().map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.type === 'couple' ? '💑 ' : '👤 '}
                          {item.label}
                        </option>
                      ))}
                    </select>
                    {getValidParentCoupleCandidates().length === 0 && (
                      <span className="text-[10px] text-amber-500 mt-1 block">
                        No valid parent candidates found in this tree.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* RENDER FOR LINKING AN EXISTING MEMBER */}
              {mode === 'add_spouse' && spouseType === 'existing' && (
                <div className="col-span-2 space-y-4">
                  <p className="text-xs text-slate-400">
                    Select a member from the current tree to establish a spouse relationship with <span className="font-bold text-slate-200">{targetNode?.name}</span>. Dravidian rules require that candidates have opposite gender, opposite parity, and a generational gap of 1 or less.
                  </p>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Select Candidate Member</label>
                    <select
                      name="spouseNodeId"
                      value={formData.spouseNodeId}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                    >
                      <option value="">Select Spouse Node</option>
                      {validCandidates.map((node) => (
                        <option key={node._id} value={node._id}>
                          {node.name} (Gotram: {node.gotram || 'N/A'} | Parity: {node.parity} | Gen: {node.generationLevel})
                        </option>
                      ))}
                    </select>
                    {validCandidates.length === 0 && (
                      <span className="text-[10px] text-amber-500 mt-1 block">
                        No valid, unmarried spouse candidates of matching gender, opposite parity, and generational level found in this tree.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* RENDER FOR LINKING NODE FROM ANOTHER TREE */}
              {mode === 'add_spouse' && spouseType === 'cross_tree' && (
                <div className="col-span-2 space-y-4">
                  <p className="text-xs text-slate-400">
                    Import and link a member node from another family tree by entering its unique database ID.
                  </p>

                  {/* Input Tree ID */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Enter Other Tree Unique ID</label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <TreeDeciduous size={14} className="absolute left-3 top-3.5 text-slate-500" />
                        <input
                          type="text"
                          value={crossTreeIdInput}
                          onChange={(e) => setCrossTreeIdInput(e.target.value)}
                          placeholder="e.g. 6a2fd6d4551bb9864d5c7e9b"
                          className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleLoadCrossTree}
                        className="px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 rounded-xl transition-all cursor-pointer active:scale-95 animate-in fade-in"
                      >
                        Load
                      </button>
                    </div>
                  </div>

                  {/* Search and Select Member list */}
                  {selectedCrossTreeId && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
                      {loadingCrossNodes ? (
                        <div className="flex items-center space-x-2 py-4">
                          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs text-slate-400">Fetching tree members...</span>
                        </div>
                      ) : (
                        <>
                          {/* Search Filter input */}
                          {crossTreeNodes.length > 0 && (
                            <div>
                              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Search/Filter Member</label>
                              <input
                                type="text"
                                value={crossMemberSearchQuery}
                                onChange={(e) => setCrossMemberSearchQuery(e.target.value)}
                                placeholder="Type name or gotram to filter..."
                                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                              />
                            </div>
                          )}

                          {/* Member List */}
                          <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Select Member Node</label>
                            {validCrossCandidates.length > 0 ? (
                              <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-800 bg-slate-950/60 rounded-xl p-2 custom-scrollbar">
                                {validCrossCandidates.map((node) => {
                                  const isSelected = formData.crossTreeNodeId === node._id;
                                  return (
                                    <div
                                      key={node._id}
                                      onClick={() => setFormData((p) => ({ ...p, crossTreeNodeId: node._id }))}
                                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                                        isSelected
                                          ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/5'
                                          : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 text-slate-300 hover:border-slate-700'
                                      }`}
                                    >
                                      <div className="flex flex-col min-w-0 pr-2">
                                        <span className="text-xs font-bold truncate">{node.name}</span>
                                        <span className="text-[9px] text-slate-500 truncate mt-0.5">
                                          Gotram: {node.gotram || 'N/A'} • Parity State {node.parity} • {node.gender === 1 ? 'Male' : 'Female'} • Gen Diff: {node.generationLevel - targetNode.generationLevel > 0 ? `+${node.generationLevel - targetNode.generationLevel}` : node.generationLevel - targetNode.generationLevel} • Single
                                        </span>
                                      </div>
                                      {isSelected && (
                                        <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                          <svg className="w-2.5 h-2.5 text-slate-900" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="border border-dashed border-slate-850 bg-slate-950/30 rounded-xl p-6 text-center text-xs text-slate-500">
                                {crossTreeNodes.length === 0 
                                  ? 'No nodes found in the selected tree.' 
                                  : `No matching members of the opposite gender (${targetNode?.gender === 1 ? 'Female' : 'Male'}) found.`}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-850 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-slate-200 text-xs font-semibold rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading || 
                (mode === 'add_spouse' && spouseType === 'cross_tree' && !formData.crossTreeNodeId) || 
                (mode === 'add_spouse' && spouseType === 'existing' && !formData.spouseNodeId) ||
                (mode === 'add_child' && childType === 'existing' && !formData.childNodeId) ||
                (mode === 'add_parent' && parentType === 'existing' && !formData.parentNodeId)
              }
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4.5 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/10 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default NodeModal;
