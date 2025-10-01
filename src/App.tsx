// src/App.jsx
import { useState } from 'react';
import './App.css';
import ImageUploader from './components/ImageUploader';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEstimate = async ({ image, text }) => {
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('text', text);

    try {
      // URL вашего будущего бэкенд-сервера
      const response = await fetch('http://localhost:3002/api/estimate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка сети или сервера.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Не удалось получить оценку. Попробуйте снова.');
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
