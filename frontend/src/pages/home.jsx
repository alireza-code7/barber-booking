
import "./style.css";
import { GetServices } from "../components/getservices";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Gallery } from "../components/Gallery";
import { Footer } from "../components/Footer";
import { About } from "../components/About";

export const Home = () => {

  document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal');

            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    }
                });
            }, {
                threshold: 0.15
            });

            revealElements.forEach(el => revealObserver.observe(el));

             const sections = document.querySelectorAll('section, footer');
            const navLinks = document.querySelectorAll('.nav-link');
            const bottomNavItems = document.querySelectorAll('.bottom-nav-item');

            window.addEventListener('scroll', () => {
                let current = '';

                sections.forEach(section => {
                    const sectionTop = section.offsetTop - 100;
                    const sectionHeight = section.clientHeight;
                    if (window.scrollY >= sectionTop) {
                        current = section.getAttribute('id');
                    }
                });

                // Top Header Nav Active Toggle
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${current}`) {
                        link.classList.add('active');
                    }
                });

                // Bottom Mobile Nav Active Toggle
                bottomNavItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${current}`) {
                        item.classList.add('active');
                    }
                });
            });

        ;
  })

  return (
    <div className="home-container">
      
      <Hero/>
      <GetServices/>
      <Gallery/>
      <About/>
      <Footer/>

    </div>
  );
};