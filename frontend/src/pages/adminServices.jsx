import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Api } from "../services/api";
import { toast } from "react-toastify";
import "./AdminServices.css";

// ============================
// لیست آیکون‌های آماده
// ============================
const iconList = [
  { value: "fas fa-cut", label: "قیچی" },
  { value: "fas fa-palette", label: "پالت" },
  { value: "fas fa-spa", label: "اسپا" },
  { value: "fas fa-gem", label: "الماس" },
  { value: "fas fa-scissors", label: "قیچی بزرگ" },
  { value: "fas fa-crown", label: "تاج" },
  { value: "fas fa-star", label: "ستاره" },
  { value: "fas fa-fire", label: "آتش" },
  { value: "fas fa-bolt", label: "برق" },
  { value: "fas fa-leaf", label: "برگ" },
  { value: "fas fa-heart", label: "قلب" },
  { value: "fas fa-magic", label: "جادو" },
  { value: "fas fa-cog", label: "چرخ‌دنده" },
  { value: "fas fa-award", label: "جایزه" },
  { value: "fas fa-trophy", label: "جام" },
  { value: "fas fa-feather", label: "پر" },
  { value: "fas fa-droplet", label: "قطره" },
  { value: "fas fa-sun", label: "خورشید" },
  { value: "fas fa-moon", label: "ماه" },
  { value: "fas fa-cloud", label: "ابر" },
];

export const AdminServices = () => {
  const { user, loading: authLoading } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    icon_class: "fas fa-cut",
    is_active: 1,
  });

  // ============================
  // دریافت لیست سرویس‌ها
  // ============================
  const fetchServices = async () => {
    try {
      const res = await Api.get("/admin/adminGetServices.php");

      if (res.data.success) {
        setServices(res.data.services);
      }
    } catch (error) {
      toast.error("❌ خطا در دریافت سرویس‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // ============================
  // جلوگیری از اسکرول هنگام باز بودن مودال
  // ============================
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  // ============================
  // باز کردن مودال اضافه کردن
  // ============================
  const openAddModal = () => {
    setEditingService(null);

    setFormData({
      title: "",
      description: "",
      price: "",
      icon_class: "fas fa-cut",
      is_active: 1,
    });

    setIsModalOpen(true);
  };

  // ============================
  // باز کردن مودال ویرایش
  // ============================
  const openEditModal = (service) => {
    setEditingService(service);

    setFormData({
      title: service.title || "",
      description: service.description || "",
      price: service.price || "",
      icon_class: service.icon || "fas fa-cut",
      is_active:
        service.is_active !== undefined ? service.is_active : 1,
    });

    setIsModalOpen(true);
  };

  // ============================
  // بستن مودال
  // ============================
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  // ============================
  // تغییر فیلدهای فرم
  // ============================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  // ============================
  // انتخاب آیکون
  // ============================
  const selectIcon = (iconValue) => {
    setFormData((prev) => ({
      ...prev,
      icon_class: iconValue,
    }));
  };

  // ============================
  // ارسال فرم
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

const payload = {
      ...formData,
      price: parseInt(formData.price) || 0,
    };

    try {
      let res;

      if (editingService) {
        res = await Api.post("/admin/adminUpdateServices.php", {
          ...payload,
          id: editingService.id,
        });
      } else {
        res = await Api.post("/admin/adminAddServices.php", payload);
      }

      if (res.data.success) {
        toast.success(
          editingService
            ? "✅ سرویس ویرایش شد"
            : "✅ سرویس اضافه شد"
        );

        closeModal();
        fetchServices();
      } else {
        toast.error("❌ " + res.data.message);
      }
    } catch (error) {
      toast.error("❌ خطا در ارتباط با سرور");
    }
  };

  // ============================
  // حذف سرویس
  // ============================
  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این سرویس مطمئن هستید؟")) {
      return;
    }

    try {
      const res = await Api.post(
        "/admin/adminDeleteServices.php",
        { id }
      );

      if (res.data.success) {
        toast.success("✅ سرویس حذف شد");
        fetchServices();
      } else {
        toast.error("❌ " + res.data.message);
      }
    } catch (error) {
      toast.error("❌ خطا در حذف سرویس");
    }
  };

  // ============================
  // محافظت از صفحه
  // ============================
  if (authLoading) {
    return (
      <div className="admin-services-loading">
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
      <div className="admin-services-loading">
        <i className="fas fa-spinner"></i>
        <span>در حال بارگذاری...</span>
      </div>
    );
  }

  const activeServices = services.filter(
    (service) => Number(service.is_active) === 1
  ).length;

  const inactiveServices = services.length - activeServices;

  return (
    <div className="admin-services">

      {/* ============================
          Page Header
      ============================ */}
      <header className="admin-services-header">

        <div className="admin-services-header-content">
          <div className="admin-services-title-icon">
            <i className="fas fa-tags"></i>
          </div>

          <div className="admin-services-title-content">
            <span className="admin-services-eyebrow">
              مدیریت خدمات
            </span>

            <h1>سرویس‌های آرایشگاه</h1>

            <p>
              سرویس‌ها، قیمت‌ها و وضعیت خدمات قابل رزرو را مدیریت کنید.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="admin-services-add-button"
          onClick={openAddModal}
        >
          <span className="admin-services-add-icon">
            <i className="fas fa-plus"></i>
          </span>

          <span>سرویس جدید</span>
        </button>

      </header>

      {/* ============================
          Summary
      ============================ */}
      <section className="admin-services-summary">

        <div className="admin-services-summary-card">
          <div className="admin-services-summary-icon">
            <i className="fas fa-layer-group"></i>
          </div>

          <div className="admin-services-summary-content">
            <span>کل سرویس‌ها</span>
            <strong>{services.length}</strong>
          </div>
        </div>

        <div className="admin-services-summary-card admin-services-summary-card-active">
          <div className="admin-services-summary-icon">
            <i className="fas fa-check"></i>
          </div>

          <div className="admin-services-summary-content">
            <span>سرویس‌های فعال</span>
            <strong>{activeServices}</strong>
          </div>
        </div>

<div className="admin-services-summary-card admin-services-summary-card-inactive">
          <div className="admin-services-summary-icon">
            <i className="fas fa-pause"></i>
          </div>

          <div className="admin-services-summary-content">
            <span>سرویس‌های غیرفعال</span>
            <strong>{inactiveServices}</strong>
          </div>
        </div>

      </section>

      {/* ============================
          Desktop Table
      ============================ */}
      <section className="admin-services-table-section">

        <div className="admin-services-section-heading">
          <div className="admin-services-section-title">
            <div className="admin-services-section-title-icon">
              <i className="fas fa-list"></i>
            </div>

            <div>
              <h2>لیست سرویس‌ها</h2>
              <p>
                تمام سرویس‌های تعریف‌شده در سیستم
              </p>
            </div>
          </div>

          <span className="admin-services-count">
            {services.length} سرویس
          </span>
        </div>

        <div className="admin-services-table-card">

          <div className="admin-services-table-scroll">

            <table className="admin-services-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>سرویس</th>
                  <th>توضیحات</th>
                  <th>قیمت</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>

              <tbody>

                {services.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="admin-services-empty-state"
                    >
                      <div className="admin-services-empty-icon">
                        <i className="fas fa-tags"></i>
                      </div>

                      <strong>
                        هنوز سرویسی ثبت نشده است
                      </strong>

                      <span>
                        برای شروع، اولین سرویس آرایشگاه را اضافه کنید.
                      </span>
                    </td>
                  </tr>
                ) : (
                  services.map((service, index) => (
                    <tr key={service.id}>

                      <td>
                        <span className="admin-services-row-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </td>

                      <td>
                        <div className="admin-services-service-info">

                          <div className="admin-services-service-icon">
                            <i
                              className={
                                service.icon || "fas fa-cut"
                              }
                            ></i>
                          </div>

                          <div className="admin-services-service-name">
                            <strong>{service.title}</strong>
                            <span>
                              سرویس #{index + 1}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        <div className="admin-services-description">
                          {service.description || "-"}
                        </div>
                      </td>

                      <td>
                        <div className="admin-services-price">
                          <strong>
                            {service.price.toLocaleString()}
                          </strong>
                          <span>تومان</span>
                        </div>
                      </td>

<td>
                        <span
                          className={`admin-services-status ${
                            service.is_active
                              ? "admin-services-status-active"
                              : "admin-services-status-inactive"
                          }`}
                        >
                          <i
                            className={
                              service.is_active
                                ? "fas fa-check"
                                : "fas fa-pause"
                            }
                          ></i>

                          {service.is_active
                            ? "فعال"
                            : "غیرفعال"}
                        </span>
                      </td>

                      <td>
                        <div className="admin-services-actions">

                          <button
                            type="button"
                            className="admin-services-action-button admin-services-action-edit"
                            onClick={() =>
                              openEditModal(service)
                            }
                            aria-label="ویرایش سرویس"
                          >
                            <i className="fas fa-edit"></i>
                          </button>

                          <button
                            type="button"
                            className="admin-services-action-button admin-services-action-delete"
                            onClick={() =>
                              handleDelete(service.id)
                            }
                            aria-label="حذف سرویس"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>

      {/* ============================
          Mobile Cards
      ============================ */}
      <section className="admin-services-mobile-list">

        <div className="admin-services-section-heading admin-services-mobile-heading">
          <div className="admin-services-section-title">
            <div className="admin-services-section-title-icon">
              <i className="fas fa-list"></i>
            </div>

            <div>
              <h2>لیست سرویس‌ها</h2>
              <p>{services.length} سرویس ثبت شده</p>
            </div>
          </div>
        </div>

        {services.length === 0 ? (
          <div className="admin-services-mobile-empty">
            <div className="admin-services-empty-icon">
              <i className="fas fa-tags"></i>
            </div>

            <strong>
              هنوز سرویسی ثبت نشده است
            </strong>

            <span>
              اولین سرویس را اضافه کنید.
            </span>
          </div>
        ) : (
          <div className="admin-services-mobile-cards">

            {services.map((service, index) => (
              <article
                className="admin-services-mobile-card"
                key={service.id}
              >

                <div className="admin-services-mobile-card-top">

                  <div className="admin-services-service-info">

                    <div className="admin-services-service-icon">
                      <i
                        className={
                          service.icon || "fas fa-cut"
                        }
                      ></i>
                    </div>

                    <div className="admin-services-service-name">
                      <strong>{service.title}</strong>
                      <span>
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                  </div>

<span
                    className={`admin-services-status ${
                      service.is_active
                        ? "admin-services-status-active"
                        : "admin-services-status-inactive"
                    }`}
                  >
                    <i
                      className={
                        service.is_active
                          ? "fas fa-check"
                          : "fas fa-pause"
                      }
                    ></i>

                    {service.is_active
                      ? "فعال"
                      : "غیرفعال"}
                  </span>

                </div>

                <div className="admin-services-mobile-divider"></div>

                <div className="admin-services-mobile-description">
                  <span className="admin-services-mobile-label">
                    توضیحات
                  </span>

                  <p>
                    {service.description || "-"}
                  </p>
                </div>

                <div className="admin-services-mobile-bottom">

                  <div className="admin-services-mobile-price">
                    <span>قیمت</span>

                    <strong>
                      {service.price.toLocaleString()}
                    </strong>

                    <small>تومان</small>
                  </div>

                  <div className="admin-services-actions">

                    <button
                      type="button"
                      className="admin-services-action-button admin-services-action-edit"
                      onClick={() =>
                        openEditModal(service)
                      }
                      aria-label="ویرایش سرویس"
                    >
                      <i className="fas fa-edit"></i>
                    </button>

                    <button
                      type="button"
                      className="admin-services-action-button admin-services-action-delete"
                      onClick={() =>
                        handleDelete(service.id)
                      }
                      aria-label="حذف سرویس"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

      {/* ============================
          Modal
      ============================ */}
      {isModalOpen && (
        <div
          className="admin-services-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="admin-services-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="admin-services-modal-header">

              <div className="admin-services-modal-title">

                <div className="admin-services-modal-title-icon">
                  <i
                    className={
                      editingService
                        ? "fas fa-edit"
                        : "fas fa-plus"
                    }
                  ></i>
                </div>

                <div>
                  <span>
                    {editingService
                      ? "ویرایش اطلاعات"
                      : "سرویس جدید"}
                  </span>

                  <h2>
                    {editingService
                      ? "ویرایش سرویس"
                      : "افزودن سرویس"}
                  </h2>
                </div>

              </div>

              <button
                type="button"
                className="admin-services-modal-close"
                onClick={closeModal}
                aria-label="بستن"
              >
                <i className="fas fa-times"></i>
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="admin-services-form"
            >

              <div className="admin-services-form-grid">

{/* عنوان */}
                <div className="admin-services-form-group">

                  <label htmlFor="admin-services-title">
                    عنوان سرویس
                  </label>

                  <div className="admin-services-input-wrapper">
                    <i className="fas fa-tag"></i>

                    <input
                      id="admin-services-title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="مثلاً کوتاهی مردانه"
                      required
                    />
                  </div>

                </div>

                {/* قیمت */}
                <div className="admin-services-form-group">

                  <label htmlFor="admin-services-price">
                    قیمت
                  </label>

                  <div className="admin-services-input-wrapper">
                    <i className="fas fa-coins"></i>

                    <input
                      id="admin-services-price"
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="150000"
                      required
                    />

                    <span className="admin-services-input-suffix">
                      تومان
                    </span>
                  </div>

                </div>

                {/* توضیحات */}
                <div className="admin-services-form-group admin-services-form-group-full">

                  <label htmlFor="admin-services-description">
                    توضیحات
                  </label>

                  <div className="admin-services-textarea-wrapper">

                    <textarea
                      id="admin-services-description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="توضیحات کوتاهی درباره این سرویس..."
                    />

                  </div>

                </div>

                {/* آیکون */}
                <div className="admin-services-form-group admin-services-form-group-full">

                  <div className="admin-services-icon-label-row">
                    <label>
                      انتخاب آیکون
                    </label>

                    <span>
                      {iconList.length} آیکون
                    </span>
                  </div>

                  <div className="admin-services-icon-grid">

                    {iconList.map((icon) => {
                      const isSelected =
                        formData.icon_class === icon.value;

                      return (
                        <button
                          type="button"
                          key={icon.value}
                          className={`admin-services-icon-card ${
                            isSelected
                              ? "admin-services-icon-card-selected"
                              : ""
                          }`}
                          onClick={() =>
                            selectIcon(icon.value)
                          }
                        >
                          <i className={icon.value}></i>
                          <span>{icon.label}</span>

                          {isSelected && (
                            <span className="admin-services-icon-check">
                              <i className="fas fa-check"></i>
                            </span>
                          )}
                        </button>
                      );
                    })}

                  </div>

                  <div className="admin-services-selected-icon">

                    <span>
                      آیکون انتخاب‌شده
                    </span>

<div>
                      <i className={formData.icon_class}></i>
                      <code>{formData.icon_class}</code>
                    </div>

                  </div>

                </div>

                {/* فعال بودن */}
                <div className="admin-services-form-group admin-services-form-group-full">

                  <label className="admin-services-checkbox">

                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active === 1}
                      onChange={handleChange}
                    />

                    <span className="admin-services-checkbox-box">
                      <i className="fas fa-check"></i>
                    </span>

                    <span className="admin-services-checkbox-content">
                      <strong>سرویس فعال باشد</strong>
                      <small>
                        کاربران می‌توانند این سرویس را هنگام رزرو انتخاب کنند.
                      </small>
                    </span>

                  </label>

                </div>

              </div>

              {/* Modal Actions */}
              <div className="admin-services-modal-actions">

                <button
                  type="button"
                  className="admin-services-cancel-button"
                  onClick={closeModal}
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  className="admin-services-save-button"
                >
                  <i
                    className={
                      editingService
                        ? "fas fa-check"
                        : "fas fa-plus"
                    }
                  ></i>

                  <span>
                    {editingService
                      ? "ذخیره تغییرات"
                      : "ثبت سرویس"}
                  </span>
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};