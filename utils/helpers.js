// ✅ Helper Functions for Sila MD Bot
const moment = require('moment-timezone');

class SilaHelpers {
    // ✅ Format time
    static formatTime(timezone = 'Africa/Dar_es_Salaam') {
        return moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss');
    }

    // ✅ Format file size
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ✅ Generate random ID
    static generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // ✅ Delay function
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ✅ Validate phone number
    static validatePhoneNumber(number) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(number.replace(/\s/g, ''));
    }

    // ✅ Extract JID from message
    static extractJid(message) {
        if (message.key && message.key.remoteJid) {
            return message.key.remoteJid;
        }
        return null;
    }

    // ✅ Get user name from message
    static async getUserName(sock, message) {
        try {
            const jid = this.extractJid(message);
            if (!jid) return 'Unknown';
            
            const contact = await sock.getContact(jid);
            return contact.name || contact.notify || 'Unknown';
        } catch (error) {
            return 'Unknown';
        }
    }

    // ✅ Create progress bar
    static createProgressBar(percentage, length = 20) {
        const filled = Math.round((percentage / 100) * length);
        const empty = length - filled;
        return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percentage}%`;
    }

    // ✅ Sanitize text for file names
    static sanitizeFileName(text) {
        return text.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }
}

module.exports = SilaHelpers;
