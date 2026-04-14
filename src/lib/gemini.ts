import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function summarizeLabReport(fileData: string, mimeType: string, language: 'English' | 'Urdu' = 'English') {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are ReportGenie, a world-class medical report analyzer. 
Your goal is to translate complex clinical data into warm, empathetic, and easy-to-understand language for patients.

Follow these rules:
1. STRUCTURE: Provide a friendly interpretation, a risk level, and 3-4 smart recommendations.
2. RISK LEVEL: Must be one of: "Normal", "Mild Concern", "Critical".
3. RECOMMENDATIONS: Provide actionable, simple advice based on the findings.
4. JARGON: Explain medical terms simply.
5. TONE: Reassuring but professional.
6. LANGUAGE: Respond in ${language}.

Return the response in JSON format.`;

  const prompt = "Analyze this lab report and provide a detailed, friendly interpretation, risk level, and smart recommendations.";

  const result = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: fileData.split(',')[1]
            }
          }
        ]
      }
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          interpretation: { type: Type.STRING, description: "The friendly summary of the report" },
          riskLevel: { type: Type.STRING, enum: ["Normal", "Mild Concern", "Critical"], description: "The calculated risk level" },
          recommendations: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of 3-4 actionable recommendations"
          }
        },
        required: ["interpretation", "riskLevel", "recommendations"]
      }
    }
  });

  return JSON.parse(result.text);
}

export async function chatWithReport(reportSummary: string, userQuestion: string) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are ReportGenie. You have already summarized a lab report for the user. 
The summary was: "${reportSummary}"

The user is now asking a follow-up question. 
Answer their question based on the report context. 
Be helpful, empathetic, and always remind them to consult their doctor for medical decisions. 
Keep answers concise and patient-friendly.`;

  const result = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: userQuestion }] }],
    config: { systemInstruction }
  });

  return result.text;
}
