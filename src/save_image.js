const fs = require("fs");

// already in CommonJS style
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function saveImage(base64, filename = "output.png") {
  const buffer = Buffer.from(base64, "base64");
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Image saved: ${filename}`);
}

app.get("/naruto", async (req, res) => {
  const imgBase64 = await getImageFromColab("A naruto with blue eyes");
  await saveImage(imgBase64, "naruto.png");
  res.json({ saved: "naruto.png" });
});
