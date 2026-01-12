import { geminiModel } from "./gemini";
import { Issue } from "@/types";

export async function generateWardSummary(
  ward: string,
  issues: Issue[]
): Promise<string> {
  if (!ward || issues.length === 0) {
    return "No data available for this ward.";
  }

  const reported = issues.filter(i => i.status === "reported").length;
  const resolved = issues.filter(i => i.status === "resolved").length;

  const prompt = `
You are summarizing civic issues for citizens.

Ward: ${ward}
Total issues: ${issues.length}
Reported: ${reported}
Resolved: ${resolved}

Give a friendly 2–3 line summary. Mention performance and improvement areas.
Use a positive, civic tone.
`;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}
