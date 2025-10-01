// src/components/ImageUploader.jsx
import { useState } from 'react';

const ImageUploader = ({ onEstimate }) => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [preview, setPreview] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!image || !text) {
      alert('Пожалуйста, загрузите изображение и добавьте описание.');
      return;
    }
    onEstimate({ image, text });
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <div className="form-group">
        <label htmlFor="image-upload">Загрузите фото повреждения</label>
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
        {preview && (
          <img src={preview} alt="Предпросмотр" className="image-preview" />
        )}
      </div>
      <div className="form-group">
        <label htmlFor="description">Опишите повреждение</label>
        <textarea
          id="description"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Например: 'Царапина на переднем бампере, задето крыло.'"
          rows={4}
          required></textarea>
      </div>
      <button type="submit" className="submit-btn">
        Рассчитать
      </button>
    </form>
  );
};

export default ImageUploader;
