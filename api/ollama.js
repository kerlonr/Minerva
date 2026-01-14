export default async function handler(req, res) {
  try {
    const ollamaUrl = "https://llama.kerlonr.com.br";

    // pega o caminho depois de /api/ollama
    const path = req.url.replace("/api/ollama", "");

    const response = await fetch(`${ollamaUrl}${path}`, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: req.method === "GET" ? undefined : JSON.stringify(req.body),
    });

    const text = await response.text();

    res.status(response.status).send(text);
  } catch (err) {
    console.error("Erro proxy Ollama:", err);
    res.status(500).json({ error: "Falha ao conectar ao Ollama" });
  }
}
