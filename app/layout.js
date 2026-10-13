import "./globals.css";
import NavBar from "./components/NavBar";

export const metadata = {
  title: "calendarGold (Prototype)",
  description: "Bay Area event calendar — internal prototype, not the live product",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Alata&family=Lexend:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
        />
      </head>
      <body>
        <NavBar />

        {children}

        <footer className="site-footer site-footer-min">
          <span>© 2026 calendar<b>Gold</b></span>
          <span>Bay Area, California</span>
        </footer>
      </body>
    </html>
  );
}
