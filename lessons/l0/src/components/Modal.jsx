import "../styles/modal.css";

export default function Modal({ photo, onClose }) {
  return (
    <dialog open className="modal" onClick={onClose}>
      <figure className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={photo.src} alt={photo.alt} />
        <figcaption>{photo.alt}</figcaption>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Закрыть модальное окно"
        >
          &times;
        </button>
      </figure>
    </dialog>
  );
}
