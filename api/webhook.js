import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  try {
    const body = req.body;

    const message = body.message?.text;
    const chatId = body.message?.chat?.id;
    const username = body.message?.from?.username || body.message?.from?.first_name;

    console.log("MESSAGE:", message);

    // skip kalau kosong atau command
    if (!message || message.startsWith("/")) {
      return res.status(200).send("OK");
    }

    // parsing
    const parts = message.trim().split(" ");
    const nominal = parts.pop();
    const pengeluaran = parts.join(" ");

    console.log("PARSED:", pengeluaran, nominal);

    if (isNaN(nominal)) {
      await sendMessage(chatId, "Format salah. Contoh: makan 10000");
      return res.status(200).send("OK");
    }

    console.log("MENULIS KE GOOGLE SHEETS...");
    console.log("SPREADSHEET_ID:", process.env.SPREADSHEET_ID);

    // 🔐 AUTH GOOGLE
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ⚠️ PASTIKAN NAMA SHEET BENAR
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Sheet1!A:D", // <-- ganti kalau nama sheet kamu beda
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            waktu,
            username,
            pengeluaran,
            Number(nominal)
          ]
        ]
      },
    });

    console.log("BERHASIL MENULIS");

    // kirim balasan ke telegram
    await sendMessage(chatId, `✅ Tersimpan: ${pengeluaran} - ${nominal}`);

    return res.status(200).send("OK");

  } catch (err) {
    console.error("ERROR DETAIL:", err);
    return res.status(200).send("ERROR: " + err.message);
  }
}

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
  });
}
