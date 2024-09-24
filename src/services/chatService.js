// src/services/chatService.js
export const sendMessageToPharaoh = async (userMessage) => {
    try {
        console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);
        const response = await fetch('https://symphony-ai-challenge-bellffgt0-juantor16s-projects.vercel.app/api/chat', { // Ensure the correct port
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userMessage }),
        });

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error communicating with PhAIraoh:', error);
        return "I'm having trouble communicating right now. Please try again.";
    }
};