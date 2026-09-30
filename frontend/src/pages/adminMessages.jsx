import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Api } from "../services/api";
import { toast } from "react-toastify";
import "./AdminMessages.css";

export const AdminMessages = () => {
  const { user, loading: authLoading } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showList, setShowList] = useState(true);

  const messagesEndRef = useRef(null);

  const [isDesktop, setIsDesktop] = useState(
    window.innerWidth >= 1024
  );

  const truncate = (text, max = 10) => {
    if (!text) return "بدون پیام";

    return text.length > max
      ? text.slice(0, max) + "..."
      : text;
  };

  /* =========================
     تشخیص سایز صفحه
  ========================= */

  useEffect(() => {
    const resize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* =========================
     دریافت لیست مکالمات
  ========================= */

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await Api.get("/admin/adminsupport.php");

        if (res.data.success) {
          setChats(res.data.chats);
        }
      } catch (error) {
        console.error("❌ خطا:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  /* =========================
     دریافت پیام‌ها
  ========================= */

  const fetchMessages = async (userId, scroll = false) => {
    try {
      const res = await Api.get(
        `/admin/usermessages.php?user_id=${userId}`
      );

      if (res.data.success) {
        setMessages(res.data.messages);

        if (scroll) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
              behavior: "smooth",
            });
          }, 100);
        }
      }
    } catch (error) {
      console.error("❌ خطا:", error);
    }
  };

  /* =========================
     انتخاب مکالمه
  ========================= */

  const selectChat = (chat) => {
    setSelectedChat(chat);

    if (!isDesktop) {
      setShowList(false);
    }

    fetchMessages(chat.user_id, false);
    markAsRead(chat.user_id);
  };

  /* =========================
     خوانده شدن پیام‌ها
  ========================= */

  const markAsRead = async (userId) => {
    try {
      await Api.post("/admin/adminread.php", {
        user_id: userId,
      });

      setChats((prev) =>
        prev.map((c) =>
          c.user_id === userId
            ? { ...c, unread_count: 0 }
            : c
        )
      );
    } catch (error) {
      console.error("❌ خطا:", error);
    }
  };

  /* =========================
     ارسال پیام
  ========================= */

  const handleSend = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedChat) return;

    setSending(true);

    try {
      const res = await Api.post("/admin/adminmessages.php", {
        user_id: selectedChat.user_id,
        message: newMessage,
      });

      if (res.data.success) {
        setNewMessage("");

        fetchMessages(selectedChat.user_id, true);

        setChats((prev) =>
          prev.map((c) =>
            c.user_id === selectedChat.user_id
              ? {
                  ...c,
                  last_message: newMessage,
                  last_time: new Date().toLocaleString("fa-IR"),
                }
              : c
          )
        );

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
          });
        }, 100);
      } else {
        toast.error("❌ " + res.data.message);
      }
    } catch (error) {
      toast.error("❌ خطا در ارسال پیام");
    } finally {
      setSending(false);
    }
  };

  /* =========================
     برگشت به لیست
  ========================= */

  const goBack = () => {
    setShowList(true);
    setSelectedChat(null);
  };

  /* =========================
     دریافت خودکار پیام‌ها
  ========================= */

  useEffect(() => {
    if (!selectedChat) return;

    const interval = setInterval(() => {
      fetchMessages(selectedChat.user_id, false);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedChat]);

  /* =========================
     Loading / Auth
  ========================= */

  if (authLoading) {
    return (
      <div className="admin-messages-loading">
        <i className="fas fa-hourglass-half"></i>
        <span>در حال بررسی...</span>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="admin-messages-loading">
        <i className="fas fa-spinner"></i>
        <span>در حال بارگذاری پیام‌ها...</span>
      </div>
    );
  }

  return (
    <div className="admin-messages">
      <div className="admin-messages-shell">

        {/* =====================================
            لیست مکالمات
        ===================================== */}

        {(isDesktop || showList) && (
          <aside className="admin-messages-chat-list">

            <div className="admin-messages-list-header">
              <div className="admin-messages-list-heading">
                <div className="admin-messages-list-icon">
                  <i className="fas fa-comments"></i>
                </div>

                <div>
                  <h1>پیام‌ها</h1>
                  <span>
                    مدیریت مکالمات کاربران
                  </span>
                </div>
              </div>

              <div className="admin-messages-chat-count">
                <span>{chats.length}</span>
                <small>مکالمه</small>
              </div>
            </div>

            <div className="admin-messages-list-scroll">
              {chats.length === 0 ? (
                <div className="admin-messages-empty-list">
                  <div className="admin-messages-empty-icon">
                    <i className="fas fa-inbox"></i>
                  </div>

                  <strong>
                    هیچ مکالمه‌ای وجود ندارد
                  </strong>

                  <span>
                    پیام‌های کاربران در اینجا نمایش داده می‌شوند.
                  </span>
                </div>
              ) : (
                chats.map((chat) => (
                  <button
                    type="button"
                    key={chat.user_id}
                    className={`admin-messages-chat-item ${
                      selectedChat?.user_id === chat.user_id
                        ? "is-active"
                        : ""
                    }`}
                    onClick={() => selectChat(chat)}
                  >
                    <div className="admin-messages-chat-avatar">
                      <i className="fas fa-user"></i>
                    </div>

                    <div className="admin-messages-chat-content">
                      <div className="admin-messages-chat-top">
                        <strong>
                          {chat.user_name}
                        </strong>

                        <span>
                          {chat.last_time || ""}
                        </span>
                      </div>

                      <div className="admin-messages-chat-bottom">
                        <p>
                          {truncate(chat.last_message, 28)}
                        </p>

                        {chat.unread_count > 0 && (
                          <span className="admin-messages-unread">
                            {chat.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>
        )}

        {/* =====================================
            پنجره چت
        ===================================== */}

        {(isDesktop || !showList) && (
          <section
            className={`admin-messages-chat-window ${
              !selectedChat ? "is-empty" : ""
            }`}
          >
            {!selectedChat ? (
              <div className="admin-messages-placeholder">

                <div className="admin-messages-placeholder-icon">
                  <i className="fas fa-comment-dots"></i>
                </div>

                <h2>
                  یک مکالمه را انتخاب کنید
                </h2>

                <p>
                  برای مشاهده و پاسخ به پیام‌های کاربران،
                  یک مکالمه را از لیست انتخاب کنید.
                </p>
              </div>
            ) : (
              <>

                {/* =================================
                    هدر چت
                ================================= */}

                <header className="admin-messages-conversation-header">

                  {!isDesktop && (
                    <button
                      type="button"
                      className="admin-messages-back-button"
                      onClick={goBack}
                      aria-label="بازگشت"
                    >
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  )}

                  <div className="admin-messages-user-profile">
                    <div className="admin-messages-user-avatar">
                      <i className="fas fa-user"></i>
                    </div>

                    <div className="admin-messages-user-details">
                      <strong>
                        {selectedChat.user_name}
                      </strong>

                      <span>
                        پشتیبانی مشتری
                      </span>
                    </div>
                  </div>

                 
                </header>

                {/* =================================
                    فقط این قسمت اسکرول می‌شود
                ================================= */}

                <div className="admin-messages-message-area">

                  <div className="admin-messages-message-inner">

                    {messages.length === 0 ? (
                      <div className="admin-messages-no-messages">
                        <div className="admin-messages-no-message-icon">
                          <i className="fas fa-comments"></i>
                        </div>

                        <strong>
                          هنوز پیامی وجود ندارد
                        </strong>

                        <span>
                          اولین پیام را برای این کاربر ارسال کنید.
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="admin-messages-day-divider">
                          <span>مکالمه</span>
                        </div>

                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`admin-messages-message-row ${
                              msg.is_admin
                                ? "is-admin"
                                : "is-user"
                            }`}
                          >
                            <div className="admin-messages-message-bubble">
                              <p>
                                {msg.message}
                              </p>

                              <span className="admin-messages-message-time">
                                {msg.created_at}

                               
                              </span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    <div ref={messagesEndRef} />

                  </div>
                </div>

                {/* =================================
                    ورودی پیام - ثابت
                ================================= */}

                <form
                  onSubmit={handleSend}
                  className="admin-messages-composer"
                >
                  <div className="admin-messages-composer-inner">

                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) =>
                        setNewMessage(e.target.value)
                      }
                      placeholder="پیام خود را بنویسید..."
                      disabled={sending}
                    />

                    <button
                      type="submit"
                      disabled={
                        sending ||
                        !newMessage.trim()
                      }
                      aria-label="ارسال پیام"
                    >
                      {sending ? (
                        <i className="fas fa-spinner"></i>
                      ) : (
                        <i className="fas fa-paper-plane"></i>
                      )}
                    </button>

                  </div>
                </form>

              </>
            )}
          </section>
        )}

      </div>
    </div>
  );
};