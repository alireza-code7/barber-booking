
import { useState } from "react";
import "./register.css";
import { Api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import registerImg from "../assets/images/images.jfif";

export const Register = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // جلوگیری از درخواست‌های پشت سر هم
    if (loading) return;

    setError("");

    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\s/g, "");

    // اعتبارسنجی نام
    if (cleanName.length < 3) {
      setError("نام و نام خانوادگی را به صورت صحیح وارد کنید");
      return;
    }

    // اعتبارسنجی شماره موبایل
    if (!/^09\d{9}$/.test(cleanPhone)) {
      setError("شماره موبایل معتبر نیست");
      return;
    }

    // اعتبارسنجی رمز
    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد");
      return;
    }

    // تکرار رمز
    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند");
      return;
    }

    try {
      setLoading(true);

      const response = await Api.post("/register.php", {
        name: cleanName,
        phone: cleanPhone,
        password,
      });

      if (response.data.status) {
        login(response.data.user);

        toast.success("ثبت نام با موفقیت انجام شد");

        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
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
      <main className="auth-container" dir="rtl" >
        {/* سمت تصویری */}
        <div className="visual-side">
          <img
            src={registerImg}
            alt="آرایشگاه محمد بهمنی"
            className="visual-image"
          />

          <div className="visual-overlay">
            <div className="visual-badge">
              <i className="fas fa-star"></i>

              <span>تجربه‌ای متفاوت از استایل آقایان</span>
            </div>

            <div className="visual-quote">
              <p className="visual-quote-text">
                «پرستیژ و اصالت در ارائه خدمات اصلاح و پیرایش آقایان»
              </p>

              <p className="visual-quote-author">آرایشگاه اختصاصی محمد بهمنی</p>
            </div>
          </div>
        </div>

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

            {/* خطا */}
            {error && (
              <div className="error-message">
                <i className="fas fa-circle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

            {/* فرم ثبت نام */}
            <form className="register-form" onSubmit={handleSubmit} noValidate>
              {/* نام */}
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  نام و نام خانوادگی
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="fullName"
                    className="form-input"
                    placeholder="نام و نام خانوادگی خود را وارد کنید"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />

                  <span className="input-icon">
                    <i className="fas fa-user"></i>
                  </span>
                </div>
              </div>

              {/* شماره */}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />

                  <span className="input-icon">
                    <i className="fas fa-lock"></i>
                  </span>

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

              {/* تکرار رمز */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  تکرار رمز عبور
                </label>

                <div className="input-wrapper has-toggle">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    className="form-input"
                    placeholder="رمز عبور را دوباره وارد کنید"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />

                  <span className="input-icon">
                    <i className="fas fa-shield-alt"></i>
                  </span>
                  <button
                    type="button"
                    className="toggle-password"
                    title="نمایش/پنهان‌سازی رمز عبور"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    <i
                      className={
                        showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"
                      }
                    ></i>
                  </button>
                </div>
              </div>

              {/* دکمه */}
              <button type="submit" className="btn-submit" disabled={loading}>
                <span className="btn-text">
                  {loading ? "در حال ثبت نام..." : "ثبت نام"}
                </span>

                {loading && <span className="btn-spinner"></span>}
              </button>
            </form>
          </div>

          {/* پایین فرم */}
          <div className="form-footer">
            <p className="login-prompt">
              قبلاً حساب دارید؟
              <Link to="/login" className="login-link">
                ورود
              </Link>
            </p>

            <Link to="/" className="back-home">
              <span>بازگشت به صفحه اصلی</span>

              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
