const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = "drcheezy123";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return res.sendStatus(200);
  const from = msg.from;
  const text = msg.text?.body || "";

  try {
    const ai = await axios.post("https://api.anthropic.com/v1/messages", {
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: text }],
      system: `آپ Dr Cheezy restaurant کے AI assistant ہیں۔ 
Customer کے ساتھ اردو میں بات کریں۔
Menu: Cheezy Burger 350rs, Double Cheezy 500rs, Fries 150rs, Cold Drink 100rs.
آرڈر لیں، پتہ پوچھیں، اور confirm کریں۔
ہمیشہ friendly رہیں۔ 🧀`
    }, {
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      }
    });

    const reply = ai.data.content[0].text;

    await axios.post(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
      messaging_product: "whatsapp",
      to: from,
      text: { body: reply }
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

  } catch (e) {
    console.error(e.message);
  }

  res.sendStatus(200);
});

app.listen(3000, () => console.log("Dr Cheezy Bot running!"));
