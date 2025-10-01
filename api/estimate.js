// api/estimate.js

// --- 1. Импортируем зависимости, используя синтаксис ESM 'import' ---
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';

// --- 2. Инициализация и настройка ---
const app = express();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- 3. Настройка CORS ---
app.use(cors());

// --- 4. Настройка Multer ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// --- 5. Эндпоинт API (логика остаётся прежней) ---
app.post('/api/estimate', upload.single('image'), async (req, res) => {
  try {
    const imageFile = req.file;
    const textDescription = req.body.text;

    if (!imageFile || !textDescription) {
      return res
        .status(400)
        .json({ error: 'Изображение и текст обязательны.' });
    }

    const imageBase64 = imageFile.buffer.toString('base64');
    const imageMimeType = imageFile.mimetype;

    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Ты — опытный оценщик стоимости ремонта автомобилей. На основе изображения и описания, оцени, сколько нормочасов потребуется на ремонт. Описание от клиента: "${textDescription}". Твой ответ ДОЛЖЕН быть в формате JSON с двумя полями: "estimatedHours" (число или строка с числом) и "comment" (краткий текстовый комментарий о необходимых работах).`,
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
        .json({
          error:
            'AI не смог обработать изображение из-за политики безопасности.',
        });
    }

    const aiResponseJson = JSON.parse(aiResponseContent);
    res.status(200).json(aiResponseJson);
  } catch (error) {
    console.error('❌ Ошибка в функции /api/estimate:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
  }
});

// --- 6. ЭКСПОРТИРУЕМ ПРИЛОЖЕНИЕ ---
// Используем 'export default' вместо 'module.exports'
export default app;
