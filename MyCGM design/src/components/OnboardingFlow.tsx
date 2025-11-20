import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Check, User, Target, Heart, Activity, Scale, Droplet, Zap, UserCircle, Sparkles, Users2, Shield, Eye, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface OnboardingData {
  // Core Info (collected in onboarding)
  firstName: string;
  lastName: string;
  userType: string;
  gender: string;
  age: string;
  goals: string[];
  deviceType: string;
  
  // Caregiver-specific fields
  careRelationship: string; // Relationship with patient
  patientAge: string; // Patient's age range
  
  // Additional Info (to be filled in Profile)
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  height: string;
  heightUnit: 'cm' | 'ft';
  weight: string;
  weightUnit: 'kg' | 'lbs';
  diagnosisType: string;
  diagnosisYear: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  notificationsEnabled: boolean;
  language: string;
  timezone: string;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

type StepType = 'user-type' | 'name' | 'gender' | 'age' | 'relationship' | 'patient-age' | 'goals' | 'device';

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    userType: '',
    gender: '',
    age: '',
    goals: [],
    deviceType: '',
    careRelationship: '',
    patientAge: '',
    // Default values for profile fields
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    height: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    diagnosisType: '',
    diagnosisYear: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    notificationsEnabled: true,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  // Determine the flow based on user type
  const flowSteps = useMemo((): StepType[] => {
    const baseSteps: StepType[] = ['user-type', 'name'];
    
    if (data.userType === 'caregiver') {
      // Caregiver flow: skip personal gender/age, ask about patient
      return [...baseSteps, 'relationship', 'patient-age', 'goals', 'device'];
    } else {
      // Regular flow: ask personal details
      return [...baseSteps, 'gender', 'age', 'goals', 'device'];
    }
  }, [data.userType]);

  const totalSteps = flowSteps.length;
  const currentStep = flowSteps[currentStepIndex];

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'user-type':
        return data.userType !== '';
      case 'name':
        return data.firstName.trim() !== '' && data.lastName.trim() !== '';
      case 'gender':
        return data.gender !== '';
      case 'age':
        return data.age !== '';
      case 'relationship':
        return data.careRelationship !== '';
      case 'patient-age':
        return data.patientAge !== '';
      case 'goals':
        return data.goals.length > 0;
      case 'device':
        return data.deviceType !== '';
      default:
        return false;
    }
  };

  const toggleGoal = (goal: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4FF] via-white to-[#F0F4FF] flex flex-col w-full max-w-[390px] mx-auto">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Step {currentStepIndex + 1} of {totalSteps}</span>
            <span className="text-xs text-[#5B7FF3]">{Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentStep === 'user-type' && (
            <motion.div
              key="step-user-type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WelcomeStep />
              <UserTypeStep userType={data.userType} setUserType={(type) => updateData('userType', type)} />
            </motion.div>
          )}

          {currentStep === 'name' && (
            <motion.div
              key="step-name"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <NameStep 
                firstName={data.firstName}
                lastName={data.lastName}
                setFirstName={(name) => updateData('firstName', name)}
                setLastName={(name) => updateData('lastName', name)}
                isCaregiver={data.userType === 'caregiver'}
              />
            </motion.div>
          )}

          {currentStep === 'gender' && (
            <motion.div
              key="step-gender"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GenderStep gender={data.gender} setGender={(gender) => updateData('gender', gender)} />
            </motion.div>
          )}

          {currentStep === 'age' && (
            <motion.div
              key="step-age"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AgeStep 
                age={data.age}
                setAge={(age) => updateData('age', age)}
              />
            </motion.div>
          )}

          {currentStep === 'relationship' && (
            <motion.div
              key="step-relationship"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RelationshipStep 
                relationship={data.careRelationship}
                setRelationship={(rel) => updateData('careRelationship', rel)}
              />
            </motion.div>
          )}

          {currentStep === 'patient-age' && (
            <motion.div
              key="step-patient-age"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PatientAgeStep 
                patientAge={data.patientAge}
                setPatientAge={(age) => updateData('patientAge', age)}
              />
            </motion.div>
          )}

          {currentStep === 'goals' && (
            <motion.div
              key="step-goals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GoalsStep 
                goals={data.goals} 
                toggleGoal={toggleGoal}
                isCaregiver={data.userType === 'caregiver'}
              />
            </motion.div>
          )}

          {currentStep === 'device' && (
            <motion.div
              key="step-device"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DeviceStep 
                deviceType={data.deviceType} 
                setDeviceType={(device) => updateData('deviceType', device)} 
                firstName={data.firstName}
                isCaregiver={data.userType === 'caregiver'}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 space-y-3">
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] text-white rounded-2xl h-14 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#5B7FF3]/30 hover:shadow-xl hover:shadow-[#5B7FF3]/40 transition-all duration-300"
        >
          {currentStepIndex === totalSteps - 1 ? 'Get Started' : 'Continue'}
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
        {currentStepIndex > 0 && (
          <button
            onClick={handleBack}
            className="w-full text-gray-600 hover:text-gray-900 py-2 transition-colors"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}

// Welcome Step Component
function WelcomeStep() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-6 flex justify-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#5B7FF3]/40">
          <Heart className="w-10 h-10 text-white" />
        </div>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-3"
      >
        Welcome to Your Health Journey
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-600 px-4"
      >
        Let's get started with a few quick questions
      </motion.p>
    </motion.div>
  );
}

// User Type Step
function UserTypeStep({ userType, setUserType }: { userType: string; setUserType: (type: string) => void }) {
  const userTypes = [
    { id: 'cgm-user', label: 'CGM User', description: 'I use a CGM device', icon: Activity },
    { id: 'caregiver', label: 'Caregiver', description: 'I care for someone using CGM', icon: UserCircle },
    { id: 'family', label: 'Family Member', description: 'Supporting family health', icon: Heart },
    { id: 'health-enthusiast', label: 'Health Enthusiast', description: 'Tracking my wellness', icon: Zap },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-center mb-6">Who are you?</h2>
      {userTypes.map((type, index) => (
        <motion.button
          key={type.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => setUserType(type.id)}
          className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
            userType === type.id
              ? 'border-[#5B7FF3] bg-[#F0F4FF] shadow-lg shadow-[#5B7FF3]/20'
              : 'border-gray-200 bg-white hover:border-[#5B7FF3]/50 hover:bg-[#F0F4FF]/30'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              userType === type.id ? 'bg-[#5B7FF3]' : 'bg-gray-100'
            }`}>
              <type.icon className={`w-6 h-6 ${userType === type.id ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className={userType === type.id ? 'text-[#5B7FF3]' : 'text-gray-900'}>{type.label}</span>
                {userType === type.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <Check className="w-5 h-5 text-[#5B7FF3]" />
                  </motion.div>
                )}
              </div>
              <p className="text-sm text-gray-500">{type.description}</p>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// Name Step
function NameStep({ firstName, lastName, setFirstName, setLastName, isCaregiver }: {
  firstName: string;
  lastName: string;
  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
  isCaregiver?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-4 flex justify-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        <h2 className="mb-2">What's your name?</h2>
        <p className="text-sm text-gray-500">
          {isCaregiver ? 'Tell us about yourself as the caregiver' : 'This helps us personalize your experience'}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm text-gray-700 mb-2">First Name</label>
          <Input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            className="w-full h-14 px-4 rounded-2xl border-2 border-gray-200 focus:border-[#5B7FF3] focus:ring-0 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">Last Name</label>
          <Input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            className="w-full h-14 px-4 rounded-2xl border-2 border-gray-200 focus:border-[#5B7FF3] focus:ring-0 transition-colors"
          />
        </div>
      </motion.div>
    </div>
  );
}

// Relationship Step (Caregiver only)
function RelationshipStep({ relationship, setRelationship }: { 
  relationship: string; 
  setRelationship: (rel: string) => void;
}) {
  const relationships = [
    { id: 'parent-child', label: 'Parent', description: 'Caring for my child', emoji: '👶' },
    { id: 'child-parent', label: 'Adult Child', description: 'Caring for my parent', emoji: '👴' },
    { id: 'spouse', label: 'Spouse/Partner', description: 'Caring for my partner', emoji: '💑' },
    { id: 'sibling', label: 'Sibling', description: 'Caring for my brother/sister', emoji: '👫' },
    { id: 'professional', label: 'Professional', description: 'Healthcare professional', emoji: '⚕️' },
    { id: 'other', label: 'Other', description: 'Other relationship', emoji: '🤝' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-4 flex justify-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-2xl flex items-center justify-center">
            <Users2 className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        <h2 className="mb-2">Who are you caring for?</h2>
        <p className="text-sm text-gray-500">Tell us about your relationship</p>
      </div>
      {relationships.map((rel, index) => (
        <motion.button
          key={rel.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.08 }}
          onClick={() => setRelationship(rel.id)}
          className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
            relationship === rel.id
              ? 'border-[#5B7FF3] bg-[#F0F4FF] shadow-lg shadow-[#5B7FF3]/20'
              : 'border-gray-200 bg-white hover:border-[#5B7FF3]/50 hover:bg-[#F0F4FF]/30'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              relationship === rel.id ? 'bg-[#5B7FF3]' : 'bg-gray-100'
            }`}>
              <span className="text-2xl">{rel.emoji}</span>
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className={relationship === rel.id ? 'text-[#5B7FF3]' : 'text-gray-900'}>{rel.label}</span>
                {relationship === rel.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <Check className="w-5 h-5 text-[#5B7FF3]" />
                  </motion.div>
                )}
              </div>
              <p className="text-sm text-gray-500">{rel.description}</p>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// Patient Age Step (Caregiver only)
function PatientAgeStep({ patientAge, setPatientAge }: {
  patientAge: string;
  setPatientAge: (age: string) => void;
}) {
  const ageRanges = [
    { id: '0-12', label: 'Child (0-12)', icon: '👶' },
    { id: '13-17', label: 'Teen (13-17)', icon: '🧒' },
    { id: '18-34', label: 'Young Adult (18-34)', icon: '🧑' },
    { id: '35-54', label: 'Adult (35-54)', icon: '👨' },
    { id: '55-74', label: 'Senior (55-74)', icon: '👴' },
    { id: '75+', label: 'Elderly (75+)', icon: '🧓' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-4 flex justify-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-2xl flex items-center justify-center">
            <Clock className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        <h2 className="mb-2">Patient's age range?</h2>
        <p className="text-sm text-gray-500">This helps us provide age-appropriate guidance</p>
      </div>

      <div className="space-y-3">
        {ageRanges.map((range, index) => (
          <motion.button
            key={range.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => setPatientAge(range.id)}
            className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
              patientAge === range.id
                ? 'border-[#5B7FF3] bg-[#F0F4FF] shadow-lg shadow-[#5B7FF3]/20'
                : 'border-gray-200 bg-white hover:border-[#5B7FF3]/50 hover:bg-[#F0F4FF]/30'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                patientAge === range.id ? 'bg-[#5B7FF3]' : 'bg-gray-100'
              }`}>
                <span className="text-2xl">{range.icon}</span>
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className={patientAge === range.id ? 'text-[#5B7FF3]' : 'text-gray-900'}>{range.label}</span>
                  {patientAge === range.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <Check className="w-5 h-5 text-[#5B7FF3]" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Gender Step
function GenderStep({ gender, setGender }: { gender: string; setGender: (gender: string) => void }) {
  const genderOptions = [
    { id: 'male', label: 'Male', emoji: '👨' },
    { id: 'female', label: 'Female', emoji: '👩' },
    { id: 'other', label: 'Other', emoji: '🧑' },
    { id: 'prefer-not', label: 'Prefer not to say', emoji: '🤝' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="mb-2">What's your gender?</h2>
        <p className="text-sm text-gray-500">This helps us provide personalized health insights</p>
      </div>
      {genderOptions.map((option, index) => (
        <motion.button
          key={option.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => setGender(option.id)}
          className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
            gender === option.id
              ? 'border-[#5B7FF3] bg-[#F0F4FF] shadow-lg shadow-[#5B7FF3]/20'
              : 'border-gray-200 bg-white hover:border-[#5B7FF3]/50 hover:bg-[#F0F4FF]/30'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              gender === option.id ? 'bg-[#5B7FF3]' : 'bg-gray-100'
            }`}>
              <span className="text-2xl">{option.emoji}</span>
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className={gender === option.id ? 'text-[#5B7FF3]' : 'text-gray-900'}>{option.label}</span>
                {gender === option.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <Check className="w-5 h-5 text-[#5B7FF3]" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// Age Step
function AgeStep({ age, setAge }: {
  age: string;
  setAge: (age: string) => void;
}) {
  const ageRanges = [
    { id: '18-24', label: '18-24 years', icon: '🌱' },
    { id: '25-34', label: '25-34 years', icon: '🌿' },
    { id: '35-44', label: '35-44 years', icon: '🌳' },
    { id: '45-54', label: '45-54 years', icon: '🍃' },
    { id: '55-64', label: '55-64 years', icon: '🌾' },
    { id: '65+', label: '65+ years', icon: '🌺' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="mb-2">What's your age range?</h2>
        <p className="text-sm text-gray-500">This helps us personalize your health recommendations</p>
      </div>

      <div className="space-y-3">
        {ageRanges.map((range, index) => (
          <motion.button
            key={range.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => setAge(range.id)}
            className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
              age === range.id
                ? 'border-[#5B7FF3] bg-[#F0F4FF] shadow-lg shadow-[#5B7FF3]/20'
                : 'border-gray-200 bg-white hover:border-[#5B7FF3]/50 hover:bg-[#F0F4FF]/30'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                age === range.id ? 'bg-[#5B7FF3]' : 'bg-gray-100'
              }`}>
                <span className="text-2xl">{range.icon}</span>
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className={age === range.id ? 'text-[#5B7FF3]' : 'text-gray-900'}>{range.label}</span>
                  {age === range.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <Check className="w-5 h-5 text-[#5B7FF3]" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Goals Step
function GoalsStep({ goals, toggleGoal, isCaregiver }: { 
  goals: string[]; 
  toggleGoal: (goal: string) => void;
  isCaregiver?: boolean;
}) {
  const regularGoals = [
    { id: 'glucose-control', label: 'Control Glucose', description: 'Manage blood sugar levels', icon: Droplet, color: '#5B7FF3' },
    { id: 'weight-loss', label: 'Weight Loss', description: 'Achieve healthy weight', icon: Scale, color: '#10B981' },
    { id: 'fitness', label: 'Fitness Focus', description: 'Improve physical fitness', icon: Activity, color: '#F59E0B' },
    { id: 'heart-health', label: 'Heart Health', description: 'Cardiovascular wellness', icon: Heart, color: '#EF4444' },
    { id: 'energy', label: 'More Energy', description: 'Boost daily energy levels', icon: Zap, color: '#8B5CF6' },
    { id: 'lifestyle', label: 'Healthy Lifestyle', description: 'Overall wellness', icon: Target, color: '#06B6D4' },
  ];

  const caregiverGoals = [
    { id: 'monitoring', label: 'CGM Monitoring', description: 'Track glucose patterns', icon: Eye, color: '#5B7FF3' },
    { id: 'emergency', label: 'Emergency Prep', description: 'Handle emergencies', icon: Shield, color: '#EF4444' },
    { id: 'education', label: 'Health Education', description: 'Learn best practices', icon: Target, color: '#F59E0B' },
    { id: 'meal-planning', label: 'Meal Planning', description: 'Prepare healthy meals', icon: Heart, color: '#10B981' },
    { id: 'communication', label: 'Communication', description: 'Work with healthcare team', icon: Users2, color: '#8B5CF6' },
    { id: 'support', label: 'Daily Support', description: 'Provide care & support', icon: Sparkles, color: '#06B6D4' },
  ];

  const goalOptions = isCaregiver ? caregiverGoals : regularGoals;

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-4 flex justify-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-2xl flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        <h2 className="mb-2">{isCaregiver ? 'Your caregiving goals?' : 'What are your goals?'}</h2>
        <p className="text-sm text-gray-500">Select all that apply</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {goalOptions.map((goal, index) => {
          const isSelected = goals.includes(goal.id);
          return (
            <motion.button
              key={goal.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleGoal(goal.id)}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                isSelected
                  ? 'border-[#5B7FF3] bg-[#F0F4FF] shadow-lg shadow-[#5B7FF3]/20'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    isSelected ? 'scale-110' : ''
                  }`}
                  style={{ backgroundColor: isSelected ? goal.color : '#F3F4F6' }}
                >
                  <goal.icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div>
                  <div className={`text-sm flex items-center justify-center gap-1 ${isSelected ? 'text-[#5B7FF3]' : 'text-gray-900'}`}>
                    {goal.label}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{goal.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Device Step (Final Step)
function DeviceStep({ deviceType, setDeviceType, firstName, isCaregiver }: { 
  deviceType: string; 
  setDeviceType: (device: string) => void;
  firstName: string;
  isCaregiver?: boolean;
}) {
  const devices = [
    { id: 'stelo', label: 'Stelo CGM', description: 'Dexcom Stelo System', image: '📱' },
    { id: 'libre', label: 'FreeStyle Libre', description: 'Abbott Libre System', image: '⌚' },
    { id: 'dexcom', label: 'Dexcom G6/G7', description: 'Dexcom Continuous Monitor', image: '💠' },
    { id: 'other', label: 'Other Device', description: 'Different CGM system', image: '🔧' },
    { id: 'none', label: 'No Device Yet', description: 'Planning to get one', image: '🎯' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="mb-2">{isCaregiver ? 'Which device do they use?' : 'Which device do you use?'}</h2>
        <p className="text-sm text-gray-500">This helps us customize your experience</p>
      </div>
      {devices.map((device, index) => (
        <motion.button
          key={device.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          onClick={() => setDeviceType(device.id)}
          className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
            deviceType === device.id
              ? 'border-[#5B7FF3] bg-[#F0F4FF] shadow-lg shadow-[#5B7FF3]/20'
              : 'border-gray-200 bg-white hover:border-[#5B7FF3]/50 hover:bg-[#F0F4FF]/30'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              deviceType === device.id ? 'bg-[#5B7FF3]' : 'bg-gray-100'
            }`}>
              <span className="text-2xl">{device.image}</span>
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className={deviceType === device.id ? 'text-[#5B7FF3]' : 'text-gray-900'}>{device.label}</span>
                {deviceType === device.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <Check className="w-5 h-5 text-[#5B7FF3]" />
                  </motion.div>
                )}
              </div>
              <p className="text-sm text-gray-500">{device.description}</p>
            </div>
          </div>
        </motion.button>
      ))}

      {deviceType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-2xl text-white"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="mb-1">Welcome, {firstName}!</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                {isCaregiver 
                  ? "You're all set to begin supporting your loved one's health journey! We'll help you provide the best care possible."
                  : "You're all set to begin your health journey! We'll help you track your progress and achieve your goals."
                }
              </p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/20">
            <p className="text-white/90 text-sm">
              💡 <span className="text-white">Pro tip:</span> Complete your full profile in the Profile tab to unlock personalized insights and recommendations.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
