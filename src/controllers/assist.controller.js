const { OpenAI } = require('openai');
const dotenv = require("dotenv");
dotenv.config();


const openai = new OpenAI({
    apiKey: process.env.AI_MODAL_KEY,
    baseURL: 'https://api.together.xyz/v1',
});

const modes = {
    continue: 'Continue writing this LinkedIn post.',
    improve: 'Improve the quality and writing of this LinkedIn post.',
    grammar: 'Fix grammar and typos in this LinkedIn post.',
    shorter: 'Make the LinkedIn post shorter but still impactful.',
    longer: 'Expand on the ideas and make the LinkedIn post longer.',
    positive: 'Rewrite the LinkedIn post with a more optimistic tone.',
    simplify: 'Simplify the language for broader understanding for LinkedIn post.',
    hook: 'Add a strong attention-grabbing hook at the beginning for LinkedIn post.',
    cta: 'Add a strong CTA at the end for LinkedIn post.',
    emoji: 'Add emojis to make it more expressive for LinkedIn post.',
    examples: 'Add specific examples to support the message for LinkedIn post.',
};

// Default behavior (LinkedIn style post)
const defaultInstruction = 'Write a professional and engaging LinkedIn post based on the following idea or text.';

exports.AIAssist = async (req, res) => {
    const { inputText, type } = req.body;
    const instruction = modes[type] || defaultInstruction;
    try {
        const response = await openai.chat.completions.create({
            model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
            messages: [
                { role: 'system', content: instruction },
                { role: 'user', content: inputText },
            ],
            temperature: 0.7,
        });

        res.json({
            status: true,
            message: "Ai Reply successfully",
            data: response.choices[0].message.content
        });
    } catch (err) {
        console.error('💥 Error:', err.message);
    }
};