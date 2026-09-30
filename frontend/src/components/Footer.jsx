export const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="container">

        <div className="footer-grid">

          {/* برند */}
          <div className="footer-brand">
            <h3>آرایشگاه محمد بهمنی</h3>

            <p>
              ارائه‌دهنده تخصصی‌ترین خدمات پیرایش، فید، استایل و پاکسازی
              پوست آقایان با جدیدترین متدهای روز دنیا در محیطی کاملاً مدرن
              و صمیمی.
            </p>

            <div className="social-links">

              <a
                href="#"
                className="social-btn"
                aria-label="اینستاگرام"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>

              <a
                href="#"
                className="social-btn"
                aria-label="تلگرام"
              >
                <i className="fa-brands fa-telegram"></i>
              </a>

              <a
                href="#"
                className="social-btn"
                aria-label="واتساپ"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>

            </div>
          </div>

          {/* دسترسی سریع */}
          <div className="footer-col">

            <h4 className="footer-title">
              دسترسی سریع
            </h4>

            <ul className="footer-info-list">

              <li>
                <a href="#home">
                  صفحه اصلی
                </a>
              </li>

              <li>
                <a href="#services">
                  خدمات و قیمت‌ها
                </a>
              </li>

              <li>
                <a href="#portfolio">
                  نمونه کارها
                </a>
              </li>

              <li>
                <a href="#about">
                  درباره سالن
                </a>
              </li>

            </ul>
          </div>

          {/* اطلاعات تماس */}
          <div className="footer-col">

            <h4 className="footer-title">
              اطلاعات تماس
            </h4>

            <div className="footer-info-list">

              <div className="footer-info-item">
                <i className="fa-solid fa-location-dot"></i>

                <span>
                  تهران، خیابان ولیعصر، بالاتر از پارک وی،
                  پلاک ۱۲۴
                </span>
              </div>

              <div className="footer-info-item">
                <i className="fa-solid fa-phone"></i>

                <span>
                  ۰۲۱-۲۲۰۰۳۳۴۴ / ۰۹۱۲۳۴۵۶۷۸۹
                </span>
              </div>

              <div className="footer-info-item">
                <i className="fa-solid fa-clock"></i>

                <span>
                  همه روزه از ساعت ۱۰:۰۰ الی ۲۱:۰۰
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* پایین فوتر */}
        <div className="footer-bottom">
          <p>
            تمامی حقوق محفوظ است © ۱۴۰۵ | طراحی شده برای آرایشگاه محمد بهمنی
          </p>
        </div>

      </div>
    </footer>
  );
};