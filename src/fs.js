const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Example usage
async function getImageFromColab(prompt) {
  const response = await fetch("https://xxxxx.gradio.live/api/predict/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [prompt] })
  });

  const result = await response.json();
  return result.data[0]; // base64 string
}
