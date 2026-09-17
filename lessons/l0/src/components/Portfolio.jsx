import { useState } from "react";
import "../styles/portfolio.css";
import Modal from "./Modal";

// ЗАМЕЧАНИЕ: Замените пути '/images/photo1.jpg' и т.д. на реальные пути к вашим 6 локальным изображениям в папке public/images/
const photos = [
  {
    id: 1,
    src: "src/images/portrait_1.jpg",
    category: "portrait",
    alt: "Портрет девушки в студии",
  },
  {
    id: 2,
    src: "src/images/wedding_1.jpg",
    category: "wedding",
    alt: "Свадебная прогулка в парке",
  },
  {
    id: 3,
    src: "src/images/nature_1.jpg",
    category: "nature",
    alt: "Туманный лес на рассвете",
  },
  {
    id: 4,
    src: "src/images/portrait_2.jpg",
    category: "portrait",
    alt: "Черно-белый портрет",
  },
  {
    id: 5,
    src: "src/images/wedding_2.jpg",
    category: "wedding",
    alt: "Детали свадебного декора",
  },
  {
    id: 6,
    src: "src/images/nature_2.jpg",
    category: "nature",
    alt: "Горное озеро в закатных лучах",
  },
];

const categories = ["all", "portrait", "wedding", "nature"];
const categoryNames = {
  all: "Все",
  portrait: "Портрет",
  wedding: "Свадьба",
  nature: "Природа",
};

export default function Portfolio() {
  const [filter, setFilter] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const filteredPhotos =
    filter === "all"
      ? photos
      : photos.filter((photo) => photo.category === filter);

  return (
    <section id="portfolio" className="portfolio-section">
      <header className="section-header">
        <h2>Портфолио</h2>
        <p>Избранные работы из разных категорий</p>
      </header>

      <nav className="portfolio-filter">
        <ul>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                className={filter === cat ? "active" : ""}
                onClick={() => setFilter(cat)}
              >
                {categoryNames[cat]}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <ul className="gallery-grid">
        {filteredPhotos.map((photo) => (
          <li key={photo.id} className="gallery-item">
            <figure>
              <img
                src={photo.src}
                alt={photo.alt}
                onClick={() => setSelectedPhoto(photo)}
                loading="lazy"
              />
              <figcaption>{photo.alt}</figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {selectedPhoto && (
        <Modal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </section>
  );
}
