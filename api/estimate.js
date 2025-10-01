// api/estimate.js

// --- 1. Импорт зависимостей ---
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const OpenAI = require('openai');
// 'dotenv' не нужен на Vercel, он использует переменные из своего дашборда

// --- 2. Инициализация и настройка ---
const app = express();
// 'port' не нужен, Vercel управляет этим сам

// Настраиваем клиент OpenAI с API-ключом
// Vercel автоматически подставит переменные окружения из настроек проекта
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- 3. Настройка CORS ---
// Разрешаем запросы со всех источников, так как Vercel сам управляет безопасностью
// между фронтендом и API на одном домене.
app.use(cors());

// --- 4. Настройка Multer (без изменений) ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// --- 5. Основной API-эндпоинт ---
// ВАЖНО: Путь должен быть полным, так как Vercel будет вызывать этот файл напрямую
app.post('/api/estimate', upload.single('image'), async (req, res) => {
  //
  // ... ВСЯ ВАША ЛОГИКА ВНУТРИ ОСТАЕТСЯ ТОЧНО ТАКОЙ ЖЕ ...
  // (от try { ... } до catch { ... })
  //
  try {
    const imageFile = req.file;
    const textDescription = req.body.text;

    if (!imageFile || !textDescription) {
      return res
        .status(400)
        .json({ error: 'Изображение и текст обязательны.' });
    }

    // ... остальная логика запроса к OpenAI ...
    const imageBase64 = imageFile.buffer.toString('base64');
    const imageMimeType = imageFile.mimetype;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Ты — опытный оценщик... Твой ответ должен быть СТРОГО в формате JSON...`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageMimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 400,
      response_format: { type: 'json_object' },
    });

    const aiResponseContent = response.choices[0].message.content;

    if (aiResponseContent === null) {
      return res
        .status(500)
        .json({ error: 'AI не смог обработать изображение.' });
    }

    const aiResponseJson = JSON.parse(aiResponseContent);
    res.status(200).json(aiResponseJson);
  } catch (error) {
    console.error('❌ Ошибка в функции /api/estimate:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
  }
});

// --- 6. ЭКСПОРТ ПРИЛОЖЕНИЯ ---
// ❗️❗️❗️ САМОЕ ГЛАВНОЕ ИЗМЕНЕНИЕ ❗️❗️❗️
// Мы не запускаем сервер, а экспортируем `app`, чтобы Vercel мог использовать его как функцию.
module.exports = app;
