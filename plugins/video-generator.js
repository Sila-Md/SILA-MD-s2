// ✅ AI Video Generator Plugin
const axios = require('axios');

module.exports = {
    name: 'video-generator',
    commands: ['videoai', 'genvideo', 'txt2video'],
    description: 'Generate AI videos from text prompts',

    async handler({ sock, m, sender, args, contextInfo, isGroup }) {
        try {
            const prompt = args.join(' ').trim();

            if (!prompt) {
                await sock.sendMessage(sender, {
                    text: '❌ Please provide video prompt\nExample: .videoai a cat dancing in space',
                    contextInfo
                }, { quoted: m });
                return;
            }

            await sock.sendPresenceUpdate('composing', sender);

            // Send processing message
            await sock.sendMessage(sender, {
                text: `🎥 Generating video for: "${prompt}"\n\nThis may take a while...`,
                contextInfo
            }, { quoted: m });

            const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/ai/txt2video?q=${encodeURIComponent(prompt)}`);
            
            const videoUrl = response.data?.url || response.data?.video;

            if (videoUrl) {
                await sock.sendMessage(sender, {
                    video: { url: videoUrl },
                    caption: `🎬 *AI Generated Video*\n\n📝 Prompt: ${prompt}\n\n✨ Powered by SILA MD`,
                    contextInfo
                }, { quoted: m });
            } else {
                await sock.sendMessage(sender, {
                    text: `❌ Video generation failed or not supported yet. Try image generation instead.`,
                    contextInfo
                }, { quoted: m });
            }

        } catch (error) {
            await sock.sendMessage(sender, {
                text: `❌ Video Generation Error: ${error.message}`,
                contextInfo
            }, { quoted: m });
        }
    }
};
