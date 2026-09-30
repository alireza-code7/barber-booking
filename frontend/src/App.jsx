import React, { useEffect } from 'react'
import "@fortawesome/fontawesome-free/css/all.min.css"
import './App.css'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom'

import { Register } from './pages/register'
import { Login } from './pages/login'
import { AuthProvider } from './contexts/AuthContext'
import { Home } from './pages/home'
import { Support } from './pages/Support'
import { Booking } from './pages/booking'
import { ServiceProvider } from './contexts/ServicesContext'
import { OrderHistory } from './pages/myOrders'
import { ToastContainer } from 'react-toastify'
import { AdminDashboard } from './pages/adminDashboard'
import { AdminMessages } from './pages/adminMessages'
import { AdminServices } from './pages/adminServices'
import { AdminBookings } from './pages/adminBookings'
import { AdminTimes } from './pages/adminTimes'
import { AdminGallery } from './pages/adminGallery'
import { Menu } from './components/menu'
import { Header } from './components/Header'


function AppContent() {

  const location = useLocation();

  const isSupportPage = location.pathname === "/support";


  return (
    <>
      {!isSupportPage && <Header />}

      <Routes>

        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/' element={<Home />} />
        <Route path='/support' element={<Support />} />
        <Route path='/booking' element={<Booking />} />
        <Route path='/myorder' element={<OrderHistory />} />

        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/admin/messages' element={<AdminMessages />} />
        <Route path='/admin/services' element={<AdminServices />} />
        <Route path='/admin/bookings' element={<AdminBookings />} />
        <Route path='/admin/times' element={<AdminTimes />} />
        <Route path='/admin/gallery' element={<AdminGallery />} />

      </Routes>

      {!isSupportPage && <Menu />}
    </>
  );
}


function App() {

  useEffect(() => {

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    const observeRevealElements = () => {
      const elements = document.querySelectorAll(".reveal:not(.active)");

      elements.forEach((element) => {
        observer.observe(element);
      });
    };

    observeRevealElements();

    const mutationObserver = new MutationObserver(() => {
      observeRevealElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };

  }, []);


  return (
    <React.Fragment>

      <ToastContainer
        position='top-right'
        autoClose={3000}
        rtl={true}
        // toastStyle={{
        //   borderRadius: "15px",
        //   width: "210px",
        //   height: "30px",
        //   marginTop: "20px",
        //   display: "flex",
        //   justifyContent: "center",
        //   fontSize: "14px"
        // }}
      />

      <AuthProvider>

        <ServiceProvider>

          <Router>

            <AppContent />

          </Router>

        </ServiceProvider>

      </AuthProvider>

    </React.Fragment>
  )
}

export default App