import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Api } from "../services/api";
import { toast } from "react-toastify";
import "./AdminGallery.css";

export const AdminGallery = () => {
  const { user, loading: authLoading } = useAuth();

  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    image: null,
    is_active: 1,
  });

  const [preview, setPreview] = useState(null);

  // ============================
  // دریافت لیست گالری
  // ============================
  const fetchGallery = async () => {
    try {
      const res = await Api.get("/admin/adminGetGallery.php");

      if (res.data.success) {
        setGallery(res.data.gallery);
      }
    } catch (error) {
      toast.error("❌ خطا در دریافت گالری");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // ============================
  // باز کردن مودال افزودن
  // ============================
  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      image: null,
      is_active: 1,
    });
    setPreview(null);
    setIsModalOpen(true);
  };

  // ============================
  // باز کردن مودال ویرایش
  // ============================
  const openEditModal = (item) => {
    setEditingItem(item);

    setFormData({
      title: item.title || "",
      image: null,
      is_active: item.is_active !== undefined ? item.is_active : 1,
    });

    setPreview(null);
    setIsModalOpen(true);
  };

  // ============================
  // بستن مودال
  // ============================
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setPreview(null);
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
  // تغییر عکس
  // ============================
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      setPreview(URL.createObjectURL(file));
    }
  };

  // ============================
  // ارسال فرم
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("❌ عنوان الزامی است");
      return;
    }

    if (!editingItem && !formData.image) {
      toast.error("❌ لطفاً یک عکس انتخاب کنید");
      return;
    }

    const form = new FormData();

    form.append("title", formData.title);
    form.append("is_active", formData.is_active);

    if (formData.image) {
      form.append("image", formData.image);
    }

    if (editingItem) {
      form.append("id", editingItem.id);
    }

    try {
      let res;

      if (editingItem) {
        res = await Api.post(
          "/admin/adminUpdateGallery.php",
          form,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        res = await Api.post(
          "/admin/adminAddGallery.php",
          form,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (res.data.success) {
        toast.success(
          editingItem
            ? "✅ گالری ویرایش شد"
            : "✅ گالری اضافه شد"
        );

        closeModal();
        fetchGallery();
      } else {
        toast.error("❌ " + res.data.message);
      }
    } catch (error) {
      toast.error("❌ خطا در ارتباط با سرور");
    }
  };

  // ============================
  // تغییر وضعیت
  // ============================
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus ? 0 : 1;

    try {
      const res = await Api.post(
        "/admin/adminToggleGallery.php",
        {
          id,
          is_active: newStatus,
        }
      );

      if (res.data.success) {
        toast.success(
          newStatus
            ? "✅ گالری فعال شد"
            : "⛔ گالری غیرفعال شد"
        );

        fetchGallery();
      } else {
        toast.error("❌ " + res.data.message);
      }
    } catch (error) {
      toast.error("❌ خطا در ارتباط با سرور");
    }
  };

  // ============================
  // حذف گالری
  // ============================
  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این گالری مطمئن هستید؟")) {
      return;
    }

    try {
      const res = await Api.post(
        "/admin/adminDeleteGallery.php",
        { id }
      );

      if (res.data.success) {
        toast.success("✅ گالری حذف شد");
        fetchGallery();
      } else {
        toast.error("❌ " + res.data.message);
      }
    } catch (error) {
      toast.error("❌ خطا در حذف گالری");
    }
  };

  // ============================
  // محافظت از صفحه
  // ============================
  if (authLoading) {
    return (
      <div className="admin-gallery-loading">
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
      <div className="admin-gallery-loading">
        <i className="fas fa-hourglass-half"></i>
        <span>در حال بارگذاری...</span>
      </div>
    );
  }

  const uploadUrl = "https://barber.site.je/api/images";

  return (
    <div className="admin-gallery-page">

      {/* ============================
          هدر صفحه
          ============================ */}
      <header className="admin-gallery-page-header">

        <div className="admin-gallery-heading">
          <div className="admin-gallery-heading-icon">
            <i className="fas fa-images"></i>
          </div>

          <div>
            <h1>مدیریت گالری</h1>
            <p>
              نمونه‌کارها و تصاویر آرایشگاه را مدیریت کنید
            </p>
          </div>
        </div>

        <button
          type="button"
          className="admin-gallery-add-button"
          onClick={openAddModal}
        >
          <i className="fas fa-plus"></i>
          <span>عکس جدید</span>
        </button>

      </header>

      {/* ============================
          آمار
          ============================ */}
      <section className="admin-gallery-stats">

        <div className="admin-gallery-stat-card">
          <div className="admin-gallery-stat-icon">
            <i className="fas fa-images"></i>
          </div>

          <div className="admin-gallery-stat-content">
            <span>کل تصاویر</span>
            <strong>{gallery.length}</strong>
          </div>
        </div>

        <div className="admin-gallery-stat-card">
          <div className="admin-gallery-stat-icon admin-gallery-stat-icon-active">
            <i className="fas fa-eye"></i>
          </div>

          <div className="admin-gallery-stat-content">
            <span>تصاویر فعال</span>
            <strong>
              {gallery.filter(
                (item) => Number(item.is_active) === 1
              ).length}
            </strong>
          </div>
        </div>

        <div className="admin-gallery-stat-card">
          <div className="admin-gallery-stat-icon admin-gallery-stat-icon-hidden">
            <i className="fas fa-eye-slash"></i>
          </div>

          <div className="admin-gallery-stat-content">
            <span>غیرفعال</span>
            <strong>
              {gallery.filter(
                (item) => Number(item.is_active) !== 1
              ).length}
            </strong>
          </div>
        </div>

      </section>

      {/* ============================
          دسکتاپ
          ============================ */}
      <section className="admin-gallery-table-section">

        <div className="admin-gallery-section-header">
          <div>
            <h2>نمونه‌کارها</h2>
            <p>
              تصاویر نمایش داده شده در بخش گالری سایت
            </p>
          </div>

          <span className="admin-gallery-count-label">
            {gallery.length} تصویر
          </span>
        </div>

        <div className="admin-gallery-table-scroll">

          <table className="admin-gallery-table">

            <thead>
              <tr>
                <th>#</th>
                <th>تصویر</th>
                <th>عنوان</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>

            <tbody>

              {gallery.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="admin-gallery-empty-table"
                  >
                    <i className="fas fa-images"></i>
                    <span>هیچ تصویری در گالری وجود ندارد</span>
                  </td>
                </tr>
              ) : (
                gallery.map((item, index) => (

                  <tr key={item.id}>

                    <td>
                      <span className="admin-gallery-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </td>

                    <td>
                      <div className="admin-gallery-table-image">
                        <img
                          src={`${uploadUrl}/${item.url}`}
                          alt={item.title}
                          onError={(e) => {
                            e.target.src =
                              "/assets/images/no-image.png";
                          }}
                        />
                      </div>
                    </td>

                    <td>
                      <span className="admin-gallery-table-title">
                        {item.title}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-gallery-status ${
                          item.is_active
                            ? "admin-gallery-status-active"
                            : "admin-gallery-status-inactive"
                        }`}
                      >
                        <span className="admin-gallery-status-dot"></span>
                        {item.is_active ? "فعال" : "غیرفعال"}
                      </span>
                    </td>

                    <td>
                      <div className="admin-gallery-actions">

                        <button
                          type="button"
                          className="admin-gallery-action-button admin-gallery-action-toggle"
                          onClick={() =>
                            toggleStatus(
                              item.id,
                              item.is_active
                            )
                          }
                          title={
                            item.is_active
                              ? "غیرفعال کردن"
                              : "فعال کردن"
                          }
                        >
                          <i
                            className={`fas ${
                              item.is_active
                                ? "fa-eye-slash"
                                : "fa-eye"
                            }`}
                          ></i>
                        </button>

                        <button
                          type="button"
                          className="admin-gallery-action-button admin-gallery-action-edit"
                          onClick={() =>
                            openEditModal(item)
                          }
                          title="ویرایش"
                        >
                          <i className="fas fa-pen"></i>
                        </button>

                        <button
                          type="button"
                          className="admin-gallery-action-button admin-gallery-action-delete"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          title="حذف"
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

      </section>

      {/* ============================
          موبایل / تبلت
          ============================ */}
      <section className="admin-gallery-mobile-list">

        {gallery.length === 0 ? (
          <div className="admin-gallery-mobile-empty">
            <i className="fas fa-images"></i>
            <span>هیچ تصویری در گالری وجود ندارد</span>
          </div>
        ) : (

          gallery.map((item, index) => (

            <article
              key={item.id}
              className="admin-gallery-mobile-card"
            >

              <div className="admin-gallery-mobile-image">
                <img
                  src={`${uploadUrl}/${item.url}`}
                  alt={item.title}
                  onError={(e) => {
                    e.target.src =
                      "/assets/images/no-image.png";
                  }}
                />

                <span className="admin-gallery-mobile-index">
                  #{String(index + 1).padStart(2, "0")}
                </span>

              </div>

              <div className="admin-gallery-mobile-content">

                <div className="admin-gallery-mobile-top">

                  <h3>{item.title}</h3>

                  <span
                    className={`admin-gallery-status ${
                      item.is_active
                        ? "admin-gallery-status-active"
                        : "admin-gallery-status-inactive"
                    }`}
                  >
                    <span className="admin-gallery-status-dot"></span>
                    {item.is_active
                      ? "فعال"
                      : "غیرفعال"}
                  </span>

                </div>

                <div className="admin-gallery-mobile-actions">

                  <button
                    type="button"
                    className="admin-gallery-mobile-action admin-gallery-mobile-toggle"
                    onClick={() =>
                      toggleStatus(
                        item.id,
                        item.is_active
                      )
                    }
                  >
                    <i
                      className={`fas ${
                        item.is_active
                          ? "fa-eye-slash"
                          : "fa-eye"
                      }`}
                    ></i>
                    {item.is_active
                      ? "غیرفعال"
                      : "فعال"}
                  </button>

                  <button
                    type="button"
                    className="admin-gallery-mobile-action admin-gallery-mobile-edit"
                    onClick={() =>
                      openEditModal(item)
                    }
                  >
                    <i className="fas fa-pen"></i>
                    ویرایش
                  </button>

                  <button
                    type="button"
                    className="admin-gallery-mobile-action admin-gallery-mobile-delete"
                    onClick={() =>
                      handleDelete(item.id)
                    }
                  >
                    <i className="fas fa-trash-alt"></i>
                    حذف
                  </button>

                </div>

              </div>

            </article>

          ))

        )}

      </section>

      {/* ============================
          مودال
          ============================ */}
      {isModalOpen && (
        <div
          className="admin-gallery-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="admin-gallery-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="admin-gallery-modal-header">

              <div className="admin-gallery-modal-title">

                <div className="admin-gallery-modal-icon">
                  <i
                    className={`fas ${
                      editingItem
                        ? "fa-pen"
                        : "fa-plus"
                    }`}
                  ></i>
                </div>

                <div>
                  <h3>
                    {editingItem
                      ? "ویرایش گالری"
                      : "گالری جدید"}
                  </h3>

                  <span>
                    {editingItem
                      ? "اطلاعات تصویر را ویرایش کنید"
                      : "یک نمونه‌کار جدید اضافه کنید"}
                  </span>
                </div>

              </div>

              <button
                type="button"
                className="admin-gallery-modal-close"
                onClick={closeModal}
              >
                <i className="fas fa-times"></i>
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="admin-gallery-modal-form"
            >

              {/* عنوان */}
              <div className="admin-gallery-form-group">

                <label>
                  عنوان تصویر
                </label>

                <div className="admin-gallery-input-wrap">
                  <i className="fas fa-heading"></i>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="مثلاً مدل موی کلاسیک"
                    required
                  />
                </div>

              </div>

              {/* آپلود تصویر */}
              <div className="admin-gallery-form-group">

                <label>
                  {editingItem
                    ? "تصویر جدید"
                    : "تصویر نمونه‌کار"}
                  {editingItem && (
                    <span> (اختیاری)</span>
                  )}
                </label>

                <label className="admin-gallery-upload-box">

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  <div className="admin-gallery-upload-icon">
                    <i className="fas fa-cloud-upload-alt"></i>
                  </div>

                  <strong>
                    انتخاب تصویر
                  </strong>

                  <span>
                    JPG، PNG یا WEBP
                  </span>

                </label>

                {preview && (
                  <div className="admin-gallery-preview">

                    <img
                      src={preview}
                      alt="پیش‌نمایش"
                    />

                    <span>
                      پیش‌نمایش تصویر جدید
                    </span>

                  </div>
                )}

                {editingItem && !preview && (
                  <div className="admin-gallery-preview">

                    <img
                      src={`${uploadUrl}/${editingItem.url}`}
                      alt="تصویر فعلی"
                      onError={(e) => {
                        e.target.src =
                          "/assets/images/no-image.png";
                      }}
                    />

                    <span>
                      تصویر فعلی
                    </span>

                  </div>
                )}

              </div>

              {/* وضعیت */}
              <label className="admin-gallery-checkbox-row">

                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active === 1}
                  onChange={handleChange}
                />

                <span className="admin-gallery-checkbox-ui">
                  <i className="fas fa-check"></i>
                </span>

                <span className="admin-gallery-checkbox-text">
                  <strong>تصویر فعال باشد</strong>
                  <small>
                    تصویر در گالری عمومی سایت نمایش داده شود
                  </small>
                </span>

              </label>

              {/* دکمه‌ها */}
              <div className="admin-gallery-modal-actions">

                <button
                  type="button"
                  className="admin-gallery-modal-cancel"
                  onClick={closeModal}
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  className="admin-gallery-modal-submit"
                >
                  <i
                    className={`fas ${
                      editingItem
                        ? "fa-save"
                        : "fa-plus"
                    }`}
                  ></i>

                  {editingItem
                    ? "ذخیره تغییرات"
                    : "افزودن تصویر"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};