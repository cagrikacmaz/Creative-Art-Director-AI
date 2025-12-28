import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WebsiteConfig, DesignManifesto } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDesignManifesto = async (config: WebsiteConfig): Promise<DesignManifesto> => {
  if (!process.env.API_KEY) {
    return {
      vision: "Error: API Key is missing. I cannot create without my tools.",
      htmlCode: "<!-- API Key missing -->"
    };
  }

  const lang = config.language || 'en';
  const isTr = lang === 'tr';

  const systemInstruction = `
    You are a world-class, award-winning Art Director & UX Visionary.
    You are sophisticated, professional, and possess a refined aesthetic sense.
    
    YOUR TASK:
    1.  **The Vision (Phase A):** vividly describe the design you have created in your mind based on the user's input.
        -   Use evocative language (e.g., "sleek interface", "glassmorphism", "negative space", "typography that breathes").
        -   Explain *why* you chose specific elements based on the 'Emotional Vibe'.
        -   Write this in the USER'S SELECTED LANGUAGE (${isTr ? 'Turkish' : 'English'}).
    
    2.  **The Artifact (Phase B):** Generate the complete, single-file HTML/CSS/JS code.
        -   **Design Rules:**
            -   Use high-quality Google Fonts (e.g., Poppins, Playfair Display, Inter, Montserrat).
            -   Use modern CSS (Flexbox, Grid, backdrop-filter, gradients, box-shadows).
            -   **Corporate:** Grid layout for Team/Founder cards.
            -   **Creative:** Masonry or artistic grid for gallery.
            -   **SaaS:** Clean pricing tables, bold CTA.
            -   Use https://picsum.photos/id/[number]/[width]/[height] for high-res placeholders.
            -   Ensure responsiveness.
            -   Place CSS in <style> and JS in <script>.

    INPUT DATA:
    - Project Name: ${config.name}
    - Category: ${config.category}
    - Color Palette: ${config.colorPalette}
    - Emotional Vibe: ${config.emotionalVibe}
    
    OUTPUT FORMAT:
    Return a JSON object with:
    - vision: The descriptive text of the design concept.
    - htmlCode: The raw HTML string.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      vision: {
        type: Type.STRING,
        description: "The vivid description of the design concept."
      },
      htmlCode: {
        type: Type.STRING,
        description: "The complete HTML/CSS/JS source code."
      }
    },
    required: ["vision", "htmlCode"]
  };

  try {
    const prompt = `Create a design manifesto for a ${config.category} website named "${config.name}". 
    The vibe is "${config.emotionalVibe}" and the palette is "${config.colorPalette}".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as DesignManifesto;

  } catch (error) {
    console.error("Error generating design:", error);
    return {
      vision: isTr 
        ? "Vizyonu oluştururken bir sorunla karşılaştım. Lütfen tekrar deneyelim." 
        : "I encountered a glitch while manifesting the vision. Let us try again.",
      htmlCode: "<!-- Error generating code -->"
    };
  }
};