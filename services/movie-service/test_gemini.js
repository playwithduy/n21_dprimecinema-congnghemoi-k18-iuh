const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env" });

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using the internal client to list models (this is how it's done in newer SDK versions)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        
        if (data.models) {
            console.log("✅ Models available for this key:");
            data.models.forEach(m => {
                console.log(` - ${m.name} (Supports: ${m.supportedGenerationMethods.join(", ")})`);
            });
        } else {
            console.log("❌ No models found or error:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("General error:", err.message);
    }
}

listModels();
