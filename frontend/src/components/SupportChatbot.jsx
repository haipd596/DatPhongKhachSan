import { useEffect, useRef, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import client from "../api/client";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_INSTRUCTION = `Bạn là lễ tân và chuyên viên tư vấn của RexHotel.
Bạn xưng "em", gọi khách là "anh/chị", trả lời ngắn gọn, lịch sự và không bịa dữ liệu phòng.
Khi khách hỏi về loại phòng hoặc giá, dùng công cụ getRoomTypes.
Khi khách hỏi phòng trống theo ngày, dùng công cụ checkRoomAvailability với định dạng yyyy-MM-dd.
Thông tin khách sạn: nhận phòng 14:00, trả phòng 12:00, địa chỉ 141 Nguyễn Huệ, Quận 1, TP.HCM, hotline 0900 123 456.`;

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "getRoomTypes",
        description: "Lấy danh sách loại phòng và bảng giá cơ bản của khách sạn."
      },
      {
        name: "checkRoomAvailability",
        description: "Kiểm tra số lượng phòng trống theo ngày nhận và ngày trả phòng.",
        parameters: {
          type: "OBJECT",
          properties: {
            checkInDate: { type: "STRING", description: "Ngày nhận phòng, định dạng yyyy-MM-dd" },
            checkOutDate: { type: "STRING", description: "Ngày trả phòng, định dạng yyyy-MM-dd" }
          },
          required: ["checkInDate", "checkOutDate"]
        }
      }
    ]
  }
];

export default function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Xin chào anh/chị. Em là trợ lý RexHotel, có thể hỗ trợ tra cứu loại phòng, giá phòng và tình trạng phòng trống."
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!API_KEY || chatSessionRef.current) return;
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: TOOLS
    });
    chatSessionRef.current = model.startChat({});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addModelMessage = (text) => {
    setMessages((prev) => [...prev, { role: "model", text }]);
  };

  const handleFunctionCall = async (call) => {
    if (call.name === "getRoomTypes") {
      const res = await client.get("/rooms/types");
      return res.data;
    }
    if (call.name === "checkRoomAvailability") {
      const { checkInDate, checkOutDate } = call.args;
      const res = await client.get(`/rooms/available-summary?checkIn=${checkInDate}&checkOut=${checkOutDate}`);
      return res.data;
    }
    return { error: "Công cụ không được hỗ trợ." };
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setIsTyping(true);

    try {
      if (!chatSessionRef.current) {
        addModelMessage("Chức năng AI chưa được cấu hình. Vui lòng thiết lập biến môi trường VITE_GEMINI_API_KEY để bật trợ lý tự động.");
        return;
      }

      const result = await chatSessionRef.current.sendMessage(text);
      const response = result.response;
      const calls = response.functionCalls?.() || [];

      if (calls.length > 0) {
        const call = calls[0];
        const apiData = await handleFunctionCall(call).catch(() => ({ error: "Không kết nối được dữ liệu khách sạn." }));
        const followUpResult = await chatSessionRef.current.sendMessage([
          {
            functionResponse: {
              name: call.name,
              response: apiData
            }
          }
        ]);
        addModelMessage(followUpResult.response.text());
      } else {
        addModelMessage(response.text());
      }
    } catch (err) {
      addModelMessage("Hệ thống trợ lý đang bận. Anh/chị vui lòng thử lại sau ít phút.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        className="chat-fab no-print"
        onClick={() => setIsOpen(!isOpen)}
        title="Trợ lý RexHotel"
      >
        {isOpen ? "Đóng" : "Hỗ trợ"}
      </button>

      {isOpen && (
        <div className="chatbox-floating no-print">
          <div className="chatbox-head">
            <strong>Trợ lý RexHotel</strong>
            <span>Tư vấn phòng và chính sách</span>
          </div>

          <div className="chatbox-body">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role === "user" ? "chat-user" : "chat-model"}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && <div className="chat-message chat-model">Đang tra cứu...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbox-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập câu hỏi..."
              disabled={isTyping}
            />
            <button className="btn btn-sm" onClick={handleSend} disabled={isTyping || !input.trim()}>
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
