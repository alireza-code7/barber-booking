import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";

import "./admin-dashboard.css";
import { Api } from "../services/api";

export const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
    totalUsers: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await Api.get("/admin/dashboard.php");

        if (res.data.success) {
          setStats(res.data.stats);
          setRecentBookings(res.data.recentBookings || []);
        }
      } catch (error) {
        console.error("❌ خطا:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (authLoading) {
    return (
      <div className="admin-loading">
        <i className="fas fa-hourglass"></i>
        <span>در حال بررسی...</span>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <i className="fas fa-hourglass"></i>
        <span>در حال بارگذاری...</span>
      </div>
    );
  }

  const statusMap = {
    pending: {
      label: "در انتظار تایید",
      icon: "fa-clock",
    },
    approved: {
      label: "تایید شده",
      icon: "fa-check-circle",
    },
    rejected: {
      label: "رد شده",
      icon: "fa-times-circle",
    },
  };

  return (
    <main className="admin-dashboard">

      {/* ========================= DASHBOARD INTRO ========================= */}

      <section className="dashboard-intro">
       

        <div className="today-card">
          <div className="today-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>

          <div className="today-content">
            <span>تاریخ امروز</span>

            <strong>
              {new Date().toLocaleDateString("fa-IR")}
            </strong>
          </div>
        </div>
      </section>

      {/* ========================= STATS ========================= */}

      <section className="dashboard-stats">
        <div className="admin-stats-grid">

          <div className="stat-card total">
            <div className="stat-icon">
              <i className="fas fa-calendar-check"></i>
            </div>

            <div className="stat-body">
              <span className="stat-value">
                {stats.totalBookings}
              </span>

              <span className="stat-label">
                کل رزروها
              </span>
            </div>
          </div>

          <div className="stat-card pending">
            <div className="stat-icon">
              <i className="fas fa-hourglass-half"></i>
            </div>

            <div className="stat-body">
              <span className="stat-value">
                {stats.pendingBookings}
              </span>

              <span className="stat-label">
                در انتظار تایید
              </span>
            </div>
          </div>

          <div className="stat-card approved">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>

            <div className="stat-body">
              <span className="stat-value">
                {stats.approvedBookings}
              </span>

<span className="stat-label">
                تایید شده
              </span>
            </div>
          </div>

          <div className="stat-card rejected">
            <div className="stat-icon">
              <i className="fas fa-times-circle"></i>
            </div>

            <div className="stat-body">
              <span className="stat-value">
                {stats.rejectedBookings}
              </span>

              <span className="stat-label">
                رد شده
              </span>
            </div>
          </div>

          <div className="stat-card users">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>

            <div className="stat-body">
              <span className="stat-value">
                {stats.totalUsers}
              </span>

              <span className="stat-label">
                کاربران
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================= QUICK ACTIONS ========================= */}

      <section className="quick-section">

        <div className="section-heading">
          <div>
           

            <h2>
              مدیریت بخش‌ها
            </h2>
          </div>
        </div>

        <div className="quick-grid">

          <Link
            to="/admin/bookings"
            className="quick-card bookings"
          >
            <div className="quick-icon">
              <i className="fas fa-calendar-check"></i>
            </div>

            <div className="quick-info">
              <h3>مدیریت رزروها</h3>

              <p>
                مشاهده، تایید و مدیریت رزروها
              </p>
            </div>

            <div className="quick-arrow">
              <i className="fas fa-arrow-left"></i>
            </div>
          </Link>

          <Link
            to="/admin/times"
            className="quick-card times"
          >
            <div className="quick-icon">
              <i className="fas fa-business-time"></i>
            </div>

            <div className="quick-info">
              <h3>مدیریت تایم‌ها</h3>

              <p>
                مدیریت ساعت‌های قابل رزرو
              </p>
            </div>

            <div className="quick-arrow">
              <i className="fas fa-arrow-left"></i>
            </div>
          </Link>

          <Link
            to="/admin/services"
            className="quick-card services"
          >
            <div className="quick-icon">
              <i className="fas fa-tags"></i>
            </div>

            <div className="quick-info">
              <h3>مدیریت سرویس‌ها</h3>

              <p>
                افزودن، حذف و ویرایش
              </p>
            </div>

            <div className="quick-arrow">
              <i className="fas fa-arrow-left"></i>
            </div>
          </Link>

          <Link
            to="/admin/gallery"
            className="quick-card services"
          >
            <div className="quick-icon">
              <i className="fas fa-images"></i>
            </div>

            <div className="quick-info">
              <h3>مدیریت نمونه کارها</h3>

              <p>
               افزودن و حذف  
              </p>
            </div>

            <div className="quick-arrow">
              <i className="fas fa-arrow-left"></i>
            </div>
          </Link>

          <Link
            to="/admin/messages"
            className="quick-card messages"
          >
            <div className="quick-icon">
              <i className="fas fa-envelope"></i>
            </div>

            <div className="quick-info">
              <h3>پیام‌های پشتیبانی</h3>

              <p>
                بررسی و پاسخ به پیام کاربران
              </p>
            </div>

            <div className="quick-arrow">
              <i className="fas fa-arrow-left"></i>
            </div>
          </Link>

        </div>
      </section>

      {/* ========================= RECENT BOOKINGS ========================= */}

      <section className="bookings-section">

        <div className="section-header">

          <div className="admin-section-title">

            <div className="section-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>

            <div className="section-text">
              <h2>
                آخرین رزروها
              </h2>

<span>
                آخرین درخواست‌های ثبت شده توسط کاربران
              </span>
            </div>

          </div>

          <Link
            to="/admin/bookings"
            className="view-all-btn"
          >
            <span>مشاهده همه</span>

            <i className="fas fa-arrow-left"></i>
          </Link>

        </div>

        <div className="table-card">

          <div className="table-responsive">

            <table className="booking-table">

              <thead>
                <tr>
                  <th>شناسه</th>
                  <th>کاربر</th>
                  <th>تاریخ</th>
                  <th>ساعت</th>
                  <th>سرویس</th>
                  <th>وضعیت</th>
                </tr>
              </thead>

              <tbody>

                {recentBookings.length === 0 ? (

                  <tr>
                    <td
                      colSpan="6"
                      className="empty-table"
                    >
                      <div className="empty-state">

                        <div className="empty-icon">
                          <i className="fas fa-folder-open"></i>
                        </div>

                        <h3>
                          رزروی وجود ندارد
                        </h3>

                        <p>
                          هنوز هیچ رزروی ثبت نشده است.
                        </p>

                      </div>
                    </td>
                  </tr>

                ) : (

                  recentBookings.map((booking) => {

                    const status =
                      statusMap[booking.status] ||
                      statusMap.pending;

                    return (
                      <tr key={booking.id}>

                        <td data-label="شناسه">
                          <span className="booking-id">
                            #{String(booking.id).padStart(4, "0")}
                          </span>
                        </td>

                        <td data-label="کاربر">
                          <div className="user-info">
                            <span className="table-icon user-icon">
                              <i className="fas fa-user"></i>
                            </span>

                            <span>
                              {booking.user_name}
                            </span>
                          </div>
                        </td>

                        <td data-label="تاریخ">
                          <div className="date-box">
                            <span className="table-icon">
                              <i className="fas fa-calendar-day"></i>
                            </span>

                            <span>
                              {booking.booking_date}
                            </span>
                          </div>
                        </td>

                        <td data-label="ساعت">
                          <div className="time-box">

                            <span>
                              {booking.booking_time_start || "—"}
                            </span>

                            <i className="fas fa-arrow-left"></i>

                            <span>
                              {booking.booking_time_end || "—"}
                            </span>

                          </div>
                        </td>

                        <td data-label="سرویس">
                          <div className="service-box">

                            <span className="table-icon">
                              <i className="fas fa-scissors"></i>
                            </span>

                            <span>
                              {booking.services || "بدون سرویس"}
                            </span>

                          </div>
                        </td>

                        <td data-label="وضعیت">

<span
                            className={`status-badge ${booking.status}`}
                          >
                            <i
                              className={`fas ${status.icon}`}
                            ></i>

                            <span>
                              {status.label}
                            </span>
                          </span>

                        </td>

                      </tr>
                    );
                  })

                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>

    </main>
  );
};