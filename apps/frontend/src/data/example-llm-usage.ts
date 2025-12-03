/**
 * Example: How to generate monthly CGM reports using an LLM API
 *
 * This shows how to programmatically generate reports using:
 * - OpenAI API (GPT-4)
 * - Anthropic API (Claude)
 * - Local LLM
 */

import template from './monthly-report-template.json';

// ====================
// Example 1: OpenAI API (GPT-4)
// ====================

interface CGMReading {
  timestamp: string;
  glucose: number;
}

interface ActivityLog {
  timestamp: string;
  type: 'meal' | 'exercise' | 'sleep' | 'stress';
  description: string;
  details?: any;
}

async function generateReportWithOpenAI(
  userId: string,
  month: string,
  cgmData: CGMReading[],
  activityLogs: ActivityLog[]
): Promise<typeof template> {
  const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;

  const prompt = `
You are an expert CGM data analyst. Generate a comprehensive monthly report.

USER CONTEXT:
- User ID: ${userId}
- Month: ${month}
- Total CGM readings: ${cgmData.length}

CGM DATA (sample of first 100 readings):
${JSON.stringify(cgmData.slice(0, 100), null, 2)}
... and ${cgmData.length - 100} more readings

ACTIVITY LOGS:
${JSON.stringify(activityLogs, null, 2)}

REQUIRED OUTPUT STRUCTURE:
${JSON.stringify(template, null, 2)}

INSTRUCTIONS:
1. Calculate all metrics accurately from the CGM data
2. Identify patterns by analyzing time-of-day trends
3. Correlate glucose patterns with activity logs
4. Generate 6 prioritized recommendations
5. Highlight wins and progress
6. Return ONLY valid JSON matching the template structure

Calculate:
- Time in Range (70-180 mg/dL)
- Average glucose
- Coefficient of Variation (CV)
- Weekly progression
- Pattern detection (morning spikes, post-meal, overnight, afternoon dips)

Return the complete JSON object.
  `.trim();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a CGM data analyst. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 4000
    })
  });

  const data = await response.json();
  const report = JSON.parse(data.choices[0].message.content);

  return report;
}

// ====================
// Example 2: Anthropic API (Claude)
// ====================

async function generateReportWithClaude(
  userId: string,
  month: string,
  cgmData: CGMReading[],
  activityLogs: ActivityLog[]
): Promise<typeof template> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  const prompt = `Generate a monthly CGM report following this exact JSON structure:

${JSON.stringify(template, null, 2)}

Based on this data:
- User: ${userId}
- Month: ${month}
- CGM Readings: ${cgmData.length} total
- Activity Logs: ${activityLogs.length} events

CGM Data (first 100 readings):
${JSON.stringify(cgmData.slice(0, 100), null, 2)}

Activity Logs:
${JSON.stringify(activityLogs, null, 2)}

Requirements:
1. Calculate all metrics from the actual data
2. Detect patterns (morning spikes, post-meal, overnight, dips)
3. Correlate behaviors with glucose patterns
4. Generate 6 prioritized recommendations
5. Return ONLY valid JSON matching the template

Be precise, evidence-based, and actionable.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  const data = await response.json();
  const reportText = data.content[0].text;

  // Extract JSON from potential markdown code blocks
  const jsonMatch = reportText.match(/```json\n([\s\S]*?)\n```/) ||
                    reportText.match(/\{[\s\S]*\}/);

  const report = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : reportText);

  return report;
}

// ====================
// Example 3: Helper Functions
// ====================

/**
 * Calculate Time in Range from raw CGM data
 */
function calculateTIR(readings: CGMReading[], min = 70, max = 180): number {
  const inRange = readings.filter(r => r.glucose >= min && r.glucose <= max);
  return (inRange.length / readings.length) * 100;
}

/**
 * Calculate average glucose
 */
function calculateAvgGlucose(readings: CGMReading[]): number {
  const sum = readings.reduce((acc, r) => acc + r.glucose, 0);
  return sum / readings.length;
}

/**
 * Calculate Coefficient of Variation (CV)
 */
function calculateCV(readings: CGMReading[]): number {
  const mean = calculateAvgGlucose(readings);
  const variance = readings.reduce((acc, r) =>
    acc + Math.pow(r.glucose - mean, 2), 0) / readings.length;
  const stdDev = Math.sqrt(variance);
  return (stdDev / mean) * 100;
}

/**
 * Group readings by week
 */
function groupByWeek(readings: CGMReading[]): CGMReading[][] {
  const weeks: CGMReading[][] = [[], [], [], []];

  readings.forEach((reading, index) => {
    const weekIndex = Math.floor((index / readings.length) * 4);
    weeks[Math.min(weekIndex, 3)].push(reading);
  });

  return weeks;
}

/**
 * Pre-calculate metrics to help LLM
 */
function precalculateMetrics(cgmData: CGMReading[]) {
  const weeks = groupByWeek(cgmData);

  return {
    overall: {
      tir: calculateTIR(cgmData),
      avgGlucose: calculateAvgGlucose(cgmData),
      cv: calculateCV(cgmData),
      totalReadings: cgmData.length
    },
    weekly: weeks.map((weekData, i) => ({
      week: i + 1,
      tir: calculateTIR(weekData),
      avgGlucose: calculateAvgGlucose(weekData),
      readings: weekData.length
    })),
    timeInRanges: {
      veryLow: calculateTIR(cgmData, 0, 54),
      low: calculateTIR(cgmData, 54, 70),
      target: calculateTIR(cgmData, 70, 180),
      high: calculateTIR(cgmData, 180, 250),
      veryHigh: calculateTIR(cgmData, 250, 500)
    }
  };
}

// ====================
// Example 4: Full Workflow
// ====================

async function generateMonthlyReport(
  userId: string,
  month: string,
  provider: 'openai' | 'claude' = 'openai'
) {
  try {
    // 1. Fetch user's CGM data
    const cgmData = await fetchCGMDataFromDB(userId, month);

    // 2. Fetch activity logs
    const activityLogs = await fetchActivityLogsFromDB(userId, month);

    // 3. Pre-calculate some metrics to help the LLM
    const metrics = precalculateMetrics(cgmData);
    console.log('Pre-calculated metrics:', metrics);

    // 4. Generate report using LLM
    let report;
    if (provider === 'openai') {
      report = await generateReportWithOpenAI(userId, month, cgmData, activityLogs);
    } else {
      report = await generateReportWithClaude(userId, month, cgmData, activityLogs);
    }

    // 5. Validate the report
    const isValid = validateReport(report);
    if (!isValid) {
      throw new Error('Generated report failed validation');
    }

    // 6. Save to database
    await saveReportToDB(userId, month, report);

    // 7. Return the report
    return report;

  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

// ====================
// Helper: Validation
// ====================

function validateReport(report: any): boolean {
  // Check required fields
  if (!report.reportMetadata || !report.overallMetrics) {
    return false;
  }

  // Check time in ranges sum to 100
  const ranges = report.timeInRanges;
  const sum = ranges.veryLow.percentage +
              ranges.low.percentage +
              ranges.target.percentage +
              ranges.high.percentage +
              ranges.veryHigh.percentage;

  if (Math.abs(sum - 100) > 0.5) {
    console.warn('Time in ranges do not sum to 100%:', sum);
    return false;
  }

  // Check weekly TIR is realistic
  const weeklyTIRs = report.weeklyTIR.map((w: any) => w.tir);
  if (weeklyTIRs.some((tir: number) => tir < 0 || tir > 100)) {
    console.warn('Invalid weekly TIR values');
    return false;
  }

  // Check recommendations exist
  if (!report.recommendations || report.recommendations.length < 4) {
    console.warn('Not enough recommendations');
    return false;
  }

  return true;
}

// ====================
// Placeholder DB functions
// ====================

async function fetchCGMDataFromDB(userId: string, month: string): Promise<CGMReading[]> {
  // TODO: Implement actual database fetch
  // This should return ~8640 readings (30 days * 288 readings/day)
  return [];
}

async function fetchActivityLogsFromDB(userId: string, month: string): Promise<ActivityLog[]> {
  // TODO: Implement actual database fetch
  return [];
}

async function saveReportToDB(userId: string, month: string, report: any): Promise<void> {
  // TODO: Implement actual database save
  console.log('Saving report to DB:', { userId, month });
}

// ====================
// Example Usage
// ====================

export async function example() {
  // Generate a report for user_001 for December 2025 using OpenAI
  const report = await generateMonthlyReport('user_001', '2025-12', 'openai');

  console.log('Generated report:', report);
  console.log('TIR:', report.overallMetrics.avgTIR + '%');
  console.log('Avg Glucose:', report.overallMetrics.avgGlucose, 'mg/dL');
  console.log('Recommendations:', report.recommendations.length);

  return report;
}

// Export functions for use in app
export {
  generateReportWithOpenAI,
  generateReportWithClaude,
  generateMonthlyReport,
  precalculateMetrics,
  validateReport,
  calculateTIR,
  calculateAvgGlucose,
  calculateCV
};
