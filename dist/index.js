"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { error: 'Too many requests, please try again later.' }
});
const service = (0, express_1.default)();
const port = process.env.PORT || 3000;
service.use(body_parser_1.default.json());
const queue = [];
service.post('/notify', limiter, (req, res) => {
    const { recipientId, notificationType, content } = req.body;
    if (!recipientId || !notificationType || !content) {
        return res.status(400).json({ error: 'Empty required fields.' });
    }
    const notification = { recipientId, notificationType, content };
    queue.push(notification);
    return res.status(202).json({ message: 'Notification received and queued.' });
});
const processQueue = async () => {
    while (true) {
        if (queue.length > 0) {
            const notification = queue.shift();
            if (notification) {
                const logPath = path_1.default.join(__dirname, 'notifications.log');
                const logEntry = `${new Date().toISOString()} = Recipient Id: ${notification.recipientId}, Notification Type: ${notification.notificationType}, Contenzt: ${notification.content}\n`;
                fs_1.default.appendFileSync(logPath, logEntry);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
};
processQueue();
service.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=index.js.map