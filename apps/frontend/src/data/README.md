# Monthly CGM Report Data Files

This directory contains templates and instructions for generating personalized monthly CGM reports using LLMs.

## Files

### 📄 `monthly-report-template.json`
**Purpose:** Complete JSON structure for a monthly CGM report with all required fields.

**Contains:**
- Report metadata (month, date range, user ID)
- Overall metrics (TIR, average glucose, variability)
- Weekly breakdown data
- Time in ranges distribution
- Daily glucose patterns
- Detected CGM patterns (spikes, dips, stability)
- Behavior correlations (sleep, meals, exercise, stress)
- AI-powered recommendations with priorities
- Progress highlights and improvement areas
- Month-over-month comparisons
- Action plans and next month goals

**Use this as:** The schema/structure to request from an LLM when generating new reports.

### 📘 `monthly-report-prompt.md`
**Purpose:** Complete guide for using LLMs to generate personalized monthly reports.

**Contains:**
- Step-by-step instructions
- LLM prompt templates
- Example usage
- Metrics calculation formulas
- Pattern detection tips
- Recommendation guidelines
- Validation checklist
- Common mistakes to avoid

**Use this as:** Your instruction manual for working with ChatGPT, Claude, or other LLMs.

## Quick Start

### Option 1: Generate Report with ChatGPT/Claude

1. **Prepare your data:**
   - Export 30 days of CGM readings
   - Gather activity logs (meals, exercise, sleep)
   - Note user goals and context

2. **Open your LLM of choice** (ChatGPT-4, Claude, etc.)

3. **Use this prompt:**
   ```
   I need you to generate a monthly CGM report. I'll provide:
   1. The JSON template structure you should follow
   2. The raw CGM data (8640 readings over 30 days)
   3. Activity logs and user context

   Please analyze the data and generate a comprehensive report
   following the exact JSON structure I provide.

   Here's the template structure:
   [Paste monthly-report-template.json]

   Here's the user data:
   [Paste your CGM data and activity logs]

   Generate the report with accurate calculations and insights.
   ```

4. **Copy the JSON output** and save it

5. **Load it in your app:**
   ```typescript
   import reportData from '@/data/reports/user_001_2025-12.json';
   ```

### Option 2: API Integration

If you want to automate this:

```typescript
// Example: Generate report via OpenAI API
async function generateMonthlyReport(userId: string, month: string) {
  const cgmData = await fetchCGMData(userId, month);
  const activityLogs = await fetchActivityLogs(userId, month);
  const template = await import('./monthly-report-template.json');

  const prompt = `
    Generate a monthly CGM report following this structure:
    ${JSON.stringify(template)}

    Based on this data:
    CGM Readings: ${JSON.stringify(cgmData)}
    Activity Logs: ${JSON.stringify(activityLogs)}

    Return only valid JSON matching the template structure.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a CGM data analyst." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  const report = JSON.parse(response.choices[0].message.content);
  return report;
}
```

## Report Generation Checklist

Before using LLM-generated reports, verify:

- [ ] All metrics calculated from real data (not hallucinated)
- [ ] Time in ranges sum to 100%
- [ ] Weekly progression is realistic
- [ ] Recommendations are specific and actionable
- [ ] JSON is valid and complete
- [ ] Numbers align with input data
- [ ] Safety concerns are highlighted (hypoglycemia)
- [ ] Behavior correlations are data-driven
- [ ] Comparison to previous month is accurate
- [ ] Action plan is personalized to user goals

## Directory Structure

```
src/data/
├── README.md (this file)
├── monthly-report-template.json (the schema)
├── monthly-report-prompt.md (LLM instructions)
└── reports/ (generated reports, gitignored)
    ├── user_001_2025-11.json
    ├── user_001_2025-12.json
    └── user_002_2025-11.json
```

## Tips for Best Results

1. **High-Quality Data:** Ensure >95% CGM data completeness
2. **Rich Context:** Include meals, exercise, sleep, stress logs
3. **User Goals:** Tell the LLM what the user wants to achieve
4. **Previous Month:** Always compare to previous month when available
5. **Iterate:** If first output isn't great, ask for refinements
6. **Validate:** Never trust LLM calculations blindly - spot check them

## Example LLM Conversations

### Example 1: Basic Report
```
User: Generate a monthly CGM report for December 2025
[Provides template and data]

LLM: [Returns JSON following template structure]

User: Great! Can you make the recommendations more specific?

LLM: [Returns refined JSON with detailed recommendations]
```

### Example 2: Focused Analysis
```
User: I see afternoon glucose dips. Focus your analysis on:
1. Why are they happening?
2. What behaviors correlate?
3. How can I prevent them?

[Provides template and data]

LLM: [Returns JSON with extra detail in afternoon pattern section]
```

## Integrating with the App

Once you have a generated report JSON:

```typescript
// Option 1: Import static report
import reportData from '@/data/reports/user_001_2025-12.json';

// Option 2: Fetch from API
const reportData = await fetch(`/api/reports/${userId}/${month}`).then(r => r.json());

// Option 3: Load from local storage
const reportData = JSON.parse(localStorage.getItem(`report_${userId}_${month}`));

// Then use it in MonthlyCGMReport component
<MonthlyCGMReport data={reportData} />
```

## Need Help?

- See `monthly-report-prompt.md` for detailed LLM instructions
- Check `monthly-report-template.json` for the complete structure
- Review the example report in `MonthlyCGMReport.tsx`

---

**Happy report generating!** 🎉📊
