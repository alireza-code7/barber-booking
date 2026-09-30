import { useState, useEffect, useRef } from "react";
import { Api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import "./support.css";

export const Support = () => {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const hasScrooled = useRef(false);

  const navigate = useNavigate();

  // ============================
  // دریافت پیام‌ها
  // ============================
  const fetchMessages = async () => {
    try {
      const res = await Api.get("/messages/getmessages.php");

      if (res.data.status) {
        setMessages(res.data.messages);
      }
    } catch (error) {
      console.error("❌ خطا در دریافت پیام‌ها:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Polling
  // ============================
  useEffect(() => {
    fetchMessages();

    const interval = setInterval(fetchMessages, 5000);

    return () => clearInterval(interval);
  }, []);

  // ============================
  // اسکرول اولیه به پایین
  // ============================
  useEffect(() => {
    if (messages.length > 0 && !hasScrooled.current) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });

      hasScrooled.current = true;
    }
  }, [messages]);

  // ============================
  // ارسال پیام
  // ============================
  const handleSend = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      const res = await Api.post(
        "/messages/sendmessage.php",
        {
          message: newMessage,
        }
      );

      if (res.data.status) {
        setNewMessage("");

        fetchMessages();

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
          });
        }, 150);
      }
    } catch (error) {
      console.error("❌ خطا در ارسال پیام:", error);
    }
  };

  // ============================
  // بررسی احراز هویت
  // ============================
  if (authLoading) {
    return (
      <div className="support-loading">
        در حال بررسی ...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ============================
  // Loading
  // ============================
  if (loading) {
    return (
      <div className="support-loading">
        در حال بارگذاری...
      </div>
    );
  }

  // ============================
  // صفحه پشتیبانی
  // ============================
  return (
    <div className="chat-app-wrapper">

      <main className="chat-container">

        {/* ================= HEADER ================= */}

        <header className="chat-header">

          <div className="header-right">

            {/* دکمه بازگشت */}
            <button
              className="icon-btn"
              aria-label="بازگشت"
              onClick={() => navigate(-1)}
            >
              <i className="fa-solid fa-arrow-right"></i>
            </button>

            {/* اطلاعات پشتیبانی */}
            <div className="header-center">

              <div className="brand-avatar">
                <i className="fa-solid fa-scissors"></i>

                <span className="status-dot"></span>
              </div>

              <div className="brand-info">

                <h1 className="brand-name">
                  پشتیبانی محمد بهمنی
                </h1>

                <span className="brand-status">
                  پاسخگویی آنلاین
                </span>

              </div>

            </div>

          </div>

        </header>


        {/* ================= MESSAGES ================= */}

        <section className="chat-messages" id="chatMessages">

          {messages.length === 0 ? (
<div className="empty-message">
              هیچ پیامی وجود ندارد.
            </div>

          ) : (

            messages.map((msg) => (

              <div
                key={msg.id}
                className={`message-row ${
                  msg.is_admin ? "support" : "customer"
                }`}
              >

                <div className="message-bubble">

                  <div className="message-text">
                    {msg.message}
                  </div>

                  <div className="message-meta">

                    <span>
                      {msg.created_at}
                    </span>

                    <span className="status-ticks">

                      {msg.is_read ? (
                        <>
                          <i className="fa-solid fa-check"></i>
                          <i className="fa-solid fa-check"></i>
                        </>
                      ) : (
                        <i className="fa-solid fa-check"></i>
                      )}

                    </span>

                  </div>

                </div>

              </div>

            ))

          )}

          <div ref={messagesEndRef}></div>

        </section>


        {/* ================= SEND MESSAGE ================= */}

        <footer className="chat-composer">

          <form
            className="composer-form"
            onSubmit={handleSend}
          >

            <input
              type="text"
              className="chat-input"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="پیامتان را بنویسید..."
              autoComplete="off"
            />

            <button
              type="submit"
              className="send-btn"
              aria-label="ارسال پیام"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>

          </form>

        </footer>

      </main>

    </div>
  );
};