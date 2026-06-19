import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Shield, Sparkles, RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
}

const DEPARTMENTS = [
  { value: 'Engineering 🛡️', label: 'Castle Guard (Engineering)' },
  { value: 'Product & Design 🧭', label: 'Alchemist & Cartography (Product)' },
  { value: 'HR & Operations 🪙', label: 'Guild Cleric (HR/Ops)' },
  { value: 'Sales & Marketing 🎺', label: 'Minstrels & Heralds (Sales)' },
  { value: 'Executive 👑', label: 'Monarch & Court (Executive)' }
];

const WORK_MODES: ('Office' | 'Remote' | 'Hybrid')[] = ['Office', 'Remote', 'Hybrid'];

const AVATARS = [
  { emoji: '🛡️', role: 'Paladin' },
  { emoji: '⚔️', role: 'Knight' },
  { emoji: '🧙‍♂️', role: 'Mage' },
  { emoji: '🐉', role: 'Wyvern Rider' },
  { emoji: '🦄', role: 'Unicorn Handler' },
  { emoji: '👑', role: 'Guild master' },
  { emoji: '☕', role: 'Bard (Coffee)' },
  { emoji: '💻', role: 'CyberSquire' },
  { emoji: '🍕', role: 'Feast Master' },
  { emoji: '🏹', role: 'Ranger' }
];

const PRESETS_STATUS = [
  "⚔️ Defending the server gates",
  "📜 Drafting ancient blueprints",
  "🧪 Mixing caffeine potions",
  "🦜 Tapping into the messenger crows",
  "🏰 Holding down the fort"
];

export default function ProfileSettings({ isOpen, onClose, profile, onSave }: ProfileSettingsProps) {
  const [name, setName] = useState(profile.name);
  const [department, setDepartment] = useState(profile.department);
  const [statusText, setStatusText] = useState(profile.statusText);
  const [avatarEmoji, setAvatarEmoji] = useState(profile.avatarEmoji);
  const [workMode, setWorkMode] = useState(profile.workMode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      department,
      statusText,
      avatarEmoji,
      workMode
    });
    onClose();
  };

  const randomizeName = () => {
    const titles = ['Sir', 'Lady', 'Guildsman', 'Squire', 'Alchemist', 'Maverick', 'Defender'];
    const medievalNames = ['Galahad', 'Lancelot', 'Ada', 'Grace', 'Guinevere', 'Arthur', 'Merlin', 'Winston', 'Vance', 'Valerie'];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const randomName = medievalNames[Math.floor(Math.random() * medievalNames.length)];
    setName(`${randomTitle} ${randomName}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="profile-settings-overlay"
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          id="profile-settings-modal"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="bg-white text-black neo-border w-full max-w-md p-6 neo-shadow-lg rounded-2xl relative overflow-y-auto max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-black/10">
            <h2 className="text-2xl font-retro font-bold uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-6 h-6 fill-amber-300" />
              Guild Profile Settings
            </h2>
            <button
              id="close-profile-btn"
              onClick={onClose}
              className="p-1 rounded-lg border-2 border-black hover:bg-red-200 transition-colors bg-white hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Picker */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2 font-retro text-gray-700">
                Choose Hero Class Avatar
              </label>
              <div className="grid grid-cols-5 gap-2 bg-[#fdfdf5] p-3 rounded-xl neo-border-sm">
                {AVATARS.map((av) => (
                  <button
                    key={av.role}
                    type="button"
                    title={av.role}
                    onClick={() => setAvatarEmoji(av.emoji)}
                    className={`text-2xl p-2 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${
                      avatarEmoji === av.emoji
                        ? 'border-black bg-[#EAFF00] scale-105 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'border-transparent hover:border-black/20'
                    }`}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* User Name input with smart random generator */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold uppercase tracking-wider font-retro text-gray-700">
                  Full Name
                </label>
                <button
                  type="button"
                  onClick={randomizeName}
                  className="text-xs flex items-center gap-1 text-black font-semibold bg-[#EAFF00] hover:bg-[#DFFF00] neo-border-sm py-0.5 px-2 rounded-lg hover:scale-105 text-[10px]"
                >
                  <RefreshCw className="w-3 h-3" />
                  Random Title
                </button>
              </div>
              <input
                id="profile-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={25}
                required
                placeholder="Lord/Lady of the Castle"
                className="w-full p-2.5 rounded-xl text-lg font-bold font-rounded neo-border-sm focus:outline-none focus:bg-[#EAFF00]/10 placeholder:text-gray-400"
              />
            </div>

            {/* Department Selector */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-1 font-retro text-gray-700">
                Guild Wing (Department)
              </label>
              <select
                id="profile-dept-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 rounded-xl font-medium font-sans bg-white neo-border-sm focus:outline-none focus:ring-0"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Mode */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2 font-retro text-gray-700">
                Stationing Mode (Work Style)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {WORK_MODES.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setWorkMode(mode)}
                    className={`py-2 rounded-xl font-bold text-sm border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      workMode === mode
                        ? 'border-black bg-teal-100 text-teal-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'border-black/10 bg-gray-50 text-gray-600 hover:border-black/30'
                    }`}
                  >
                    {mode === 'Office' ? '🏰 Inside' : mode === 'Remote' ? '🏕️ Outpost' : '🐎 Hybrid'}
                    <div className="text-[10px] uppercase tracking-wider font-retro font-light opacity-80 mt-0.5">
                      {mode}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom status message */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-1.5 font-retro text-gray-700">
                Alliance Status (Daily Status)
              </label>
              <input
                id="profile-status-input"
                type="text"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                maxLength={40}
                placeholder="e.g., Brewed coffee, ready to defend"
                className="w-full p-2.5 rounded-xl text-sm font-medium font-sans neo-border-sm focus:outline-none placeholder:text-gray-400"
              />
              {/* Presets */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PRESETS_STATUS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setStatusText(preset)}
                    className="text-[10px] font-medium px-2 py-1 rounded-full border border-black/20 hover:border-black bg-gray-50 text-gray-700 hover:bg-[#EAFF00]/5 transition-all"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 flex gap-3">
              <button
                id="cancel-profile-btn"
                type="button"
                onClick={onClose}
                className="flex-1 py-3 font-retro font-bold uppercase tracking-wider text-sm rounded-xl border-2 border-black bg-gray-100 hover:bg-gray-200"
              >
                Retreat
              </button>
              <button
                id="save-profile-btn"
                type="submit"
                className="flex-1 py-3 font-retro font-semibold text-lg uppercase tracking-wider rounded-xl border-2 border-black bg-[#EAFF00] hover:bg-[#DFFF00] neo-shadow hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                Apply Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
