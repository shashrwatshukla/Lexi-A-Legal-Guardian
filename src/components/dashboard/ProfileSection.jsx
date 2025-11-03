'use client';

import { useState } from 'react';
import { updateUserDocument } from '../../lib/userService';
import { auth } from '../../lib/firebase';
import { useLanguage } from '../../context/LanguageContext';
import UsernameWarningModal from './UsernameWarningModal';

export default function ProfileSection({ userData, onUpdate }) {
  const { t } = useLanguage();
  const [editMode, setEditMode] = useState({});
  const [formData, setFormData] = useState(userData || {});
  const [saving, setSaving] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  // ✅ KEEP ALL HANDLERS - No changes
  const handleEdit = (field) => {
    setEditMode({ ...editMode, [field]: true });
  };

  const handleSave = async (field) => {
    setSaving(true);
    try {
      await updateUserDocument(auth.currentUser.uid, {
        [field]: formData[field]
      });
      
      setEditMode({ ...editMode, [field]: false });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUsernameClick = () => {
    if (!userData?.usernameChanged) {
      setShowUsernameModal(true);
    }
  };

  return (
    <>
      {/* ✅ KEEP MODAL - No changes */}
      <UsernameWarningModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        currentUsername={userData?.uniqueUsername}
        onUpdate={onUpdate}
      />

      {/* ✅ REDESIGNED: No gradients, no borders, glassmorphism */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {t('dashboard.profile.title') || 'Your Profile'}
          </h2>
          {userData?.createdAt && (
            <span className="text-white/60 text-sm">
              {t('dashboard.profile.memberSince') || 'Member since'}{' '}
              {new Date(userData.createdAt).toLocaleDateString()} 🎉
            </span>
          )}
        </div>

        {/* ✅ REDESIGNED: Clean spacing, no overflow */}
        <div className="space-y-4">
          
          {/* Name Field */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <label className="text-white/60 text-sm font-medium">
                {t('dashboard.profile.name') || 'Full Name'}
              </label>
              {editMode.displayName ? (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={formData.displayName || ''}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-xl rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Enter your name"
                  />
                  <button
                    onClick={() => handleSave('displayName')}
                    disabled={saving}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {t('common.buttons.save') || 'Save'}
                  </button>
                </div>
              ) : (
                <p className="text-white text-lg mt-1">{userData?.displayName || 'Not set'}</p>
              )}
            </div>
            {!editMode.displayName && (
              <button 
                onClick={() => handleEdit('displayName')} 
                className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors"
              >
                ✏️ {t('common.buttons.edit') || 'Edit'}
              </button>
            )}
          </div>

          {/* Username Field */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <label className="text-white/60 text-sm font-medium">
                {t('dashboard.profile.username') || 'Username'}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-white text-lg">@{userData?.uniqueUsername || 'Not set'}</p>
                {userData?.usernameChanged ? (
                  <span className="text-yellow-400/80 text-xs px-2 py-1 bg-yellow-500/10 rounded-full">
                    {t('dashboard.profile.usernameChanged') || 'Changed'}
                  </span>
                ) : (
                  <button
                    onClick={handleUsernameClick}
                    className="text-blue-400 hover:text-blue-300 text-xs font-semibold transition-colors"
                  >
                    ⚠️ {t('dashboard.profile.clickToChange') || 'Click to change (one-time)'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Email Field (Read-only) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <label className="text-white/60 text-sm font-medium">
                {t('dashboard.profile.email') || 'Email Address'}
              </label>
              <p className="text-white text-lg mt-1">
                {userData?.email || 'Not set'}
                <span className="text-white/40 text-xs ml-2">
                  ({t('dashboard.profile.readOnly') || 'Read-only'})
                </span>
              </p>
            </div>
          </div>

          {/* Gender Field */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <label className="text-white/60 text-sm font-medium">
                {t('dashboard.profile.gender') || 'Gender'}
              </label>
              {editMode.gender ? (
                <div className="flex gap-2 mt-1">
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-xl rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-gray-900">Select</option>
                    <option value="male" className="bg-gray-900">Male</option>
                    <option value="female" className="bg-gray-900">Female</option>
                    <option value="other" className="bg-gray-900">Other</option>
                    <option value="prefer-not-to-say" className="bg-gray-900">Prefer not to say</option>
                  </select>
                  <button
                    onClick={() => handleSave('gender')}
                    disabled={saving}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {t('common.buttons.save') || 'Save'}
                  </button>
                </div>
              ) : (
                <p className="text-white text-lg mt-1 capitalize">{userData?.gender || 'Not set'}</p>
              )}
            </div>
            {!editMode.gender && (
              <button 
                onClick={() => handleEdit('gender')} 
                className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors"
              >
                ✏️ {t('common.buttons.edit') || 'Edit'}
              </button>
            )}
          </div>

          {/* Date of Birth Field */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <label className="text-white/60 text-sm font-medium">
                {t('dashboard.profile.dateOfBirth') || 'Date of Birth'}
              </label>
              {editMode.dateOfBirth ? (
                <div className="flex gap-2 mt-1">
                  <input
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-xl rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    style={{ colorScheme: 'dark' }}
                  />
                  <button
                    onClick={() => handleSave('dateOfBirth')}
                    disabled={saving}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {t('common.buttons.save') || 'Save'}
                  </button>
                </div>
              ) : (
                <p className="text-white text-lg mt-1">
                  {userData?.dateOfBirth || 'Not set'}
                </p>
              )}
            </div>
            {!editMode.dateOfBirth && (
              <button 
                onClick={() => handleEdit('dateOfBirth')} 
                className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors"
              >
                ✏️ {t('common.buttons.edit') || 'Edit'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}