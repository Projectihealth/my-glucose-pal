import type { ParsedVoiceInput } from "@/components/VoiceInput";

// Configuration for OpenAI API (optional - falls back to rule-based parsing)
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const USE_AI_PARSING = Boolean(OPENAI_API_KEY);

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Parse voice transcript using AI (OpenAI GPT) if API key is available,
 * otherwise fall back to rule-based parsing
 * Can return multiple activities if detected in the transcript
 */
export const parseVoiceTranscript = async (
  transcript: string
): Promise<ParsedVoiceInput[]> => {
  if (!transcript.trim()) return [];

  // Use AI parsing if API key is configured
  if (USE_AI_PARSING) {
    try {
      return await parseWithOpenAI(transcript);
    } catch (error) {
      console.warn("AI parsing failed, falling back to rule-based parsing:", error);
      return parseWithRules(transcript);
    }
  }

  // Otherwise use rule-based parsing
  return parseWithRules(transcript);
};

/**
 * AI-powered parsing using OpenAI GPT
 * Can detect and split multiple activities from a single transcript
 */
const parseWithOpenAI = async (transcript: string): Promise<ParsedVoiceInput[]> => {
  const systemPrompt = `You are a helpful assistant that parses voice transcripts from people with diabetes logging their activities.

IMPORTANT: The user may describe MULTIPLE activities in one sentence. You must detect and separate them into individual log entries.

Extract structured data and return a JSON ARRAY of objects with these fields:
- title: A concise title for the activity (string)
- category: One of: "food", "lifestyle", "medication", "sleep", "stress"
- note: Optional additional notes (string or null)
- medicationName: Only for medication category (string or null)
- dose: Only for medication category (string or null)

Examples:

Input: "I went on a walk this morning and I ate six pork dumplings for lunch"
Output: [
  {"title": "Morning walk", "category": "lifestyle", "note": null, "medicationName": null, "dose": null},
  {"title": "Lunch: 6 pork dumplings", "category": "food", "note": null, "medicationName": null, "dose": null}
]

Input: "I just ate a chicken salad with some vegetables and olive oil dressing"
Output: [{"title": "Chicken salad", "category": "food", "note": "With vegetables and olive oil dressing", "medicationName": null, "dose": null}]

Input: "Took 6 units of humalog before dinner then went for a short walk"
Output: [
  {"title": "Humalog", "category": "medication", "note": "Before dinner", "medicationName": "Humalog", "dose": "6 units"},
  {"title": "Short walk", "category": "lifestyle", "note": "After dinner", "medicationName": null, "dose": null}
]

Input: "Had breakfast with oatmeal and berries, took my metformin, then did 20 minutes of yoga"
Output: [
  {"title": "Breakfast: Oatmeal and berries", "category": "food", "note": null, "medicationName": null, "dose": null},
  {"title": "Metformin", "category": "medication", "note": null, "medicationName": "Metformin", "dose": null},
  {"title": "20 minutes of yoga", "category": "lifestyle", "note": null, "medicationName": null, "dose": null}
]

Return ONLY a valid JSON array, no additional text.`;

  const messages: OpenAIMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: transcript },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Fast and cost-effective
      messages,
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = (await response.json()) as OpenAIResponse;
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response from OpenAI");
  }

  // Parse the JSON response - should be an array
  const parsed = JSON.parse(content) as ParsedVoiceInput | ParsedVoiceInput[];

  // Ensure we always return an array
  return Array.isArray(parsed) ? parsed : [parsed];
};

/**
 * Rule-based parsing as fallback or when AI is not configured
 * Detects and splits multiple activities from a single transcript
 */
const parseWithRules = (transcript: string): ParsedVoiceInput[] => {
  const text = transcript.toLowerCase().trim();
  const activities: ParsedVoiceInput[] = [];

  // Split by common conjunctions that indicate multiple activities
  const segments = splitIntoSegments(text, transcript);

  // Parse each segment separately
  for (const segment of segments) {
    const parsed = parseSegment(segment.text, segment.original);
    if (parsed) {
      activities.push(parsed);
    }
  }

  return activities.length > 0 ? activities : [];
};

/**
 * Split transcript into activity segments
 */
const splitIntoSegments = (
  text: string,
  original: string
): Array<{ text: string; original: string }> => {
  const segments: Array<{ text: string; original: string }> = [];

  // Common separators for multiple activities
  const separators = [
    / and then /gi,
    / and i /gi,
    / then /gi,
    /\. /g,
  ];

  let remainingText = text;
  let remainingOriginal = original;
  let lastIndex = 0;

  // Try to split by separators
  for (const separator of separators) {
    const matches = Array.from(text.matchAll(separator));

    if (matches.length > 0) {
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const startIdx = match.index!;
        const endIdx = startIdx + match[0].length;

        if (startIdx > lastIndex) {
          const segmentText = text.slice(lastIndex, startIdx).trim();
          const segmentOriginal = original.slice(lastIndex, startIdx).trim();

          if (segmentText) {
            segments.push({ text: segmentText, original: segmentOriginal });
          }
        }

        lastIndex = endIdx;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        const segmentText = text.slice(lastIndex).trim();
        const segmentOriginal = original.slice(lastIndex).trim();
        if (segmentText) {
          segments.push({ text: segmentText, original: segmentOriginal });
        }
      }

      // If we found segments, return them
      if (segments.length > 1) {
        return segments;
      }

      // Reset for next separator
      segments.length = 0;
      lastIndex = 0;
    }
  }

  // No splits found, return as single segment
  return [{ text, original }];
};

/**
 * Parse a single segment/activity
 */
const parseSegment = (text: string, original: string): ParsedVoiceInput | null => {
  let category: ParsedVoiceInput["category"] = "food";
  let title = original.trim();
  let note = "";
  let medicationName = "";
  let dose = "";

  // Detect category from keywords
  if (
    text.includes("walk") ||
    text.includes("exercise") ||
    text.includes("run") ||
    text.includes("jog") ||
    text.includes("gym") ||
    text.includes("workout") ||
    text.includes("yoga") ||
    text.includes("bike") ||
    text.includes("swim") ||
    text.includes("dance") ||
    text.includes("hike") ||
    text.includes("sport")
  ) {
    category = "lifestyle";
  } else if (
    text.includes("insulin") ||
    text.includes("medication") ||
    text.includes("pill") ||
    text.includes("medicine") ||
    text.includes("dose") ||
    text.includes("metformin") ||
    text.includes("humalog") ||
    text.includes("lantus") ||
    text.includes("novolog") ||
    text.includes("ozempic") ||
    text.includes("jardiance") ||
    text.includes("glipizide") ||
    text.includes("took") ||
    text.includes("injected")
  ) {
    category = "medication";

    // Extract medication name
    const medicationKeywords = [
      "insulin",
      "metformin",
      "humalog",
      "lantus",
      "novolog",
      "ozempic",
      "jardiance",
      "glipizide",
      "basaglar",
      "toujeo",
      "tresiba",
      "levemir",
    ];

    for (const med of medicationKeywords) {
      if (text.includes(med)) {
        medicationName = med.charAt(0).toUpperCase() + med.slice(1);
        break;
      }
    }

    // Extract dose
    const dosePatterns = [
      /(\d+(?:\.\d+)?)\s*(unit|units)/i,
      /(\d+(?:\.\d+)?)\s*(mg|milligram|milligrams)/i,
      /(\d+(?:\.\d+)?)\s*(mcg|microgram|micrograms)/i,
      /(\d+(?:\.\d+)?)\s*u(?:\s|$)/i, // "u" for units
    ];

    for (const pattern of dosePatterns) {
      const match = text.match(pattern);
      if (match) {
        dose = `${match[1]} ${match[2] || "units"}`;
        break;
      }
    }
  } else if (
    text.includes("sleep") ||
    text.includes("slept") ||
    text.includes("nap") ||
    text.includes("rest") ||
    text.includes("bed")
  ) {
    category = "sleep";
  } else if (
    text.includes("stress") ||
    text.includes("anxious") ||
    text.includes("anxiety") ||
    text.includes("worried") ||
    text.includes("nervous") ||
    text.includes("overwhelm") ||
    text.includes("panic")
  ) {
    category = "stress";
  }

  // Extract title and notes
  const sentences = original.split(/[.!?]+/).filter((s) => s.trim());

  if (sentences.length > 0) {
    title = sentences[0].trim();

    // For medication, create a more descriptive title
    if (category === "medication" && medicationName) {
      title = medicationName;
      if (dose) title += ` - ${dose}`;
    }

    // Add remaining sentences as notes
    if (sentences.length > 1) {
      note = sentences.slice(1).join(". ").trim();
    }
  }

  // Capitalize first letter of title
  if (title) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // Extract food items for food category with meal context
  if (category === "food") {
    const mealTimes = ["breakfast", "lunch", "dinner", "snack"];
    let mealContext = "";

    for (const meal of mealTimes) {
      if (text.includes(meal)) {
        mealContext = meal.charAt(0).toUpperCase() + meal.slice(1);
        break;
      }
    }

    const foodKeywords = [
      "ate",
      "had",
      "eating",
      "eat",
    ];

    let foundFood = false;
    for (const keyword of foodKeywords) {
      if (text.includes(keyword)) {
        foundFood = true;
        // Extract what comes after the keyword
        const parts = text.split(keyword);
        if (parts.length > 1) {
          let foodPart = parts[1].trim().split(/[.!?,]/)[0];

          // Remove "for breakfast/lunch/dinner" from the food part
          for (const meal of mealTimes) {
            foodPart = foodPart.replace(new RegExp(`for ${meal}`, 'gi'), '').trim();
          }

          if (foodPart) {
            // Format: "Lunch: Pork dumplings" or just "Pork dumplings"
            if (mealContext) {
              title = `${mealContext}: ${foodPart.charAt(0).toUpperCase() + foodPart.slice(1)}`;
            } else {
              title = foodPart.charAt(0).toUpperCase() + foodPart.slice(1);
            }
          }
        }
        break;
      }
    }

    // If no food keyword found but has meal context, use that
    if (!foundFood && mealContext && sentences.length > 0) {
      title = `${mealContext}: ${sentences[0].trim().charAt(0).toUpperCase() + sentences[0].trim().slice(1)}`;
    } else if (!foundFood && sentences.length > 0) {
      title = sentences[0].trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }
  }

  // For lifestyle, extract time/duration if mentioned
  if (category === "lifestyle") {
    const timeMatch = text.match(/(\d+)\s*(minute|minutes|min|hour|hours|hr)/i);
    if (timeMatch && !title.toLowerCase().includes(timeMatch[0].toLowerCase())) {
      title = `${timeMatch[0]} ${title}`;
    }

    // Add time of day context
    if (text.includes("morning") && !title.toLowerCase().includes("morning")) {
      title = `Morning ${title.toLowerCase()}`;
    } else if (text.includes("evening") && !title.toLowerCase().includes("evening")) {
      title = `Evening ${title.toLowerCase()}`;
    } else if (text.includes("afternoon") && !title.toLowerCase().includes("afternoon")) {
      title = `Afternoon ${title.toLowerCase()}`;
    }

    // Capitalize properly
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return {
    title,
    category,
    note: note || undefined,
    medicationName: medicationName || undefined,
    dose: dose || undefined,
  };
};
