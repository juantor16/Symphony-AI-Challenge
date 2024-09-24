// api/index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*'  // or specify your frontend URL, e.g., "https://symphony-ai-challenge.vercel.app"
  }));

const PORT = 5001;
const OPENAI_API_KEY = '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';

// Utility function to fetch questions with retry logic
const fetchQuestionsWithRetry = async (retryCount = 3) => {
    console.log('Fetching questions from OpenAI...');
    console.log('openapi key:', OPENAI_API_KEY)
    for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: "Generate a list of 7 questions about ancient Egypt in a format with options A, B, C, and D, followed by the correct answer and explanation."
                        }
                    ],
                    max_tokens: 800,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const aiQuestions = response.data.choices[0].message.content.split("\n\n").map(q => {
                const parts = q.split('\n');
                const mainQuestion = parts[0].replace('Question: ', '');
                const options = parts.slice(1, 5).map(opt => opt.slice(3)); // Extract options A), B), etc.
                const correctAnswer = parts[5].replace('Correct Answer: ', '').trim();
                const explanation = parts[6].replace('Explanation: ', '').trim();

                return {
                    question: mainQuestion,
                    options: options,
                    correctAnswer: correctAnswer,
                    explanation: explanation
                };
            });

            return { success: true, questions: aiQuestions };
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.response ? error.response.data : error.message);

            // If we've reached the max retry count, return the failure
            if (attempt === retryCount) {
                return { success: false, error: 'Failed to fetch questions from OpenAI after multiple attempts' };
            }

            // Wait a bit before retrying (e.g., 1 second)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

// Endpoint to fetch all questions using the retry logic
app.get('/api/generate-questions', async (req, res) => {
    const result = await fetchQuestionsWithRetry();

    if (result.success) {
        res.json({ questions: result.questions });
    } else {
        res.status(500).json({ error: result.error });
    }
});

// New endpoint to generate pharaoh match
app.post('/api/pharaoh-match', async (req, res) => {
    const { personalityTraits } = req.body;
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are an ancient Egyptian historian. Based on the personality traits provided, identify the pharaoh this person resembles the most and describe their achievements, personality, and life briefly.`
                    },
                    {
                        role: 'user',
                        content: `Personality Traits: ${personalityTraits.join(', ')}`
                    }
                ],
                max_tokens: 150,
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        const matchDescription = response.data.choices[0].message.content.trim();
        res.json({ match: matchDescription });
    } catch (error) {
        console.error('Error generating match:', error);
        res.status(500).json({ error: 'Could not generate a pharaoh match' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});