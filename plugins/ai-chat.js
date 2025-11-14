// ✅ AI Chat Plugin with Multiple AI Models
const axios = require('axios');

module.exports = {
    name: 'ai-chat',
    commands: ['ai', 'gpt', 'gemini', 'ask', 'mistral'],
    description: 'Chat with various AI models (GPT, Gemini, Mistral)',

    async handler({ sock, m, sender, args, contextInfo, isGroup }) {
        try {
            const question = args.join(' ').trim();

            if (!question) {
                await sock.sendMessage(sender, {
                    text: '❌ Please provide a question\nExample: .ai hello\n.gemini what is AI\n.mistral explain quantum physics',
                    contextInfo
                }, { quoted: m });
                return;
            }

            await sock.sendPresenceUpdate('composing', sender);

            const command = args[0]?.toLowerCase();
            let apiUrl = '';

            if (command === 'gemini') {
                const geminiQuestion = args.slice(1).join(' ');
                apiUrl = `https://okatsu-rolezapiiz.vercel.app/ai/gemini?q=${encodeURIComponent(geminiQuestion)}`;
            } else if (command === 'mistral') {
                const mistralQuestion = args.slice(1).join(' ');
                apiUrl = `https://okatsu-rolezapiiz.vercel.app/ai/ask?q=${encodeURIComponent(mistralQuestion)}`;
            } else {
                apiUrl = `https://okatsu-rolezapiiz.vercel.app/ai/chat?q=${encodeURIComponent(question)}`;
            }

            const response = await axios.get(apiUrl);
            let answer = response.data?.result || response.data?.answer || response.data?.text || 'No response from AI';

            // Trim long responses
            if (answer.length > 4000) {
                answer = answer.substring(0, 4000) + '...\n\n💡 Response was too long, truncated.';
            }

            const modelName = command === 'gemini' ? 'Google Gemini' : command === 'mistral' ? 'Mistral AI' : 'GPT';

            await sock.sendMessage(sender, {
                text: `🧠 *${modelName} Response:*\n\n${answer}\n\n✨ Powered by SILA MD AI`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            await sock.sendMessage(sender, {
                text: `❌ AI Error: ${error.message}`,
                contextInfo
            }, { quoted: m });
        }
    }
};
