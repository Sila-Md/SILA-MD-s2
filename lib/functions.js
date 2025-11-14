// ✅ Utility Functions for Sila MD Bot
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class SilaFunctions {
    constructor() {
        this.tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    // ✅ Download media from URL
    async downloadMedia(url, filename) {
        try {
            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream'
            });

            const filePath = path.join(this.tempDir, filename);
            const writer = fs.createWriteStream(filePath);

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(filePath));
                writer.on('error', reject);
            });
        } catch (error) {
            throw new Error(`Download failed: ${error.message}`);
        }
    }

    // ✅ Generate random text with stylish fonts
    stylishText(text) {
        const fonts = {
            bold: '𝐁𝐨𝐥𝐝',
            italic: '𝑰𝒕𝒂𝒍𝒊𝒄',
            monospace: '𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎',
            script: '𝒮𝒸𝓇𝒾𝓅𝓉',
            doubleStruck: '𝔻𝕠𝕦𝕓𝕝𝕖𝕊𝕥𝕣𝕦𝕔𝕜'
        };
        
        // Simple implementation - you can expand this with actual font mapping
        return `✨ ${text} ✨`;
    }

    // ✅ Fake typing indicator
    async fakeTyping(sock, jid, duration = 3000) {
        try {
            await sock.sendPresenceUpdate('composing', jid);
            setTimeout(async () => {
                await sock.sendPresenceUpdate('paused', jid);
            }, duration);
        } catch (error) {
            console.log('Typing indicator error:', error.message);
        }
    }

    // ✅ Fake recording indicator
    async fakeRecording(sock, jid, duration = 3000) {
        try {
            await sock.sendPresenceUpdate('recording', jid);
            setTimeout(async () => {
                await sock.sendPresenceUpdate('paused', jid);
            }, duration);
        } catch (error) {
            console.log('Recording indicator error:', error.message);
        }
    }

    // ✅ Check if user is admin
    async isAdmin(sock, groupJid, userJid) {
        try {
            const metadata = await sock.groupMetadata(groupJid);
            const participants = metadata.participants;
            const user = participants.find(p => p.id === userJid);
            return user && (user.admin === 'admin' || user.admin === 'superadmin');
        } catch (error) {
            return false;
        }
    }

    // ✅ Anti-link detection
    containsLinks(text) {
        const linkPatterns = [
            /http[s]?:\/\/[^\s]+/gi,
            /www\.[^\s]+/gi,
            /[^\s]+\.[a-z]{2,}[^\s]*/gi
        ];
        
        return linkPatterns.some(pattern => pattern.test(text));
    }

    // ✅ Clean temporary files
    cleanTemp() {
        try {
            const files = fs.readdirSync(this.tempDir);
            const now = Date.now();
            const maxAge = 30 * 60 * 1000; // 30 minutes

            files.forEach(file => {
                const filePath = path.join(this.tempDir, file);
                const stats = fs.statSync(filePath);
                
                if (now - stats.mtime.getTime() > maxAge) {
                    fs.unlinkSync(filePath);
                }
            });
        } catch (error) {
            console.log('Clean temp error:', error.message);
        }
    }
}

module.exports = SilaFunctions;
