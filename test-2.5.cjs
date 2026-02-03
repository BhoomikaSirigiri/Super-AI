const fs = require('fs');

async function testTwoPointFive() {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    const key = "AIzaSyDFzfbLpoL4-lSsnYf1HbLZhgSgUDsszh0";

    console.log("Testing with Gemini 2.5 Flash via official headers...");
    try {
        const response = await fetch(`${url}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": key
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hi" }] }]
            })
        });

        const status = response.status;
        const data = await response.json();

        console.log(`STATUS: ${status}`);
        if (status === 200) {
            console.log("✅ SUCCESS!");
        } else {
            console.log("❌ FAILED");
            console.log("Error Detail:", data.error?.message);
        }
    } catch (err) {
        console.error("❌ ERROR:", err.message);
    }
}

testTwoPointFive();
