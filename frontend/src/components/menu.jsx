import { useAuth } from "../contexts/AuthContext";
import { NavLink } from "react-router-dom";
import "../pages/style.css"

export const Menu = () => {
  const { user } = useAuth();

  if (user?.is_admin) {
    return (
      <nav className="bottom-nav">
        <div className="bottom-nav-container">

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
             ` bottom-nav-item ${isActive ? "active" : ""}`
            }
          >
            <i className="fa-solid fa-house"></i>
            <span>خانه</span>
          </NavLink>

          <NavLink
            to="/admin/messages"
            className={({ isActive }) =>
            `  bottom-nav-item ${isActive ? "active" : ""}`
            }
          >
            <i className="fa-solid fa-headset"></i>
            <span>پشتیبانی</span>
          </NavLink>

          <NavLink
            to="/admin/bookings"
            className={({ isActive }) =>
             ` bottom-nav-item ${isActive ? "active" : ""}`
            }
          >
            <i className="fa-solid fa-book"></i>
            <span>رزرو ها</span>
          </NavLink>

          <NavLink
            to="/admin/times"
            className={({ isActive }) =>
             ` bottom-nav-item ${isActive ? "active" : ""}`
            }
          >
            <i className="fa-solid fa-clock"></i>
            <span>تایم ها</span>
          </NavLink>

        </div>
      </nav>
    );
  }

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
           ` bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <i className="fa-solid fa-house"></i>
          <span>خانه</span>
        </NavLink>

        <NavLink
          to="/myorder"
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <i className="fa-solid fa-calendar-check"></i>
          <span>رزرو های من</span>
        </NavLink>

        <NavLink
          to="/support"
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <i className="fa-solid fa-headset"></i>
          <span>پشتیبانی</span>
        </NavLink>

        {user ? (
          <span className="bottom-nav-item">
            <i className="fa-solid fa-user"></i>
            <span>{user.name}</span>
          </span>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? "active" : ""}`
            }
          >
            <i className="fa-solid fa-right-to-bracket"></i>
            <span>ورود</span>
          </NavLink>
        )}

      </div>
    </nav>
  );
};



