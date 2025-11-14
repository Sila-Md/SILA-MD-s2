// ✅ APK Downloader Plugin
const axios = require('axios');

module.exports = {
    name: 'apk-downloader',
    commands: ['apk', 'playstore', 'modapk'],
    description: 'Search and download APK files',

    async handler({ sock, m, sender, args, contextInfo, isGroup }) {
        try {
            const query = args.join(' ').trim();

            if (!query) {
                await sock.sendMessage(sender, {
                    text: '❌ Please provide app name\nExample: .apk whatsapp\n.playstore facebook\n.modapk spotify premium',
                    contextInfo
                }, { quoted: m });
                return;
            }

            await sock.sendPresenceUpdate('composing', sender);

            await sock.sendMessage(sender, {
                text: `🔍 Searching for: "${query}"...`,
                contextInfo
            }, { quoted: m });

            // Search APK
            const searchResponse = await axios.get(`https://api.bk9.dev/search/apk?q=${encodeURIComponent(query)}`);
            const apps = searchResponse.data?.data || searchResponse.data?.results;

            if (!apps || apps.length === 0) {
                await sock.sendMessage(sender, {
                    text: '❌ No apps found. Try different search term.',
                    contextInfo
                }, { quoted: m });
                return;
            }

            const app = apps[0];
            const appId = app.package || app.id;

            if (appId) {
                // Download APK
                const downloadResponse = await axios.get(`https://api.bk9.dev/download/apk?id=${encodeURIComponent(appId)}`);
                const downloadUrl = downloadResponse.data?.url || downloadResponse.data?.downloadUrl;

                if (downloadUrl) {
                    await sock.sendMessage(sender, {
                        document: { url: downloadUrl },
                        fileName: `${app.name || query}.apk`,
                        mimetype: 'application/vnd.android.package-archive',
                        caption: `📱 *${app.name || query}*\n\n📦 Package: ${appId}\n🔄 Version: ${app.version || 'N/A'}\n📊 Size: ${app.size || 'N/A'}\n\n✨ Powered by SILA MD`,
                        contextInfo
                    }, { quoted: m });
                } else {
                    await sock.sendMessage(sender, {
                        text: `📱 *App Found:* ${app.name}\n\n📦 Package: ${appId}\n🔄 Version: ${app.version || 'N/A'}\n📊 Size: ${app.size || 'N/A'}\n\n❌ Download link not available`,
                        contextInfo
                    }, { quoted: m });
                }
            } else {
                await sock.sendMessage(sender, {
                    text: '❌ Could not get app details',
                    contextInfo
                }, { quoted: m });
            }

        } catch (error) {
            await sock.sendMessage(sender, {
                text: `❌ APK Search Error: ${error.message}`,
                contextInfo
            }, { quoted: m });
        }
    }
};
