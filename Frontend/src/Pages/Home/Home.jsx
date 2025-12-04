import { Helmet } from "react-helmet";
import Navbar from "../Navbar/Navbar";
import Bannner from "../Banner/Bannner";
import Footer from "../../Footer/Footer";
import { NavLink } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Home | Digital Healthcare</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      <Navbar />
      <div className="navbar-spacer"></div>
      <Bannner />
      
      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Digital Healthcare?</h2>
          <p className="section-subtitle">
            Experience healthcare that's convenient, professional, and tailored to your needs
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👨‍⚕️</div>
              <h3>Expert Doctors</h3>
              <p>Access to highly qualified and experienced healthcare professionals</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Easy Scheduling</h3>
              <p>Book appointments at your convenience with our simple scheduling system</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💊</div>
              <h3>Digital Prescriptions</h3>
              <p>Receive and manage prescriptions digitally for easy access</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your health data is protected with industry-standard security</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get started in three simple steps</p>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Sign up and complete your profile in minutes</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Find Your Doctor</h3>
              <p>Browse specialists and choose the right doctor for you</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Book Appointment</h3>
              <p>Schedule your appointment and get the care you need</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-text">Join thousands of patients who trust Digital Healthcare</p>
          <div className="cta-buttons">
            <NavLink to="/register">
              <button className="cta-button primary">Create Account</button>
            </NavLink>
            <NavLink to="/doctors">
              <button className="cta-button secondary">Browse Doctors</button>
            </NavLink>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
