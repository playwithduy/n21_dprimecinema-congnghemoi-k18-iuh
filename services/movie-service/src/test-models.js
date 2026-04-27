const https = require("https");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    https.get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => data += chunk);
        res.on("end", () => {
            try {
                const json = JSON.parse(data);
                if (json.models) {
                    console.log("Available Models:");
                    json.models.forEach(m => console.log(`- ${m.name}`));
                } else {
                    console.log("Error response:", JSON.stringify(json, null, 2));
                }
            } catch (e) {
                console.error("Failed to parse JSON:", data);
            }
        });
    }).on("error", (err) => {
        console.error("HTTP Error:", err.message);
    });
}

listModels();

