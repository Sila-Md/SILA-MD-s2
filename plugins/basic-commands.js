const config = require('../config');
const os = require('os');

module.exports = {
    name: 'basic-commands',
    commands: ['alive', 'ping', 'uptime', 'system', 'owner', 'jid', 'sila', 'new'],
    description: 'Basic bot commands',

    async handler({ sock, m, sender, args, contextInfo, isGroup }) {
        try {
            const command = args[0]?.toLowerCase();
            const pushname = m.pushName || "User";

            await sock.sendPresenceUpdate('composing', sender);

            switch (command) {
                case 'alive':
                    await this.alive(sock, m, sender, contextInfo);
                    break;
                case 'ping':
                    await this.ping(sock, m, sender, contextInfo);
                    break;
                case 'uptime':
                    await this.uptime(sock, m, sender, contextInfo);
                    break;
                case 'system':
                    await this.system(sock, m, sender, contextInfo);
                    break;
                case 'owner':
                    await this.owner(sock, m, sender, contextInfo);
                    break;
                case 'jid':
                    await this.jid(sock, m, sender, contextInfo);
                    break;
                case 'sila':
                    await this.sila(sock, m, sender, contextInfo);
                    break;
                case 'new':
                    await this.newFeatures(sock, m, sender, contextInfo);
                    break;
                default:
                    await sock.sendMessage(sender, {
                        text: '🐢 *Basic Commands:*\n\n.alive - Bot status\n.ping - Check latency\n.uptime - Bot uptime\n.system - System info\n.owner - Bot owner\n.jid - Get chat JID\n.sila - About SILA MD\n.new - New features',
                        contextInfo
                    }, { quoted: m });
            }

        } catch (error) {
            await sock.sendMessage(sender, {
                text: `❌ Command Error: ${error.message}`,
                contextInfo
            }, { quoted: m });
        }
    },

    async alive(sock, m, sender, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                image: { url: config.ALIVE_IMG },
                caption: config.LIVE_MSG,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Alive failed: ${error.message}`);
        }
    },

    async ping(sock, m, sender, contextInfo) {
        try {
            const start = Date.now();
            const latency = Date.now() - start;
            
            await sock.sendMessage(sender, {
                text: `🏓 *Pong!*\n\n📡 Latency: ${latency}ms\n⚡ Status: Active\n✨ ${config.BOT_NAME}`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Ping failed: ${error.message}`);
        }
    },

    async uptime(sock, m, sender, contextInfo) {
        try {
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            
            await sock.sendMessage(sender, {
                text: `⏰ *Uptime:* ${hours}h ${minutes}m ${seconds}s\n\n🚀 ${config.BOT_NAME} is running smoothly!`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Uptime failed: ${error.message}`);
        }
    },

    async system(sock, m, sender, contextInfo) {
        try {
            const memory = process.memoryUsage();
            const used = Math.round(memory.heapUsed / 1024 / 1024);
            const total = Math.round(memory.heapTotal / 1024 / 1024);
            
            await sock.sendMessage(sender, {
                text: `💻 *System Info*\n\n🖥️ Platform: ${os.platform()}\n📊 Memory: ${used}MB / ${total}MB\n⚡ Uptime: ${Math.floor(process.uptime())}s\n🐢 ${config.BOT_NAME}`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`System failed: ${error.message}`);
        }
    },

    async owner(sock, m, sender, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: `👑 *Bot Owner*\n\n📛 Name: ${config.OWNER_NAME}\n📞 Number: ${config.OWNER_NUMBER}\n\n💬 Contact for support or queries.`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Owner failed: ${error.message}`);
        }
    },

    async jid(sock, m, sender, contextInfo) {
        try {
            const jid = m.key.remoteJid;
            
            await sock.sendMessage(sender, {
                text: `🆔 *Chat JID:*\n\n${jid}\n\n💡 Use this for bot development or support.`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`JID failed: ${error.message}`);
        }
    },

    async sila(sock, m, sender, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: `🐢 *SILA MD s1*\n\n✨ Advanced WhatsApp Bot\n🚀 Multi-Device Support\n🎯 100+ Features\n💖 Powered by Sila Tech\n\n📱 Version: 2.0.0\n🔧 Mode: ${config.MODE}\n🎮 Prefix: ${config.PREFIX}`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Sila failed: ${error.message}`);
        }
    },

    async newFeatures(sock, m, sender, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: `🎉 *New Features!*\n\n🤖 Advanced AI Chat\n🖼️ AI Image Generation\n🎵 Enhanced Music Download\n📱 APK Downloader\n💻 Code Tools\n🎮 Fun Commands\n🔧 Utility Tools\n\n✨ More features coming soon!`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`New features failed: ${error.message}`);
        }
    }
};
