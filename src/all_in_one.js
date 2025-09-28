// server.js
const express = require("express");
const fs = require("fs");
const  Client = require("@gradio/client");


const client = await Client.connect("https://b4be911692e073c7c5.gradio.live/");
const result = await client.predict("/predict", {
    prompt: "Hello!!"
});

console.log(result.data);


const app = express();

async function getImageFromColab(prompt) {

    const client = await Client.connect("https://b4be911692e073c7c5.gradio.live/");
    const result = await client.predict("/predict", {
        prompt: prompt
    });
    return result.data[0]

}

async function saveImage(base64, filename = "output.png") {
    const buffer = Buffer.from(base64, "base64");
    fs.writeFileSync(filename, buffer);
    console.log(`✅ Image saved: ${filename}`);
}

app.get("/naruto", async (req, res) => {
    try {
        const imgBase64 = await getImageFromColab("A naruto with blue eyes");
        await saveImage(imgBase64, "naruto.png");
        res.json({ saved: "naruto.png" });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Image generation failed" });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
