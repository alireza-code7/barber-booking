import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Api } from "../services/api";
import { toast } from "react-toastify";
import "./AdminBookings.css";

export const AdminBookings = () => {
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirst, indexOfLast);

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const visiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(currentPage - 2, 1);
    let end = start + 4;

    if (end > totalPages) {
      end = totalPages;
      start = end - 4;
    }

    return Array.from(
      { length: end - start + 1 },
      (_, i) => i + start
    );
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [bookings, totalPages, currentPage]);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  const fetchBookings = async () => {
    try {
      const res = await Api.get("/admin/getBookings.php");

      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (error) {
      toast.error("❌ خطا در دریافت رزروها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await Api.post("/admin/updateBookingsStatus.php", {
        booking_id: id,
        status: "approved",
      });

      if (res.data.success) {
        toast.success("✅ رزرو تایید شد");
        fetchBookings();
      } else {
        toast.error("❌ " + res.data.message);
      }
    } catch (error) {
      toast.error("❌ خطا در ارتباط با سرور");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("آیا از رد این رزرو مطمئن هستید؟")) return;

    try {
      const res = await Api.post("/admin/updateBookingsStatus.php", {
        booking_id: id,
        status: "rejected",
      });

      if (res.data.success) {
        toast.success("❌ رزرو رد شد");
        fetchBookings();
      } else {
        toast.error("❌ " + res.data.message);
      }
    } catch (error) {
      toast.error("❌ خطا در ارتباط با سرور");
    }
  };

  const viewReceipt = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  if (authLoading) {
    return (
      <div className="admin-bookings-loading">
        <i className="fas fa-hourglass"></i>
        در حال بررسی...
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="admin-bookings-loading">
        <i className="fas fa-hourglass"></i>
        در حال بارگذاری...
      </div>
    );
  }

  const statusMap = {
    pending: {
      label: "در انتظار تایید",
      icon: "fa-clock",
      color: "#ffc107",
    },
    approved: {
      label: "تایید شده",
      icon: "fa-check-circle",
      color: "#4caf50",
    },
    rejected: {
      label: "رد شده",
      icon: "fa-times-circle",
      color: "#f44336",
    },
  };

  return (
    <div className="admin-bookings">
      <div className="admin-bookings-header">
        <div className="admin-bookings-header-title">
          <div className="admin-bookings-header-icon">
            <i className="fas fa-calendar-check"></i>
          </div>

          <div>
            <h2>مدیریت رزروها</h2>
            <span>مشاهده و مدیریت درخواست‌های رزرو</span>
          </div>
        </div>

        <div className="admin-bookings-count">
          <i className="fas fa-calendar-days"></i>
          <span>{bookings.length} رزرو</span>
        </div>
      </div>

      <div className="admin-bookings-table-wrapper">
        <table className="admin-bookings-table">
          <thead>
            <tr>
              <th>شناسه</th>
              <th>کاربر</th>
              <th>تاریخ</th>
              <th>ساعت</th>
              <th>سرویس</th>
              <th>مبلغ</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>

          <tbody>
            {currentBookings.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <div className="admin-bookings-empty">
                    <i className="fas fa-calendar-xmark"></i>
                    <strong>رزروی وجود ندارد</strong>
                    <span>هنوز هیچ رزروی برای نمایش ثبت نشده است.</span>
                  </div>
                </td>
              </tr>
            ) : (
              currentBookings.map((booking) => {
                const status =
                  statusMap[booking.status] || statusMap.pending;

                return (
                  <tr key={booking.id}>
                    <td>
                      <span className="admin-bookings-id">
                        #{String(booking.id).padStart(4, "0")}
                      </span>
                    </td>

                    <td>
                      <div className="admin-bookings-user">
                        <div className="admin-bookings-user-icon">
                          <i className="fas fa-user"></i>
                        </div>
                        <span>{booking.user_name}</span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-bookings-date">
                        <i className="fas fa-calendar-day"></i>
                        <span>{booking.booking_date}</span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-bookings-time">
                        <span>{booking.booking_time_start || "—"}</span>
                        <i className="fas fa-arrow-left"></i>
                        <span>{booking.booking_time_end || "—"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-bookings-service">
                        <i className="fas fa-scissors"></i>
                        <span>{booking.services || "بدون سرویس"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-bookings-price">
                        {booking.total_price
                          ? `${Number(booking.total_price).toLocaleString("fa-IR")} تومان`
                          : "—"}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`admin-bookings-status ${booking.status}`}
                      >
                        <i className={`fas ${status.icon}`}></i>
                        {status.label}
                      </span>
                    </td>

                    <td>
                      <div className="admin-bookings-actions">
                        <button
                          type="button"
                          className="admin-bookings-action admin-bookings-action-receipt"
                          onClick={() => viewReceipt(booking)}
                          title="مشاهده رسید"
                        >
                          <i className="fas fa-receipt"></i>
                        </button>

                        {booking.status === "pending" && (
                          <>
                            <button
                              type="button"
                              className="admin-bookings-action admin-bookings-action-approve"
                              onClick={() => handleApprove(booking.id)}
                              title="تایید رزرو"
                            >
                              <i className="fas fa-check"></i>
                            </button>

                            <button
                              type="button"
                              className="admin-bookings-action admin-bookings-action-reject"
                              onClick={() => handleReject(booking.id)}
                              title="رد رزرو"
                            >
                              <i className="fas fa-xmark"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-bookings-mobile">
        {currentBookings.length === 0 ? (
          <div className="admin-bookings-empty">
            <i className="fas fa-calendar-xmark"></i>
            <strong>رزروی وجود ندارد</strong>
            <span>هنوز هیچ رزروی برای نمایش ثبت نشده است.</span>
          </div>
        ) : (
          currentBookings.map((booking) => {
            const status =
              statusMap[booking.status] || statusMap.pending;

            return (
              <div className="admin-bookings-card" key={booking.id}>
                <div className="admin-bookings-card-top">
                  <span className="admin-bookings-id">
                    #{String(booking.id).padStart(4, "0")}
                  </span>

                  <span
                    className={`admin-bookings-status ${booking.status}`}
                  >
                    <i className={`fas ${status.icon}`}></i>
                    {status.label}
                  </span>
                </div>

                <div className="admin-bookings-card-user">
                  <div className="admin-bookings-user-icon">
                    <i className="fas fa-user"></i>
                  </div>

                  <div>
                    <span className="admin-bookings-card-label">کاربر</span>
                    <strong>{booking.user_name}</strong>
                  </div>
                </div>

                <div className="admin-bookings-card-grid">
                  <div className="admin-bookings-card-item">
                    <i className="fas fa-calendar-day"></i>
                    <div>
                      <span>تاریخ</span>
                      <strong>{booking.booking_date}</strong>
                    </div>
                  </div>

                  <div className="admin-bookings-card-item">
                    <i className="fas fa-clock"></i>
                    <div>
                      <span>ساعت</span>
                      <strong>
                        {booking.booking_time_start || "—"}{" "}
                        {booking.booking_time_end
                          ? `تا ${booking.booking_time_end}`
                          : ""}
                      </strong>
                    </div>
                  </div>

                  <div className="admin-bookings-card-item admin-bookings-card-service">
                    <i className="fas fa-scissors"></i>
                    <div>
                      <span>سرویس</span>
                      <strong>{booking.services || "بدون سرویس"}</strong>
                    </div>
                  </div>

                  <div className="admin-bookings-card-item">
                    <i className="fas fa-wallet"></i>
                    <div>
                      <span>مبلغ</span>
                      <strong>
                        {booking.total_price
                          ? `${Number(
                              booking.total_price
                            ).toLocaleString("fa-IR")} تومان`
                          : "—"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="admin-bookings-card-actions">
                  <button
                    type="button"
                    className="admin-bookings-card-receipt"
                    onClick={() => viewReceipt(booking)}
                  >
                    <i className="fas fa-receipt"></i>
                    مشاهده رسید
                  </button>

                  {booking.status === "pending" && (
                    <>
                      <button
                        type="button"
                        className="admin-bookings-card-approve"
                        onClick={() => handleApprove(booking.id)}
                        title="تایید رزرو"
                      >
                        <i className="fas fa-check"></i>
                      </button>

                      <button
                        type="button"
                        className="admin-bookings-card-reject"
                        onClick={() => handleReject(booking.id)}
                        title="رد رزرو"
                      >
                        <i className="fas fa-xmark"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="admin-bookings-pagination">
          <button
            type="button"
            className="admin-bookings-page-arrow"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-right"></i>
          </button>

          {visiblePages().map((page) => (
            <button
              type="button"
              key={page}
              className={`admin-bookings-page-number ${
                currentPage === page ? "active" : ""
              }`}
              onClick={() => changePage(page)}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            className="admin-bookings-page-arrow"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>
      )}

      {isModalOpen && selectedBooking && (
        <div
          className="admin-bookings-receipt-overlay"
          onClick={closeModal}
        >
          <div
            className="admin-bookings-receipt-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-bookings-receipt-header">
              <div className="admin-bookings-receipt-title">
                <div className="admin-bookings-receipt-title-icon">
                  <i className="fas fa-receipt"></i>
                </div>

                <div>
                  <h3>رسید پرداخت</h3>
                  <span>
                    رزرو #
                    {String(selectedBooking.id).padStart(4, "0")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="admin-bookings-receipt-close"
                onClick={closeModal}
                aria-label="بستن"
              >
                <i className="fas fa-xmark"></i>
              </button>
            </div>

            <div className="admin-bookings-receipt-body">
              <div className="admin-bookings-receipt-info">
                <div className="admin-bookings-receipt-info-row">
                  <span>نام کاربر</span>
                  <strong>{selectedBooking.user_name || "—"}</strong>
                </div>

                <div className="admin-bookings-receipt-info-row">
                  <span>تاریخ رزرو</span>
                  <strong>
                    {selectedBooking.booking_date || "—"}
                  </strong>
                </div>

                <div className="admin-bookings-receipt-info-row">
                  <span>ساعت</span>
                  <strong>
                    {selectedBooking.booking_time_start || "—"}
                    {selectedBooking.booking_time_end
                      ? ` تا ${selectedBooking.booking_time_end}`
                      : ""}
                  </strong>
                </div>

                <div className="admin-bookings-receipt-info-row">
                  <span>مبلغ</span>
                  <strong>
                    {selectedBooking.total_price
                      ? `${Number(
                          selectedBooking.total_price
                        ).toLocaleString("fa-IR")} تومان`
                      : "—"}
                  </strong>
                </div>
              </div>

              <div className="admin-bookings-receipt-image-wrap">
                <span className="admin-bookings-receipt-image-label">
                  تصویر رسید
                </span>

                <img
                  className="admin-bookings-receipt-image"
                  src={
                    
                       `https://barber.site.je/api/images/${selectedBooking.receipt_image}`
                     
                  }
                  alt="رسید پرداخت"
                />
              </div>
            </div>

            <div className="admin-bookings-receipt-actions">
              <button
                type="button"
                className="admin-bookings-receipt-cancel"
                onClick={closeModal}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
