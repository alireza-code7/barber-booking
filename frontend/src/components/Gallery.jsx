import { useEffect, useState } from "react";
import { Api } from "../services/api";

export const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await Api.get("/getgallery.php");

        if (res.data.status) {
          setGallery(res.data.gallery);
        }
      } catch (err) {
        console.error("خطا در دریافت نمونه کارها:", err);
      }
    };

    fetchGallery();
  }, []);

  // عکس بعدی
  const nextSlide = () => {
    if (gallery.length === 0) return;

    setCurrentIndex((prevIndex) =>
      prevIndex === gallery.length - 1
        ? 0
        : prevIndex + 1
    );
  };

  // عکس قبلی
  const prevSlide = () => {
    if (gallery.length === 0) return;

    setCurrentIndex((prevIndex) =>
      prevIndex === 0
        ? gallery.length - 1
        : prevIndex - 1
    );
  };

  // تغییر خودکار هر 5 ثانیه
  useEffect(() => {
    if (gallery.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === gallery.length - 1
          ? 0
          : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [gallery.length]);

  if (gallery.length === 0) {
    return null;
  }

  return (
    <section
      className="section portfolio-section"
      id="portfolio"
    >
      <div className="container">

        <div className="section-header reveal">
          <h2 className="section-title">
            نمونه کارها
          </h2>

         
        </div>

        <div className="carousel-container reveal">

          {/* دکمه قبلی */}
          <button
            className="carousel-btn prev"
            aria-label="قبلی"
            onClick={prevSlide}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          {/* دکمه بعدی */}
          <button
            className="carousel-btn next"
            aria-label="بعدی"
            onClick={nextSlide}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          {/* اسلایدها */}
          <div
            className="carousel-track"
            style={{
              transform: `translateX(${currentIndex * 100}%)`,
            }}
          >
            {gallery.map((image) => (
              <div
                className="carousel-slide"
                key={image.id}
              >
                <img
                  src={`https://barber.site.je/api/images/${image.url}`}
                  alt={image.title}
                />

                <div className="carousel-caption">
                  <h4>{image.title}</h4>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* نقاط پایین اسلایدر */}
        <div className="carousel-dots">
          {gallery.map((image, index) => (
            <div
              key={image.id}
              className={`dot ${
                index === currentIndex ? "active" : ""
              }`}
              onClick={() => setCurrentIndex(index)}
            ></div>
          ))}
        </div>

      </div>
    </section>
  );
};