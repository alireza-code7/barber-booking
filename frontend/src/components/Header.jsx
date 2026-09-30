import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, NavLink, useLocation } from "react-router-dom";


export const Header = () => {
  const { user, logout } = useAuth();

  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const location = useLocation();

  const isAdmin = user?.is_admin === true || user?.is_admin === 1;

  const userName =
    user?.name ||
    user?.first_name ||
    user?.username ||
    "حساب کاربری";

  const handleLogout = async () => {
    setAccountOpen(false);
    await logout();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setAccountOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <div className="header-shell">

        {/* برند */}
        <Link to={isAdmin ? "/admin" : "/"} className="header-brand">
          <span className="header-brand-icon">
            <i className="fa-solid fa-scissors"></i>
          </span>

          <span className="brand-content">
            <strong>محمد بهمنی</strong>
            <small>
             
            </small>
          </span>
        </Link>


        {/* =========================================
            منوی دسکتاپ
        ========================================= */}

        <nav className="desktop-navigation">

          {!isAdmin ? (
            <>
              {/* منوی کاربر عادی */}

              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                 ` desktop-nav-link ${isActive ? "active" : ""}`
                }
              >
                <i className="fa-solid fa-house"></i>
                <span>خانه</span>
              </NavLink>

              <NavLink
                to="/support"
                className={({ isActive }) =>
                 ` desktop-nav-link ${isActive ? "active" : ""}`
                }
              >
                <i className="fa-solid fa-headset"></i>
                <span>پشتیبانی</span>
              </NavLink>

              <NavLink
                to="/myorder"
                className={({ isActive }) =>
                  `desktop-nav-link ${isActive ? "active" : ""}`
                }
              >
                <i className="fa-solid fa-calendar-check"></i>
                <span>رزروهای من</span>
              </NavLink>

              <a
                href="#"
                className="desktop-nav-link"
              >
                <i className="fa-brands fa-instagram"></i>
                <span>اینستاگرام</span>
              </a>
            </>
          ) : (
            <>
              {/* =====================================
                  منوی مخصوص ادمین
              ===================================== */}

              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                 ` desktop-nav-link ${isActive ? "active" : ""}`
                }
              >
                <i className="fa-solid fa-gauge-high"></i>
                <span>داشبورد</span>
              </NavLink>

              <NavLink
                to="/admin/bookings"
                className={({ isActive }) =>
                  `desktop-nav-link ${isActive ? "active" : ""}`
                }
              >
                <i className="fa-solid fa-calendar-check"></i>
                <span> رزروها</span>
              </NavLink>

<NavLink
                to="/admin/times"
                className={({ isActive }) =>
                  `desktop-nav-link ${isActive ? "active" : ""}`
                }
              >
                <i className="fa-solid fa-clock"></i>
                <span> تایم‌ها</span>
              </NavLink>

              <NavLink
                to="/admin/services"
                className={({ isActive }) =>
                 ` desktop-nav-link ${isActive ? "active" : ""}`
                }
              >
                <i className="fa-solid fa-scissors"></i>
                <span> سرویس‌ها</span>
              </NavLink>

              <NavLink
                to="/admin/messages"
                className={({ isActive }) =>
                 ` desktop-nav-link ${isActive ? "active" : ""}`
                }
              >
                <i className="fa-solid fa-headset"></i>
                <span> پشتیبانی</span>
              </NavLink>
            </>
          )}

        </nav>


        {/* =========================================
            حساب کاربری
        ========================================= */}

        <div className="header-account" ref={accountRef}>

          {!user ? (

            <Link
              to="/login"
              className="guest-login-button"
            >
              <span>ورود</span>
              <i className="fa-regular fa-user"></i>
            </Link>

          ) : (

            <>
              <button
                type="button"
                className={`account-button ${
                  accountOpen ? "open" : ""
                }`}
                onClick={() =>
                  setAccountOpen((prev) => !prev)
                }
              >

                <span className="account-avatar">
                  <i className="fa-solid fa-user"></i>
                </span>

                <span className="account-info">
                  <strong>{userName}</strong>

                 
                </span>

                <i
                  className={`fa-solid fa-chevron-down account-chevron ${
                    accountOpen ? "rotate" : ""
                  }`}
                ></i>

              </button>


              {/* =====================================
                  منوی بازشونده حساب
              ===================================== */}

              <div
                className={`account-dropdown ${
                  accountOpen ? "show" : ""
                }`}
              >

                {/* اطلاعات کاربر */}
                <div className="dropdown-user">

                  <div className="dropdown-avatar">
                    <i className="fa-solid fa-user"></i>
                  </div>

                  <div>
                    <strong>{userName}</strong>

                    <span>
                      {isAdmin
                        ? "مدیر سیستم"
                        : "کاربر"}
                    </span>
                  </div>

                </div>


                <div className="dropdown-divider"></div>


                {!isAdmin ? (
                  <>
                    {/* ==========================
                        منوی کاربر
                    ========================== */}

                    <Link
                      to="/myorder"
                      className="dropdown-item"
                    >
                      <span className="dropdown-item-icon">
                        <i className="fa-solid fa-calendar-check"></i>
                      </span>

                      <span>رزروهای من</span>

                      <i className="fa-solid fa-chevron-left arrow"></i>
                    </Link>

<Link
                      to="/support"
                      className="dropdown-item"
                    >
                      <span className="dropdown-item-icon">
                        <i className="fa-solid fa-headset"></i>
                      </span>

                      <span>پشتیبانی</span>

                      <i className="fa-solid fa-chevron-left arrow"></i>
                    </Link>
                  </>
                ) : (
                  <>
                    {/* ==========================
                        منوی ادمین
                    ========================== */}

                    <Link
                      to="/admin"
                      className="dropdown-item admin-item"
                    >
                      <span className="dropdown-item-icon">
                        <i className="fa-solid fa-gauge-high"></i>
                      </span>

                      <span>داشبورد مدیریت</span>

                      <i className="fa-solid fa-chevron-left arrow"></i>
                    </Link>

                    <Link
                      to="/admin/bookings"
                      className="dropdown-item admin-item"
                    >
                      <span className="dropdown-item-icon">
                        <i className="fa-solid fa-calendar-check"></i>
                      </span>

                      <span>مدیریت رزروها</span>

                      <i className="fa-solid fa-chevron-left arrow"></i>
                    </Link>

                    <Link
                      to="/admin/times"
                      className="dropdown-item admin-item"
                    >
                      <span className="dropdown-item-icon">
                        <i className="fa-solid fa-clock"></i>
                      </span>

                      <span>مدیریت تایم‌ها</span>

                      <i className="fa-solid fa-chevron-left arrow"></i>
                    </Link>

                    <Link
                      to="/admin/services"
                      className="dropdown-item admin-item"
                    >
                      <span className="dropdown-item-icon">
                        <i className="fa-solid fa-scissors"></i>
                      </span>

                      <span>مدیریت سرویس‌ها</span>

                      <i className="fa-solid fa-chevron-left arrow"></i>
                    </Link>

                    <Link
                      to="/admin/messages"
                      className="dropdown-item admin-item"
                    >
                      <span className="dropdown-item-icon">
                        <i className="fa-solid fa-headset"></i>
                      </span>

                      <span>مدیریت پشتیبانی</span>

                      <i className="fa-solid fa-chevron-left arrow"></i>
                    </Link>
                  </>
                )}


                <div className="dropdown-divider"></div>


                {/* خروج برای همه */}
                <button
                  type="button"
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <span className="dropdown-item-icon">
                    <i className="fa-solid fa-right-from-bracket"></i>
                  </span>

                  <span>خروج از حساب</span>
                </button>

              </div>
            </>
          )}

        </div>

      </div>
    </header>
  );
};