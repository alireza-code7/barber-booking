import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Api } from "../services/api";
import "./myorder.css";

export const OrderHistory = () => {
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentFilter, setCurrentFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  // ============================
  // دریافت رزروها
  // ============================
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await Api.get("/getuserbooking.php");

        console.log(res.data);

        if (res.data.success) {
          setBookings(res.data.bookings);
        }

      } catch (error) {
        console.error("خطا در دریافت رزرو ها:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);


  // ============================
  // وضعیت‌ها
  // ============================
  const statusMap = {
    pending: {
      label: "در حال بررسی",
      icon: "fa-solid fa-clock",
      class: "pending",
    },

    approved: {
      label: "تایید شده",
      icon: "fa-solid fa-circle-check",
      class: "confirmed",
    },

    rejected: {
      label: "رد شده",
      icon: "fa-solid fa-circle-xmark",
      class: "rejected",
    },
  };


  // ============================
  // بررسی احراز هویت
  // ============================
  if (authLoading) {
    return (
      <div className="order-loading">
        در حال بررسی...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="order-loading">
        در حال بارگذاری رزرو ها...
      </div>
    );
  }


  // ============================
  // فیلتر رزروها
  // ============================
  const filteredBookings = bookings.filter((booking) => {

    if (currentFilter === "all") {
      return true;
    }

    return booking.status === currentFilter;

  });


  // ============================
  // مرتب‌سازی
  // ============================
  const sortedBookings = [...filteredBookings].sort((a, b) => {

    const dateA = new Date(
      `${a.booking_date} ${a.booking_time_start || ""}`
    );

    const dateB = new Date(
      `${b.booking_date} ${b.booking_time_start || ""}`
    );

    if (sortOrder === "newest") {
      return dateB - dateA;
    }

    return dateA - dateB;

  });


  return (
    <div className="order-page-wrapper">

      {/* ================= HEADER ================= */}

      <header className="page-header">

        <div className="header-title-group">

          <div className="header-icon">
            <i className="fa-regular fa-calendar-check"></i>
          </div>

          <div className="header-text">

            <h1>
              رزروهای من
            </h1>

            <p>
              تعداد رزروهای شما:
              <span className="count-highlight">
                {bookings.length.toLocaleString("fa-IR")}
              </span>
            </p>

          </div>

        </div>


        <div>

          <Link
            to="/booking"
            className="btn-primary"
          >
            <i className="fa-solid fa-circle-plus"></i>

            <span>
              رزرو وقت جدید
            </span>
          </Link>

        </div>

      </header>


      {/* ================= FILTER & SORT ================= */}

      <section className="controls-section">

        <div
          className="filter-tabs"
          role="tablist"
        >

          <button
            type="button"
            className={`filter-btn ${
              currentFilter === "all" ? "active" : ""
            }`}
            onClick={() => setCurrentFilter("all")}
          >
            <span>
              همه
            </span>
          </button><button
            type="button"
            className={`filter-btn ${
              currentFilter === "approved" ? "active" : ""
            }`}
            onClick={() => setCurrentFilter("approved")}
          >
            <i className="fa-solid fa-circle-check"></i>

            <span>
              تایید شده
            </span>
          </button>


          <button
            type="button"
            className={`filter-btn ${
              currentFilter === "pending" ? "active" : ""
            }`}
            onClick={() => setCurrentFilter("pending")}
          >
            <i className="fa-solid fa-clock"></i>

            <span>
              در حال بررسی
            </span>
          </button>


          <button
            type="button"
            className={`filter-btn ${
              currentFilter === "rejected" ? "active" : ""
            }`}
            onClick={() => setCurrentFilter("rejected")}
          >
            <i className="fa-solid fa-circle-xmark"></i>

            <span>
              رد شده
            </span>
          </button>

        </div>


        {/* مرتب سازی */}

        <div className="sort-wrapper">

          <span className="sort-label">

            <i className="fa-solid fa-arrow-down-wide-short"></i>

            مرتب‌سازی:

          </span>

          <select
            className="sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">
              جدیدترین
            </option>

            <option value="oldest">
              قدیمی‌ترین
            </option>
          </select>

        </div>

      </section>


      {/* ================= BOOKINGS ================= */}

      {sortedBookings.length === 0 ? (

        <div className="empty-state visible">

          <div className="empty-icon-box">
            <i className="fa-regular fa-calendar-xmark"></i>
          </div>

          <h2 className="empty-title">
            هنوز رزروی ثبت نکرده‌اید
          </h2>

          <p className="empty-desc">
            برای دریافت خدمات حرفه‌ای آرایشگاه محمد بهمنی،
            همین حالا اولین وقت خود را رزرو کنید.
          </p>

          <Link
            to="/booking"
            className="btn-primary"
          >
            <i className="fa-solid fa-calendar-plus"></i>

            <span>
              رزرو وقت
            </span>
          </Link>

        </div>

      ) : (

        <main className="bookings-grid">

          {sortedBookings.map((booking, index) => {

            const status =
              statusMap[booking.status] ||
              statusMap.pending;

            return (

              <article
                key={booking.id}
                className="booking-card"
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
              >

                {/* ================= CARD TOP ================= */}

                <div className="card-top">

                  <div className="booking-id">

                    <i className="fa-solid fa-hashtag"></i>

                    <span>
                      شناسه: {String(booking.id).padStart(4, "0")}
                    </span>

                  </div>


                  <div
                    className={`status-badge ${status.class}`}
                  >

                    <i className={status.icon}></i>

                    <span>
                      {status.label}
                    </span>

                  </div>

                </div>


                {/* ================= CARD MIDDLE ================= */}

                <div className="card-middle">

                  <div className="meta-row">

                    <div className="meta-item">

                      <i className="fa-regular fa-calendar"></i>

                      <span>
                        {booking.booking_date}
                      </span>

                    </div>


                    <div className="meta-item"><i className="fa-regular fa-clock"></i>

                      <span className="time-range">
                        {booking.booking_time_start}
                        {" - "}
                        {booking.booking_time_end}
                      </span>

                    </div>

                  </div>


                  {/* خدمات */}

                  <div className="services-container">

                    <span className="services-label">

                      <i className="fa-solid fa-scissors"></i>

                      خدمات انتخاب شده:

                    </span>


                    <div className="services-list">

                      {booking.services ? (

                        <span className="service-tag">
                          {booking.services}
                        </span>

                      ) : (

                        <span className="service-tag">
                          بدون سرویس
                        </span>

                      )}

                    </div>

                  </div>

                </div>


                {/* ================= CARD BOTTOM ================= */}

                <div className="card-bottom">

                  <span className="price-label">

                    <i className="fa-solid fa-receipt"></i>

                    مبلغ کل:

                  </span>


                  <div>

                    <span className="price-value">
                      {Number(
                        booking.total_price
                      ).toLocaleString("fa-IR")}
                    </span>

                    <span className="price-currency">
                      تومان
                    </span>

                  </div>

                </div>

              </article>

            );

          })}

        </main>

      )}

    </div>
  );
};