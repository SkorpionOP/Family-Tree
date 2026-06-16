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

  // Determine node styling based on state
  let containerClass = 'border-slate-700/50 shadow-lg';
  let glowClass = '';

  if (isDeceased) {
    containerClass = 'border-slate-600/40 shadow-slate-900/50 opacity-80';
  } else if (isMale) {
    containerClass = 'border-blue-500/30 shadow-blue-500/5';
  } else {
    containerClass = 'border-pink-500/30 shadow-pink-500/5';
  }

  if (isSearched) {
    containerClass = 'border-yellow-400/60 shadow-xl ring-2 ring-yellow-400/20 scale-105';
    glowClass = 'shadow-yellow-400/20';
  } else if (isRelationSource) {
    containerClass = 'border-emerald-400/60 shadow-xl ring-2 ring-emerald-400/20 scale-105';
    glowClass = 'shadow-emerald-400/20';
  } else if (isRelationTarget) {
    containerClass = 'border-purple-400/60 shadow-xl ring-2 ring-purple-400/20 scale-105';
    glowClass = 'shadow-purple-400/20';
  }

  // Avatar color scheme
  const avatarBg = isDeceased
    ? 'bg-slate-800/60 border-slate-600/40 text-slate-500'
    : isMale
      ? 'bg-blue-950/50 border-blue-500/30 text-blue-400'
      : 'bg-pink-950/50 border-pink-500/30 text-pink-400';

  const avatarBorder = isDeceased
    ? 'border-slate-600/40'
    : isMale
      ? 'border-blue-500/30'
      : 'border-pink-500/30';

  // Permission settings
  const canEdit = userRole === 'Admin' || userRole === 'Sub-Admin' || (userRole === 'Standard' && data.isCurrentUser);
  const canAdd = userRole === 'Admin' || userRole === 'Sub-Admin';
  const canDelete = userRole === 'Admin';

  return (
    <div className={`relative px-3 py-2 rounded-2xl bg-slate-900 border text-slate-100 min-w-[190px] shadow-xl backdrop-blur-md transition-all duration-300 ${containerClass} ${glowClass} ${isDeceased ? 'opacity-85' : ''}`}>

      {/* Handles for React Flow. Both source and target handles on all sides to allow flexible connections */}
      {/* Top Handle */}
      <Handle type="target" position={Position.Top} id="top-target" className="!bg-slate-500/60 !w-1.5 !h-1.5 !border-none" />
      <Handle type="source" position={Position.Top} id="top-source" className="!bg-slate-500/60 !w-1.5 !h-1.5 !opacity-0 !border-none" />

      {/* Bottom Handle */}
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!bg-slate-500/60 !w-1.5 !h-1.5 !border-none" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!bg-slate-500/60 !w-1.5 !h-1.5 !opacity-0 !border-none" />

      {/* Left Handle */}
      <Handle type="target" position={Position.Left} id="left-target" className="!bg-slate-500/60 !w-1.5 !h-1.5 !border-none" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-slate-500/60 !w-1.5 !h-1.5 !opacity-0 !border-none" />

      {/* Right Handle */}
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-slate-500/60 !w-1.5 !h-1.5 !border-none" />
      <Handle type="target" position={Position.Right} id="right-target" className="!bg-slate-500/60 !w-1.5 !h-1.5 !opacity-0 !border-none" />

      {/* Main Info */}
      <div className="flex items-center space-x-2.5">
        {profilePictureUrl ? (
          <img
            src={profilePictureUrl}
            alt={name}
            className={`w-10 h-10 rounded-full object-cover border-2 flex-shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200 shadow-md ${isDeceased ? 'grayscale border-slate-600/40' : avatarBorder}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onViewImage) onViewImage(profilePictureUrl);
            }}
          />
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0 ${avatarBg} ${isDeceased ? 'grayscale' : ''}`}>
            <User size={17} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
            <span className="truncate">{name}</span>
            {isDeceased && (
              <span className="px-1 py-[1px] text-[7px] font-extrabold bg-slate-700/60 text-slate-400 rounded border border-slate-600/50 flex-shrink-0">
                Deceased
              </span>
            )}
            {data.isCurrentUser && (
              <span className="px-1 py-[1px] text-[7px] font-bold bg-amber-500/15 text-amber-300 rounded border border-amber-500/25 flex-shrink-0">
                You
              </span>
            )}
          </h4>
          <p className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
            <span className={`${isMale ? 'text-blue-400/70' : 'text-pink-400/70'}`}>{isMale ? 'Male' : 'Female'}</span>
            {age !== null && (
              <>
                <span className="text-slate-700">•</span>
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
          className="mt-2.5 w-full py-1 text-[8px] font-bold bg-purple-950/40 text-purple-400 hover:bg-purple-950/60 border border-purple-500/20 hover:border-purple-500/40 rounded-lg flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer group"
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
