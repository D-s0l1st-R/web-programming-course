import "../styles/services.css";

export default function Services() {
  return (
    <section id="services" className="services-section">
      <header className="section-header">
        <h2>Услуги</h2>
        <p>Индивидуальный подход к каждому виду съёмки</p>
      </header>
      <ul className="services-list">
        <article className="service-card">
          <h3>Портретная съёмка</h3>
          <p>
            Индивидуальные, семейные и творческие портреты. Помощь в позировании
            и подборе образа.
          </p>
        </article>
        <article className="service-card">
          <h3>Свадебная съёмка</h3>
          <p>
            Полное сопровождение вашего дня: от сборов невесты до вечернего
            банкета. Незабываемые эмоции в кадре.
          </p>
        </article>
        <article className="service-card">
          <h3>Фотография природы</h3>
          <p>
            Пейзажные и детализированные снимки природы. Доступны для печати в
            высоком разрешении.
          </p>
        </article>
      </ul>
    </section>
  );
}
