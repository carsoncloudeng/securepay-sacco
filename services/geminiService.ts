
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSecurityInsight = async (transactionData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Senior Sacco Fraud Forensic AI. Your mission is to protect member savings. Analyze this flagged member transaction for sophisticated fraud patterns: ${JSON.stringify(transactionData)}. 
      
      Provide your response in a clear, professional structured format with the following headers:
      - **THREAT ANALYSIS**: Detailed technical explanation of suspicious indicators relative to SACCO transaction behaviors.
      - **RISK VECTOR**: Categorize the type of fraud (e.g., Member Account Takeover, Loan Disbursement Fraud, Synthetic Identity).
      - **RECOVERY STEPS**: Provide 3 specific, actionable steps for the treasury or security team to protect the member's funds.
      - **TRUST SCORE**: A numerical confidence rating for this analysis (0-100%).
      
      Maintain an authoritative, secure, and member-centric security tone.`,
      config: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    return "### SYSTEM ALERT: AI Forensic Module Offline\nForensic investigation could not be completed via AI. Please manually review the SACCO transaction logs for anomalous velocity or location mismatches to ensure member safety.";
  }
};
