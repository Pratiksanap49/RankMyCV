import axios from "axios";

export async function rankCVWithGroq(jobDescription, cvText, requiredKeywords = []) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("Missing GROQ_API_KEY");
    }

    const prompt = `
You are an expert recruiter AI.

We will rank CVs using this formula:
CV Score = (0.6 * SemanticSimilarity) + (0.4 * KeywordMatchScore)

- SemanticSimilarity (0–100): How well the CV semantically matches the job description.
- KeywordMatchScore (0–100): Percentage of required keywords found in the CV.
- Final CV Score must follow the formula above.

Instructions:
1. Calculate SemanticSimilarity (0–100).
2. Check which required keywords are present in the CV and which are missing.
3. Compute KeywordMatchScore = (matchedKeywords / totalKeywords) * 100.
4. Apply the formula to get final CV Score.
5. **Return only valid JSON, with no explanation.**

Format:
{
  "semanticScore": number,
  "keywordScore": number,
  "finalScore": number,
  "reason": "short explanation",
  "matchedKeywords": ["list"],
  "missingKeywords": ["list"]
}

Job Description:
${jobDescription}

Required Keywords:
${requiredKeywords.join(", ")}

Candidate Resume:
${cvText}
`;

    const body = {
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: "You are an expert CV analyzer. Always return raw JSON, no extra text." },
            { role: "user", content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.2
    };

    const headers = {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
    };

    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            body,
            { headers }
        );

        const content = response.data.choices[0].message.content.trim();

        // Try to parse JSON safely
        try {
            return JSON.parse(content);
        } catch (err) {
            // Fallback: extract JSON part if extra text exists
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No valid JSON in response");
            return JSON.parse(jsonMatch[0]);
        }
    } catch (err) {
        console.error("❌ Groq API error:", err.response?.data || err.message);
        throw new Error("Groq API failed");
    }
}
