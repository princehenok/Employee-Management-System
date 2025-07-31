import React from 'react';
import Slider from 'react-slick';
import './LandingPage.css';
import { FaUsers, FaUserTie, FaChartLine } from 'react-icons/fa';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import slide1 from '../assets/images/slide 1.jpeg';
import slide2 from '../assets/images/slide 2.jpeg';
import slide3 from '../assets/images/slide3.jpg';

const LandingPage = () => {
  const sliderImages = [slide1, slide2, slide3];

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    arrows: false,
  };

  return (
    <div className="landing-wrapper">
      <header className="hero-section">
        <Slider {...settings} className="slider">
          {sliderImages.map((src, i) => (
            <div key={i} className="slider-image-wrapper">
              <img src={src} alt={`Slide ${i + 1}`} className="slider-image" />
            </div>
          ))}
        </Slider>
        <div className="hero-overlay-text">
          <h1 className="main-heading">Employee Management System</h1>
          <p className="subheading">Smart. Scalable. Seamless.</p>
          <button className="cta-button">Get Started</button>
        </div>
      </header>

      <section className="features-section">
        <h2 className="section-heading">Core Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaUsers className="feature-icon" />
            <h3>Employee Directory</h3>
            <p>Search, view, and manage employee records effortlessly.</p>
          </div>
          <div className="feature-card">
            <FaUserTie className="feature-icon" />
            <h3>Role & Access Control</h3>
            <p>Assign roles and control access with precision.</p>
          </div>
          <div className="feature-card">
            <FaChartLine className="feature-icon" />
            <h3>Performance Insights</h3>
            <p>Visualize workforce data to drive better decisions.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} EMS Platform • Built with ♥ by Heni</p>
      </footer>
    </div>
  );
};

export default LandingPage;
