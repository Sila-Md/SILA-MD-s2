const axios = require('axios');

module.exports = {
    name: 'tools-enhanced',
    commands: ['carbon', 'anime', 'quote', 'lyrics', 'weather', 'joke', 'fact', 'news', 'crypto', 'advice', 'meme', 'riddle', 'trivia', 'tts'],
    description: 'Enhanced tools and utilities',

    async handler({ sock, m, sender, args, contextInfo, isGroup }) {
        try {
            const command = args[0]?.toLowerCase();
            const query = args.slice(1).join(' ').trim();

            await sock.sendPresenceUpdate('composing', sender);

            switch (command) {
                case 'carbon':
                    await this.carbonCode(sock, m, sender, query, contextInfo);
                    break;
                case 'anime':
                    await this.animeQuote(sock, m, sender, contextInfo);
                    break;
                case 'quote':
                    await this.randomQuote(sock, m, sender, contextInfo);
                    break;
                case 'lyrics':
                    await this.getLyrics(sock, m, sender, query, contextInfo);
                    break;
                case 'weather':
                    await this.getWeather(sock, m, sender, query, contextInfo);
                    break;
                case 'joke':
                    await this.getJoke(sock, m, sender, contextInfo);
                    break;
                case 'fact':
                    await this.getFact(sock, m, sender, contextInfo);
                    break;
                case 'news':
                    await this.getNews(sock, m, sender, contextInfo);
                    break;
                case 'crypto':
                    await this.getCrypto(sock, m, sender, query, contextInfo);
                    break;
                case 'advice':
                    await this.getAdvice(sock, m, sender, contextInfo);
                    break;
                case 'meme':
                    await this.getMeme(sock, m, sender, contextInfo);
                    break;
                case 'riddle':
                    await this.getRiddle(sock, m, sender, contextInfo);
                    break;
                case 'trivia':
                    await this.getTrivia(sock, m, sender, contextInfo);
                    break;
                case 'tts':
                    await this.textToSpeech(sock, m, sender, query, contextInfo);
                    break;
                default:
                    await sock.sendMessage(sender, {
                        text: '🛠️ *Tools Commands:*\n\n.carbon <code> - Create code image\n.anime - Get anime quote\n.quote - Random quote\n.lyrics <song> - Get lyrics\n.weather <city> - Weather info\n.joke - Random joke\n.fact - Interesting fact\n.news - Latest news\n.crypto <coin> - Crypto prices\n.advice - Life advice\n.meme - Random meme\n.riddle - Brain teaser\n.trivia - Quiz question\n.tts <text> - Text to speech',
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

    async carbonCode(sock, m, sender, code, contextInfo) {
        try {
            if (!code) {
                await sock.sendMessage(sender, {
                    text: '❌ Please provide code\nExample: .carbon console.log("hello world");',
                    contextInfo
                }, { quoted: m });
                return;
            }

            const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/maker/tocarbon?code=${encodeURIComponent(code)}`);
            const imageUrl = response.data?.url;

            if (imageUrl) {
                await sock.sendMessage(sender, {
                    image: { url: imageUrl },
                    caption: '💻 Carbon Code\n✨ SILA MD',
                    contextInfo
                }, { quoted: m });
            } else {
                throw new Error('Carbon generation failed');
            }

        } catch (error) {
            throw new Error(`Carbon failed: ${error.message}`);
        }
    },

    async animeQuote(sock, m, sender, contextInfo) {
        try {
            const response = await axios.get('https://okatsu-rolezapiiz.vercel.app/anime/quote');
            const quote = response.data;

            if (quote) {
                const quoteText = `🎌 *Anime Quote*\n\n"${quote.quote}"\n\n👤 ${quote.character}\n📺 ${quote.anime}\n✨ SILA MD`;

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

    async randomQuote(sock, m, sender, contextInfo) {
        try {
            const quotes = [
                "The only way to do great work is to love what you do. - Steve Jobs",
                "Innovation distinguishes between a leader and a follower. - Steve Jobs",
                "Your time is limited, so don't waste it living someone else's life. - Steve Jobs",
                "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
                "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill"
            ];
            
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            
            await sock.sendMessage(sender, {
                text: `💫 *Inspirational Quote*\n\n"${randomQuote}"\n\n✨ SILA MD`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Quote failed: ${error.message}`);
        }
    },

    async getLyrics(sock, m, sender, query, contextInfo) {
        try {
            if (!query) {
                await sock.sendMessage(sender, {
                    text: '❌ Please provide song name\nExample: .lyrics shape of you',
                    contextInfo
                }, { quoted: m });
                return;
            }

            // Placeholder for lyrics
            await sock.sendMessage(sender, {
                text: `🎵 Lyrics for: ${query}\n\n🚧 Lyrics feature coming soon!\n\nTry music download with .song command`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Lyrics failed: ${error.message}`);
        }
    },

    async getWeather(sock, m, sender, query, contextInfo) {
        try {
            if (!query) {
                await sock.sendMessage(sender, {
                    text: '❌ Please provide city name\nExample: .weather dar es salaam',
                    contextInfo
                }, { quoted: m });
                return;
            }

            // Placeholder for weather
            await sock.sendMessage(sender, {
                text: `🌤️ Weather for: ${query}\n\n🚧 Weather feature coming soon!`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Weather failed: ${error.message}`);
        }
    },

    async getJoke(sock, m, sender, contextInfo) {
        try {
            const jokes = [
                "Why don't scientists trust atoms? Because they make up everything!",
                "Why did the scarecrow win an award? He was outstanding in his field!",
                "Why don't eggs tell jokes? They'd crack each other up!",
                "What do you call a fake noodle? An impasta!",
                "Why did the math book look so sad? Because it had too many problems!"
            ];
            
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            
            await sock.sendMessage(sender, {
                text: `😂 *Joke Time!*\n\n${randomJoke}\n\n✨ SILA MD`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Joke failed: ${error.message}`);
        }
    },

    async getFact(sock, m, sender, contextInfo) {
        try {
            const facts = [
                "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat.",
                "Octopuses have three hearts. Two pump blood through the gills, while the third pumps it through the rest of the body.",
                "Bananas are berries, but strawberries aren't.",
                "A day on Venus is longer than a year on Venus.",
                "The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes."
            ];
            
            const randomFact = facts[Math.floor(Math.random() * facts.length)];
            
            await sock.sendMessage(sender, {
                text: `📚 *Did You Know?*\n\n${randomFact}\n\n✨ SILA MD`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Fact failed: ${error.message}`);
        }
    },

    async getNews(sock, m, sender, contextInfo) {
        try {
            // Placeholder for news
            await sock.sendMessage(sender, {
                text: `📰 *Latest News*\n\n🚧 News feature coming soon!\n\nStay tuned for updates.`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`News failed: ${error.message}`);
        }
    },

    async getCrypto(sock, m, sender, query, contextInfo) {
        try {
            const coin = query || 'bitcoin';
            
            // Placeholder for crypto
            await sock.sendMessage(sender, {
                text: `💰 Crypto Price: ${coin.toUpperCase()}\n\n🚧 Crypto feature coming soon!`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Crypto failed: ${error.message}`);
        }
    },

    async getAdvice(sock, m, sender, contextInfo) {
        try {
            const advice = [
                "Believe you can and you're halfway there.",
                "The only way to do great work is to love what you do.",
                "Don't watch the clock; do what it does. Keep going.",
                "The future depends on what you do today
