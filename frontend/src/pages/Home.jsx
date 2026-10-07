import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="meroasha-home">

      {/* ================= NAVBAR ================= */}

      <header className="home-navbar">

        <Link to="/" className="home-brand">
          <div className="home-brand-mark">M</div>

          <div>
            <div className="home-brand-name">MeroAsha</div>
            <div className="home-brand-subtitle">
              Hospital Management System
            </div>
          </div>
        </Link>

        <nav className="home-nav-links">
          <a href="#services">Services</a>
          <a href="#care">Healthcare</a>
          <a href="#about">About</a>
        </nav>

        <div className="home-nav-actions">
          <Link to="/login" className="home-login">
            Login
          </Link>

          <Link to="/register" className="home-register">
            Get Started
          </Link>
        </div>

      </header>


      {/* ================= HERO ================= */}

      <main>

        <section className="home-hero">

          <div className="home-hero-content">

            <div className="home-eyebrow">
              DIGITAL HEALTHCARE PLATFORM
            </div>

            <h1>
              Healthcare that stays
              <span> connected.</span>
            </h1>

            <p>
              MeroAsha brings patients, doctors and hospital teams
              together through one secure digital healthcare system.
            </p>

            <div className="home-hero-actions">

              <Link
                to="/login"
                className="home-primary-button"
              >
                Access Patient Portal
                <span>→</span>
              </Link>

              <Link
                to="/register"
                className="home-secondary-button"
              >
                Create Account
              </Link>

            </div>

            <div className="home-trust-row">

              <div>
                <strong>Secure</strong>
                <span>Digital records</span>
              </div>

              <div>
                <strong>Connected</strong>
                <span>Hospital services</span>
              </div>

              <div>
                <strong>Real-time</strong>
                <span>Notifications</span>
              </div>

            </div>

          </div>


          {/* Healthcare overview card */}

          <div className="home-hero-panel">

            <div className="hero-panel-header">
              <div>
                <span className="hero-panel-label">
                  HEALTHCARE OVERVIEW
                </span>

                <h3>Everything in one place</h3>
              </div>

              <div className="hero-live">
                <span></span>
                Connected
              </div>
            </div>


            <div className="hero-overview-card">

              <div className="hero-overview-icon">
                ♡
              </div>

              <div>
                <strong>Patient Care</strong>
                <p>
                  Appointments, records and healthcare services
                </p>
              </div>

            </div>


            <div className="hero-overview-grid">

              <div className="hero-small-card">
                <span>▣</span>
                <strong>Appointments</strong>
                <p>Manage visits</p>
              </div>

              <div className="hero-small-card">
                <span>▤</span>
                <strong>Medical Records</strong>
                <p>Health history</p>
              </div>

              <div className="hero-small-card">
                <span>⌁</span>
                <strong>Laboratory</strong>
                <p>Reports & tests</p>
              </div>

              <div className="hero-small-card">
                <span>□</span>
                <strong>Pharmacy</strong>
                <p>Prescriptions</p>
              </div>

            </div>

          </div>

        </section>


        {/* ================= SERVICES ================= */}

        <section
          id="services"
          className="home-section"
        >

          <div className="home-section-heading">

            <div>
              <span className="section-label">
                HOSPITAL SERVICES
              </span>

              <h2>
                One platform for complete care
              </h2>
            </div>

            <p>
              MeroAsha connects the major workflows of a modern
              hospital into one digital system.
            </p>

          </div>


          <div className="home-service-grid">

            <article className="home-service-card">
              <div className="service-icon">▣</div>
              <h3>Appointments & Queue</h3>
              <p>
                Manage appointments, check-in and patient queues
                for smoother hospital visits.
              </p>
            </article>


            <article className="home-service-card">
              <div className="service-icon">♙</div>
              <h3>Doctor Consultation</h3>
              <p>
                Support consultations, clinical notes and
                prescriptions through a connected workflow.
              </p>
            </article>


            <article className="home-service-card">
              <div className="service-icon">▤</div>
              <h3>Medical Records</h3>
              <p>
                Maintain important patient medical information
                and healthcare history digitally.
              </p>
            </article>


            <article className="home-service-card">
              <div className="service-icon">⌁</div>
              <h3>Laboratory</h3>
              <p>
                Handle laboratory requests, sample processing
                and medical reports.
              </p>
            </article>


            <article className="home-service-card">
              <div className="service-icon">□</div>
              <h3>Pharmacy</h3>
              <p>
                Manage prescriptions, medicines, inventory and
                dispensing workflows.
              </p>
            </article>


            <article className="home-service-card">
              <div className="service-icon">◇</div>
              <h3>Blood Bank</h3>
              <p>
                Track blood inventory, donations, requests and
                blood issue operations.
              </p>
            </article>


            <article className="home-service-card">
              <div className="service-icon emergency-icon">
                !
              </div>
              <h3>Emergency & Ambulance</h3>
              <p>
                Coordinate emergency requests, ambulance
                availability and dispatch.
              </p>
            </article>


            <article className="home-service-card">
              <div className="service-icon">♡</div>
              <h3>Pregnancy Care</h3>
              <p>
                Support pregnancy profiles, antenatal visits,
                risk assessment and follow-up care.
              </p>
            </article>

          </div>

        </section>


        {/* ================= CARE SECTION ================= */}

        <section
          id="care"
          className="home-care-section"
        >

          <div className="home-care-content">

            <span className="section-label">
              CONNECTED HEALTHCARE
            </span>

            <h2>
              Different teams.
              <br />
              One connected hospital.
            </h2>

            <p>
              MeroAsha provides role-based access for patients,
              doctors, nurses, reception teams, laboratory staff,
              pharmacy staff, blood bank teams, emergency staff
              and administrators.
            </p>

            <div className="home-role-grid">

              <div>
                <strong>Patients</strong>
                <span>Access care and health information</span>
              </div>

              <div>
                <strong>Doctors</strong>
                <span>Manage consultations and records</span>
              </div>

              <div>
                <strong>Hospital Staff</strong>
                <span>Coordinate daily operations</span>
              </div>

              <div>
                <strong>Administrators</strong>
                <span>Manage the hospital system</span>
              </div>

            </div>

          </div>

        </section>


        {/* ================= CTA ================= */}

        <section className="home-cta">

          <div>

            <span className="section-label">
              MEROASHA
            </span>

            <h2>
              Ready to access your healthcare portal?
            </h2>

            <p>
              Sign in to continue or create your MeroAsha account.
            </p>

          </div>

          <div className="home-cta-actions">

            <Link
              to="/login"
              className="home-primary-button"
            >
              Login
              <span>→</span>
            </Link>

            <Link
              to="/register"
              className="home-secondary-button"
            >
              Register
            </Link>

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer
        id="about"
        className="home-footer"
      >

        <div className="home-footer-main">

          <div className="home-footer-brand">

            <div className="home-brand">
              <div className="home-brand-mark">M</div>

              <div>
                <div className="home-brand-name">
                  MeroAsha
                </div>

                <div className="home-brand-subtitle">
                  Hospital Management System
                </div>
              </div>
            </div>

            <p>
              A connected digital platform for modern
              hospital management and patient care.
            </p>

          </div>


          <div className="home-footer-column">
            <h4>Platform</h4>
            <a href="#services">Services</a>
            <a href="#care">Healthcare</a>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>


          <div className="home-footer-column">
            <h4>Healthcare</h4>
            <span>Appointments</span>
            <span>Medical Records</span>
            <span>Laboratory</span>
            <span>Pharmacy</span>
          </div>


          <div className="home-footer-column">
            <h4>Hospital Operations</h4>
            <span>Blood Bank</span>
            <span>Emergency</span>
            <span>Pregnancy Care</span>
            <span>Administration</span>
          </div>

        </div>


        <div className="home-footer-bottom">
          <span>
            © MeroAsha Hospital. All rights reserved.
          </span>

          <span>
            Digital Healthcare Management System
          </span>
        </div>

      </footer>

    </div>
  );
}

export default Home;