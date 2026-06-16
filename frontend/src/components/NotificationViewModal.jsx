import React from 'react';
import { X, Calendar, Heart, Gift, ShieldAlert, Smartphone, Mail, Globe } from 'lucide-react';

export default function NotificationViewModal({ isOpen, onClose, notification, nodes }) {
  if (!isOpen || !notification) return null;

  const node = nodes.find(n => n._id === notification.nodeId);
  const spouse = notification.spouseNodeId ? nodes.find(n => n._id === notification.spouseNodeId) : null;

  const getAge = (dobString, refDate) => {
    if (!dobString) return 'N/A';
    const birthDate = new Date(dobString);
    const end = refDate ? new Date(refDate) : new Date();
    let age = end.getFullYear() - birthDate.getFullYear();
    const m = end.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderProfileCard = (member, titleRole) => {
    if (!member) return null;
    const isMale = member.gender === 1;
    const memberAge = getAge(member.dob, member.isDeceased ? member.dateOfDeath : null);

    return (
      <div className="flex-1 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center text-center shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${isMale ? 'from-blue-500 to-indigo-500' : 'from-pink-500 to-rose-500'}`} />
        
        {/* Profile Pic */}
        <div className="relative mb-3.5 mt-2">
          {member.profilePictureUrl ? (
            <img
              src={member.profilePictureUrl}
              alt={member.name}
              className={`w-20 h-20 rounded-full object-cover border-4 ${member.isDeceased ? 'grayscale border-slate-600/50' : (isMale ? 'border-blue-500/30' : 'border-pink-500/30')} group-hover:scale-105 transition-transform duration-300`}
            />
          ) : (
            <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${
              member.isDeceased ? 'bg-slate-900 border-slate-700 text-slate-500 grayscale' :
              (isMale ? 'bg-blue-950/40 border-blue-500/30 text-blue-400' : 'bg-pink-950/40 border-pink-500/30 text-pink-400')
            }`}>
              <span className="text-2xl font-bold">{member.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          {titleRole && (
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-400">
              {titleRole}
            </span>
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-100 mt-2 truncate w-full group-hover:text-emerald-400 transition-colors">
          {member.name}
        </h3>
        
        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
          {isMale ? 'Male' : 'Female'}
          {memberAge !== 'N/A' && ` • ${memberAge} yrs${member.isDeceased ? ' (Deceased)' : ''}`}
        </p>

        {/* Member Details */}
        <div className="w-full border-t border-slate-900/60 mt-4 pt-3.5 space-y-2.5 text-left text-[11px] text-slate-350">
          <div className="flex items-center space-x-2">
            <Calendar size={13} className="text-slate-500" />
            <span>DOB: {getFormattedDate(member.dob)}</span>
          </div>
          {member.gotram && (
            <div className="flex items-center space-x-2">
              <Globe size={13} className="text-slate-500" />
              <span>Gotram: <strong className="text-slate-200">{member.gotram}</strong></span>
            </div>
          )}
          {member.bloodGroup && (
            <div className="flex items-center space-x-2">
              <Heart size={13} className="text-rose-500/80" />
              <span>Blood Group: <strong className="text-slate-200">{member.bloodGroup}</strong></span>
            </div>
          )}
          {member.mobileNumber && (
            <div className="flex items-center space-x-2">
              <Smartphone size={13} className="text-slate-500" />
              <span>{member.mobileNumber}</span>
            </div>
          )}
          {member.email && (
            <div className="flex items-center space-x-2">
              <Mail size={13} className="text-slate-500" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getEventIcon = () => {
    switch (notification.type) {
      case 'birthday':
        return (
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-bounce">
            <Gift size={24} />
          </div>
        );
      case 'death':
        return (
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert size={24} />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Heart size={24} className="fill-pink-500/10" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            {getEventIcon()}
            <div>
              <h2 className="text-sm font-bold text-slate-100">{notification.title}</h2>
              <p className="text-[10px] text-slate-400 font-medium">{notification.message}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 bg-slate-850 hover:bg-slate-850 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {notification.type === 'anniversary' ? (
            <div className="space-y-6">
              {/* Marriage Anniversary Info */}
              <div className="bg-slate-950/50 border border-slate-850 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-350 flex items-center justify-center space-x-2 font-medium">
                  <span>Marriage Anniversary: </span>
                  <strong className="text-emerald-400">{getFormattedDate(node?.marriageDate)}</strong>
                  {node?.marriageDate && (
                    <span className="bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-pink-500/20 ml-2">
                      {new Date().getFullYear() - new Date(node.marriageDate).getFullYear()} Years Married
                    </span>
                  )}
                </p>
              </div>

              {/* Side by Side Spouse Profiles */}
              <div className="flex flex-col md:flex-row gap-5">
                {renderProfileCard(node, node?.gender === 1 ? 'Husband' : 'Wife')}
                {renderProfileCard(spouse, spouse?.gender === 1 ? 'Husband' : 'Wife')}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              {/* Single Member Profile for Birthdays / Deaths */}
              <div className="w-full max-w-sm">
                {renderProfileCard(node, notification.type === 'birthday' ? 'Birthday Star' : 'Remembrance')}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/20 active:scale-95 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
