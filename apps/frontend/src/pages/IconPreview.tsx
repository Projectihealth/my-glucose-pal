/**
 * Icon Preview Page
 * Preview all conversation icon types
 */

import { ConversationIcon } from '../components/ConversationIcon';

const iconTypes = [
  { type: 'nutrition', color: '#FF9F43', label: 'Nutrition' },
  { type: 'sleep', color: '#A78BFA', label: 'Sleep' },
  { type: 'exercise', color: '#34D399', label: 'Exercise' },
  { type: 'wellness', color: '#A55EEA', label: 'Wellness' },
  { type: 'glucose', color: '#5B7FF3', label: 'Glucose' },
  { type: 'medication', color: '#FC5C65', label: 'Medication' },
  { type: 'hydration', color: '#60A5FA', label: 'Hydration' },
  { type: 'weight', color: '#FD9644', label: 'Weight' },
  { type: 'general', color: '#26DE81', label: 'General' },
];

export function IconPreview() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Conversation Icons Preview</h1>

        <div className="grid grid-cols-3 gap-6">
          {iconTypes.map(({ type, color, label }) => (
            <div key={type} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                    border: `1.5px solid ${color}30`
                  }}
                >
                  <div style={{ color }}>
                    <ConversationIcon type={type} size={40} />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500 mt-1">{type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IconPreview;
