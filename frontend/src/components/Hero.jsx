import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import heroImg from "../assets/images/baner2.jpg";

export const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="hero-section" id="home">
      <div className="container">

        <div className="hero-card reveal">

          {/* Hero Image */}
          <img
            src={heroImg}
            alt="آرایشگاه محمد بهمنی"
            className="hero-bg-img"
          />

          <div className="hero-overlay"></div>

          {/* Hero Content */}
          <div className="hero-content">

            <h1 className="hero-title">
              استایل شما، امضای ماست
            </h1>

            <p className="hero-description">
              با تجربه و تخصص، بهترین استایل را متناسب با چهره و سلیقه شما
              خلق می‌کنیم. بالاترین کیفیت، دقیق‌ترین خطوط و فضایی مدرن.
            </p>

            <div className="hero-actions">

              {/* Booking */}
              {user ? (
                <Link to="/booking" className="btn btn-primary">
                  <i className="fa-regular fa-calendar-check"></i>
                  <span>رزرو آنلاین وقت</span>
                </Link>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  <i className="fa-regular fa-calendar-check"></i>
                  <span>رزرو آنلاین وقت</span>
                </Link>
              )}

              {/* Services */}
              <a href="#services" className="btn btn-secondary">
                <span>مشاهده خدمات</span>
                <i className="fa-solid fa-arrow-left"></i>
              </a>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};