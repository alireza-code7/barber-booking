import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Api } from "../services/api";
import { toast } from "react-toastify";
import "./AdminTimes.css";

export const AdminTimes = () => {
  const { user, loading: authLoading } = useAuth();

  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTime, setEditingTime] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTimes = times.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(times.length / itemsPerPage);

  const [formData, setFormData] = useState({
    year: "",
    month: "",
    day: "",
    time_start: "",
    time_end: "",
  });

  const years = Array.from({ length: 11 }, (_, i) => 1400 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const hours = Array.from(
    { length: 24 },
    (_, i) => String(i).padStart(2, "0")
  );

  const minutes = ["00", "15", "30", "45"];

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [times]);

  const fetchTimes = async () => {
    try {
      const res = await Api.get("/admin/adminGetTimes.php");

      if (res.data.success) {
        setTimes(res.data.times || []);
      }
    } catch (error) {
      toast.error("❌ خطا در دریافت تایم‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimes();
  }, []);

  const openAddModal = () => {
    setEditingTime(null);

    setFormData({
      year: "",
      month: "",
      day: "",
      time_start: "",
      time_end: "",
    });

    setIsModalOpen(true);
  };

  const openEditModal = (time) => {
    const [year, month, day] = time.date.split("/");

    setEditingTime(time);

    setFormData({
      year: year || "",
      month: month || "",
      day: day || "",
      time_start: time.time_start || "",
      time_end: time.time_end || "",
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTime(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fullDate =
    formData.year && formData.month && formData.day
      ? `${formData.year}/${formData.month}/${formData.day}`
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullDate || !formData.time_start || !formData.time_end) {
      toast.error("❌ همه فیلدها الزامی هستند");
      return;
    }

    const payload = {
      date: fullDate,
      time_start: formData.time_start,
      time_end: formData.time_end,
    };

    try {
      let res;

      if (editingTime) {
        res = await Api.post("/admin/adminUpdateTime.php", {
          id: editingTime.id,
          ...payload,
        });
      } else {
        res = await Api.post("/admin/adminAddTimes.php", payload);
      }

      if (res.data.success) {
        toast.success(
          editingTime ? "✅ تایم ویرایش شد" : "✅ تایم اضافه شد"
        );

        closeModal();
        fetchTimes();
      } else {
        toast.error("❌ " + res.data.message);
      }
    } catch (error) {
      toast.error("❌ خطا در ارتباط با سرور");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این تایم مطمئن هستید؟")) return;

    try {
      const res = await Api.post("/admin/adminDeleteTime.php", { id });

if (res.data.success) {
        toast.success("✅ تایم حذف شد");
        fetchTimes();
      } else {
        toast.error("❌ " + res.data.message);
      }
    } catch (error) {
      toast.error("❌ خطا در حذف تایم");
    }
  };

  const totalTimes = times.length;
  const bookedTimes = times.filter((time) => Number(time.is_booked) === 1).length;
  const freeTimes = totalTimes - bookedTimes;

  if (authLoading) {
    return (
      <div className="admin-times-loading">
        <div className="admin-times-loading-icon">
          <i className="fas fa-hourglass-half"></i>
        </div>

        <span>در حال بررسی دسترسی...</span>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="admin-times-loading">
        <div className="admin-times-loading-icon">
          <i className="fas fa-spinner fa-spin"></i>
        </div>

        <span>در حال بارگذاری تایم‌ها...</span>
      </div>
    );
  }

  return (
    <div className="admin-times">

      {/* Header */}
      <header className="admin-times-header">
        <div className="admin-times-header-content">
          <div className="admin-times-header-title">
            <div className="admin-times-header-icon">
              <i className="fas fa-clock"></i>
            </div>

            <div>
              <h1>مدیریت تایم‌ها</h1>
              <p>
                زمان‌های قابل رزرو آرایشگاه را مدیریت و تنظیم کنید
              </p>
            </div>
          </div>

          <button
            type="button"
            className="admin-times-add-button"
            onClick={openAddModal}
          >
            <i className="fas fa-plus"></i>
            <span>تایم جدید</span>
          </button>
        </div>
      </header>

      {/* Summary */}
      <section className="admin-times-summary">

        <div className="admin-times-summary-card">
          <div className="admin-times-summary-icon admin-times-summary-icon-total">
            <i className="fas fa-calendar-alt"></i>
          </div>

          <div className="admin-times-summary-content">
            <span>کل تایم‌ها</span>
            <strong>{totalTimes}</strong>
          </div>

          <div className="admin-times-summary-arrow">
            <i className="fas fa-layer-group"></i>
          </div>
        </div>

        <div className="admin-times-summary-card">
          <div className="admin-times-summary-icon admin-times-summary-icon-free">
            <i className="fas fa-check"></i>
          </div>

          <div className="admin-times-summary-content">
            <span>تایم‌های خالی</span>
            <strong>{freeTimes}</strong>
          </div>

          <div className="admin-times-summary-arrow">
            <i className="fas fa-unlock"></i>
          </div>
        </div>

        <div className="admin-times-summary-card">
          <div className="admin-times-summary-icon admin-times-summary-icon-booked">
            <i className="fas fa-calendar-check"></i>
          </div>

          <div className="admin-times-summary-content">
            <span>رزرو شده</span>
            <strong>{bookedTimes}</strong>
          </div>

          <div className="admin-times-summary-arrow">
            <i className="fas fa-lock"></i>
          </div>
        </div>

      </section>

      {/* Desktop Table */}
      <section className="admin-times-desktop">
        <div className="admin-times-table-wrapper">

          <div className="admin-times-table-heading">
            <div>
              <h2>لیست تایم‌ها</h2>
              <span>
                {totalTimes} تایم ثبت شده
              </span>
            </div>

            <div className="admin-times-table-heading-icon">
              <i className="fas fa-list-ul"></i>
            </div>
          </div>

<div className="admin-times-table-scroll">
            <table className="admin-times-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>تاریخ</th>
                  <th>ساعت شروع</th>
                  <th>ساعت پایان</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>

              <tbody>
                {currentTimes.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="admin-times-empty">
                        <div className="admin-times-empty-icon">
                          <i className="fas fa-clock"></i>
                        </div>

                        <strong>هیچ تایمی ثبت نشده است</strong>

                        <span>
                          برای ایجاد اولین تایم، روی دکمه «تایم جدید» کلیک کنید.
                        </span>

                        <button
                          type="button"
                          onClick={openAddModal}
                          className="admin-times-empty-button"
                        >
                          <i className="fas fa-plus"></i>
                          ایجاد تایم
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentTimes.map((time, index) => {
                    const isBooked = Number(time.is_booked) === 1;

                    return (
                      <tr key={time.id}>

                        <td>
                          <span className="admin-times-index">
                            #{String(indexOfFirst + index + 1).padStart(2, "0")}
                          </span>
                        </td>

                        <td>
                          <div className="admin-times-date">
                            <div className="admin-times-date-icon">
                              <i className="fas fa-calendar-day"></i>
                            </div>

                            <span>{time.date}</span>
                          </div>
                        </td>

                        <td>
                          <div className="admin-times-clock">
                            <i className="fas fa-play"></i>
                            <span>{time.time_start}</span>
                          </div>
                        </td>

                        <td>
                          <div className="admin-times-clock admin-times-clock-end">
                            <i className="fas fa-flag-checkered"></i>
                            <span>{time.time_end}</span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`admin-times-status ${
                              isBooked ? "admin-times-status-booked" : "admin-times-status-free"
                            }`}
                          >
                            <span className="admin-times-status-dot"></span>

                            {isBooked ? "رزرو شده" : "خالی"}
                          </span>
                        </td>

                        <td>
                          <div className="admin-times-actions">

                            <button
                              type="button"
                              className="admin-times-action admin-times-action-edit"
                              onClick={() => openEditModal(time)}
                              disabled={isBooked}
                              title={isBooked ? "این تایم رزرو شده است" : "ویرایش تایم"}
                            >
                              <i className="fas fa-pen"></i>
                            </button>

<button
                              type="button"
                              className="admin-times-action admin-times-action-delete"
                              onClick={() => handleDelete(time.id)}
                              disabled={isBooked}
                              title={isBooked ? "این تایم رزرو شده است" : "حذف تایم"}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>

                          </div>
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

      {/* Mobile Cards */}
      <section className="admin-times-mobile">

        {currentTimes.length === 0 ? (
          <div className="admin-times-empty admin-times-empty-mobile">
            <div className="admin-times-empty-icon">
              <i className="fas fa-clock"></i>
            </div>

            <strong>هیچ تایمی ثبت نشده است</strong>

            <span>
              برای ایجاد اولین تایم، روی دکمه «تایم جدید» کلیک کنید.
            </span>

            <button
              type="button"
              onClick={openAddModal}
              className="admin-times-empty-button"
            >
              <i className="fas fa-plus"></i>
              ایجاد تایم
            </button>
          </div>
        ) : (
          currentTimes.map((time, index) => {
            const isBooked = Number(time.is_booked) === 1;

            return (
              <article
                key={time.id}
                className="admin-times-card"
              >

                <div className="admin-times-card-top">

                  <span className="admin-times-card-number">
                    #{String(indexOfFirst + index + 1).padStart(2, "0")}
                  </span>

                  <span
                    className={`admin-times-status ${
                      isBooked
                        ? "admin-times-status-booked"
                        : "admin-times-status-free"
                    }`}
                  >
                    <span className="admin-times-status-dot"></span>
                    {isBooked ? "رزرو شده" : "خالی"}
                  </span>

                </div>

                <div className="admin-times-card-main">

                  <div className="admin-times-card-date">
                    <div className="admin-times-card-icon">
                      <i className="fas fa-calendar-day"></i>
                    </div>

                    <div>
                      <span>تاریخ</span>
                      <strong>{time.date}</strong>
                    </div>
                  </div>

                  <div className="admin-times-card-time">
                    <div className="admin-times-card-time-item">
                      <span>پایان</span>
                      <strong>{time.time_end}</strong>
                    </div>

                    <div className="admin-times-card-time-line">
                      <i className="fas fa-arrow-left"></i>
                    </div>

                    
                    <div className="admin-times-card-time-item">
                      <span>شروع</span>
                      <strong>{time.time_start}</strong>
                    </div>
                  </div>

                </div>

                <div className="admin-times-card-actions">

                  <button
                    type="button"
                    className="admin-times-card-button admin-times-card-edit"
                    onClick={() => openEditModal(time)}
                    disabled={isBooked}
                  >
                    <i className="fas fa-pen"></i>
                    <span>ویرایش</span>
                  </button>

<button
                    type="button"
                    className="admin-times-card-button admin-times-card-delete"
                    onClick={() => handleDelete(time.id)}
                    disabled={isBooked}
                  >
                    <i className="fas fa-trash-alt"></i>
                    <span>حذف</span>
                  </button>

                </div>

              </article>
            );
          })
        )}

      </section>

      {/* Pagination */}
      {times.length > itemsPerPage && (
        <div className="admin-times-pagination">

          <button
            type="button"
            className="admin-times-page-button"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-right"></i>
            <span>قبلی</span>
          </button>

          <div className="admin-times-page-info">
            <span>صفحه</span>
            <strong>{currentPage}</strong>
            <span>از</span>
            <strong>{totalPages}</strong>
          </div>

          <button
            type="button"
            className="admin-times-page-button"
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            <span>بعدی</span>
            <i className="fas fa-chevron-left"></i>
          </button>

        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="admin-times-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="admin-times-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="admin-times-modal-header">

              <div className="admin-times-modal-title">
                <div className="admin-times-modal-icon">
                  <i
                    className={`fas ${
                      editingTime ? "fa-pen" : "fa-plus"
                    }`}
                  ></i>
                </div>

                <div>
                  <h3>
                    {editingTime ? "ویرایش تایم" : "تایم جدید"}
                  </h3>

                  <span>
                    {editingTime
                      ? "اطلاعات تایم را ویرایش کنید"
                      : "یک زمان جدید برای رزرو ایجاد کنید"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="admin-times-modal-close"
                onClick={closeModal}
                aria-label="بستن"
              >
                <i className="fas fa-times"></i>
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="admin-times-modal-form"
            >

              <div className="admin-times-form-group">
                <label>
                  <i className="fas fa-calendar-alt"></i>
                  تاریخ
                  <small>(شمسی)</small>
                </label>

                <div className="admin-times-date-selects">

                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  >
                    <option value="">سال</option>

                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    required
                  >
                    <option value="">ماه</option>

                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>

<select
                    name="day"
                    value={formData.day}
                    onChange={handleChange}
                    required
                  >
                    <option value="">روز</option>

                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>

                </div>
              </div>

              <div className="admin-times-form-group">
                <label>
                  <i className="fas fa-play"></i>
                  ساعت شروع
                </label>

                <div className="admin-times-time-select">

                  <select
                    name="time_start"
                    value={formData.time_start}
                    onChange={handleChange}
                    required
                  >
                    <option value="">انتخاب ساعت شروع</option>

                    {hours.map((hour) => (
                      <optgroup
                        key={hour}
                        label={`${hour}:۰۰`}
                      >
                        {minutes.map((minute) => (
                          <option
                            key={`${hour}:${minute}`}
                            value={`${hour}:${minute}:00`}
                          >
                            {hour}:{minute}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                </div>
              </div>

              <div className="admin-times-form-group">
                <label>
                  <i className="fas fa-flag-checkered"></i>
                  ساعت پایان
                </label>

                <div className="admin-times-time-select">

                  <select
                    name="time_end"
                    value={formData.time_end}
                    onChange={handleChange}
                    required
                  >
                    <option value="">انتخاب ساعت پایان</option>

                    {hours.map((hour) => (
                      <optgroup
                        key={hour}
                        label={`${hour}:۰۰`}
                      >
                        {minutes.map((minute) => (
                          <option
                            key={`${hour}:${minute}`}
                            value={`${hour}:${minute}:00`}
                          >
                            {hour}:{minute}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                </div>
              </div>

              <div className="admin-times-modal-actions">

                <button
                  type="button"
                  className="admin-times-modal-cancel"
                  onClick={closeModal}
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  className="admin-times-modal-submit"
                >
                  <i
                    className={`fas ${
                      editingTime ? "fa-check" : "fa-plus"
                    }`}
                  ></i>

                  {editingTime ? "ذخیره تغییرات" : "افزودن تایم"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};