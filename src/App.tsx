// src/App.tsx
import { useState } from 'react';
import './App.css';
import ImageUploader from './components/ImageUploader';

// 1. Создаём интерфейс для объекта с результатом
// Это описывает, какие данные мы ожидаем получить от API.
interface IResultData {
  estimatedHours: string | number; // Нормочасы могут быть числом или строкой
  comment: string;
}

function App() {
  // 2. Указываем тип для состояния result: это либо наш объект, либо null
  const [result, setResult] = useState<IResultData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 3. Указываем типы для параметров функции
  const handleEstimate = async ({
    image,
    text,
  }: {
    image: File;
    text: string;
  }) => {
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('text', text);

    try {
      // Для деплоя на Vercel/Netlify используем относительный путь
      const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/estimate`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Попытаемся прочитать текст ошибки от сервера
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка сети или сервера.');
      }

      // Указываем, что полученные данные соответствуют нашему интерфейсу
      const data: IResultData = await response.json();
      setResult(data);
    } catch (err: unknown) {
      // 4. Типизируем ошибку в блоке catch
      let errorMessage = 'Не удалось получить оценку. Попробуйте снова.';

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Нейрокалькулятор нормочасов ремонта авто 🚗</h1>
        <p>Загрузите фото повреждения и добавьте описание для оценки.</p>
      </header>
      <main>
        <ImageUploader onEstimate={handleEstimate} />
        {loading && <div className="loader"></div>}
        {error && <p className="error-message">{error}</p>}
        {result && (
          <div className="result-container">
            <h2>Результат оценки:</h2>
            <p>
              <strong>Предполагаемые нормочасы:</strong> {result.estimatedHours}{' '}
              ч.
            </p>
            <p>
              <strong>Комментарий AI:</strong> {result.comment}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
