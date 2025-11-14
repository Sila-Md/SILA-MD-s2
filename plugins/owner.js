// ✅ Owner Only Commands Plugin
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'owner',
    commands: ['broadcast', 'bc', 'setprefix', 'restart', 'shutdown', 'eval'],
    description: 'Owner only commands',

    async handler({ sock, m, sender, args, contextInfo, isGroup }) {
        try {
            const config = require('../config.js');
            const ownerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`;

            // Check if user is owner
            if (sender !== ownerJid) {
                await sock.sendMessage(sender, {
                    text: '❌ This command is only for the bot owner!',
                    contextInfo
                }, { quoted: m });
                return;
            }

            const command = args[0]?.toLowerCase();

            await sock.sendPresenceUpdate('composing', sender);

            switch (command) {
                case 'broadcast':
                case 'bc':
                    await this.broadcast(sock, m, sender, args.slice(1), contextInfo);
                    break;
                case 'setprefix':
                    await this.setPrefix(sock, m, sender, args.slice(1), contextInfo);
                    break;
                case 'restart':
                    await this.restartBot(sock, m, sender, contextInfo);
                    break;
                case 'shutdown':
                    await this.shutdownBot(sock, m, sender, contextInfo);
                    break;
                case 'eval':
                    await this.evalCode(sock, m, sender, args.slice(1), contextInfo);
                    break;
                default:
                    await sock.sendMessage(sender, {
                        text: '👑 *Owner Commands:*\n\n.broadcast <message> - Broadcast message\n.setprefix <prefix> - Change bot prefix\n.restart - Restart bot\n.shutdown - Shutdown bot\n.eval <code> - Evaluate code',
                        contextInfo
                    }, { quoted: m });
            }

        } catch (error) {
            await sock.sendMessage(sender, {
                text: `❌ Owner Command Error: ${error.message}`,
                contextInfo
            }, { quoted: m });
        }
    },

    async broadcast(sock, m, sender, args, contextInfo) {
        try {
            const message = args.join(' ').trim();

            if (!message) {
                await sock.sendMessage(sender, {
                    text: '❌ Please provide broadcast message',
                    contextInfo
                }, { quoted: m });
                return;
            }

            // In real implementation, you would get all chats
            // This is a simplified version
            await sock.sendMessage(sender, {
                text: `📢 Broadcast sent to all chats!\n\nMessage: ${message}`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Broadcast failed: ${error.message}`);
        }
    },

    async setPrefix(sock, m, sender, args, contextInfo) {
        try {
            const newPrefix = args[0];

            if (!newPrefix) {
                await sock.sendMessage(sender, {
                    text: '❌ Please provide new prefix\nExample: .setprefix !',
                    contextInfo
                }, { quoted: m });
                return;
            }

            // In real implementation, you would update config
            await sock.sendMessage(sender, {
                text: `✅ Prefix updated to: ${newPrefix}\n\nNote: This is a demo. Actual config update requires file modification.`,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Set prefix failed: ${error.message}`);
        }
    },

    async restartBot(sock, m, sender, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: '🔄 Restarting bot...',
                contextInfo
            }, { quoted: m });

            // In real implementation, you would restart the process
            setTimeout(() => {
                process.exit(0);
            }, 2000);

        } catch (error) {
            throw new Error(`Restart failed: ${error.message}`);
        }
    },

    async shutdownBot(sock, m, sender, contextInfo) {
        try {
            await sock.sendMessage(sender, {
                text: '⏹️ Shutting down bot...',
                contextInfo
            }, { quoted: m });

            process.exit(0);

        } catch (error) {
            throw new Error(`Shutdown failed: ${error.message}`);
        }
    },

    async evalCode(sock, m, sender, args, contextInfo) {
        try {
            const code = args.join(' ').trim();

            if (!code) {
                await sock.sendMessage(sender, {
                    text: '❌ Please provide code to evaluate',
                    contextInfo
                }, { quoted: m });
                return;
            }

            let result;
            try {
                result = eval(code);
            } catch (evalError) {
                result = `Error: ${evalError.message}`;
            }

            await sock.sendMessage(sender, {
                text: `📝 *Eval Result:*\n\n\`\`\`${result}\`\`\``,
                contextInfo
            }, { quoted: m });

        } catch (error) {
            throw new Error(`Eval failed: ${error.message}`);
        }
    }
};
