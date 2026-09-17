import "../styles/sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <h1>Анна Аннушкина</h1>
        <p>Фотограф</p>
      </header>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <a href="#hero">Главная</a>
          </li>
          <li>
            <a href="#services">Услуги</a>
          </li>
          <li>
            <a href="#portfolio">Портфолио</a>
          </li>
          <li>
            <a href="#contact">Контакты</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
