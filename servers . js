const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const PAGE_ACCESS_TOKEN = "YAHAN_APNA_PAGE_TOKEN_LIKHO";
const VERIFY_TOKEN = "mera_secret_token_123";
const ANTHROPIC_KEY = "YAHAN_CLAUDE_KEY_LIKHO";

app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object !== "page") return res.sendStatus(404);
  for (const entry of body.entry) {
    for (const event of entry.messaging) {
      if (event.message && !event.message.is_echo) {
        const reply = await getAIReply(event.message.text);
        await sendMessage(event.sender.id, reply);
      }
    }
  }
  res.status(200).send("OK");
});

async function getAIReply(msg) {
  try {
    const res = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: "Tu ek Facebook Marketplace seller ka assistant hai. Customer ke sawalon ka jawab Roman Urdu mein do. 2-3 lines, friendly. Shukriya 🙏 se khatam karo.",
        messages: [{ role: "user", content: msg }]
      },
      { headers: { "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "Content-Type": "application/json" } }
    );
    return res.data.content[0].text;
  } catch (e) {
    return "Shukriya! Hum jald jawab denge 🙏";
  }
}

async function sendMessage(id, text) {
  await axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    { recipient: { id }, message: { text } }
  );
}

app.listen(3000, () => console.log("Bot chal raha hai!"));
