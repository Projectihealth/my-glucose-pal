/**
 * Conversation Icon Component
 * Renders cute, minimalist SVG icons for different conversation categories
 * Inspired by clean, friendly illustration style
 */

interface ConversationIconProps {
  type: string;
  size?: number;
}

export function ConversationIcon({ type, size = 32 }: ConversationIconProps) {
  const iconComponents: Record<string, JSX.Element> = {
    nutrition: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Smiling bowl/plate */}
        <path
          d="M4 10C4 10 4 16 12 16C20 16 20 10 20 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="7" r="1" fill="currentColor" />
        <path
          d="M9 12C9 12 10 13 12 13C14 13 15 12 15 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),

    sleep: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cute moon with stars */}
        <path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M6 6L7 8L9 9L7 10L6 12L5 10L3 9L5 8L6 6Z"
          fill="currentColor"
          opacity="0.7"
        />
      </svg>
    ),

    exercise: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Simple running person */}
        <circle cx="12" cy="5" r="2" fill="currentColor" />
        <path
          d="M10 10H14V13H13V19H11V13H10V10Z"
          fill="currentColor"
        />
        <path
          d="M8 14L7 18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),

    wellness: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Simple heart */}
        <path
          d="M12 21C12 21 4 15 4 9C4 6.79086 5.79086 5 8 5C9.53 5 10.84 5.76 11.62 6.89C11.77 7.12 12 7.24 12 7.24C12 7.24 12.23 7.12 12.38 6.89C13.16 5.76 14.47 5 16 5C18.2091 5 20 6.79086 20 9C20 15 12 21 12 21Z"
          fill="currentColor"
        />
      </svg>
    ),

    glucose: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Chart bars */}
        <rect x="5" y="15" width="3" height="5" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="10.5" y="11" width="3" height="9" rx="1" fill="currentColor" opacity="0.8" />
        <rect x="16" y="7" width="3" height="13" rx="1" fill="currentColor" />
        <path
          d="M4 6L8 9L12 6L16 9L20 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
        />
      </svg>
    ),

    medication: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pill capsule */}
        <rect x="7" y="7" width="10" height="10" rx="5" fill="currentColor" opacity="0.9" />
        <line x1="7" y1="12" x2="17" y2="12" stroke="white" strokeWidth="2" opacity="0.8" />
        <circle cx="10" cy="10" r="1.2" fill="white" opacity="0.6" />
        <circle cx="14" cy="14" r="1.2" fill="white" opacity="0.6" />
      </svg>
    ),

    hydration: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Water droplet */}
        <path
          d="M12 4C12 4 7 10 7 14C7 17.3137 9.68629 20 13 20C16.3137 20 19 17.3137 19 14C19 10 14 4 12 4Z"
          fill="currentColor"
        />
        <path
          d="M11 13C11 13 10 14 10 14.5C10 15.0523 10.4477 15.5 11 15.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    ),

    weight: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Scale */}
        <rect x="6" y="11" width="12" height="8" rx="2" fill="currentColor" />
        <rect x="10" y="8" width="4" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
        <circle cx="9.5" cy="15" r="1.2" fill="white" opacity="0.7" />
        <circle cx="14.5" cy="15" r="1.2" fill="white" opacity="0.7" />
        <line x1="12" y1="14" x2="12" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      </svg>
    ),

    general: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Sparkle/star */}
        <path
          d="M12 2L13 9L15 7.5L14.5 11L18 10L15 13.5L19 14.5L14.5 15.5L16 20L12 17L8 20L9.5 15.5L5 14.5L9 13.5L6 10L9.5 11L9 7.5L11 9L12 2Z"
          fill="currentColor"
        />
        <circle cx="6" cy="6" r="1.5" fill="currentColor" opacity="0.6" />
        <circle cx="18" cy="6" r="1" fill="currentColor" opacity="0.5" />
        <circle cx="18" cy="18" r="1" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      {iconComponents[type] || iconComponents.general}
    </div>
  );
}
