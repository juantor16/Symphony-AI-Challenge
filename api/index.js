// api/index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',  // You can specify your frontend URL if needed, e.g., "https://symphony-ai-challenge.vercel.app"
}));

const PORT = 5001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Utility function to fetch questions with retry logic
const fetchQuestionsWithRetry = async (retryCount = 3) => {
    console.log('Fetching questions from OpenAI...');
    console.log('API Key:', OPENAI_API_KEY);
    const promptContent = "Generate a list of 5 questions about ancient Egypt in a format with options A, B, C, and D, followed by the correct answer and explanation.";

    for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
            const startTime = Date.now(); // Start time to measure API request duration

            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: promptContent
                        }
                    ],
                    max_tokens: 500,  // Reduced from 800 to handle potential long response issues
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const endTime = Date.now(); // End time
            console.log(`OpenAI API call took ${endTime - startTime} ms`); // Log the duration

            // Check if there's a valid response
            if (response.data.choices && response.data.choices[0] && response.data.choices[0].message.content) {
                const aiContent = response.data.choices[0].message.content;
                console.log("AI Response Content:", aiContent);

                // Validate and split the response properly
                const aiQuestions = aiContent.split("\n\n").map(q => {
                    const parts = q.split('\n');
                    if (parts.length < 7) {
                        console.error(`Unexpected question format in: ${q}`);
                        return null;
                    }
                    const mainQuestion = parts[0].replace('Question: ', '').trim();
                    const options = parts.slice(1, 5).map(opt => opt.slice(3).trim()); // Extract options A), B), etc.
                    const correctAnswer = parts[5].replace('Correct Answer: ', '').trim();
                    const explanation = parts[6].replace('Explanation: ', '').trim();

                    return {
                        question: mainQuestion,
                        options: options,
                        correctAnswer: correctAnswer,
                        explanation: explanation
                    };
                }).filter(q => q !== null); // Filter out any null entries caused by unexpected formats

                if (aiQuestions.length > 0) {
                    return { success: true, questions: aiQuestions };
                } else {
                    throw new Error('Failed to parse questions from the AI response');
                }
            } else {
                throw new Error('Unexpected response format from OpenAI');
            }
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.response ? error.response.data : error.message);

            // Log more details if available
            if (error.response) {
                console.error(`Status: ${error.response.status}`);
                console.error(`Headers: ${JSON.stringify(error.response.headers)}`);
                console.error(`Data: ${JSON.stringify(error.response.data)}`);
            } else {
                console.error(`Error Message: ${error.message}`);
            }

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
    console.log('Fetching questions from OpenAI...');
    console.log('openapi key:', OPENAI_API_KEY)
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

        // Log error details for better troubleshooting
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Headers: ${JSON.stringify(error.response.headers)}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
        }

        res.status(500).json({ error: 'Could not generate a pharaoh match' });
    }
});

// Listen to the environment port provided by Vercel, otherwise use the default 5001 port
const port = process.env.PORT || PORT;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});