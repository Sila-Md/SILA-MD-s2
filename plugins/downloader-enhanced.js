const axios = require('axios');

module.exports = {
    name: 'downloader-enhanced',
    commands: ['song', 'video', 'tiktok', 'fb', 'apk', 'img', 'mp3', 'mp4', 'yts', 'play', 'apk2', 'mediafire'],
    description: 'Enhanced downloader with all menu commands',

    async handler({ sock, m, sender, args, contextInfo, isGroup }) {
        try {
            const command = args[0]?.toLowerCase();
            const query = args.slice(1).join(' ').trim();

            if (!query && command !== 'img') {
                await sock.sendMessage(sender, {
                    text: '❌ Please provide URL or search query',
                    contextInfo
                }, { quoted: m });
                return;
            }

            await sock.sendPresenceUpdate('composing', sender);

            switch (command) {
                case 'song':
                case 'mp3':
                    await this.downloadSong(sock, m, sender, query, contextInfo);
                    break;
                case 'video':
                case 'mp4':
                    await this.downloadVideo(sock, m, sender, query, contextInfo);
                    break;
                case 'tiktok':
                    await this.downloadTikTok(sock, m, sender, query, contextInfo);
                    break;
                case 'fb':
                    await this.downloadFacebook(sock, m, sender, query, contextInfo);
                    break;
                case 'apk':
                case 'apk2':
                    await this.downloadAPK(sock, m, sender, query, contextInfo);
                    break;
                case 'img':
                    await this.downloadImage(sock, m, sender, query, contextInfo);
                    break;
                case 'yts':
                    await this.searchYouTube(sock, m, sender, query, contextInfo);
                    break;
                case 'play':
                    await this.playSong(sock, m, sender, query, contextInfo);
                    break;
                case 'mediafire':
                    await this.downloadMediafire(sock, m, sender, query, contextInfo);
                    break;
                default:
                    await sock.sendMessage(sender, {
                        text: '❌ Invalid download command',
                        contextInfo
                    }, { quoted: m });
            }

        } catch (error) {
            await sock.sendMessage(sender, {
                text: `❌ Download Error: ${error.message}`,
                contextInfo
            }, { quoted: m });
        }
    },

    async downloadSong(sock, m, sender, query, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: '🎵 Downloading song...',
                contextInfo
            }, { quoted: m });

            // Using NekoLabs API for song download
            const apiUrl = `https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(query)}`;
            const response = await axios.get(apiUrl);
            
            const audioUrl = response.data?.url || response.data?.audioUrl;
            const title = response.data?.title || 'Downloaded Song';

            if (audioUrl) {
                await sock.sendMessage(sender, {
                    audio: { url: audioUrl },
                    mimetype: 'audio/mp4',
                    fileName: `${title}.mp3`,
                    contextInfo
                }, { quoted: m });
            } else {
                throw new Error('No audio URL found');
            }

        } catch (error) {
            throw new Error(`Song download failed: ${error.message}`);
        }
    },

    async downloadVideo(sock, m, sender, query, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: '🎥 Downloading video...',
                contextInfo
            }, { quoted: m });

            const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(query)}`);
            const videoUrl = response.data?.url;

            if (videoUrl) {
                await sock.sendMessage(sender, {
                    video: { url: videoUrl },
                    caption: '📹 Downloaded Video\n✨ SILA MD',
                    contextInfo
                }, { quoted: m });
            } else {
                throw new Error('No video URL found');
            }

        } catch (error) {
            throw new Error(`Video download failed: ${error.message}`);
        }
    },

    async downloadTikTok(sock, m, sender, query, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: '📱 Downloading TikTok...',
                contextInfo
            }, { quoted: m });

            // Placeholder for TikTok download
            await sock.sendMessage(sender, {
                text: '🚧 TikTok downloader coming soon!\n\nTry other download commands like .song or .video',
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`TikTok download failed: ${error.message}`);
        }
    },

    async downloadFacebook(sock, m, sender, query, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: '📘 Downloading Facebook video...',
                contextInfo
            }, { quoted: m });

            const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/downloader/facebook?url=${encodeURIComponent(query)}`);
            const videoUrl = response.data?.url;

            if (videoUrl) {
                await sock.sendMessage(sender, {
                    video: { url: videoUrl },
                    caption: '📹 Facebook Video\n✨ SILA MD',
                    contextInfo
                }, { quoted: m });
            } else {
                throw new Error('No Facebook video URL found');
            }

        } catch (error) {
            throw new Error(`Facebook download failed: ${error.message}`);
        }
    },

    async downloadAPK(sock, m, sender, query, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: `📱 Searching for: ${query}...`,
                contextInfo
            }, { quoted: m });

            const response = await axios.get(`https://api.bk9.dev/search/apk?q=${encodeURIComponent(query)}`);
            const apps = response.data?.data;

            if (apps && apps.length > 0) {
                const app = apps[0];
                const downloadUrl = `https://api.bk9.dev/download/apk?id=${app.package}`;

                await sock.sendMessage(sender, {
                    document: { url: downloadUrl },
                    fileName: `${app.name}.apk`,
                    mimetype: 'application/vnd.android.package-archive',
                    caption: `📱 ${app.name}\n🔄 ${app.version}\n📊 ${app.size}\n✨ SILA MD`,
                    contextInfo
                }, { quoted: m });
            } else {
                throw new Error('No APK found');
            }

        } catch (error) {
            throw new Error(`APK download failed: ${error.message}`);
        }
    },

    async downloadImage(sock, m, sender, query, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: '🖼️ Generating AI image...',
                contextInfo
            }, { quoted: m });

            const prompt = query || 'beautiful landscape';
            const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/ai/txt2img?q=${encodeURIComponent(prompt)}`);
            const imageUrl = response.data?.url;

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

    async searchYouTube(sock, m, sender, query, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: `🔍 Searching YouTube for: ${query}`,
                contextInfo
            }, { quoted: m });

            // Placeholder for YouTube search
            await sock.sendMessage(sender, {
                text: `🎯 YouTube Search Results for: ${query}\n\nUse .song or .video with specific URLs for downloading.`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`YouTube search failed: ${error.message}`);
        }
    },

    async playSong(sock, m, sender, query, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: `🎵 Playing: ${query}`,
                contextInfo
            }, { quoted: m });

            const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/search/play?q=${encodeURIComponent(query)}`);
            const audioUrl = response.data?.url;

            if (audioUrl) {
                await sock.sendMessage(sender, {
                    audio: { url: audioUrl },
                    mimetype: 'audio/mp4',
                    contextInfo
                }, { quoted: m });
            } else {
                throw new Error('No audio found');
            }

        } catch (error) {
            throw new Error(`Play failed: ${error.message}`);
        }
    },

    async downloadMediafire(sock, m, sender, query, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: '📦 Downloading from MediaFire...',
                contextInfo
            }, { quoted: m });

            const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/tools/mediafire?url=${encodeURIComponent(query)}`);
            const downloadUrl = response.data?.url;

            if (downloadUrl) {
                await sock.sendMessage(sender, {
                    document: { url: downloadUrl },
                    fileName: 'mediafire_download.file',
                    contextInfo
                }, { quoted: m });
            } else {
                throw new Error('No MediaFire download URL found');
            }

        } catch (error) {
            throw new Error(`MediaFire download failed: ${error.message}`);
        }
    }
};
