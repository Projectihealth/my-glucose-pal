import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Ruler,
  Weight,
  Activity,
  Heart,
  Target,
  AlertCircle,
  Bell,
  Globe,
  Edit2,
  Check,
  X,
  ChevronRight,
  Droplet,
  Shield,
  LogOut,
  Settings,
  Camera,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TabHeader } from "./TabHeader";
import { getStoredUserId, setStoredUserId, type User } from "@/utils/userUtils";
import { getAgentConfig, type AgentType } from "@/config/agentConfig";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userType: string;
  gender: string;
  age: string;
  dateOfBirth: string;
  goals: string[];
  height: string;
  heightUnit: "cm" | "ft";
  weight: string;
  weightUnit: "kg" | "lbs";
  deviceType: string;
  diagnosisType: string;
  diagnosisYear: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  notificationsEnabled: boolean;
  language: string;
  timezone: string;
  agentPreference: AgentType;
}

const DEFAULT_PROFILE: UserProfile = {
  firstName: 'CGM',
  lastName: 'User',
  email: '',
  phoneNumber: '',
  userType: 'cgm-user',
  gender: 'prefer-not',
  age: '35-44',
  dateOfBirth: '',
  goals: [],
  height: '',
  heightUnit: 'cm',
  weight: '',
  weightUnit: 'kg',
  deviceType: 'none',
  diagnosisType: 'none',
  diagnosisYear: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  notificationsEnabled: true,
  language: 'English',
  timezone: 'America/Los_Angeles',
  agentPreference: 'olivia',
};

export function ProfileTab() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingSection, setEditingSection] = useState<
    string | null
  >(null);
  const [editedProfile, setEditedProfile] =
    useState<UserProfile | null>(null);
  const [completionPercentage, setCompletionPercentage] =
    useState(0);
  const [showAgeDialog, setShowAgeDialog] = useState(false);
  const [showDeviceDialog, setShowDeviceDialog] =
    useState(false);
  const [currentUserId, setCurrentUserId] = useState(() => getStoredUserId());
  const [availableUsers, setAvailableUsers] = useState<Array<{ user_id: string; name?: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [manualUserId, setManualUserId] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const backendUrl = import.meta.env.DEV
    ? "http://localhost:5000"
    : (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/user/${currentUserId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        const normalized = mapUserRecordToProfile(data);
        setProfile(normalized);
        setEditedProfile(normalized);
      } catch (error) {
        console.error('Failed to load profile data', error);
        const fallback = createDefaultProfile();
        setProfile(fallback);
        setEditedProfile(fallback);
        toast.error('Unable to load profile data from the server. Showing defaults.');
      }
    };

    fetchProfile();
  }, [backendUrl, currentUserId]);

  useEffect(() => {
    if (profile) {
      calculateCompletion(profile);
    }
  }, [profile]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
        const response = await fetch(`${backendUrl}/api/users`);
        if (response.ok) {
          const users = await response.json();
          setAvailableUsers(users);
        }
      } catch (error) {
        console.warn("Failed to fetch user list", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const calculateCompletion = (prof: UserProfile) => {
    const fields = [
      prof.firstName,
      prof.lastName,
      prof.email,
      prof.phoneNumber,
      prof.userType,
      prof.gender,
      prof.age,
      prof.dateOfBirth,
      prof.goals.length > 0 ? "yes" : "",
      prof.height,
      prof.weight,
      prof.deviceType,
      prof.diagnosisType,
      prof.diagnosisYear,
      prof.emergencyContactName,
      prof.emergencyContactPhone,
    ];
    const filled = fields.filter(
      (f) => f && f.trim() !== "",
    ).length;
    setCompletionPercentage(
      Math.round((filled / fields.length) * 100),
    );
  };

  const handleSaveSection = async (section: string) => {
    if (!editedProfile) return;

    // Special handling for settings section with agent preference
    if (section === "settings" && profile && editedProfile.agentPreference !== profile.agentPreference) {
      try {
        const response = await fetch(`${backendUrl}/api/user/${currentUserId}/agent-preference`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agent_preference: editedProfile.agentPreference })
        });

        if (!response.ok) {
          throw new Error('Failed to update agent preference');
        }

        const agentConfig = getAgentConfig(editedProfile.agentPreference);
        toast.success(`Health Companion updated to ${agentConfig.displayName}`);

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('agentPreferenceChanged', {
          detail: { agentPreference: editedProfile.agentPreference }
        }));
      } catch (error) {
        console.error('Failed to update agent preference:', error);
        toast.error('Failed to update health companion. Please try again.');
        return;
      }
    }

    setProfile(editedProfile);
    setEditingSection(null);
    if (section !== "settings" || editedProfile.agentPreference === profile?.agentPreference) {
      toast.success("Changes saved (local preview only)");
    }
  };

  const handleCancelSection = () => {
    setEditedProfile(profile);
    setEditingSection(null);
  };

  const updateField = (key: keyof UserProfile, value: any) => {
    if (editedProfile) {
      setEditedProfile({ ...editedProfile, [key]: value });
    }
  };

  const handleSaveAge = () => {
    if (editedProfile) {
      setProfile(editedProfile);
      setShowAgeDialog(false);
      toast.success("Age updated (local preview only)");
    }
  };

  const handleSaveDevice = () => {
    if (editedProfile) {
      setProfile(editedProfile);
      setShowDeviceDialog(false);
      toast.success("Device updated (local preview only)");
    }
  };

  const toggleGoal = (goal: string) => {
    if (editedProfile) {
      const goals = editedProfile.goals.includes(goal)
        ? editedProfile.goals.filter((g) => g !== goal)
        : [...editedProfile.goals, goal];
      updateField("goals", goals);
    }
  };

  const handleSwitchAccount = (userId: string) => {
    if (!userId || userId === currentUserId) {
      return;
    }

    try {
      setStoredUserId(userId);
      setCurrentUserId(userId);
      toast.success("Switching account", {
        description: `Loading data for ${userId}...`,
      });
    } catch (error) {
      console.error("Failed to switch account", error);
      toast.error("Unable to switch account right now.");
    }
  };

  if (!profile || !editedProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5B7FF3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    const first = profile.firstName || "";
    const last = profile.lastName || "";
    if (!first && !last) return "U";
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header - Clean & Spacious */}
      <div className="relative bg-white">
        <TabHeader
          eyebrow="Profile"
          title={`${profile.firstName} ${profile.lastName}`.trim() || 'Your Profile'}
          subtitle={getUserTypeLabel(profile.userType)}
          align="center"
          className="pb-0"
          leadingContent={(
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-full flex items-center justify-center shadow-xl shadow-[#5B7FF3]/30">
                <span className="text-white text-3xl">
                  {getInitials()}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-[#F8F9FA]">
                <Camera className="w-4 h-4 text-[#5B7FF3]" />
              </button>
            </motion.div>
          )}
        >
          <div className="flex flex-col items-center gap-6 pt-2">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  initial={{
                    strokeDashoffset: 2 * Math.PI * 56,
                  }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 56 * (1 - completionPercentage / 100),
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#5B7FF3" />
                    <stop offset="100%" stopColor="#7B9FF9" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl text-gray-900">
                  {completionPercentage}%
                </span>
                <span className="text-xs text-gray-500">
                  Complete
                </span>
              </div>
            </div>

            {completionPercentage < 100 && (
              <p className="text-sm text-gray-500">
                Complete your profile to unlock all features
              </p>
            )}
          </div>
        </TabHeader>
      </div>

      {/* Content Cards */}
      <div className="px-4 py-6 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={Target}
            value={profile.goals.length.toString()}
            label="Goals"
            color="#5B7FF3"
          />
          <StatCard
            icon={Activity}
            value={getDeviceShortName(profile.deviceType)}
            label="Device"
            color="#10B981"
            onClick={() => setShowDeviceDialog(true)}
            editable
          />
          <StatCard
            icon={Heart}
            value={profile.age}
            label="Age"
            color="#EF4444"
            onClick={() => setShowAgeDialog(true)}
            editable
          />
        </div>

        {/* Age Dialog */}
        <AnimatePresence>
          {showAgeDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowAgeDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-6 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">
                    Edit Age Range
                  </h3>
                  <button
                    onClick={() => setShowAgeDialog(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <SelectField
                  label="Age Range"
                  value={editedProfile.age}
                  options={[
                    { value: "18-24", label: "18-24 years" },
                    { value: "25-34", label: "25-34 years" },
                    { value: "35-44", label: "35-44 years" },
                    { value: "45-54", label: "45-54 years" },
                    { value: "55-64", label: "55-64 years" },
                    { value: "65+", label: "65+ years" },
                  ]}
                  onChange={(v) => updateField("age", v)}
                />

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setShowAgeDialog(false)}
                    className="flex-1 bg-gray-100 text-gray-700 rounded-xl h-11 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAge}
                    className="flex-1 bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] text-white rounded-xl h-11"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Device Dialog */}
        <AnimatePresence>
          {showDeviceDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowDeviceDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-6 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">Edit Device</h3>
                  <button
                    onClick={() => setShowDeviceDialog(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <SelectField
                  label="Device Type"
                  value={editedProfile.deviceType}
                  options={[
                    { value: "stelo", label: "Stelo CGM" },
                    {
                      value: "libre",
                      label: "FreeStyle Libre",
                    },
                    { value: "dexcom", label: "Dexcom G6/G7" },
                    { value: "other", label: "Other Device" },
                    { value: "none", label: "No Device Yet" },
                  ]}
                  onChange={(v) => updateField("deviceType", v)}
                />

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setShowDeviceDialog(false)}
                    className="flex-1 bg-gray-100 text-gray-700 rounded-xl h-11 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveDevice}
                    className="flex-1 bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] text-white rounded-xl h-11"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Personal Information */}
        <EditableCard
          title="Personal Information"
          icon={User}
          iconColor="#5B7FF3"
          iconBg="#EFF6FF"
          isEditing={editingSection === "personal"}
          onEdit={() => setEditingSection("personal")}
          onSave={() => handleSaveSection("personal")}
          onCancel={handleCancelSection}
        >
          {editingSection === "personal" ? (
            <div className="space-y-4">
              <InputField
                label="First Name"
                value={editedProfile.firstName}
                onChange={(v) => updateField("firstName", v)}
              />
              <InputField
                label="Last Name"
                value={editedProfile.lastName}
                onChange={(v) => updateField("lastName", v)}
              />
              <SelectField
                label="Gender"
                value={editedProfile.gender}
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                  {
                    value: "prefer-not",
                    label: "Prefer not to say",
                  },
                ]}
                onChange={(v) => updateField("gender", v)}
              />
              <SelectField
                label="Age Range"
                value={editedProfile.age}
                options={[
                  { value: "18-24", label: "18-24 years" },
                  { value: "25-34", label: "25-34 years" },
                  { value: "35-44", label: "35-44 years" },
                  { value: "45-54", label: "45-54 years" },
                  { value: "55-64", label: "55-64 years" },
                  { value: "65+", label: "65+ years" },
                ]}
                onChange={(v) => updateField("age", v)}
              />
              <InputField
                label="Date of Birth"
                type="date"
                value={editedProfile.dateOfBirth}
                onChange={(v) => updateField("dateOfBirth", v)}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <InfoRow
                label="Gender"
                value={formatGender(profile.gender)}
              />
              <InfoRow
                label="Age Range"
                value={profile.age + " years"}
              />
              <InfoRow
                label="Date of Birth"
                value={profile.dateOfBirth || "Not set"}
              />
            </div>
          )}
        </EditableCard>

        {/* Contact Information */}
        <EditableCard
          title="Contact"
          icon={Mail}
          iconColor="#10B981"
          iconBg="#ECFDF5"
          isEditing={editingSection === "contact"}
          onEdit={() => setEditingSection("contact")}
          onSave={() => handleSaveSection("contact")}
          onCancel={handleCancelSection}
        >
          {editingSection === "contact" ? (
            <div className="space-y-4">
              <InputField
                label="Email"
                type="email"
                value={editedProfile.email}
                onChange={(v) => updateField("email", v)}
                placeholder="your.email@example.com"
              />
              <InputField
                label="Phone"
                type="tel"
                value={editedProfile.phoneNumber}
                onChange={(v) => updateField("phoneNumber", v)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <InfoRow
                label="Email"
                value={profile.email || "Not set"}
                icon={Mail}
              />
              <InfoRow
                label="Phone"
                value={profile.phoneNumber || "Not set"}
                icon={Phone}
              />
            </div>
          )}
        </EditableCard>

        {/* Health Goals */}
        <EditableCard
          title="Health Goals"
          icon={Target}
          iconColor="#8B5CF6"
          iconBg="#F3F0FF"
          isEditing={editingSection === "goals"}
          onEdit={() => setEditingSection("goals")}
          onSave={() => handleSaveSection("goals")}
          onCancel={handleCancelSection}
        >
          {editingSection === "goals" ? (
            <GoalsEditor
              goals={editedProfile.goals}
              toggleGoal={toggleGoal}
            />
          ) : (
            <GoalChips goals={profile.goals} />
          )}
        </EditableCard>

        {/* Physical Metrics */}
        <EditableCard
          title="Physical Metrics"
          icon={Ruler}
          iconColor="#F59E0B"
          iconBg="#FEF3C7"
          isEditing={editingSection === "metrics"}
          onEdit={() => setEditingSection("metrics")}
          onSave={() => handleSaveSection("metrics")}
          onCancel={handleCancelSection}
        >
          {editingSection === "metrics" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <InputField
                    label="Height"
                    type="number"
                    value={editedProfile.height}
                    onChange={(v) => updateField("height", v)}
                  />
                  <div className="flex gap-2 mt-2">
                    <UnitButton
                      active={editedProfile.heightUnit === "cm"}
                      onClick={() =>
                        updateField("heightUnit", "cm")
                      }
                      label="cm"
                    />
                    <UnitButton
                      active={editedProfile.heightUnit === "ft"}
                      onClick={() =>
                        updateField("heightUnit", "ft")
                      }
                      label="ft"
                    />
                  </div>
                </div>
                <div>
                  <InputField
                    label="Weight"
                    type="number"
                    value={editedProfile.weight}
                    onChange={(v) => updateField("weight", v)}
                  />
                  <div className="flex gap-2 mt-2">
                    <UnitButton
                      active={editedProfile.weightUnit === "kg"}
                      onClick={() =>
                        updateField("weightUnit", "kg")
                      }
                      label="kg"
                    />
                    <UnitButton
                      active={
                        editedProfile.weightUnit === "lbs"
                      }
                      onClick={() =>
                        updateField("weightUnit", "lbs")
                      }
                      label="lbs"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                icon={Ruler}
                label="Height"
                value={
                  profile.height
                    ? `${profile.height} ${profile.heightUnit}`
                    : "Not set"
                }
              />
              <MetricCard
                icon={Weight}
                label="Weight"
                value={
                  profile.weight
                    ? `${profile.weight} ${profile.weightUnit}`
                    : "Not set"
                }
              />
            </div>
          )}
        </EditableCard>

        {/* Health Status */}
        <EditableCard
          title="Health Status"
          icon={Heart}
          iconColor="#EF4444"
          iconBg="#FEE2E2"
          isEditing={editingSection === "health"}
          onEdit={() => setEditingSection("health")}
          onSave={() => handleSaveSection("health")}
          onCancel={handleCancelSection}
        >
          {editingSection === "health" ? (
            <div className="space-y-4">
              <SelectField
                label="Device Type"
                value={editedProfile.deviceType}
                options={[
                  { value: "stelo", label: "Stelo CGM" },
                  { value: "libre", label: "FreeStyle Libre" },
                  { value: "dexcom", label: "Dexcom G6/G7" },
                  { value: "other", label: "Other Device" },
                  { value: "none", label: "No Device Yet" },
                ]}
                onChange={(v) => updateField("deviceType", v)}
              />
              <SelectField
                label="Diagnosis"
                value={editedProfile.diagnosisType}
                options={[
                  { value: "type1", label: "Type 1 Diabetes" },
                  { value: "type2", label: "Type 2 Diabetes" },
                  {
                    value: "prediabetes",
                    label: "Prediabetes",
                  },
                  {
                    value: "gestational",
                    label: "Gestational Diabetes",
                  },
                  { value: "none", label: "No Diagnosis" },
                  { value: "other", label: "Other" },
                ]}
                onChange={(v) =>
                  updateField("diagnosisType", v)
                }
              />
              <SelectField
                label="Year of Diagnosis"
                value={editedProfile.diagnosisYear}
                options={Array.from({ length: 50 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return {
                    value: year.toString(),
                    label: year.toString(),
                  };
                })}
                onChange={(v) =>
                  updateField("diagnosisYear", v)
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              <InfoRow
                label="Device"
                value={getDeviceLabel(profile.deviceType)}
              />
              <InfoRow
                label="Diagnosis"
                value={getDiagnosisLabel(profile.diagnosisType)}
              />
              {profile.diagnosisYear && (
                <InfoRow
                  label="Since"
                  value={profile.diagnosisYear}
                />
              )}
            </div>
          )}
        </EditableCard>

        {/* Emergency Contact */}
        <EditableCard
          title="Emergency Contact"
          icon={Shield}
          iconColor="#06B6D4"
          iconBg="#CFFAFE"
          isEditing={editingSection === "emergency"}
          onEdit={() => setEditingSection("emergency")}
          onSave={() => handleSaveSection("emergency")}
          onCancel={handleCancelSection}
        >
          {editingSection === "emergency" ? (
            <div className="space-y-4">
              <InputField
                label="Contact Name"
                value={editedProfile.emergencyContactName}
                onChange={(v) =>
                  updateField("emergencyContactName", v)
                }
                placeholder="Optional"
              />
              <InputField
                label="Phone Number"
                type="tel"
                value={editedProfile.emergencyContactPhone}
                onChange={(v) =>
                  updateField("emergencyContactPhone", v)
                }
                placeholder="Optional"
              />
              <SelectField
                label="Relationship"
                value={editedProfile.emergencyContactRelation}
                options={[
                  { value: "", label: "Select relationship" },
                  { value: "spouse", label: "Spouse" },
                  { value: "parent", label: "Parent" },
                  { value: "child", label: "Child" },
                  { value: "sibling", label: "Sibling" },
                  { value: "friend", label: "Friend" },
                  { value: "caregiver", label: "Caregiver" },
                  { value: "other", label: "Other" },
                ]}
                onChange={(v) =>
                  updateField("emergencyContactRelation", v)
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {profile.emergencyContactName ? (
                <>
                  <InfoRow
                    label="Name"
                    value={profile.emergencyContactName}
                  />
                  <InfoRow
                    label="Phone"
                    value={
                      profile.emergencyContactPhone || "Not set"
                    }
                  />
                  <InfoRow
                    label="Relationship"
                    value={
                      profile.emergencyContactRelation
                        ? profile.emergencyContactRelation
                            .charAt(0)
                            .toUpperCase() +
                          profile.emergencyContactRelation.slice(
                            1,
                          )
                        : "Not set"
                    }
                  />
                </>
              ) : (
                <p className="text-gray-400 text-center py-4">
                  No emergency contact set
                </p>
              )}
            </div>
          )}
        </EditableCard>

        {/* Settings */}
        <EditableCard
          title="Preferences"
          icon={Settings}
          iconColor="#6366F1"
          iconBg="#EEF2FF"
          isEditing={editingSection === "settings"}
          onEdit={() => setEditingSection("settings")}
          onSave={() => handleSaveSection("settings")}
          onCancel={handleCancelSection}
        >
          {editingSection === "settings" ? (
            <div className="space-y-4">
              <ToggleField
                label="Notifications"
                description="Receive health updates"
                value={editedProfile.notificationsEnabled}
                onChange={(v) =>
                  updateField("notificationsEnabled", v)
                }
              />
              <SelectField
                label="Language"
                value={editedProfile.language}
                options={[
                  { value: "en", label: "🇺🇸 English" },
                  { value: "es", label: "🇪🇸 Español" },
                  { value: "fr", label: "🇫🇷 Français" },
                  { value: "de", label: "🇩🇪 Deutsch" },
                  { value: "zh", label: "🇨🇳 中文" },
                ]}
                onChange={(v) => updateField("language", v)}
              />
              <SelectField
                label="Health Companion"
                value={editedProfile.agentPreference}
                options={[
                  { value: "olivia", label: "Olivia (Female)" },
                  { value: "oliver", label: "Oliver (Male)" },
                ]}
                onChange={(v) => updateField("agentPreference", v as AgentType)}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <InfoRow
                label="Notifications"
                value={
                  profile.notificationsEnabled
                    ? "Enabled"
                    : "Disabled"
                }
              />
              <InfoRow
                label="Language"
                value={getLanguageLabel(profile.language)}
              />
              <InfoRow
                label="Health Companion"
                value={getAgentConfig(profile.agentPreference).displayName + " (" + getAgentConfig(profile.agentPreference).gender.charAt(0).toUpperCase() + getAgentConfig(profile.agentPreference).gender.slice(1) + ")"}
              />
            </div>
          )}
        </EditableCard>

        {/* Logout Button */}
        <button
          onClick={() => {
            if (confirm("Are you sure you want to sign out?")) {
              localStorage.removeItem("onboardingComplete");
              localStorage.removeItem("userProfile");
              window.location.reload();
            }
          }}
          className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>

        {/* Developer Options */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              Developer Options
            </span>
          </div>
          <button
            onClick={() => {
              if (
                confirm(
                  "This will clear all data and restart the onboarding process. Continue?",
                )
              ) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full bg-orange-50 border-2 border-orange-200 rounded-xl p-3 flex items-center justify-center gap-2 text-orange-600 hover:bg-orange-100 transition-colors mb-2"
          >
            <Activity className="w-5 h-5" />
            <span>Reset Onboarding</span>
          </button>
          <button
            onClick={() => {
              if (
                confirm(
                  "This will show the app tutorial again. Continue?",
                )
              ) {
                localStorage.removeItem("tutorialComplete");
                window.location.reload();
              }
            }}
            className="w-full bg-blue-50 border-2 border-blue-200 rounded-xl p-3 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            <span>Show Tutorial Again</span>
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            Use these to test the welcome flow and tutorial
          </p>
        </div>
      </div>
      <section className="px-4 pt-4 pb-12 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#5B7FF3]" />
          <h2 className="text-lg font-semibold text-gray-900">
            Switch Account (Testing)
          </h2>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Current User ID</Label>
            <div className="px-3 py-2 rounded-2xl bg-gray-50 border border-gray-100 font-mono text-sm text-gray-800">
              {currentUserId}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Choose Existing Account</Label>
            <Select
              value={selectedUserId}
              onValueChange={(value) => {
                setSelectedUserId(value);
                setManualUserId("");
              }}
              disabled={isLoadingUsers}
            >
              <SelectTrigger className="rounded-2xl h-12">
                <SelectValue
                  placeholder={isLoadingUsers ? "Loading users..." : "Select a saved user"}
                />
              </SelectTrigger>
              <SelectContent className="z-[100]" position="popper" sideOffset={8}>
                {availableUsers.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.user_id}
                    {user.name ? ` · ${user.name}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-dashed border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-500 uppercase">
              <span className="bg-white px-2">or enter User ID</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-600" htmlFor="manual-user-id">
              Manual user ID
            </Label>
            <Input
              id="manual-user-id"
              value={manualUserId}
              placeholder="e.g., user_001"
              onChange={(event) => {
                setManualUserId(event.target.value);
                setSelectedUserId("");
              }}
              className="rounded-2xl"
            />
          </div>

          <Button
            className="w-full rounded-2xl"
            disabled={!manualUserId && !selectedUserId}
            onClick={() => handleSwitchAccount(manualUserId || selectedUserId)}
          >
            Switch Account
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Switching reloads the page with the selected user's data
          </p>
        </div>
      </section>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  value,
  label,
  color,
  onClick,
  editable,
}: {
  icon: any;
  value: string;
  label: string;
  color: string;
  onClick?: () => void;
  editable?: boolean;
}) {
  return (
    <motion.button
      whileHover={editable ? { scale: 1.05 } : { scale: 1.02 }}
      whileTap={editable ? { scale: 0.98 } : { scale: 1 }}
      onClick={onClick}
      disabled={!editable}
      className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center relative ${editable ? "cursor-pointer" : "cursor-default"}`}
    >
      {editable && (
        <div className="absolute top-2 right-2">
          <Edit2 className="w-3 h-3 text-gray-400" />
        </div>
      )}
      <div
        className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </motion.button>
  );
}

// Editable Card Component
function EditableCard({
  title,
  icon: Icon,
  iconColor,
  iconBg,
  children,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: {
  title: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  children: React.ReactNode;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      layout
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: iconBg }}
            >
              <Icon
                className="w-5 h-5"
                style={{ color: iconColor }}
              />
            </div>
            <h3 className="text-gray-900">{title}</h3>
          </div>
          {!isEditing && (
            <button
              onClick={onEdit}
              className="text-[#5B7FF3] hover:bg-[#F0F4FF] w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isEditing ? "editing" : "viewing"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>

        {isEditing && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button
              onClick={onSave}
              className="flex-1 bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] text-white rounded-xl h-11"
            >
              <Check className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={onCancel}
              className="px-6 bg-gray-100 text-gray-700 rounded-xl h-11 hover:bg-gray-200"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Info Row Component
function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: any;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <span className="text-gray-600 text-sm">{label}</span>
      </div>
      <span className="text-gray-900 text-sm">{value}</span>
    </div>
  );
}

// Input Field Component
function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-2">
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#5B7FF3] focus:ring-0 transition-colors"
      />
    </div>
  );
}

// Select Field Component
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#5B7FF3] focus:ring-0 bg-white transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Toggle Field Component
function ToggleField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div>
        <p className="text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-14 h-8 rounded-full transition-colors ${
          value ? "bg-[#5B7FF3]" : "bg-gray-300"
        }`}
      >
        <motion.div
          className="w-6 h-6 bg-white rounded-full shadow-sm"
          animate={{ x: value ? 28 : 4 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>
    </div>
  );
}

// Unit Button Component
function UnitButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-sm transition-all ${
        active
          ? "bg-[#5B7FF3] text-white shadow-sm"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

// Metric Card Component
function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}

// Goals Editor Component
function GoalsEditor({
  goals,
  toggleGoal,
}: {
  goals: string[];
  toggleGoal: (goal: string) => void;
}) {
  const goalOptions = [
    {
      id: "glucose-control",
      label: "Glucose",
      icon: Droplet,
      color: "#5B7FF3",
    },
    {
      id: "weight-loss",
      label: "Weight Loss",
      icon: Weight,
      color: "#10B981",
    },
    {
      id: "fitness",
      label: "Fitness",
      icon: Activity,
      color: "#F59E0B",
    },
    {
      id: "heart-health",
      label: "Heart",
      icon: Heart,
      color: "#EF4444",
    },
    {
      id: "energy",
      label: "Energy",
      icon: Target,
      color: "#8B5CF6",
    },
    {
      id: "lifestyle",
      label: "Lifestyle",
      icon: Target,
      color: "#06B6D4",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {goalOptions.map((goal) => {
        const isSelected = goals.includes(goal.id);
        return (
          <motion.button
            key={goal.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleGoal(goal.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              isSelected
                ? "border-[#5B7FF3] bg-[#F0F4FF] shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div
              className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center transition-all"
              style={{
                backgroundColor: isSelected
                  ? goal.color
                  : "#F3F4F6",
                transform: isSelected
                  ? "scale(1.1)"
                  : "scale(1)",
              }}
            >
              <goal.icon
                className={`w-5 h-5 ${isSelected ? "text-white" : "text-gray-600"}`}
              />
            </div>
            <p
              className={`text-sm text-center ${isSelected ? "text-[#5B7FF3]" : "text-gray-700"}`}
            >
              {goal.label}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}

function createDefaultProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  // Check localStorage for onboarding data first
  const onboardingData = localStorage.getItem('userProfile');
  let baseProfile = DEFAULT_PROFILE;

  if (onboardingData) {
    try {
      const parsed = JSON.parse(onboardingData);
      // Merge onboarding data with defaults, prioritizing onboarding data
      baseProfile = {
        ...DEFAULT_PROFILE,
        ...parsed,
      };
    } catch (error) {
      console.warn('Failed to parse onboarding data from localStorage:', error);
    }
  }

  return {
    ...baseProfile,
    ...overrides,
  };
}

const AGE_BUCKETS = [
  { label: '18-24', min: 18, max: 24 },
  { label: '25-34', min: 25, max: 34 },
  { label: '35-44', min: 35, max: 44 },
  { label: '45-54', min: 45, max: 54 },
  { label: '55-64', min: 55, max: 64 },
  { label: '65+', min: 65, max: 200 },
];

function deriveAgeRange(dateOfBirth?: string): string {
  if (!dateOfBirth) {
    return '';
  }
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return '';
  }
  const diff = Date.now() - dob.getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  const bucket = AGE_BUCKETS.find(({ min, max }) => age >= min && age <= max);
  return bucket ? bucket.label : '';
}

function mapHealthGoalToIds(goal?: string | null): string[] {
  if (!goal) {
    return [];
  }
  const normalized = goal.toLowerCase();
  const mapping: Record<string, string> = {
    glucose: 'glucose-control',
    sugar: 'glucose-control',
    weight: 'weight-loss',
    fitness: 'fitness',
    heart: 'heart-health',
    energy: 'energy',
    lifestyle: 'lifestyle',
  };
  for (const [keyword, id] of Object.entries(mapping)) {
    if (normalized.includes(keyword)) {
      return [id];
    }
  }
  return [];
}

function mapUserRecordToProfile(record: any): UserProfile {
  const defaults = createDefaultProfile();
  if (!record) {
    return defaults;
  }
  const name = (record.name || '').trim();
  const [firstName, ...rest] = name ? name.split(' ') : [defaults.firstName, defaults.lastName];
  const derivedAge = deriveAgeRange(record.date_of_birth);

  return {
    ...defaults,
    firstName: firstName || defaults.firstName,
    lastName: rest.join(' ') || defaults.lastName,
    gender: record.gender || defaults.gender,
    dateOfBirth: record.date_of_birth || defaults.dateOfBirth,
    age: derivedAge || defaults.age,
    goals: mapHealthGoalToIds(record.health_goal),
    deviceType: (record.cgm_device_type || defaults.deviceType) as UserProfile['deviceType'],
    userType: record.cgm_device_type ? 'cgm-user' : defaults.userType,
    agentPreference: (record.agent_preference || defaults.agentPreference) as AgentType,
  };
}

// Goal Chips Component
function GoalChips({ goals }: { goals: string[] }) {
  const goalConfig: Record<
    string,
    { label: string; color: string }
  > = {
    "glucose-control": {
      label: "🩸 Glucose",
      color: "#5B7FF3",
    },
    "weight-loss": { label: "⚖️ Weight", color: "#10B981" },
    fitness: { label: "💪 Fitness", color: "#F59E0B" },
    "heart-health": { label: "❤️ Heart", color: "#EF4444" },
    energy: { label: "⚡ Energy", color: "#8B5CF6" },
    lifestyle: { label: "🌟 Lifestyle", color: "#06B6D4" },
  };

  if (goals.length === 0) {
    return (
      <p className="text-gray-400 text-center py-4">
        No goals set
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {goals.map((goal) => {
        const config = goalConfig[goal];
        if (!config) return null;
        return (
          <div
            key={goal}
            className="px-4 py-2 rounded-full text-sm"
            style={{
              backgroundColor: `${config.color}15`,
              color: config.color,
            }}
          >
            {config.label}
          </div>
        );
      })}
    </div>
  );
}

// Helper functions
function getUserTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    "cgm-user": "CGM User",
    caregiver: "Caregiver",
    family: "Family Member",
    "health-enthusiast": "Health Enthusiast",
  };
  return labels[type] || type;
}

function formatGender(gender: string): string {
  const labels: Record<string, string> = {
    male: "Male",
    female: "Female",
    other: "Other",
    "prefer-not": "Prefer not to say",
  };
  return labels[gender] || "Not set";
}

function getDeviceLabel(device: string): string {
  const labels: Record<string, string> = {
    stelo: "Stelo CGM",
    libre: "FreeStyle Libre",
    dexcom: "Dexcom G6/G7",
    other: "Other Device",
    none: "No Device",
  };
  return labels[device] || "Not set";
}

function getDeviceShortName(device: string): string {
  const names: Record<string, string> = {
    stelo: "Stelo",
    libre: "Libre",
    dexcom: "Dexcom",
    other: "Other",
    none: "None",
  };
  return names[device] || "-";
}

function getDiagnosisLabel(diagnosis: string): string {
  const labels: Record<string, string> = {
    type1: "Type 1 Diabetes",
    type2: "Type 2 Diabetes",
    prediabetes: "Prediabetes",
    gestational: "Gestational Diabetes",
    none: "No Diagnosis",
    other: "Other",
  };
  return labels[diagnosis] || "Not set";
}

function getLanguageLabel(code: string): string {
  const labels: Record<string, string> = {
    en: "🇺🇸 English",
    es: "🇪🇸 Español",
    fr: "🇫🇷 Français",
    de: "🇩🇪 Deutsch",
    zh: "🇨🇳 中文",
  };
  return labels[code] || code;
}
