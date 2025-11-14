const { File: BufferFile } = require('node:buffer');
global.File = BufferFile;

// ✅ Sila Tech  Property 2025
const baileys = require('@whiskeysockets/baileys');
const {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    Browsers,
    DisconnectReason,
    isJidGroup,
    isJidBroadcast,
    isJidStatusBroadcast,
    areJidsSameUser,
    makeInMemoryStore,
    downloadContentFromMessage
} = baileys;

const fs = require('fs');
const path = require('path');
const os = require('os');
const express = require('express');
const P = require('pino');
const { handleMessages } = require('./handler');
const config = require('./config.js');
const store = makeInMemoryStore({ logger: P({ level: 'silent' }) });

const prefix = config.PREFIX || '.';
const tempDir = path.join(os.tmpdir(), 'sila-cache');
const port = process.env.PORT || 25680;
const pluginsDir = path.join(__dirname, 'plugins');
const libDir = path.join(__dirname, 'lib');
const utilsDir = path.join(__dirname, 'utils');

// ✅ Message Cache for Anti-Delete
const messageCache = new Map();

// ✅ Auto Reply Messages with Stylish Fonts
const autoReplies = {
    'hi': '𝙷𝚎𝚕𝚕𝚘! 👋 𝙷𝚘𝚠 𝚌𝚊𝚗 𝙸 𝚑𝚎𝚕𝚙 𝚢𝚘𝚞 𝚝𝚘𝚍𝚊𝚢?',
    'mambo': '𝙿𝚘𝚊 𝚜𝚊𝚗𝚊! 👋 𝙽𝚒𝚔𝚞𝚜𝚊𝚒𝚍𝚒𝚎 𝙺𝚞𝚑𝚞𝚜𝚞?',
    'hey': '𝙷𝚎𝚢 𝚝𝚑𝚎𝚛𝚎! 😊 𝚄𝚜𝚎 .𝚖𝚎𝚗𝚞 𝚝𝚘 𝚜𝚎𝚎 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜.',
    'vip': '𝙷𝚎𝚕𝚕𝚘 𝚅𝙸𝙿! 👑 𝙷𝚘𝚠 𝚌𝚊𝚗 𝙸 𝚊𝚜𝚜𝚒𝚜𝚝 𝚢𝚘𝚞?',
    'mkuu': '𝙷𝚎𝚢 𝚖𝚔𝚞𝚞! 👋 𝙽𝚒𝚔𝚞𝚜𝚊𝚒𝚍𝚒𝚎 𝙺𝚞𝚑𝚞𝚜𝚞?',
    'boss': '𝚈𝚎𝚜 𝚋𝚘𝚜𝚜! 👑 𝙷𝚘𝚠 𝚌𝚊𝚗 𝙸 𝚑𝚎𝚕𝚙 𝚢𝚘𝚞?',
    'habari': '𝙽𝚣𝚞𝚛𝚞 𝚜𝚊𝚗𝚊! 👋 𝙷𝚊𝚋𝚊𝚛𝚒 𝚢𝚊𝚔𝚘?',
    'hello': '𝙷𝚒 𝚝𝚑𝚎𝚛𝚎! 😊 𝚄𝚜𝚎 .𝚖𝚎𝚗𝚞 𝚝𝚘 𝚜𝚎𝚎 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜.',
    'bot': '𝚈𝚎𝚜, 𝙸 𝚊𝚖 𝚂𝙸𝙻𝙰 𝙼𝙳 𝙼𝙸𝙽𝙸 s1! 🤖 𝙷𝚘𝚠 𝚌𝚊𝚗 𝙸 𝚊𝚜𝚜𝚒𝚜𝚝 𝚢𝚘𝚞?',
    'menu': '𝚃𝚢𝚙𝚎 .𝚖𝚎𝚗𝚞 𝚝𝚘 𝚜𝚎𝚎 𝚊𝚕𝚕 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜! 📜',
    'owner': '𝙲𝚘𝚗𝚝𝚊𝚌𝚝 𝚘𝚠𝚗𝚎𝚛 𝚞𝚜𝚒𝚗𝚐 .𝚘𝚠𝚗𝚎𝚛 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 👑',
    'thanks': '𝚈𝚘𝚞\'𝚛𝚎 𝚠𝚎𝚕𝚌𝚘𝚖𝚎! 😊',
    'thank you': '𝙰𝚗𝚢𝚝𝚒𝚖𝚎! 𝙻𝚎𝚝 𝚖𝚎 𝚔𝚗𝚘𝚠 𝚒𝚏 𝚢𝚘𝚞 𝚗𝚎𝚎𝚍 𝚑𝚎𝚕𝚙 🤖'
};

// ✅ Message Logger Setup
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

function getLogFileName() {
    const date = new Date();
    return `messages-${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}.log`;
}

function logMessage(type, message) {
    if (!config.DEBUG && type === 'DEBUG') return;

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type}] ${message}\n`;
    console.log(logEntry.trim());
    const logFile = path.join(logDir, getLogFileName());
    try {
        fs.appendFileSync(logFile, logEntry);
    } catch (e) {
        console.error('Failed writing log:', e.message);
    }
}

// ✅ Global Context Info for Forwarding
const globalContextInfo = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363402325089913@newsletter',
        newsletterName: 'Sila Tech',
        serverMessageId: 144
    }
};

// ✅ Safe Get User JID
function safeGetUserJid(sock) {
    try {
        return sock.user?.id || null;
    } catch {
        return null;
    }
}

// ✅ Ensure Directories Exist
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true });
if (!fs.existsSync(libDir)) fs.mkdirSync(libDir, { recursive: true });
if (!fs.existsSync(utilsDir)) fs.mkdirSync(utilsDir, { recursive: true });

setInterval(() => {
    try {
        fs.readdirSync(tempDir).forEach(file => fs.unlinkSync(path.join(tempDir, file)));
    } catch (e) { /* ignore */ }
}, 5 * 60 * 1000);

// ✅ Load Plugins
let plugins = new Map();
function loadPlugins() {
    const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
    plugins.clear();
    for (const file of files) {
        try {
            delete require.cache[require.resolve(path.join(pluginsDir, file))];
            const plugin = require(path.join(pluginsDir, file));
            plugins.set(file.replace('.js', ''), plugin);
        } catch (err) {
            logMessage('ERROR', `Failed loading plugin ${file}: ${err.message}`);
        }
    }
    logMessage('INFO', `✅ Loaded ${plugins.size} plugins`);
}
loadPlugins();

// ✅ Setup Session from Mega.nz
async function setupSession() {
    const sessionPath = path.join(__dirname, 'sessions', 'creds.json');
    if (!fs.existsSync(sessionPath)) {
        if (!config.SESSION_ID || !config.SESSION_ID.startsWith('Sila~')) {
            throw new Error('Invalid or missing SESSION_ID. Must start with Sila~');
        }
        logMessage('INFO', '⬇ Downloading session from Mega.nz...');
        const megaCode = config.SESSION_ID.replace('Sila~', '');

        const mega = require('megajs');
        const file = mega.File.fromURL(`https://mega.nz/file/${megaCode}`);

        await new Promise((resolve, reject) => {
            file.download((err, data) => {
                if (err) {
                    logMessage('ERROR', `❌ Mega download failed: ${err.message}`);
                    return reject(err);
                }
                fs.mkdirSync(path.join(__dirname, 'sessions'), { recursive: true });
                fs.writeFileSync(sessionPath, data);
                logMessage('SUCCESS', '✅ Session downloaded and saved.');
                resolve();
            });
        });
    }
}

// ✅ Utility helpers
async function downloadAsBuffer(messageObj, typeHint = 'file') {
    try {
        const stream = await downloadContentFromMessage(messageObj, typeHint);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        return buffer;
    } catch (err) {
        logMessage('ERROR', `downloadAsBuffer error: ${err.message}`);
        return null;
    }
}

function isBotMentioned(message, botJid) {
    try {
        const extended = message?.extendedTextMessage;
        if (!extended) return false;
        const mentions = extended.contextInfo?.mentionedJid || [];
        return mentions.includes(botJid);
    } catch (e) {
        return false;
    }
}

// ✅ Generate Config Table
function generateConfigTable() {
    const configs = [
        { name: 'MODE', value: config.MODE },
        { name: 'ANTIDELETE_GROUP', value: config.ANTIDELETE_GROUP },
        { name: 'ANTIDELETE_PRIVATE', value: config.ANTIDELETE_PRIVATE },
        { name: 'AUTO_STATUS_SEEN', value: config.AUTO_STATUS_SEEN },
        { name: 'AUTO_STATUS_REACT', value: config.AUTO_STATUS_REACT },
        { name: 'AUTO_STATUS_REPLY', value: config.AUTO_STATUS_REPLY },
        { name: 'AUTO_REACT_NEWSLETTER', value: config.AUTO_REACT_NEWSLETTER },
        { name: 'ANTI_LINK', value: config.ANTI_LINK },
        { name: 'ALWAYS_ONLINE', value: config.ALWAYS_ONLINE },
        { name: 'GROUP_COMMANDS', value: config.GROUP_COMMANDS }
    ];

    let table = '╔══════════════════════════╦═══════════╗\n';
    table += '║        Config Name       ║   Value   ║\n';
    table += '╠══════════════════════════╬═══════════╣\n';

    for (const c of configs) {
        const paddedName = c.name.padEnd(24, ' ');
        const paddedValue = String(c.value).padEnd(9, ' ');
        table += `║ ${paddedName} ║ ${paddedValue} ║\n`;
    }

    table += '╚══════════════════════════╩═══════════╝';
    return table;
}

// ✅ Fancy Bio Generator
function generateFancyBio() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-KE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const timeStr = now.toLocaleTimeString('en-KE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const bios = [
        `✨ ${config.BOT_NAME} ✦ Online ✦ ${dateStr} ✦`,
        `⚡ Sila MD Active ✦ ${timeStr} ✦ ${dateStr} ✦`,
        `💫 ${config.BOT_NAME} Operational ✦ ${dateStr} ✦`,
        `🚀 Sila MD Live ✦ ${dateStr} ✦ ${timeStr} ✦`,
        `🌟 ${config.BOT_NAME} Running ✦ ${dateStr} ✦`
    ];

    return bios[Math.floor(Math.random() * bios.length)];
}

// ✅ Welcome Message with Config Status
async function sendWelcomeMessage(sock) {
    const configTable = generateConfigTable();

    const welcomeMsg = `*Hello ✦ ${config.BOT_NAME} ✦ User!*\n\n` +
        `✅ Sila MD Bot is now active!\n\n` +
        `*Prefix:* ${prefix}\n` +
        `*Mode:* ${config.MODE}\n` +
        `*Plugins Loaded:* ${plugins.size}\n\n` +
        `*⚙️ Configuration Status:*\n\`\`\`${configTable}\`\`\`\n\n` +
        `*Description:* ${config.DESCRIPTION}\n\n` +
        `⚡ Powered by Sila Tech \nGitHub: https://github.com/Sila/sila-md-bot`;

    try {
        await sock.sendMessage(sock.user.id, {
            image: { url: config.ALIVE_IMG },
            caption: welcomeMsg,
            contextInfo: {
                ...globalContextInfo,
                externalAdReply: {
                    title: `✦ ${config.BOT_NAME} ✦ Official`,
                    body: "Your bot is live with enhanced features!",
                    thumbnailUrl: "https://files.catbox.moe/jwmx1j.jpg",
                    sourceUrl: "https://github.com/Sila/sila-md-bot",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
    } catch (e) {
        logMessage('WARN', `Welcome message failed: ${e.message}`);
    }
}

// ✅ Update Profile Status
async function updateProfileStatus(sock) {
    try {
        const bio = generateFancyBio();
        await sock.updateProfileStatus(bio);
        logMessage('SUCCESS', `✅ Bio updated: ${bio}`);
    } catch (err) {
        logMessage('ERROR', `❌ Failed to update bio: ${err.message}`);
    }
}

// ✅ Auto Join Groups and Channels
async function autoJoinGroups(sock) {
    const groups = [
        'https://chat.whatsapp.com/IdGNaKt80DEBqirc2ek4ks',
        'https://chat.whatsapp.com/C03aOCLQeRUH821jWqRPC6'
    ];
    
    const channels = [
        'https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02',
        'https://whatsapp.com/channel/0029Vb7CLKM5vKAHHK9sR02z',
        'https://whatsapp.com/channel/0029VbBmFT430LKO7Ch9C80X'
    ];

    for (const group of groups) {
        try {
            await sock.groupAcceptInvite(group.split('/').pop());
            logMessage('SUCCESS', `✅ Joined group: ${group}`);
        } catch (e) {
            logMessage('ERROR', `❌ Failed to join group ${group}: ${e.message}`);
        }
    }

    for (const channel of channels) {
        try {
            if (typeof sock.newsletterFollow === 'function') {
                const channelId = channel.split('/').pop() + '@newsletter';
                await sock.newsletterFollow(channelId);
                logMessage('SUCCESS', `✅ Following channel: ${channel}`);
            }
        } catch (e) {
            logMessage('ERROR', `❌ Failed to follow channel ${channel}: ${e.message}`);
        }
    }
}

// ✅ Connect to WhatsApp (main)
async function connectToWhatsApp() {
    await setupSession();
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'sessions'));
    const { version } = await fetchLatestBaileysVersion();

    const cryptoOptions = {
        maxSharedKeys: 1000,
        sessionThreshold: 0,
        cache: {
            TRANSACTION: false,
            PRE_KEYS: false
        }
    };

    const sock = makeWASocket({
        logger: P({ level: config.DEBUG ? 'debug' : 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Safari'),
        auth: state,
        version,
        markOnlineOnConnect: config.ALWAYS_ONLINE,
        syncFullHistory: false,
        generateHighQualityLinkPreview: false,
        getMessage: async () => undefined,
        ...cryptoOptions
    });

    // Bind store
    try {
        store.bind(sock.ev);
    } catch (e) {
        logMessage('WARN', `store.bind failed: ${e.message}`);
    }

    // Connection update handler
    sock.ev.on('connection.update', async update => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            logMessage('WARN', `Connection closed: ${lastDisconnect?.error?.output?.statusCode || 'Unknown'}`);
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                logMessage('INFO', 'Reconnecting...');
                setTimeout(() => connectToWhatsApp(), 2000);
            }
        } else if (connection === 'open') {
            logMessage('SUCCESS', '✅ Connected to WhatsApp');

            // Store bot jid for mention detection
            global.botJid = sock.user.id;

            // Update profile & send welcome
            await updateProfileStatus(sock);
            await sendWelcomeMessage(sock);
            await autoJoinGroups(sock);

            // Follow newsletters
            const newsletterIds = config.NEWSLETTER_IDS || [];
            for (const jid of newsletterIds) {
                try {
                    if (typeof sock.newsletterFollow === 'function') {
                        await sock.newsletterFollow(jid);
                        logMessage('SUCCESS', `✅ Followed newsletter ${jid}`);
                    }
                } catch (err) {
                    logMessage('ERROR', `Failed to follow newsletter ${jid}: ${err.message}`);
                }
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // ✅ Cache messages for anti-delete
    sock.ev.on('messages.upsert', ({ messages }) => {
        if (!Array.isArray(messages)) return;
        
        for (const m of messages) {
            if (!m.message || !m.key.id) continue;
            
            const cacheKey = `${m.key.remoteJid}-${m.key.id}`;
            messageCache.set(cacheKey, {
                message: m.message,
                timestamp: Date.now()
            });
        }
        
        // Clean old cache entries
        const now = Date.now();
        for (const [key, value] of messageCache.entries()) {
            if (now - value.timestamp > 60 * 60 * 1000) {
                messageCache.delete(key);
            }
        }
    });

    // ✅ Anti-delete handler
    sock.ev.on("messages.update", async (updates) => {
        for (const { key, update } of updates) {
            if (key.remoteJid === "status@broadcast") continue;
            if (update?.message === null && !key.fromMe) {
                const cacheKey = `${key.remoteJid}-${key.id}`;
                const original = messageCache.get(cacheKey);
                const owner = safeGetUserJid(sock);

                if (!original?.message || !owner) continue;
                
                sock.sendMessage(owner, {
                    text: `🚨 *Anti-Delete* — Message recovered from ${key.participant || key.remoteJid}`,
                    contextInfo: globalContextInfo
                }).catch(() => {});

                const msgObj = original.message;
                const mType = Object.keys(msgObj)[0];

                try {
                    if (["conversation", "extendedTextMessage"].includes(mType)) {
                        const text = msgObj.conversation || msgObj.extendedTextMessage?.text;
                        await sock.sendMessage(owner, { text, contextInfo: globalContextInfo });
                    } else if (["imageMessage", "videoMessage", "audioMessage", "stickerMessage", "documentMessage"].includes(mType)) {
                        const stream = await downloadContentFromMessage(msgObj[mType], mType.replace("Message", ""));
                        let buffer = Buffer.from([]);
                        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                        const field = mType.replace("Message", "");
                        const payload = { [field]: buffer, contextInfo: globalContextInfo };
                        if (msgObj[mType]?.caption) payload.caption = msgObj[mType].caption;
                        await sock.sendMessage(owner, payload);
                    }
                } catch (err) {
                    logMessage("DEBUG", `Recovery failed: ${err.message}`);
                }
            }
        }
    });

    // ✅ Status saver directory
    const statusSaverDir = path.join(__dirname, 'status_saver');
    if (!fs.existsSync(statusSaverDir)) fs.mkdirSync(statusSaverDir, { recursive: true });

    async function saveMedia(message, msgType, sockLocal, caption) {
        try {
            const stream = await downloadContentFromMessage(
                message.message[msgType],
                msgType.replace('Message', '')
            );

            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            const extMap = {
                imageMessage: 'jpg',
                videoMessage: 'mp4',
                audioMessage: 'ogg'
            };

            const filename = `${Date.now()}.${extMap[msgType]}`;
            const filePath = path.join(statusSaverDir, filename);
            fs.writeFileSync(filePath, buffer);

            const selfJid = sockLocal.user.id.includes(':') ? `${sockLocal.user.id.split(':')[0]}@s.whatsapp.net` : sockLocal.user.id;

            await sockLocal.sendMessage(selfJid, {
                [msgType.replace('Message', '')]: { url: filePath },
                caption: caption,
                mimetype: message.message[msgType].mimetype,
                contextInfo: globalContextInfo
            });
            return true;
        } catch (error) {
            logMessage('ERROR', `Media Save Error: ${error.message}`);
            return false;
        }
    }

    function unwrapStatus(msg) {
        const inner =
            msg.message?.viewOnceMessageV2?.message ||
            msg.message?.viewOnceMessage?.message ||
            msg.message || {};
        const msgType = Object.keys(inner)[0] || '';
        return { inner, msgType };
    }

    // ✅ Consolidated messages.upsert handler
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            if (!Array.isArray(messages) || messages.length === 0) return;

            for (const m of messages) {
                // Auto Reply to Inbox Messages
                if (config.AUTO_REPLY_INBOX && m.message && !m.key.fromMe) {
                    const messageType = Object.keys(m.message)[0];
                    let content = '';
                    
                    if (messageType === 'conversation') {
                        content = m.message.conversation?.toLowerCase() || '';
                    } else if (messageType === 'extendedTextMessage') {
                        content = m.message.extendedTextMessage.text?.toLowerCase() || '';
                    }
                    
                    if (content) {
                        for (const [trigger, reply] of Object.entries(autoReplies)) {
                            if (content.includes(trigger.toLowerCase())) {
                                await sock.sendMessage(m.key.remoteJid, { 
                                    text: reply,
                                    contextInfo: globalContextInfo
                                });
                                break;
                            }
                        }
                    }
                }

                // STATUS handling
                if (m.key.remoteJid === 'status@broadcast') {
                    try {
                        const statusId = m.key.id;
                        const userJid = m.key.participant;
                        logMessage('EVENT', `Status update from ${userJid}: ${statusId}`);

                        const { inner, msgType } = unwrapStatus(m);

                        if (config.AUTO_STATUS_SEEN) {
                            try {
                                await sock.readMessages([m.key]);
                                logMessage('INFO', `Status seen: ${statusId}`);
                            } catch (e) {
                                logMessage('WARN', `Status seen failed: ${e.message}`);
                            }
                        }

                        if (config.AUTO_STATUS_REACT) {
                            try {
                                const emojis = (config.CUSTOM_REACT_EMOJIS || '❤️,🔥,💯,😍,👏').split(',');
                                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)].trim();
                                await sock.sendMessage(userJid, {
                                    react: {
                                        text: randomEmoji,
                                        key: {
                                            remoteJid: 'status@broadcast',
                                            id: statusId,
                                            participant: userJid
                                        }
                                    }
                                });
                                logMessage('INFO', `Reacted on status ${statusId} with: ${randomEmoji}`);
                            } catch (e) {
                                logMessage('WARN', `Status reaction failed: ${e.message}`);
                            }
                        }

                        if (config.AUTO_STATUS_REPLY) {
                            try {
                                await sock.sendMessage(userJid, {
                                    text: config.AUTO_STATUS_MSG,
                                    contextInfo: {
                                        stanzaId: statusId,
                                        participant: userJid,
                                        quotedMessage: inner,
                                        ...globalContextInfo
                                    }
                                });
                                logMessage('INFO', `Status replied: ${statusId}`);
                            } catch (e) {
                                logMessage('WARN', `Status reply failed: ${e.message}`);
                            }
                        }

                        if (config.Status_Saver === 'true') {
                            try {
                                const userName = await sock.getName(userJid) || 'Unknown';
                                const statusHeader = 'AUTO STATUS SAVER';
                                let caption = `${statusHeader}\n\n*🩵 Status From:* ${userName}`;

                                switch (msgType) {
                                    case 'imageMessage':
                                    case 'videoMessage':
                                        if (inner[msgType]?.caption) caption += `\n*🩵 Caption:* ${inner[msgType].caption}`;
                                        await saveMedia({ message: inner }, msgType, sock, caption);
                                        break;
                                    case 'audioMessage':
                                        caption += `\n*🩵 Audio Status*`;
                                        await saveMedia({ message: inner }, msgType, sock, caption);
                                        break;
                                    case 'extendedTextMessage':
                                        caption = `${statusHeader}\n\n${inner.extendedTextMessage?.text || ''}`;
                                        await sock.sendMessage(sock.user.id, { 
                                            text: caption,
                                            contextInfo: globalContextInfo 
                                        });
                                        break;
                                    default:
                                        logMessage('WARN', `Unsupported status type: ${msgType}`);
                                        break;
                                }

                                if (config.STATUS_REPLY === 'true') {
                                    const replyMsg = config.STATUS_MSG || 'SILA MD 💖 SUCCESSFULLY VIEWED YOUR STATUS';
                                    await sock.sendMessage(userJid, { 
                                        text: replyMsg,
                                        contextInfo: globalContextInfo 
                                    });
                                }
                                logMessage('INFO', `Status saved: ${statusId}`);
                            } catch (e) {
                                logMessage('ERROR', `Status save failed: ${e.message}`);
                            }
                        }
                    } catch (e) {
                        logMessage('ERROR', `Status handler error: ${e.message}`);
                    }
                    continue;
                }

                // Command processing
                if (type && type !== 'notify') continue;
                if (!m.message) continue;

                const sender = m.key.remoteJid;
                const isGroupMsg = isJidGroup(sender);
                const isNewsletter = sender && sender.endsWith && sender.endsWith('@newsletter');
                const isBroadcast = isJidBroadcast(sender) || isJidStatusBroadcast(sender);

                logMessage('MESSAGE', `New ${isNewsletter ? 'newsletter' : isGroupMsg ? 'group' : isBroadcast ? 'broadcast' : 'private'} message from ${sender}`);

                // Auto-react to newsletters
                if (isNewsletter && config.AUTO_REACT_NEWSLETTER) {
                    try {
                        const emojis = ['🤖','🔥','💫','❤️','👍','💯','✨','👏','😎'];
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await sock.sendMessage(m.key.remoteJid, {
                            react: { text: randomEmoji, key: m.key }
                        });
                        logMessage('INFO', `Auto-reacted with ${randomEmoji} to ${m.key.remoteJid}`);
                    } catch (e) {
                        logMessage('ERROR', `Newsletter react failed: ${e.stack || e.message}`);
                    }
                }

                // Skip group commands if disabled
                if (isGroupMsg && !config.GROUP_COMMANDS) {
                    logMessage('DEBUG', 'Group commands disabled, skipping processing for this message.');
                    continue;
                }

                // Extract text content for command parsing
                const messageType = Object.keys(m.message)[0];
                let content = '';
                let isMentioned = false;

                if (messageType === 'conversation') {
                    content = m.message.conversation || '';
                } else if (messageType === 'extendedTextMessage') {
                    content = m.message.extendedTextMessage.text || '';
                    if (isGroupMsg && global.botJid) isMentioned = isBotMentioned(m.message, global.botJid);
                } else if (messageType === 'imageMessage') {
                    content = m.message.imageMessage.caption || '';
                } else if (messageType === 'videoMessage') {
                    content = m.message.videoMessage.caption || '';
                } else if (messageType === 'documentMessage') {
                    content = m.message.documentMessage.caption || '';
                } else {
                    continue;
                }

                logMessage('DEBUG', `Message content: ${content.substring(0, 100)}`);

                // Determine if message is for the bot
                let isForBot = false;
                if (isGroupMsg) {
                    isForBot = content.startsWith(prefix) || isMentioned;
                } else {
                    isForBot = content.startsWith(prefix);
                }

                if (!isForBot) {
                    logMessage('INFO', 'Message not for bot, ignoring.');
                    continue;
                }

                // Remove mention text if present
                if (isMentioned) {
                    const botNumber = (global.botJid || '').split('@')[0];
                    content = content.replace(new RegExp(`@${botNumber}\\s*`, 'i'), '').trim();
                }

                // Extract command and args
                const commandText = content.startsWith(prefix) ? content.slice(prefix.length).trim() : content.trim();
                const [cmd, ...args] = commandText.split(/\s+/);
                const command = (cmd || '').toLowerCase();

                logMessage('COMMAND', `Detected command: ${command} | Args: ${args.join(' ')}`);

                if (config.READ_MESSAGE) {
                    try { await sock.readMessages([m.key]); } catch (e) { /* ignore */ }
                }

                // CORE commands with forwarding context
                if (command === 'ping') {
                    const latency = m.messageTimestamp ? new Date().getTime() - m.messageTimestamp * 1000 : 0;
                    await sock.sendMessage(sender, {
                        text: `🏓 *Pong!* ${latency} ms ${config.BOT_NAME} is live!`,
                        contextInfo: globalContextInfo
                    }, { quoted: m });
                    continue;
                }

                if (command === 'alive') {
                    await sock.sendMessage(sender, {
                        image: { url: config.ALIVE_IMG },
                        caption: config.LIVE_MSG,
                        contextInfo: globalContextInfo
                    }, { quoted: m });
                    continue;
                }

                if (command === 'menu') {
                    const cmds = ['ping', 'alive', 'menu', 'resetsession'];
                    for (const plugin of plugins.values()) {
                        if (Array.isArray(plugin.commands)) cmds.push(...plugin.commands);
                    }
                    const menuText = `*✦ ${config.BOT_NAME} ✦ Command Menu*\n\n` +
                        cmds.map(c => `• ${prefix}${c}`).join('\n') +
                        `\n\n⚡ Total Commands: ${cmds.length}\n\n✨ ${config.DESCRIPTION}`;

                    await sock.sendMessage(sender, {
                        image: { url: 'https://files.catbox.moe/jwmx1j.jpg' },
                        caption: menuText,
                        contextInfo: {
                            ...globalContextInfo,
                            externalAdReply: {
                                title: config.BOT_NAME,
                                body: "Explore all available commands",
                                thumbnailUrl: "https://files.catbox.moe/jwmx1j.jpg",
                                sourceUrl: "https://github.com/SilaTechB/sila-md-bot",
                                mediaType: 1,
                                renderLargerThumbnail: true
                            }
                        }
                    }, { quoted: m });
                    continue;
                }

                // Plugin Commands
                let pluginFound = false;
                for (const plugin of plugins.values()) {
                    if (plugin.commands && plugin.commands.includes(command)) {
                        pluginFound = true;
                        try {
                            logMessage('PLUGIN', `Executing plugin: ${plugin.commands}`);
                            await plugin.handler({ 
                                sock, 
                                m, 
                                sender, 
                                args, 
                                contextInfo: globalContextInfo, 
                                isGroup: isGroupMsg 
                            });
                            logMessage('SUCCESS', `Plugin executed: ${plugin.commands}`);
                        } catch (err) {
                            logMessage('ERROR', `Plugin error: ${plugin.commands} - ${err.message}`);
                            try {
                                await sock.sendMessage(sender, { 
                                    text: `❌ Plugin error: ${err.message || 'Unknown error'}`,
                                    contextInfo: globalContextInfo
                                }, { quoted: m });
                            } catch (e) { /* ignore send error */ }
                        }
                        break;
                    }
                }

                if (!pluginFound) {
                    logMessage('WARN', `Command not found: ${command}`);
                }
            }
        } catch (err) {
            logMessage('ERROR', `messages.upsert consolidated handler error: ${err.stack || err.message}`);
        }
    });

    return sock;
}

// ✅ Express Web API
const app = express();
app.use(express.static(path.join(__dirname, 'smm')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'smm', 'sila.html')));
app.get('/health', (req, res) => res.send(`✅ ${config.BOT_NAME} is Running!`));

app.listen(port, () => {
    logMessage('INFO', `🌐 Server running on port ${port}`);
    logMessage('INFO', `📊 Dashboard available at http://localhost:${port}`);
});

// ✅ Error handling
process.on('uncaughtException', (err) => {
    logMessage('CRITICAL', `Uncaught Exception: ${err.stack || err.message}`);
    setTimeout(() => connectToWhatsApp(), 5000);
});
process.on('unhandledRejection', (reason, promise) => {
    logMessage('CRITICAL', `Unhandled Rejection: ${reason} at ${promise}`);
});

// ✅ Boot Bot
(async () => {
    try {
        logMessage('INFO', 'Booting Sila MD Bot...');
        await connectToWhatsApp();
    } catch (e) {
        logMessage('CRITICAL', `Bot Init Failed: ${e.stack || e.message}`);
        setTimeout(() => connectToWhatsApp(), 5000);
    }
})();
