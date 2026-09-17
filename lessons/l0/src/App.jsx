import "./App.css";
import Sidebar from "./components/Sidebar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Portfolio from "./components/Portfolio";
import Contact from "./components/Contact";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <>
      <Sidebar />
      <main className="main-content">
        <Hero />
        <Services />
        <Portfolio />
        <Contact />
        <footer className="main-footer">
          <p>© 2026 Анна Аннушкина. Все права защищены.</p>
        </footer>
      </main>
      <ScrollToTop />
    </>
  );
}

export default App;
