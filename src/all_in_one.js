const express = require("express");
const fs = require("fs");
const axios = require("axios");

const app = express();

const GRADIO_URL = "https://f73d64555bfeecef86.gradio.live/gradio_api/call/predict";

async function getImageFromColab(prompt) {
  try {
    // Step 1: POST prompt to Gradio
    const response = await axios.post(
      GRADIO_URL,
      { data: [prompt] },
      { headers: { "Content-Type": "application/json" } }
    );

    const eventId = response.data?.event_id;
    if (!eventId) throw new Error("No event_id returned from Gradio");

    console.log("Event ID:", eventId);

    // Step 2: Poll event result endpoint
    const resultUrl = `${GRADIO_URL}/${eventId}`;
    const resultResponse = await axios.get(resultUrl);

    const resultText = resultResponse.data;

    // Gradio streams in "event: ... \n data: ... " format
    console.log("Raw result preview:", resultText.substring(0, 200) + "...");

    // Extract the line that starts with "data:"
    const dataLine = resultText
      .split("\n")
      .find(line => line.startsWith("data:"));

    if (!dataLine) {
      throw new Error("No data line found in Gradio response");
    }

    // Remove "data:" and parse as JSON
    const parsedData = JSON.parse(dataLine.replace("data: ", ""));
    const imgBase64 = parsedData[0]; // first item in array is the image

    console.log("Base64 preview:", imgBase64.substring(0, 100) + "...");

    if (!imgBase64) throw new Error("No image returned from Gradio");

    return imgBase64;
  } catch (err) {
    console.error("Gradio call failed:", err.message);
    throw err;
  }
}

async function saveImage(base64, filename = "output.png") {
  const buffer = Buffer.from(base64, "base64");
  fs.writeFileSync(filename, buffer);
  console.log(`Image saved: ${filename}`);
}

app.get("/naruto", async (req, res) => {
  try {
    const imgBase64 = await getImageFromColab("A naruto with blue eyes");
    await saveImage(imgBase64, "naruto.png");
    res.json({ saved: "naruto.png" });
  } catch (err) {
    res.status(500).json({ error: "Image generation failed" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
