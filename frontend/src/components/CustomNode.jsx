import React from 'react';
import { Handle, Position } from 'reactflow';
import { User, Compass } from 'lucide-react';

const CustomNode = ({ data }) => {
  
  const {
    _id,
    name,
    gender,
    dob,
    bloodGroup,
    gotram,
    generationLevel,
    parity,
    profilePictureUrl,
    userRole,
    linkedUserId,
    onAddChild,
    onAddSpouse,
    onEditProfile,
    onCheckRelation,
    onDeleteNode,
    isSearched,
    isRelationSource,
    isRelationTarget,
    hasSpouse,
    isDeceased,
    dateOfDeath,
    onViewImage,
    crossTreeLinkId,
    onViewCrossTree,
  } = data;

  const isMale = gender === 1;

  // Calculate age from DOB (or age at death if deceased)
  const calculateAge = (dobString, dodString) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    const endDate = dodString ? new Date(dodString) : new Date();
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const m = endDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(dob, isDeceased ? dateOfDeath : null);

  // Border and shadow classes based on selection/search states
  let borderClass = isDeceased
    ? 'border-slate-600/80 shadow-slate-600/5'
    : (isMale 
      ? 'border-blue-500/80 shadow-blue-500/10' 
      : 'border-pink-500/80 shadow-pink-500/10');

  if (isSearched) {
    borderClass = 'border-yellow-400 border-2 shadow-lg shadow-yellow-400/40 ring-4 ring-yellow-400/20 scale-105';
  } else if (isRelationSource) {
    borderClass = 'border-emerald-500 border-2 shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-500/20 scale-105';
  } else if (isRelationTarget) {
    borderClass = 'border-purple-500 border-2 shadow-lg shadow-purple-500/40 ring-4 ring-purple-500/20 scale-105';
  }

  // Permission settings
  const canEdit = userRole === 'Admin' || userRole === 'Sub-Admin' || (userRole === 'Standard' && data.isCurrentUser);
  const canAdd = userRole === 'Admin' || userRole === 'Sub-Admin';
  const canDelete = userRole === 'Admin';

  return (
    <div className={`relative px-3 py-2.5 rounded-2xl bg-slate-900 border text-slate-100 w-[220px] h-[95px] flex flex-col justify-between shadow-xl backdrop-blur-md transition-all duration-300 ${borderClass} ${isDeceased ? 'opacity-85' : ''}`}>
      
      {/* Handles for React Flow. Both source and target handles on all sides to allow flexible connections */}
      {/* Top Handle */}
      <Handle type="target" position={Position.Top} id="top-target" className="!bg-slate-450 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Top} id="top-source" className="!bg-slate-450 !w-1.5 !h-1.5 !opacity-0" />
      
      {/* Bottom Handle */}
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!bg-slate-450 !w-1.5 !h-1.5" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!bg-slate-450 !w-1.5 !h-1.5 !opacity-0" />
      
      {/* Left Handle */}
      <Handle type="target" position={Position.Left} id="left-target" className="!bg-slate-450 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-slate-450 !w-1.5 !h-1.5 !opacity-0" />
      
      {/* Right Handle */}
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-slate-450 !w-1.5 !h-1.5" />
      <Handle type="target" position={Position.Right} id="right-target" className="!bg-slate-450 !w-1.5 !h-1.5 !opacity-0" />
 
      {/* Main Info */}
      <div className="flex items-center space-x-2.5">
        {profilePictureUrl ? (
          <img
            src={profilePictureUrl}
            alt={name}
            className={`w-10 h-10 rounded-full object-cover border-2 flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200 ${isDeceased ? 'grayscale border-slate-500/50' : (isMale ? 'border-blue-500/50' : 'border-pink-500/50')}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onViewImage) onViewImage(profilePictureUrl);
            }}
          />
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
            isDeceased ? 'bg-slate-950/60 border-slate-650/50 text-slate-400 grayscale' :
            (isMale ? 'bg-blue-950/40 border-blue-500/50 text-blue-400' : 'bg-pink-950/40 border-pink-500/50 text-pink-400')
          }`}>
            <User size={18} />
          </div>
        )}
 
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-slate-100 truncate flex items-center">
            <span className="truncate">{name}</span>
            {isDeceased && (
              <span className="ml-1 px-1 py-0.2 text-[7px] font-extrabold bg-slate-700/80 text-slate-350 rounded border border-slate-600 flex-shrink-0">
                Deceased
              </span>
            )}
            {data.isCurrentUser && (
              <span className="ml-1 px-1 py-0.2 text-[8px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 flex-shrink-0">
                You
              </span>
            )}
          </h4>
          <p className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
            <span>{isMale ? 'Male' : 'Female'}</span>
            {age !== null && (
              <>
                <span className="text-slate-600">•</span>
                <span>{age} yrs{isDeceased ? ' (d.)' : ''}</span>
              </>
            )}
          </p>
        </div>
      </div>
      {crossTreeLinkId ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onViewCrossTree) onViewCrossTree(crossTreeLinkId);
          }}
          className="w-full py-1 text-[8px] font-bold bg-purple-950/40 text-purple-400 hover:bg-purple-950/60 border border-purple-500/20 hover:border-purple-500/40 rounded-lg flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer group flex-shrink-0"
        >
          <Compass size={10} className="group-hover:rotate-45 transition-transform duration-300" />
          <span>Check Family Tree</span>
        </button>
      ) : (
        <div className="h-[22px] flex-shrink-0" />
      )}
    </div>
  );
};

export default CustomNode;
