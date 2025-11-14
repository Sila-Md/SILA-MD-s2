// ✅ AI Image Generator Plugin
const axios = require('axios');

module.exports = {
    name: 'image-generator',
    commands: ['img', 'image', 'generate', 'aiimg', 'flux'],
    description: 'Generate AI images from text prompts',

    async handler({ sock, m, sender, args, contextInfo, isGroup }) {
        try {
            const prompt = args.join(' ').trim();

            if (!prompt) {
                await sock.sendMessage(sender, {
                    text: '❌ Please provide image prompt\nExample: .img a beautiful sunset over mountains\n.flux futuristic city at night',
                    contextInfo
                }, { quoted: m });
                return;
            }

            await sock.sendPresenceUpdate('composing', sender);

            // Send processing message
            await sock.sendMessage(sender, {
                text: `🎨 Generating image for: "${prompt}"\n\nPlease wait...`,
                contextInfo
            }, { quoted: m });

            let imageUrl;
            const command = args[0]?.toLowerCase();

            if (command === 'flux') {
                const fluxPrompt = args.slice(1).join(' ');
                const response = await axios.get(`https://api.bk9.dev/ai/fluximg?q=${encodeURIComponent(fluxPrompt)}`);
                imageUrl = response.data?.url || response.data?.image;
            } else {
                const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/ai/txt2img?q=${encodeURIComponent(prompt)}`);
                imageUrl = response.data?.url || response.data?.image;
            }

            if (!imageUrl) {
                // Fallback to shizoapi
                const shizoResponse = await axios.get(`https://shizoapi.onrender.com/api/ai/imagine?apikey=shizo&query=${encodeURIComponent(prompt)}`);
                imageUrl = shizoResponse.data?.image || shizoResponse.data?.url;
            }

            if (imageUrl) {
                await sock.sendMessage(sender, {
                    image: { url: imageUrl },
                    caption: `🖼️ *AI Generated Image*\n\n📝 Prompt: ${prompt}\n\n✨ Powered by SILA MD`,
                    contextInfo
                }, { quoted: m });
            } else {
                await sock.sendMessage(sender, {
                    text: `❌ Failed to generate image. Please try again with different prompt.`,
                    contextInfo
                }, { quoted: m });
            }

        } catch (error) {
            await sock.sendMessage(sender, {
                text: `❌ Image Generation Error: ${error.message}`,
                contextInfo
            }, { quoted: m });
        }
    }
};
