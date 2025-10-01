// src/App.tsx
import { useState } from 'react';
import './App.css';
import ImageUploader from './components/ImageUploader';

// 1. Создаём интерфейс для одной детали повреждения
interface IDamageDetail {
  partName: string;
  damageType: string;
  estimatedHours: number;
}

// 2. Обновляем основной интерфейс для ответа от API
interface IResultData {
  totalHours: number;
  details: IDamageDetail[]; // Массив с деталями повреждений
  summary: string;
}

function App() {
  // Тип состояния остаётся прежним, но теперь он ссылается на новый интерфейс
  const [result, setResult] = useState<IResultData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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
      const response = await fetch('/api/estimate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка сети или сервера.');
      }

      const data: IResultData = await response.json();
      setResult(data);
    } catch (err: unknown) {
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

        {/* --- 3. ПОЛНОСТЬЮ ОБНОВЛЁННЫЙ БЛОК ОТОБРАЖЕНИЯ РЕЗУЛЬТАТА --- */}
        {result && (
          <div className="result-container">
            <h2>Результат оценки:</h2>
            <div className="summary-section">
              <p>
                <strong>Общие нормочасы:</strong>
                <span>{result.totalHours} ч.</span>
              </p>
              <p>
                <strong>Комментарий AI:</strong> {result.summary}
              </p>
            </div>

            <h3>Детализация работ:</h3>
            <table className="details-table">
              <thead>
                <tr>
                  <th>Деталь</th>
                  <th>Тип повреждения</th>
                  <th>Нормочасы</th>
                </tr>
              </thead>
              <tbody>
                {/* Используем .map() для отрисовки каждой строки таблицы */}
                {result.details.map((detail, index) => (
                  <tr key={index}>
                    <td>{detail.partName}</td>
                    <td>{detail.damageType}</td>
                    <td>{detail.estimatedHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
