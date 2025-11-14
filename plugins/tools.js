// ✅ Tools & Utilities Plugin
const axios = require('axios');

module.exports = {
    name: 'tools',
    commands: ['carbon', 'anime', 'quote', 'github', 'trending'],
    description: 'Various tools and utilities',

    async handler({ sock, m, sender, args, contextInfo, isGroup }) {
        try {
            const command = args[0]?.toLowerCase();

            await sock.sendPresenceUpdate('composing', sender);

            switch (command) {
                case 'carbon':
                    await this.carbonCode(sock, m, sender, args.slice(1), contextInfo);
                    break;
                case 'anime':
                case 'quote':
                    await this.animeQuote(sock, m, sender, contextInfo);
                    break;
                case 'github':
                case 'trending':
                    await this.githubTrending(sock, m, sender, contextInfo);
                    break;
                default:
                    await sock.sendMessage(sender, {
                        text: '🛠️ *Available Tools:*\n\n.carbon <code> - Create carbon code image\n.anime - Get random anime quote\n.github - Show GitHub trending repos',
                        contextInfo
                    }, { quoted: m });
            }

        } catch (error) {
            await sock.sendMessage(sender, {
                text: `❌ Tools Error: ${error.message}`,
                contextInfo
            }, { quoted: m });
        }
    },

    async carbonCode(sock, m, sender, args, contextInfo) {
        try {
            const code = args.join(' ').trim();

            if (!code) {
                await sock.sendMessage(sender, {
                    text: '❌ Please provide code\nExample: .carbon console.log("Hello World");',
                    contextInfo
                }, { quoted: m });
                return;
            }

            await sock.sendMessage(sender, {
                text: '🖥️ Creating carbon code image...',
                contextInfo
            }, { quoted: m });

            const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/maker/tocarbon?code=${encodeURIComponent(code)}`);
            const imageUrl = response.data?.url || response.data?.image;

            if (imageUrl) {
                await sock.sendMessage(sender, {
                    image: { url: imageUrl },
                    caption: '✨ Carbon Code Image\nPowered by SILA MD',
                    contextInfo
                }, { quoted: m });
            } else {
                throw new Error('Failed to generate carbon image');
            }

        } catch (error) {
            throw new Error(`Carbon generation failed: ${error.message}`);
        }
    },

    async animeQuote(sock, m, sender, contextInfo) {
        try {
            const response = await axios.get('https://okatsu-rolezapiiz.vercel.app/anime/quote');
            const quote = response.data;

            if (quote) {
                const quoteText = `🎌 *Anime Quote*\n\n"${quote.quote}"\n\n👤 Character: ${quote.character}\n📺 Anime: ${quote.anime}\n🎬 Episode: ${quote.episode || 'N/A'}\n\n✨ Powered by SILA MD`;

                await sock.sendMessage(sender, {
                    text: quoteText,
                    contextInfo
                }, { quoted: m });
            } else {
                throw new Error('No quote received');
            }

        } catch (error) {
            throw new Error(`Anime quote failed: ${error.message}`);
        }
    },

    async githubTrending(sock, m, sender, contextInfo) {
        try {
            const response = await axios.get('https://okatsu-rolezapiiz.vercel.app/search/githubtrend');
            const trending = response.data?.repos || response.data;

            if (trending && trending.length > 0) {
                let trendingText = '🔥 *GitHub Trending Repositories*\n\n';

                trending.slice(0, 5).forEach((repo, index) => {
                    trendingText += `${index + 1}. *${repo.name}*\n`;
                    trendingText += `   📝 ${repo.description || 'No description'}\n`;
                    trendingText += `   ⭐ Stars: ${repo.stars || 0}\n`;
                    trendingText += `   🍴 Forks: ${repo.forks || 0}\n`;
                    trendingText += `   🔗 ${repo.url || 'No URL'}\n\n`;
                });

                trendingText += '✨ Powered by SILA MD';

                await sock.sendMessage(sender, {
                    text: trendingText,
                    contextInfo
                }, { quoted: m });
            } else {
                throw new Error('No trending data');
            }

        } catch (error) {
            throw new Error(`GitHub trending failed: ${error.message}`);
        }
    }
};
