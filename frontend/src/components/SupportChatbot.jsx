import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import client from "../api/client";

const API_KEY = "AIzaSyA3fgv2-JNVsw_evWGC8NHFsHiSiS8kA6U";

const SYSTEM_INSTRUCTION = `Bạn là lễ tân và chuyên gia Sales của RexHotel. Tên bạn là 'Trợ lý Rex'. Bạn xưng 'em' và gọi khách là 'anh/chị'.
Các việc bạn có thể làm:
1. THÔNG TIN KHÁCH SẠN: Giải đáp lưu loát giờ nhận phòng (14:00), trả phòng (12:00), địa chỉ (141 Nguyễn Huệ, Quận 1, TP.HCM), số điện thoại Hotline (0900 123 456), Email (support@rexhotel.local), và chính sách hủy phòng (có thể hủy miễn phí khi đơn ở thái HOLD hoặc CONFIRMED).
2. BÁO GIÁ & HẠNG PHÒNG: Bất cứ khi nào khách hỏi về giá cả, loại phòng, danh sách phòng hiện có, hãy lập tức dùng tool getRoomTypes để tra xuất bảng giá thời gian thực.
3. KIỂM TRA PHÒNG TRỐNG (KHO PHÒNG): Đây là nghiệp vụ quan trọng. Khi khách hỏi có còn phòng nào trống không (ví dụ: ngày mai tới mốt, tuần sau...), phải chủ động dùng tool checkRoomAvailability để tra cứu vào Database khách sạn lấy sức chứa khả dụng theo yyyy-MM-dd. Nếu khách chưa cho ngày, hãy khéo léo hỏi lại ngày dương lịch.
Cách trả lời: Cực kỳ tinh tế, như một tư vấn viên 5 sao thực thụ. Format số tiền rõ ràng, kèm 'VND'. Mời gọi khách hàng đăng nhập tài khoản để được giảm giá hạng thẻ Hội viên. Không được bịa đặt dữ liệu phòng, chỉ đọc kết quả của tool trả về.`;

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "getRoomTypes",
        description: "Lấy danh sách hạng phòng và bảng giá cơ bản của khách sạn. Tự động dùng khi khách hỏi giá."
      },
      {
        name: "checkRoomAvailability",
        description: "Kiểm tra phòng trống dùng cho các câu hỏi xem còn phòng tiêu chuẩn / vip nào trống không.",
        parameters: {
          type: "OBJECT",
          properties: {
            checkInDate: { type: "STRING", description: "Ngày nhận phòng (yyyy-MM-dd)" },
            checkOutDate: { type: "STRING", description: "Ngày trả phòng (yyyy-MM-dd)" }
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
    { role: "model", text: "Xin chào Quý khách! Em là Trợ lý AI thực tập của RexHotel. Em có thể tư vấn phòng, báo giá và kiểm tra phòng trống trên hệ thống ngay bây giờ ạ." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const chatSessionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: TOOLS
      });
      chatSessionRef.current = model.startChat({});
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    
    setInput("");
    setMessages(prev => [...prev, { role: "user", text }]);
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessage(text);
      const response = result.response;
      
      if (response.functionCalls && response.functionCalls().length > 0) {
        const call = response.functionCalls()[0];
        let apiData = null;
        
        try {
          if (call.name === "getRoomTypes") {
            const res = await client.get("/rooms/types");
            apiData = res.data;
          } else if (call.name === "checkRoomAvailability") {
            const { checkInDate, checkOutDate } = call.args;
            const res = await client.get(`/rooms/available-summary?checkIn=${checkInDate}&checkOut=${checkOutDate}`);
            apiData = res.data;
          }
        } catch (dbErr) {
          apiData = { error: "Lỗi kết nối cơ sở dữ liệu." };
        }

        const followUpResult = await chatSessionRef.current.sendMessage([{
          functionResponse: {
            name: call.name,
            response: apiData
          }
        }]);
        
        setMessages(prev => [...prev, { role: "model", text: followUpResult.response.text() }]);
      } else {
        setMessages(prev => [...prev, { role: "model", text: response.text() }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "model", text: "Dạ hệ thống AI đang quá tải, mong anh/chị thông cảm vài phút nữa chat lại với em nhé!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        className="chat-fab no-print" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9998,
          width: 60, height: 60, borderRadius: '50%', backgroundColor: 'var(--gold)',
          color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(212,175,55,0.5)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        title="Trợ lý AI RexHotel"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        ) : (
           <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zm-3-4H7v-2h10v2zm0-3H7V7h10v2z"/></svg>
        )}
      </button>

      {isOpen && (
        <div className="chatbox-floating glass-card no-print" style={{
          position: 'fixed', bottom: 100, right: 24, width: 380, height: 500, zIndex: 9999,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          borderRadius: 'var(--radius-lg)', boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          border: '1px solid var(--gold-light)', backgroundColor: '#fffffffd'
        }}>
          <div style={{ backgroundColor: 'var(--primary)', color: '#fff', padding: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 10 }}>
             <svg viewBox="0 0 24 24" width="24" height="24" fill="var(--gold)"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1H3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2z"/></svg>
             <div style={{display:'flex', flexDirection:'column'}}>
               <span style={{fontSize: '1.1rem'}}>RexHotel AI Sales</span>
               <span style={{fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--gold-light)'}}>Tư vấn 24/7 chuyên nghiệp</span>
             </div>
          </div>
          
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                backgroundColor: msg.role === 'user' ? 'var(--primary)' : '#f8fafc',
                border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                color: msg.role === 'user' ? '#fff' : 'var(--text-dark)',
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '20px 20px 20px 0', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '0.9rem', display: 'flex', gap: 4, alignItems: 'center' }}>
                <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span> Tra cứu hệ thống...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, background: '#fff' }}>
            <input 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Chat với lễ tân RexAI..."
               disabled={isTyping}
               style={{ flex: 1, padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: 24, outline: 'none', fontSize: '0.95rem' }}
            />
            <button 
               onClick={handleSend} 
               disabled={isTyping || !input.trim()}
               style={{ backgroundColor: isTyping || !input.trim() ? '#cbd5e1' : 'var(--primary)', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        #tong-quan + section .chatbox { display: none !important; }
        .dot { animation: blink 1.4s infinite both; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
      `}</style>
    </>
  );
}
