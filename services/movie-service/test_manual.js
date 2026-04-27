const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function manualTest() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API key found in .env");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;
    console.log("Testing v1 API...");
    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: "Hi" }] }]
        }, { headers: { "Content-Type": "application/json" } });
        console.log("✅ v1 API works! Response:", JSON.stringify(response.data.candidates[0].content.parts[0].text));
    } catch (e) {
        console.log("❌ v1 API failed:", e.response ? e.response.status + " " + JSON.stringify(e.response.data) : e.message);
    }

    const urlBeta = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    console.log("Testing v1beta API...");
    try {
        const response = await axios.post(urlBeta, {
            contents: [{ parts: [{ text: "Hi" }] }]
        }, { headers: { "Content-Type": "application/json" } });
        console.log("✅ v1beta API works! Response:", JSON.stringify(response.data.candidates[0].content.parts[0].text));
    } catch (e) {
        console.log("❌ v1beta API failed:", e.response ? e.response.status + " " + JSON.stringify(e.response.data) : e.message);
    }
}

manualTest();
