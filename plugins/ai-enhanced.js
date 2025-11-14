const axios = require('axios');

module.exports = {
    name: 'ai-enhanced',
    commands: ['ai', 'gpt', 'flux2', 'imagine', 'sora', 'gemini', 'textmaker'],
    description: 'Enhanced AI commands from menu',

    async handler({ sock, m, sender, args, contextInfo, isGroup }) {
        try {
            const command = args[0]?.toLowerCase();
            const query = args.slice(1).join(' ').trim();

            if (!query && command !== 'flux2') {
                await sock.sendMessage(sender, {
                    text: '❌ Please provide your question or prompt',
                    contextInfo
                }, { quoted: m });
                return;
            }

            await sock.sendPresenceUpdate('composing', sender);

            switch (command) {
                case 'ai':
                case 'gpt':
                    await this.chatGPT(sock, m, sender, query, contextInfo);
                    break;
                case 'flux2':
                case 'imagine':
                    await this.generateImage(sock, m, sender, query, contextInfo);
                    break;
                case 'sora':
                    await this.generateVideo(sock, m, sender, query, contextInfo);
                    break;
                case 'gemini':
                    await this.chatGemini(sock, m, sender, query, contextInfo);
                    break;
                case 'textmaker':
                    await this.textMaker(sock, m, sender, query, contextInfo);
                    break;
                default:
                    await sock.sendMessage(sender, {
                        text: '🤖 *AI Commands:*\n\n.ai <question> - Chat with AI\n.gemini <question> - Ask Gemini\n.flux2 <prompt> - Generate image\n.imagine <prompt> - Generate image\n.sora <prompt> - Generate video\n.textmaker <text> - Create styled text',
                        contextInfo
                    }, { quoted: m });
            }

        } catch (error) {
            await sock.sendMessage(sender, {
                text: `❌ AI Error: ${error.message}`,
                contextInfo
            }, { quoted: m });
        }
    },

    async chatGPT(sock, m, sender, query, contextInfo) {
        try {
            const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/ai/chat?q=${encodeURIComponent(query)}`);
            const answer = response.data?.result || response.data?.answer || 'No response from AI';

            await sock.sendMessage(sender, {
                text: `🧠 *GPT Response:*\n\n${answer}\n\n✨ SILA MD AI`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`GPT chat failed: ${error.message}`);
        }
    },

    async generateImage(sock, m, sender, query, contextInfo) {
        try {
            const prompt = query || 'beautiful landscape';
            
            // Try multiple image APIs
            let imageUrl;
            try {
                const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/ai/txt2img?q=${encodeURIComponent(prompt)}`);
                imageUrl = response.data?.url;
            } catch {
                const response = await axios.get(`https://api.bk9.dev/ai/fluximg?q=${encodeURIComponent(prompt)}`);
                imageUrl = response.data?.url;
            }

            if (imageUrl) {
                await sock.sendMessage(sender, {
                    image: { url: imageUrl },
                    caption: `🖼️ ${prompt}\n✨ SILA MD AI`,
                    contextInfo
                }, { quoted: m });
            } else {
                throw new Error('No image generated');
            }

        } catch (error) {
            throw new Error(`Image generation failed: ${error.message}`);
        }
    },

    async generateVideo(sock, m, sender, query, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: `🎥 Generating AI video: ${query}\n\nThis may take a while...`,
                contextInfo
            }, { quoted: m });

            // Placeholder for Sora video generation
            await sock.sendMessage(sender, {
                text: `🚧 Sora AI video generation coming soon!\n\nFor now, try image generation with .flux2 or .imagine`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Video generation failed: ${error.message}`);
        }
    },

    async chatGemini(sock, m, sender, query, contextInfo) {
        try {
            const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/ai/gemini?q=${encodeURIComponent(query)}`);
            const answer = response.data?.result || response.data?.answer || 'No response from Gemini';

            await sock.sendMessage(sender, {
                text: `🔮 *Gemini Response:*\n\n${answer}\n\n✨ SILA MD AI`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Gemini chat failed: ${error.message}`);
        }
    },

    async textMaker(sock, m, sender, query, contextInfo) {
        try {
            // Simple text styling
            const styledText = this.styleText(query);
            
            await sock.sendMessage(sender, {
                text: `🎨 *Styled Text:*\n\n${styledText}\n\n✨ SILA MD Text Maker`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Text maker failed: ${error.message}`);
        }
    },

    styleText(text) {
        const styles = {
            bold: text.split('').map(char => `𝐁${char}`).join(''),
            italic: text.split('').map(char => `𝐼${char}`).join(''),
            monospace: text.split('').map(char => `𝙼${char}`).join(''),
            double: text.split('').map(char => `𝔻${char}`).join('')
        };
        
        return `𝐁𝐨𝐥𝐝: ${styles.bold}\n𝐼𝑡𝑎𝑙𝑖𝑐: ${styles.italic}\n𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎: ${styles.monospace}\n𝔻𝕠𝕦𝕓𝕝𝕖: ${styles.double}`;
    }
};
