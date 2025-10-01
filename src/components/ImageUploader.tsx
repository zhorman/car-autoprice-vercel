// src/components/ImageUploader.tsx
import React, { useState } from 'react';

// 1. Создаём интерфейс, чтобы описать, какие props ожидает компонент.
// В нашем случае это одна функция `onEstimate`.
interface ImageUploaderProps {
  // `onEstimate` — это функция, которая ничего не возвращает (void)
  // и принимает один аргумент — объект с полями image (тип File) и text (тип string).
  onEstimate: (data: { image: File; text: string }) => void;
}

// 2. Указываем, что наш компонент является функциональным компонентом React (React.FC)
// и использует пропсы, описанные в ImageUploaderProps.
const ImageUploader: React.FC<ImageUploaderProps> = ({ onEstimate }) => {
  // 3. Добавляем типы для состояний
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [preview, setPreview] = useState<string>('');

  // 4. Добавляем тип для события 'e' в обработчике
  // React.ChangeEvent для события изменения, HTMLInputElement для элемента <input>
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TypeScript теперь знает, что у e.target есть свойство files
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // 5. Добавляем тип для события отправки формы
  // React.FormEvent для события формы, HTMLFormElement для элемента <form>
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
