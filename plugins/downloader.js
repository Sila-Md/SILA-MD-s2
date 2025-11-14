// ✅ Enhanced Media Downloader Plugin
const axios = require('axios');

module.exports = {
    name: 'downloader',
    commands: ['yt', 'fb', 'mediafire', 'videy', 'song', 'video', 'play', 'spotify'],
    description: 'Download media from various platforms',

    async handler({ sock, m, sender, args, contextInfo, isGroup }) {
        try {
            const command = args[0]?.toLowerCase();
            const url = args[1];

            if (!url && !['play', 'spotify'].includes(command)) {
                await sock.sendMessage(sender, {
                    text: `❌ Please provide URL\nExamples:\n.yt https://youtube.com/...\n.fb https://facebook.com/...\n.mediafire https://mediafire.com/...\n.song song name\n.spotify song name`,
                    contextInfo
                }, { quoted: m });
                return;
            }

            await sock.sendPresenceUpdate('composing', sender);

            switch (command) {
                case 'yt':
                case 'song':
                    await this.downloadYouTube(sock, m, sender, url, 'audio', contextInfo);
                    break;
                case 'video':
                    await this.downloadYouTube(sock, m, sender, url, 'video', contextInfo);
                    break;
                case 'fb':
                    await this.downloadFacebook(sock, m, sender, url, contextInfo);
                    break;
                case 'mediafire':
                    await this.downloadMediafire(sock, m, sender, url, contextInfo);
                    break;
                case 'videy':
                    await this.downloadVidey(sock, m, sender, url, contextInfo);
                    break;
                case 'play':
                case 'spotify':
                    const query = args.slice(1).join(' ');
                    await this.searchAndDownload(sock, m, sender, query, contextInfo);
                    break;
                default:
                    await sock.sendMessage(sender, {
                        text: '❌ Invalid command. Use: .yt, .fb, .mediafire, .videy, .song, .video, .play, .spotify',
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

    async downloadYouTube(sock, m, sender, url, type, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: type === 'audio' ? '🎵 Downloading YouTube audio...' : '🎥 Downloading YouTube video...',
                contextInfo
            }, { quoted: m });

            const endpoint = type === 'audio' ? 
                'https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3' :
                'https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4';

            const response = await axios.get(`${endpoint}?url=${encodeURIComponent(url)}`);
            const mediaUrl = response.data?.url || response.data?.downloadUrl;

            if (mediaUrl) {
                if (type === 'audio') {
                    await sock.sendMessage(sender, {
                        audio: { url: mediaUrl },
                        mimetype: 'audio/mp4',
                        contextInfo
                    }, { quoted: m });
                } else {
                    await sock.sendMessage(sender, {
                        video: { url: mediaUrl },
                        contextInfo
                    }, { quoted: m });
                }
            } else {
                throw new Error('No media URL found');
            }

        } catch (error) {
            throw new Error(`YouTube download failed: ${error.message}`);
        }
    },

    async downloadFacebook(sock, m, sender, url, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: '📘 Downloading Facebook video...',
                contextInfo
            }, { quoted: m });

            const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/downloader/facebook?url=${encodeURIComponent(url)}`);
            const videoUrl = response.data?.url || response.data?.videoUrl;

            if (videoUrl) {
                await sock.sendMessage(sender, {
                    video: { url: videoUrl },
                    contextInfo
                }, { quoted: m });
            } else {
                throw new Error('No video URL found');
            }

        } catch (error) {
            throw new Error(`Facebook download failed: ${error.message}`);
        }
    },

    async downloadMediafire(sock, m, sender, url, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: '📦 Downloading from MediaFire...',
                contextInfo
            }, { quoted: m });

            const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/tools/mediafire?url=${encodeURIComponent(url)}`);
            const downloadUrl = response.data?.url || response.data?.downloadUrl;

            if (downloadUrl) {
                const fileName = response.data?.filename || 'download.file';
                await sock.sendMessage(sender, {
                    document: { url: downloadUrl },
                    fileName: fileName,
                    mimetype: 'application/octet-stream',
                    contextInfo
                }, { quoted: m });
            } else {
                throw new Error('No download URL found');
            }

        } catch (error) {
            throw new Error(`MediaFire download failed: ${error.message}`);
        }
    },

    async downloadVidey(sock, m, sender, url, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: '🎬 Downloading from Videy...',
                contextInfo
            }, { quoted: m });

            const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/downloader/videy?url=${encodeURIComponent(url)}`);
            const videoUrl = response.data?.url || response.data?.videoUrl;

            if (videoUrl) {
                await sock.sendMessage(sender, {
                    video: { url: videoUrl },
                    contextInfo
                }, { quoted: m });
            } else {
                throw new Error('No video URL found');
            }

        } catch (error) {
            throw new Error(`Videy download failed: ${error.message}`);
        }
    },

    async searchAndDownload(sock, m, sender, query, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: `🔍 Searching for: "${query}"...`,
                contextInfo
            }, { quoted: m });

            const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/search/play?q=${encodeURIComponent(query)}`);
            const mediaUrl = response.data?.url || response.data?.audioUrl;

            if (mediaUrl) {
                await sock.sendMessage(sender, {
                    audio: { url: mediaUrl },
                    mimetype: 'audio/mp4',
                    contextInfo
                }, { quoted: m });
            } else {
                // Try Spotify
                const spotifyResponse = await axios.get(`https://okatsu-rolezapiiz.vercel.app/search/spotify?q=${encodeURIComponent(query)}`);
                const spotifyUrl = spotifyResponse.data?.url;
                
                if (spotifyUrl) {
                    await sock.sendMessage(sender, {
                        audio: { url: spotifyUrl },
                        mimetype: 'audio/mp4',
                        contextInfo
                    }, { quoted: m });
                } else {
                    throw new Error('No results found');
                }
            }

        } catch (error) {
            throw new Error(`Search & download failed: ${error.message}`);
        }
    }
};
