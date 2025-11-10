export const PATTERN_ACTIONS: Record<string, string[]> = {
  persistent_hyperglycemia: [
    "Take a closer look into patient data and context details",
    "Review current medication regimen and adherence",
    "Assess carbohydrate intake and meal timing patterns",
    "Refer to provider for potential medication adjustment, initiation, or dose increase",
    "Educate on carbohydrate counting and portion control",
    "Set A1C and time-in-range goals with patient",
  ],
  high_glycemic_variability: [
    "Take a closer look into patient data and context details",
    "Identify patterns of highs and lows throughout the day",
    "Review carbohydrate consistency and meal timing",
    "Assess insulin dosing accuracy and timing (if applicable)",
    "Educate on pairing carbohydrates with protein and fat",
    "Refer to provider for potential medication adjustment",
    "Endocrinology referral or escalation",
  ],
  overnight_hyperglycemia: [
    "Reduce late carbs",
    "Exercise during the day or night",
    "Improve sleep quality",
    "Increase basal insulin",
    "Avoid high fat meals for dinner",
    "Confirm bedtime and 03:00 readings to rule out post-dinner carryover",
  ],
  morning_hyperglycemia: [
    "Add light morning exercise",
    "Identify or address missed medication",
  ],
  frequent_spike: [
    "Pair fruit or carb snacks with fat and protein",
    "Review beverage choices for hidden sugars",
    "Address emotional eating triggers",
    "Discuss initiating a GLP-1 therapy",
  ],
  dual_peak: [
    "Use split or extended bolus timing for mixed meals (for insulin users)",
    "Pre-bolus 15-20 minutes before high-carb meals",
    "Reduce meals that combine refined carbs and high fat",
    "Add non-starchy vegetables or fiber to slow absorption",
    "For non-insulin users, take metformin or GLP-1 RA before large meals",
    "Add light post-meal activity (10-15 minute walk around 60-90 minutes)",
    "Review CGM traces for delayed peaks to fine-tune dosing or meal composition",
  ],
  day_to_day_variability: [
    "Reduce weekend alcohol or late-night snacking",
    "Track trigger days and plan mindful eating or pre-packed meals",
    "Adjust basal insulin slightly (+/- 10%) if specific days repeat patterns",
    "Keep sleep routines consistent and aim for at least seven hours",
  ],
} as const;

export type PatternWithActions = keyof typeof PATTERN_ACTIONS;
