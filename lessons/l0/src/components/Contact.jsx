import { useState } from "react";
import "../styles/contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Имя обязательно";
    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Некорректный email";
    }
    if (!formData.message.trim()) newErrors.message = "Сообщение обязательно";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setIsSubmitted(false), 3000);
    } else {
      setErrors(validationErrors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <section id="contact" className="contact-section">
      <header className="section-header">
        <h2>Контакты</h2>
        <p>Свяжитесь со мной для обсуждения деталей съёмки</p>
      </header>

      <article className="contact-info">
        <address>
          <p>
            Телефон: <a href="tel:+79991234567">+7 (999) 123-45-67</a>
          </p>
          <p>
            Email: <a href="mailto:anna@photo.ru">anna@photo.ru</a>
          </p>
          <p>
            Telegram:{" "}
            <a
              href="https://t.me/anna_photo"
              target="_blank"
              rel="noopener noreferrer"
            >
              @anna_photo
            </a>
          </p>
        </address>
      </article>

      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend>Форма обратной связи</legend>

          <label htmlFor="name">Ваше имя</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <span id="name-error" className="error-message">
              {errors.name}
            </span>
          )}

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <span id="email-error" className="error-message">
              {errors.email}
            </span>
          )}

          <label htmlFor="message">Сообщение</label>
          <textarea
            id="message"
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
          ></textarea>
          {errors.message && (
            <span id="message-error" className="error-message">
              {errors.message}
            </span>
          )}

          <button type="submit" className="submit-button">
            Отправить
          </button>
          {isSubmitted && (
            <p className="success-message">Сообщение успешно отправлено!</p>
          )}
        </fieldset>
      </form>
    </section>
  );
}
