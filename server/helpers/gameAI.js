const { GoogleGenAI } = require('@google/genai')

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const aiMove = async (playerHistory = []) => {
  try {
    const prompt = `
Kamu adalah lawan dalam game Gunting Batu Kertas.
Riwayat pilihan pemain: ${JSON.stringify(playerHistory)}.
Analisis polanya dan pilih gerakan terbaik untuk menang.
Balas HANYA dengan JSON (tanpa markdown):
{"move": "rock", "hint": "alasan singkat pilihanmu"}
Pilihan valid: "rock", "paper", "scissors".
    `.trim()

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    const text = response.text.trim()
    return JSON.parse(text)
  } catch (err) {
    const choices = ['rock', 'paper', 'scissors']
    return { move: choices[Math.floor(Math.random() * 3)], hint: 'Aku sudah memilih!' }
  }
}

module.exports = aiMove