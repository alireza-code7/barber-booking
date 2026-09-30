import { useState } from "react";
import "./register.css";
import { Api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import logimg from "../assets/images/images.jfif";

export const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // جلوگیری از ارسال چندباره
    if (loading) return;

    setError("");

    // حذف فاصله‌های شماره
    const cleanPhone = phone.replace(/\s/g, "");

    // اعتبارسنجی شماره موبایل
    if (!/^09\d{9}$/.test(cleanPhone)) {
      setError("شماره موبایل معتبر نیست");
      return;
    }

    // اعتبارسنجی رمز عبور
    if (!password.trim()) {
      setError("رمز عبور را وارد کنید");
      return;
    }

    try {
      setLoading(true);

      const response = await Api.post("/login.php", {
        phone: cleanPhone,
        password,
      });

      if (response.data.status) {
        toast.success("با موفقیت وارد شدید");

        if (!response.data.user.is_admin) {
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        }

        if (response.data.user.is_admin) {
          setTimeout(() => {
            window.location.href = "/admin";
          }, 1500);
        }
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <main className="auth-container">
        {/* سمت فرم */}
        <div className="form-side">
          <div>
            {/* برند */}
            <div className="brand-header">
              <div className="brand-icon" aria-hidden="true">
                <i className="fas fa-cut"></i>
              </div>

              <h1 className="brand-title">آرایشگاه محمد بهمنی</h1>
            </div>

            {/* پیام خطا */}
            {error && (
  <div className="error-message">
    <i className="fas fa-circle-exclamation"></i>
    <span>{error}</span>
  </div>
)}

            {/* فرم */}
            <form className="register-form" onSubmit={handleSubmit} noValidate>
              {/* شماره تلفن */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  شماره تلفن
                </label>

                <div className="input-wrapper">
                  <input
                    type="tel"
                    id="phone"
                    className="form-input"
                    placeholder="مثلاً 09123456789"
                    dir="ltr"
                    style={{ textAlign: "right" }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                  />

                  <span className="input-icon">
                    <i className="fas fa-phone"></i>
                  </span>
                </div>
              </div>

              {/* رمز عبور */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  رمز عبور
                </label>

                <div className="input-wrapper has-toggle">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="form-input"
                    placeholder="رمز عبور خود را وارد کنید"
                     style={{ textAlign: "right" }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />

                  <span className="input-icon">
                    <i className="fas fa-lock"></i>
                  </span>

                  {/* نمایش / مخفی کردن رمز */}
                  <button
                    type="button"
                    className="toggle-password"
                    title="نمایش/پنهان‌سازی رمز عبور"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <i
                      className={
                        showPassword ? "fas fa-eye-slash" : "fas fa-eye"
                      }
                    ></i>
                  </button>
                </div>
              </div>

              {/* دکمه ورود */}
              <button type="submit" className="btn-submit" disabled={loading}>
                <span className="btn-text">
                  {loading ? "در حال ورود..." : "ورود"}
                </span>

                {loading && <span className="btn-spinner"></span>}
              </button>
            </form>
          </div>

          {/* پایین فرم */}
          <div className="form-footer">
            <p className="login-prompt">
              حسابی ندارید ؟
              <Link to="/register" className="login-link">
                ثبت نام
              </Link>
            </p>

            <Link to="/" className="back-home">
              <span>بازگشت به صفحه اصلی</span>

              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
        {/* سمت تصویری */}
        <div className="visual-side">

          <img
            src={logimg}
            alt="آرایشگاه محمد بهمنی"
            className="visual-image"
          />

          <div className="visual-overlay">

            <div className="visual-badge">
              <i className="fas fa-star"></i>

              <span>
                تجربه‌ای متفاوت از استایل آقایان
              </span>
            </div>

            <div className="visual-quote">

              <p className="visual-quote-text">
                «پرستیژ و اصالت در ارائه خدمات اصلاح و پیرایش آقایان»
              </p>

              <p className="visual-quote-author">
                آرایشگاه اختصاصی محمد بهمنی
              </p>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
