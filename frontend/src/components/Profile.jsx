import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Save, User, Calendar, Droplets, ShieldAlert, Phone, Link2, Image as ImageIcon, CheckCircle, RefreshCw, Mail } from 'lucide-react';
import { auth, verifyBeforeUpdateEmail } from '../utils/firebase';

const Profile = () => {
  const { user, reloadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    bloodGroup: '',
    gotram: '',
    mobileNumber: '',
    profilePictureUrl: '',
    socialLinks: ['']
  });

  const [syncSettings, setSyncSettings] = useState({
    name: true,
    dob: true,
    bloodGroup: true,
    gotram: true,
    mobileNumber: true,
    email: true,
    profilePictureUrl: true,
    socialLinks: true
  });

  // Email states
  const [emailInput, setEmailInput] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [sendingEmailVerification, setSendingEmailVerification] = useState(false);
  const [emailMessage, setEmailMessage] = useState(null);

  // Profile picture upload states
  const [uploadingPic, setUploadingPic] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.profile?.name || '',
        dob: user.profile?.dob ? new Date(user.profile.dob).toISOString().split('T')[0] : '',
        bloodGroup: user.profile?.bloodGroup || '',
        gotram: user.profile?.gotram || '',
        mobileNumber: user.profile?.mobileNumber || '',
        profilePictureUrl: user.profile?.profilePictureUrl || '',
        socialLinks: user.profile?.socialLinks?.length > 0 ? [...user.profile.socialLinks] : ['']
      });
      setEmailInput(user.email || '');
      setIsEditingEmail(false);
      if (user.syncSettings) {
        setSyncSettings({
          name: user.syncSettings.name !== false,
          dob: user.syncSettings.dob !== false,
          bloodGroup: user.syncSettings.bloodGroup !== false,
          gotram: user.syncSettings.gotram !== false,
          mobileNumber: user.syncSettings.mobileNumber !== false,
          email: user.syncSettings.email !== false,
          profilePictureUrl: user.syncSettings.profilePictureUrl !== false,
          socialLinks: user.syncSettings.socialLinks !== false
        });
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (index, value) => {
    const updated = [...formData.socialLinks];
    updated[index] = value;
    setFormData(prev => ({
      ...prev,
      socialLinks: updated
    }));
  };

  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, '']
    }));
  };

  const removeSocialLink = (index) => {
    const updated = formData.socialLinks.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      socialLinks: updated.length > 0 ? updated : ['']
    }));
  };

  const handleSyncToggle = (field) => {
    setSyncSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSendEmailVerification = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      setEmailMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    setSendingEmailVerification(true);
    setEmailMessage(null);
    try {
      if (auth.currentUser) {
        await verifyBeforeUpdateEmail(auth.currentUser, emailInput);
        setEmailMessage({
          type: 'success',
          text: `A verification link has been sent to ${emailInput}. Please click the link to confirm the change. Once verified, refresh or re-login to see the updated email.`
        });
        setIsEditingEmail(false);
      } else {
        throw new Error('No authenticated Firebase user session found.');
      }
    } catch (err) {
      console.error(err);
      setEmailMessage({ type: 'error', text: err.message || 'Failed to send email verification link.' });
    } finally {
      setSendingEmailVerification(false);
    }
  };


  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be under 5MB.' });
      return;
    }

    setUploadingPic(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await api.auth.uploadProfilePicture(file);
      setFormData(prev => ({
        ...prev,
        profilePictureUrl: data.link
      }));
      setMessage({ type: 'success', text: "Profile picture uploaded successfully! Don't forget to save changes." });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to upload profile picture.' });
    } finally {
      setUploadingPic(false);
    }
  };

  const handleRemovePic = () => {
    setFormData(prev => ({
      ...prev,
      profilePictureUrl: ''
    }));
    setMessage({ type: 'success', text: 'Profile picture marked for removal. Save changes to finalize.' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Clean social links
    const cleanedSocialLinks = formData.socialLinks.filter(link => link.trim() !== '');

    // Validate DOB is not in the future
    if (formData.dob) {
      const selectedDob = new Date(formData.dob);
      if (selectedDob > new Date()) {
        setMessage({ type: 'error', text: 'Date of birth cannot be in the future.' });
        setLoading(false);
        return;
      }
    }

    try {
      await api.auth.updateProfile(
        {
          ...formData,
          socialLinks: cleanedSocialLinks
        },
        syncSettings
      );
      await reloadUser();
      setMessage({ type: 'success', text: 'Profile updated and synced to tree nodes successfully!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#020617] p-6 md:p-10 overflow-y-auto text-slate-100 flex justify-center">
      <div className="w-full max-w-4xl space-y-8 animate-fadeIn">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Universal Account Profile
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage your personal credentials and select which details automatically paste to your assigned kinship node.
          </p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl border flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Details Form (2 cols) */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 backdrop-blur-md">
            <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center space-x-2">
              <User size={18} className="text-emerald-400" />
              <span>Personal Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><User size={16} /></span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none transition"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              {/* DOB */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Date of Birth</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Calendar size={16} /></span>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Gotram */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Gotram</label>
                <input
                  type="text"
                  name="gotram"
                  value={formData.gotram}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none transition"
                  placeholder="e.g., Shiva"
                />
              </div>

              {/* Blood Group */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Blood Group</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Droplets size={16} /></span>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none transition cursor-pointer"
                  >
                    <option value="">Unknown</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-semibold text-slate-400">Email Address (Login)</label>
                  {user?.emailVerified ? (
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                      <span>Unverified</span>
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      disabled={!isEditingEmail}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none transition disabled:opacity-70 disabled:cursor-not-allowed"
                      placeholder="email@example.com"
                    />
                  </div>
                  {!isEditingEmail ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(true)}
                      className="bg-slate-950 border border-slate-800 hover:bg-slate-850 text-emerald-400 font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Edit Email
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleSendEmailVerification}
                        disabled={sendingEmailVerification || emailInput === (user?.email || '')}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                      >
                        {sendingEmailVerification ? 'Sending...' : 'Verify & Update'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingEmail(false);
                          setEmailInput(user?.email || '');
                          setEmailMessage(null);
                        }}
                        className="bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 font-semibold text-xs px-3 py-2.5 rounded-xl transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                {emailMessage && (
                  <p className={`text-xs mt-1 ${emailMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {emailMessage.text}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-400">Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Phone size={16} /></span>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none transition"
                    placeholder="e.g. +919876543210"
                  />
                </div>
              </div>

              {/* Profile Picture Upload & URL */}
              <div className="space-y-3 md:col-span-2 border-t border-slate-800/80 pt-4 mt-2">
                <label className="text-xs font-semibold text-slate-400 block">Profile Picture</label>
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5">
                  {/* Avatar Circle */}
                  <div 
                    onClick={() => !uploadingPic && fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-full border border-slate-850 bg-slate-950 flex items-center justify-center overflow-hidden relative group cursor-pointer shadow-inner"
                  >
                    {formData.profilePictureUrl ? (
                      <img 
                        src={formData.profilePictureUrl} 
                        alt="Avatar Preview" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User size={32} className="text-slate-550" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                      <span className="text-[10px] text-slate-200 font-bold text-center px-1">Upload</span>
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex flex-wrap gap-2">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPic}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-855 text-white font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-1.5"
                      >
                        {uploadingPic ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={12} />
                            <span>Upload Image</span>
                          </>
                        )}
                      </button>
                      {formData.profilePictureUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePic}
                          className="bg-slate-950 border border-slate-850 hover:bg-red-500/10 hover:text-red-400 text-slate-400 font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                    
                    {/* URL Fallback input */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500">Or paste an image URL:</span>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-650"><Link2 size={12} /></span>
                        <input
                          type="url"
                          name="profilePictureUrl"
                          value={formData.profilePictureUrl}
                          onChange={handleChange}
                          className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-xl pl-8 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition"
                          placeholder="https://image-url.com/profile.jpg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Social Links */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
                <label className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
                  <Link2 size={14} className="text-emerald-400" />
                  <span>Social Profiles / Links</span>
                </label>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="text-xs text-emerald-400 hover:text-emerald-350 cursor-pointer font-medium"
                >
                  + Add Link
                </button>
              </div>

              <div className="space-y-2.5">
                {formData.socialLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handleSocialLinkChange(idx, e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-650 focus:outline-none transition"
                      placeholder="https://linkedin.com/in/username"
                    />
                    <button
                      type="button"
                      onClick={() => removeSocialLink(idx)}
                      className="text-xs text-slate-500 hover:text-red-400 p-2 border border-slate-800 rounded-xl hover:bg-red-500/10 transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold rounded-xl px-6 py-2.5 transition active:scale-95 cursor-pointer shadow-lg hover:shadow-emerald-600/20"
              >
                {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                <span>{loading ? 'Saving Changes...' : 'Save Profile Details'}</span>
              </button>
            </div>
          </div>

          {/* Sync Settings Panel (1 col) */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md h-fit space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center space-x-2">
                <RefreshCw size={18} className="text-emerald-400" />
                <span>Sync Preferences</span>
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Check the fields below to allow them to automatically copy and sync to your assigned family tree node. Unchecked fields will remain hidden/blank on the node.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { field: 'name', label: 'Sync Name' },
                { field: 'dob', label: 'Sync Date of Birth' },
                { field: 'bloodGroup', label: 'Sync Blood Group' },
                { field: 'gotram', label: 'Sync Gotram' },
                { field: 'mobileNumber', label: 'Sync Mobile Number' },
                { field: 'email', label: 'Sync Login Email', requiresVerification: true, verified: user?.emailVerified },
                { field: 'profilePictureUrl', label: 'Sync Profile Photo' },
                { field: 'socialLinks', label: 'Sync Social Links' }
              ].map(({ field, label, requiresVerification, verified }) => {
                const isBlocked = requiresVerification && !verified;
                return (
                  <label 
                    key={field} 
                    className={`flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 transition select-none ${
                      isBlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-300">{label}</span>
                      {isBlocked && (
                        <span className="text-[9px] text-amber-500 font-semibold mt-0.5">Requires verification</span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      disabled={isBlocked}
                      checked={isBlocked ? false : syncSettings[field]}
                      onChange={() => !isBlocked && handleSyncToggle(field)}
                      className={`w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800 focus:ring-emerald-500 focus:ring-offset-slate-950 focus:ring-2 ${
                        isBlocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                      }`}
                    />
                  </label>
                );
              })}
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-1">
              <span className="text-xs font-bold text-emerald-400 block">How syncing works:</span>
              <p className="text-[10px] text-emerald-500 leading-normal">
                Whenever you join a tree and get assigned a node, or whenever you modify this profile, checked details will be copied directly to the tree node.
              </p>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

export default Profile;
