import { useState, useEffect, useRef } from "react";

import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Api } from "../services/api";
import { useServices } from "../contexts/ServicesContext";
import { toast } from "react-toastify";
import "./rezerv.css";

export const Booking = () => {
  // ============================
  // CONTEXT
  // ============================

  const { services } = useServices();
  const { user, loading: authLoading } = useAuth();

  // ============================
  // STATE
  // ============================

  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const [times, setTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const [selectedServices, setSelectedServices] = useState([]);

  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  const [cardNumber, setCardNumber] = useState("");
  const [nameCard, setNameCard] = useState("");

  const [isSubmit, setIsSubmit] = useState(false);

  const fileInputRef = useRef(null);

  // const upload=document.querySelector("#upload-area");
  // const fileInput = document.querySelector("#file");

  // upload.addEventListener("click",()=>{fileInput.click()})

  // ============================
  // MONTHS
  // ============================

  const month = {
    1: "فروردین",
    2: "اردیبهشت",
    3: "خرداد",
    4: "تیر",
    5: "مرداد",
    6: "شهریور",
    7: "مهر",
    8: "آبان",
    9: "آذر",
    10: "دی",
    11: "بهمن",
    12: "اسفند",
  };

  // ============================
  // GET CARD NUMBER
  // ============================

  useEffect(() => {
    const fetchCardNumber = async () => {
      try {
        const res = await Api.get("/getcardnumber.php");

        if (res.data.status) {
          setCardNumber(res.data.number);
          setNameCard(res.data.name);
        }
      } catch (error) {
        console.error("خطا در دریافت شماره کارت:", error);
      }
    };

    fetchCardNumber();
  }, []);

  // ============================
  // GET AVAILABLE DATES
  // ============================

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const res = await Api.get("/booking/getDates.php");

        if (res.data.success) {
          setAvailableDates(res.data.dates);
        }
      } catch (error) {
        console.error("خطا در دریافت تاریخ‌ها:", error);
      }
    };

    fetchAvailableDates();
  }, []);

  // ============================
  // GET TIMES
  // ============================

  useEffect(() => {
    if (!selectedDate) {
      setTimes([]);
      return;
    }

    const fetchTimes = async () => {
      setLoadingTimes(true);

      try {
        const res = await Api.get(`/booking/getTime.php?date=${selectedDate}`);

        if (res.data.success) {
          setTimes(res.data.times);
        } else {
          setTimes([]);
        }
      } catch (error) {
        console.error("خطا در دریافت تایم‌ها:", error);
        setTimes([]);
      } finally {
        setLoadingTimes(false);
      }
    };

    fetchTimes();
  }, [selectedDate]);

  // ============================
  // SERVICES
  // ============================

  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const totalPrice = services
    .filter((service) => selectedServices.includes(service.id))
    .reduce((sum, service) => sum + Number(service.price), 0);

  // ============================
  // RECEIPT
  // ============================

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل تصویری مجاز است");
      return;
    }

    setReceiptImage(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const removeFile = () => {
    setReceiptImage(null);
    setReceiptPreview(null);
  };
  // ============================
  // SUBMIT
  // ============================

  const handleSend = async (e) => {
    e.preventDefault();

    if (isSubmit) return;

    setIsSubmit(true);

    if (selectedServices.length === 0) {
      toast.error("لطفاً حداقل یک خدمت را انتخاب کنید");
      setIsSubmit(false);
      return;
    }

    if (!selectedDate) {
      toast.error("لطفاً تاریخ مورد نظر را انتخاب کنید");
      setIsSubmit(false);
      return;
    }

    if (!selectedTime) {
      toast.error("لطفاً ساعت نوبت را انتخاب کنید");
      setIsSubmit(false);
      return;
    }

    if (!receiptImage) {
      toast.error("لطفاً تصویر رسید پرداخت را بارگذاری کنید");
      setIsSubmit(false);
      return;
    }

    const formData = new FormData();

    formData.append("date", selectedDate);
    formData.append("time_id", selectedTime);
    formData.append("services", JSON.stringify(selectedServices));
    formData.append("receipt", receiptImage);

    try {
      const res = await Api.post("/booking/submitbooking.php", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.status) {
        toast.success("رزرو شما با موفقیت ثبت شد");

        setSelectedDate("");
        setSelectedTime(null);
        setSelectedServices([]);
        setReceiptImage(null);
        setReceiptPreview(null);
      } else {
        toast.error("خطا: " + res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در ثبت رزرو");
    } finally {
      setIsSubmit(false);
    }
  };

  // ============================
  // AUTH LOADING
  // ============================

  if (authLoading) {
    return <div className="booking-loading">⏳ در حال بررسی...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ============================
  // RENDER
  // ============================

  return (
    <div className="booking-page-wrapper">
      {/* ============================
          PAGE HEADER
      ============================ */}

      <header className="page-header">
        <div className="header-brand">
          <div className="brand-icon">
            <i className="fas fa-cut"></i>
          </div>

          <div className="brand-text">
            <h1>رزرو وقت آنلاین</h1>

            <p>وقت مناسب خود را انتخاب کنید و نوبت خود را ثبت کنید.</p>
          </div>
        </div>

        {/* USER */}

        <div className="user-pill">
          <div className="user-avatar">{user.name?.charAt(0)}</div>

          <div className="user-details">
            <span className="user-name">{user.name}</span>

            <span className="user-phone">{user.phone}</span>
          </div>
        </div>
      </header>

      <form className="booking-layout" onSubmit={handleSend}>
        {/* ============================
            MAIN CONTENT
        ============================ */}

        <main className="main-content">
          {/* ============================
              SERVICES
          ============================ */}

          <section className="section-card">
            <h2 className="booking-section-title">
              <i className="fas fa-cut"></i>

              <span>انتخاب خدمات</span>
            </h2>

            <div className="booking-services-grid" id="services-container">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`booking-service-card ${
                    selectedServices.includes(service.id) ? "selected" : ""
                  }`}
                  onClick={() => toggleService(service.id)}
                >
                  <div className="service-info">
                    <div className="service-name">{service.title}</div>
                  </div>

                  <div className="booking-service-desc">
                    <div className="checkbox-indicator">
                      <i className="fas fa-check"></i>
                    </div>
                    <p>{service.description || ""}</p>

                    <div className="service-price">
                      {Number(service.price).toLocaleString("fa-IR")} تومان
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedServices.length === 0 && (
              <div className="validation-msg">
                <i className="fas fa-exclamation-circle"></i>

                <span>لطفاً حداقل یک خدمت را انتخاب کنید.</span>
              </div>
            )}
          </section>

          {/* ============================
              DATE
          ============================ */}

          <section className="section-card">
            <h2 className="booking-section-title">
              <i className="fas fa-calendar-alt"></i>

              <span>انتخاب تاریخ</span>
            </h2>

            <div className="dates-scroll-wrapper" id="dates-container">
              {availableDates.map((date) => {
                const parts = date.split("/");

                return (
                  <div
                    key={date}
                    className={`date-card ${
                      selectedDate === date ? "selected" : ""
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="date-day">{parts[2]}</span>

                    <span className="date-num">{month[parts[1]]}</span>

                    <span className="date-year">{parts[0]}</span>
                  </div>
                );
              })}
            </div>

            {!selectedDate && (
              <div className="validation-msg">
                <i className="fas fa-exclamation-circle"></i>

                <span>لطفاً تاریخ مورد نظر خود را انتخاب کنید.</span>
              </div>
            )}
          </section>

          {/* ============================
              TIME
          ============================ */}

          <section className="section-card">
            <h2 className="booking-section-title">
              <i className="fas fa-clock"></i>

              <span>انتخاب ساعت</span>
            </h2>

            <div className="times-grid" id="times-container">
              {!selectedDate ? (
                <span className="time-placeholder">
                  ابتدا یک تاریخ انتخاب کنید.
                </span>
              ) : loadingTimes ? (
                <span className="time-placeholder">
                  ⏳ در حال بارگذاری تایم‌ها...
                </span>
              ) : times.length === 0 ? (
                <span className="time-placeholder">
                  ساعتی برای این تاریخ یافت نشد.
                </span>
              ) : (
                times.map((time) => (
                  <button
                    key={time.id}
                    type="button"
                    className={`time-card ${
                      selectedTime === time.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedTime(time.id)}
                  >
                    <span>{time.time_start}</span>

                    <i className="fas fa-arrow-left"></i>

                    <span>{time.time_end}</span>
                  </button>
                ))
              )}
            </div>

            {!selectedTime && selectedDate && (
              <div className="validation-msg">
                <i className="fas fa-exclamation-circle"></i>

                <span>لطفاً ساعت نوبت خود را انتخاب کنید.</span>
              </div>
            )}
          </section>

          {/* ============================
              PAYMENT
          ============================ */}

          <section className="section-card">
            <h2 className="booking-section-title">
              <i className="fas fa-credit-card"></i>

              <span>اطلاعات پرداخت و ثبت رسید</span>
            </h2>

            {/* BANK CARD */}

            <div className="bank-card">
              <div className="card-top-row">
                <span className="card-brand">
                  <i className="fas fa-university"></i>
                  بانک ملی ایران
                </span>

                <i className="fas fa-wifi"></i>
              </div>

              <div className="card-number-wrapper">
                <span className="card-number">
                  {cardNumber || "در حال دریافت..."}
                </span>

                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(cardNumber);
                    toast.success("شماره کارت کپی شد");
                  }}
                >
                  <i className="fas fa-copy"></i>
                </button>
              </div>

              <div className="card-owner">
                <span>به نام:</span>

                <strong>{nameCard}</strong>
              </div>
            </div>

            {/* UPLOAD */}

            <div
              className="upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="fas fa-cloud-upload-alt upload-icon"></i>

              <div className="upload-text">برای انتخاب رسید کلیک کنید</div>

              <div className="upload-hint">فرمت‌های مجاز: JPG, PNG, WEBP</div>

              <input
                ref={fileInputRef}
                type="file"
                className="file-input"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />
            </div>

            {receiptPreview && (
              <div className="preview-container">
                <div className="preview-details">
                  <img
                    src={receiptPreview}
                    alt="رسید پرداخت"
                    className="preview-img"
                  />

                  <span className="preview-name">{receiptImage?.name}</span>
                </div>

                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={removeFile}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            )}

            {!receiptImage && (
              <div className="validation-msg">
                <i className="fas fa-exclamation-circle"></i>
                <span>لطفاً تصویر رسید پرداخت را بارگذاری کنید.</span>
              </div>
            )}
          </section>
        </main>

        {/* ============================
            SIDEBAR
        ============================ */}

        <aside className="side-panel">
          <div className="summary-card">
            <h2 className="booking-section-title">
              <i className="fas fa-receipt"></i>

              <span>خلاصه رزرو</span>
            </h2>

            <div className="summary-list">
              <div className="summary-item">
                <span className="summary-label">نام متقاضی:</span>

                <span className="summary-value">{user.name}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">شماره تماس:</span>

                <span className="summary-value">{user.phone}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-item">
                <span className="summary-label">خدمات:</span>

                <span className="summary-value">
                  {selectedServices.length === 0
                    ? "انتخاب نشده"
                    : services
                        .filter((service) =>
                          selectedServices.includes(service.id),
                        )
                        .map((service) => service.title)
                        .join("، ")}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">تاریخ رزرو:</span>

                <span className="summary-value">
                  {selectedDate || "انتخاب نشده"}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">ساعت:</span>

                <span className="summary-value">
                  {selectedTime
                    ? (() => {
                        const selected = times.find(
                          (time) => time.id === selectedTime,
                        );

                        return selected
                          ? `${selected.time_start} ← ${selected.time_end}`
                          : "انتخاب نشده";
                      })()
                    : "انتخاب نشده"}
                </span>
              </div>
            </div>

            <div className="summary-divider"></div>

            <div className="total-row">
              <span className="total-label">مجموع هزینه:</span>

              <div className="total-amount">
                <span>{totalPrice.toLocaleString("fa-IR")}</span>

                <span className="total-currency">تومان</span>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmit}>
              <span>
                {isSubmit ? "در حال ثبت..." : "ثبت و ارسال درخواست رزرو"}
              </span>

              <i className="fas fa-arrow-left"></i>
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
};
