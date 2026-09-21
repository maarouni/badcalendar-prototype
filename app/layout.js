import "./globals.css";
import NavBar from "./components/NavBar";

export const metadata = {
  title: "BadCalendar (Prototype)",
  description: "Bay Area event calendar — internal prototype, not the live product",
};

function SocialIcon({ href, label, children }) {
  return (
    <a
      className="social-icon"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
    >
      {children}
    </a>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar />

        {children}

        <footer className="site-footer">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="/" className="brand">
                <span className="brand-mark">📅</span>
                bad<span>calendar</span>
              </a>
              <p>
                One place for every Bay Area networking event, meetup and
                workshop — built for organizers who are tired of juggling five
                different tools.
              </p>
              <div className="social-row">
                <SocialIcon href="#" label="X (Twitter)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.1l-5.6-7.3L4.2 22H1l8.1-9.3L.9 2H8l5 6.7L18.9 2Zm-1.2 18h1.9L7.4 4H5.4l12.3 16Z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="#" label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="#" label="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.5c0-1.3-.02-3-1.9-3-1.9 0-2.2 1.4-2.2 2.9V21h-4V9Z" />
                  </svg>
                </SocialIcon>
              </div>
            </div>

            <div className="footer-col">
              <h5>Navigate</h5>
              <a href="/">Super Calendar</a>
              <a href="/my-calendar">My Calendar</a>
              <a href="/submit">Submit an Event</a>
              <a href="/profile">My Profile</a>
            </div>

            <div className="footer-col">
              <h5>About</h5>
              <a href="#">For Organizers</a>
              <a href="#">For Attendees</a>
              <a href="#">Contact</a>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 badcalendar — internal prototype, not a live product</span>
            <span>Bay Area, CA</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
