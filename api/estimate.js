// api/estimate.js

// --- 1. Import dependencies using ESM 'import' syntax ---
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';

// --- 2. Initialize and configure ---
const app = express();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- 3. Configure CORS ---
app.use(cors());

// --- 4. Configure Multer ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// --- 5. The API endpoint (logic remains the same) ---
app.post('/api/estimate', upload.single('image'), async (req, res) => {
  try {
    const imageFile = req.file;
    const textDescription = req.body.text;

    if (!imageFile || !textDescription) {
      return res.status(400).json({ error: 'Image and text are required.' });
    }

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
              text: `You are an expert auto repair estimator. Based on the image and description, estimate the standard labor hours required for the repair. Client's description: "${textDescription}". Your response MUST be in JSON format with two fields: "estimatedHours" (a number or a string with a number) and "comment" (a brief text commentary on the necessary work).`,
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
          error: 'The AI could not process the image due to safety policies.',
        });
    }

    const aiResponseJson = JSON.parse(aiResponseContent);
    res.status(200).json(aiResponseJson);
  } catch (error) {
    console.error('❌ Error in /api/estimate function:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// --- 6. EXPORT THE APP ---
// Use 'export default' instead of 'module.exports'
export default app;
