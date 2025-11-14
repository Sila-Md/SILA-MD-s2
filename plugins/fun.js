// ✅ Fun & Entertainment Plugin
const axios = require('axios');

module.exports = {
    name: 'fun',
    commands: ['joke', 'fact', 'meme', 'quote'],
    description: 'Fun and entertainment commands',

    async handler({ sock, m, sender, args, contextInfo, isGroup }) {
        try {
            const command = args[0]?.toLowerCase();

            await sock.sendPresenceUpdate('composing', sender);

            switch (command) {
                case 'joke':
                    await this.getJoke(sock, m, sender, contextInfo);
                    break;
                case 'fact':
                    await this.getFact(sock, m, sender, contextInfo);
                    break;
                case 'meme':
                    await this.getMeme(sock, m, sender, contextInfo);
                    break;
                case 'quote':
                    await this.getQuote(sock, m, sender, contextInfo);
                    break;
                default:
                    await sock.sendMessage(sender, {
                        text: '🎉 *Fun Commands:*\n\n.joke - Get random joke\n.fact - Get interesting fact\n.meme - Get random meme\n.quote - Get inspirational quote',
                        contextInfo
                    }, { quoted: m });
            }

        } catch (error) {
            await sock.sendMessage(sender, {
                text: `❌ Fun Error: ${error.message}`,
                contextInfo
            }, { quoted: m });
        }
    },

    async getJoke(sock, m, sender, contextInfo) {
        try {
            // Simple joke API (you can replace with actual API)
            const jokes = [
                "Why don't scientists trust atoms? Because they make up everything!",
                "Why did the scarecrow win an award? He was outstanding in his field!",
                "Why don't eggs tell jokes? They'd crack each other up!",
                "What do you call a fake noodle? An impasta!",
                "Why did the math book look so sad? Because it had too many problems!"
            ];
            
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            
            await sock.sendMessage(sender, {
                text: `😂 *Joke Time!*\n\n${randomJoke}\n\n✨ SILA MD Fun`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Joke failed: ${error.message}`);
        }
    },

    async getFact(sock, m, sender, contextInfo) {
        try {
            // Simple facts (you can replace with actual API)
            const facts = [
                "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat.",
                "Octopuses have three hearts. Two pump blood through the gills, while the third pumps it through the rest of the body.",
                "Bananas are berries, but strawberries aren't.",
                "A day on Venus is longer than a year on Venus.",
                "The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes."
            ];
            
            const randomFact = facts[Math.floor(Math.random() * facts.length)];
            
            await sock.sendMessage(sender, {
                text: `📚 *Did You Know?*\n\n${randomFact}\n\n✨ SILA MD Facts`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Fact failed: ${error.message}`);
        }
    },

    async getMeme(sock, m, sender, contextInfo) {
        try {
            // Simple meme (you can integrate with meme API)
            await sock.sendMessage(sender, {
                text: `🖼️ *Meme Feature*\n\nMeme generation coming soon! For now, enjoy our other fun features. 😊\n\n✨ SILA MD`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Meme failed: ${error.message}`);
        }
    },

    async getQuote(sock, m, sender, contextInfo) {
        try {
            // Simple quotes (you can replace with actual API)
            const quotes = [
                "The only way to do great work is to love what you do. - Steve Jobs",
                "Innovation distinguishes between a leader and a follower. - Steve Jobs",
                "Your time is limited, so don't waste it living someone else's life. - Steve Jobs",
                "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
                "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill"
            ];
            
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            
            await sock.sendMessage(sender, {
                text: `💫 *Inspirational Quote*\n\n"${randomQuote}"\n\n✨ SILA MD Motivation`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Quote failed: ${error.message}`);
        }
    }
};
