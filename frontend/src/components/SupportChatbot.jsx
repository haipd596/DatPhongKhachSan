import { useState } from "react";

const FAQ = [
  { q: "gio check-in", a: "Check-in tu 14:00, check-out truoc 12:00." },
  { q: "chinh sach huy", a: "Ban co the huy mien phi truoc ngay nhan phong 24 gio." },
  { q: "ho tro", a: "Lien he le tan qua email support@rex.local hoac so 0900000000." },
  { q: "dia chi", a: "Rex Sai Gon, 141 Nguyen Hue, Quan 1, TP.HCM." }
];

function SupportChatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "Xin chao, toi co the ho tro ve gio check-in, huy phong, dia chi." }
  ]);

  const ask = () => {
    const normalized = input.toLowerCase().trim();
    if (!normalized) return;
    const matched = FAQ.find((item) => normalized.includes(item.q));
    const answer = matched ? matched.a : "Minh chua co cau tra loi nay. Ban co the hoi ve check-in, huy phong, dia chi.";
    setMessages((prev) => [...prev, { role: "user", text: input }, { role: "bot", text: answer }]);
    setInput("");
  };

  return (
    <div className="chatbox">
      <h3>Chatbot ho tro</h3>
      <div className="chatlog">
        {messages.map((msg, idx) => (
          <p key={idx} className={msg.role === "bot" ? "bot" : "user"}>
            {msg.role === "bot" ? "Bot: " : "Ban: "}
            {msg.text}
          </p>
        ))}
      </div>
      <div className="chat-actions">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhap cau hoi..." />
        <button onClick={ask}>Gui</button>
      </div>
    </div>
  );
}

export default SupportChatbot;
