import { FaFacebook, FaGithub, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h1 className="footer-logo">
              <span className="text-white">Digital</span>{" "}
              <span className="text-blue-400">Healthcare</span>
            </h1>
            <p className="footer-description">
              Providing quality healthcare services with experienced professionals. Your health is our priority.
            </p>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Contact</h3>
            <p className="footer-link">
              Merul Badda<br />
              Dhaka, Bangladesh
            </p>
            <p className="footer-link">Phone: 01734804733</p>
            <p className="footer-link">Email: niazmorshedrafi@gmail.com</p>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Follow Us</h3>
            <div className="footer-socials">
              <a href="#" className="social-icon"><FaFacebook /></a>
              <a href="#" className="social-icon"><FaInstagram /></a>
              <a href="#" className="social-icon"><FaTwitter /></a>
              <a href="#" className="social-icon"><FaGithub /></a>
            </div>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Newsletter</h3>
            <p className="footer-text">Subscribe to get updates</p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Your email"
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-button">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Digital Healthcare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
