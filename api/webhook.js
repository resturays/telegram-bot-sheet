export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  const body = req.body;
  const message = body.message?.text;
  const chatId = body.message?.chat?.id;

  if (!message || message.startsWith("/")) {
    return res.status(200).send("OK");
  }

  const parts = message.split(" ");
  const nominal = parts.pop();
  const pengeluaran = parts.join(" ");

  await fetch(`https://api.telegram.org/bot${process.env.8613120620:AAGHXv_ktZWIyquq5dqWeeWgzEUW0QC2Weo}/sendMessage`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      chat_id: chatId,
      text: `✅ ${pengeluaran} - ${nominal} tersimpan`
    })
  });

  return res.status(200).send("OK");
}
