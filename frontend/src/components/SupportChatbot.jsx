import { useState } from "react";

const FAQ = [
  { q: "check-in", a: "Khách s?n h? tr? check-in t? 14:00, check-out tru?c 12:00." },
  { q: "h?y", a: "B?n có th? h?y khi booking còn ? tr?ng thái HOLD ho?c CONFIRMED." },
  { q: "h? tr?", a: "Liên h? l? tân qua email support@rex.local ho?c hotline 0900 000 000." },
  { q: "d?a ch?", a: "Rex Sài Gòn, 141 Nguy?n Hu?, Qu?n 1, TP.HCM." },
  { q: "vip", a: "B?n có th? xem h?ng VIP và m?c gi?m ? m?c H? so khách hàng." }
];

function SupportChatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "Xin chào, mình có th? h? tr? v? check-in, h?y phòng, VIP và d?a ch?." }
  ]);

  const ask = () => {
    const normalized = input.toLowerCase().trim();
    if (!normalized) return;

    const matched = FAQ.find((item) => normalized.includes(item.q));
    const answer = matched
      ? matched.a
      : "Mình chua có câu tr? l?i này. B?n th? h?i v? check-in, h?y phòng, VIP ho?c d?a ch? nhé.";

    setMessages((prev) => [...prev, { role: "user", text: input }, { role: "bot", text: answer }]);
    setInput("");
  };

  return (
    <div className="chatbox">
      <h3>Tr? lý h? tr? nhanh</h3>
      <div className="chatlog">
        {messages.map((msg, idx) => (
          <p key={idx} className={`chatline ${msg.role === "bot" ? "bot" : "user"}`}>
            {msg.role === "bot" ? "Bot: " : "B?n: "}
            {msg.text}
          </p>
        ))}
      </div>
      <div className="chat-actions">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Nh?p câu h?i..."
        />
        <button type="button" onClick={ask}>
          G?i
        </button>
      </div>
    </div>
  );
}

export default SupportChatbot;
