# Monthly CGM Report Generator - LLM Prompt Guide

## Overview
This guide helps you generate personalized monthly CGM reports using an LLM by providing real CGM data and user context.

## How to Use

### Step 1: Prepare Your Data
Gather the following information about the user:
- Raw CGM readings from the past 30 days
- Activity logs (meals, exercise, sleep, stress events)
- User demographics and goals
- Previous month's report for comparison (if available)

### Step 2: LLM Prompt Template

```
You are a CGM (Continuous Glucose Monitor) data analyst and health coach. Generate a comprehensive monthly CGM report based on the following data.

INPUT DATA:
- User ID: [user_id]
- Month: [month and year]
- CGM Readings: [total number of readings]
- Data Completeness: [percentage]%

RAW CGM DATA:
[Paste 30 days of CGM readings with timestamps]

ACTIVITY LOGS:
[Paste meal logs, exercise logs, sleep data, stress events]

USER CONTEXT:
- Age: [age]
- Gender: [gender]
- Diabetes Type: [type 1/type 2/prediabetes/metabolic health]
- Current Goals: [weight loss, glucose control, athletic performance, etc.]
- Previous Month TIR: [percentage]
- Known Conditions: [list any relevant health conditions]

GENERATE A REPORT FOLLOWING THIS JSON STRUCTURE:
[Paste the monthly-report-template.json structure]

INSTRUCTIONS:
1. Calculate all metrics accurately from the raw CGM data
2. Identify patterns by analyzing time-of-day trends, day-of-week patterns, and correlations
3. Correlate CGM patterns with activity logs to find behavior-glucose relationships
4. Compare to previous month if data available
5. Generate 4-6 prioritized, actionable recommendations based on identified patterns
6. Make recommendations specific to the user's goals and context
7. Highlight wins and progress (be encouraging!)
8. Identify top 2-3 improvement opportunities
9. Ensure all numbers are accurate and calculations are correct
10. Use evidence-based insights and explain the "why" behind patterns

OUTPUT FORMAT:
Return a valid JSON object following the exact structure of the template, with all calculated values filled in.
```

### Step 3: Example Usage

**Input to LLM:**

```
Generate a monthly CGM report for:

User: Sarah Chen (user_002)
Month: December 2025
Type: Type 1 Diabetes
Goal: Improve overnight glucose control

CGM Data (sample):
2025-12-01T00:00:00Z: 105 mg/dL
2025-12-01T00:05:00Z: 103 mg/dL
2025-12-01T00:10:00Z: 101 mg/dL
[...8640 readings total...]

Activity Logs:
2025-12-01 07:30 - Meal: Oatmeal with berries (45g carbs)
2025-12-01 08:15 - Exercise: 30 min yoga
2025-12-01 12:30 - Meal: Grilled chicken salad (20g carbs)
[...continues...]

Sleep Data:
2025-12-01: 6.5 hours
2025-12-02: 7.8 hours
[...30 days...]

Previous Month TIR: 72%
Goal: Achieve 80%+ TIR

Generate the report following the monthly-report-template.json structure.
```

### Step 4: Validation

After receiving the LLM output, validate:
- All percentages sum to 100% (for time in ranges)
- Weekly TIR values are realistic and show progression
- Recommendations are specific and actionable
- Numbers align with input data
- JSON is valid and complete

### Step 5: Integration

Once validated, the JSON can be:
1. Saved to your database
2. Used directly in the MonthlyCGMReport.tsx component
3. Displayed in the app for the user

## Key Metrics to Calculate

### Time in Range (TIR)
```
TIR = (readings between 70-180 mg/dL / total readings) * 100
```

### Average Glucose
```
Avg Glucose = sum(all glucose readings) / total readings
```

### Coefficient of Variation (CV)
```
CV = (standard deviation / mean glucose) * 100
Target: <36%
```

### Glucose Management Indicator (GMI)
```
GMI = 3.31 + (0.02392 × average glucose in mg/dL)
Estimate of HbA1c based on CGM data
```

## Pattern Detection Tips

### Morning Spikes (Dawn Phenomenon)
- Compare glucose at 3 AM vs 8 AM
- Look for consistent increases >20 mg/dL
- Check if exercise or medication timing affects it

### Post-Meal Spikes
- Measure peak glucose after meal
- Calculate time to peak
- Measure time to return to baseline
- Compare breakfast/lunch/dinner patterns

### Overnight Stability
- Calculate standard deviation from 11 PM - 6 AM
- Count hypoglycemia events (<70 mg/dL)
- Excellent: ±10-15 mg/dL variation

### Behavior Correlations
- Good sleep (>7h) → Better next-day TIR?
- Early meals → Lower post-meal spikes?
- Morning exercise → Better daily control?
- Stress → Afternoon glucose elevation?

## Recommendation Guidelines

**High Priority:**
- Patterns affecting >20% of days
- Safety concerns (hypoglycemia)
- Largest glucose excursions

**Medium Priority:**
- Opportunities for 10-20% improvement
- Behavior modifications with strong evidence
- Sleep and exercise optimization

**Low Priority:**
- Fine-tuning already good patterns
- Minor optimizations
- Advanced strategies

**Good Recommendation Structure:**
1. **Insight:** What the data shows
2. **Action:** Specific, actionable step
3. **Impact:** Quantified expected improvement
4. **Why:** Scientific basis

**Example:**
```json
{
  "category": "Morning Routine",
  "priority": "high",
  "insight": "Dawn phenomenon detected on 60% of days",
  "action": "Try light exercise (10-min walk) within 30 minutes of waking",
  "expectedImpact": "Could reduce morning spike by 15-20 mg/dL",
  "scientificBasis": "Morning physical activity improves insulin sensitivity"
}
```

## Advanced LLM Prompt (GPT-4, Claude, etc.)

```
You are an expert endocrinologist and data scientist specializing in CGM analysis. Analyze the following 30-day CGM dataset and generate a comprehensive monthly report.

Your analysis should:
1. Calculate standard CGM metrics (TIR, average glucose, CV, GMI)
2. Identify temporal patterns (time-of-day, day-of-week)
3. Detect anomalies and concerning trends
4. Correlate glucose patterns with logged behaviors
5. Generate evidence-based recommendations
6. Provide encouragement while highlighting improvement areas

Be quantitative, specific, and actionable. Every recommendation should have:
- Clear data-driven insight
- Specific action with timeline
- Estimated impact with reasoning
- Difficulty and time required

[Provide data and template as shown above]

Output the report as valid JSON matching the template structure exactly.
```

## Example Output Files

The LLM should generate JSON like:
- `/apps/frontend/src/data/reports/user_001_2025-11.json`
- `/apps/frontend/src/data/reports/user_001_2025-12.json`

These can then be loaded dynamically in the MonthlyCGMReport component.

## Tips for Best Results

1. **Data Quality:** Ensure >90% data completeness for accurate analysis
2. **Context Matters:** Include user goals, medications, and health conditions
3. **Comparison:** Always compare to previous month when available
4. **Specificity:** Ask for specific numeric recommendations
5. **Validation:** Always validate LLM calculations against raw data
6. **Personalization:** Include user demographics and lifestyle factors
7. **Encourage:** Balance criticism with recognition of progress

## Common LLM Mistakes to Watch For

- Hallucinating patterns not in the data
- Incorrect percentage calculations
- Generic recommendations not based on actual data
- Overly optimistic impact estimates
- Missing important safety concerns (hypoglycemia)
- Forgetting to compare to previous month

## Iterative Refinement

If the first output isn't good enough:

```
The report looks good, but please refine:
1. Make recommendations more specific (exact times, foods, durations)
2. Quantify the behavior correlations (e.g., "good sleep → 15% better TIR")
3. Add more detail to the stress correlation analysis
4. Ensure all weeklyTIR values are realistic and progressive
```

---

**Ready to generate your first report?** Feed your CGM data and the template to your favorite LLM!
