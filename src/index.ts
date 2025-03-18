import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path, { resolve } from 'path';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // One minute
    max: 10, // Max of 10 requests per minute
    message: { error: 'Too many requests, please try again later.' }
  });

const service = express();
const port = process.env.PORT || 3000;
service.use(bodyParser.json());

interface Notification {
    recipientId: string;
    notificationType: string;
    content: string;
}

const queue: Notification[] = [];

// API endpoint to receive notifications
service.post('/notify', limiter, (req: Request, res: Response) => {
    const { recipientId, notificationType, content } = req.body;

    if (!recipientId || !notificationType || !content) {
        return res.status(400).json({ error: 'Empty required fields.'});
    }

    const notification:Notification = { recipientId, notificationType, content };
    queue.push(notification);
    return res.status(202).json({ message: 'Notification received and queued.'});
});

// Function to process notifications asynchronously
const processQueue = async () => {
    while (true) {
        if (queue.length > 0) {
            const notification = queue.shift();
            if(notification) {
                const logPath = path.join(__dirname, 'notifications.log');
                const logEntry = `${new Date().toISOString()} = Recipient Id: ${notification.recipientId}, Notification Type: ${notification.notificationType}, Contenzt: ${notification.content}\n`;
                fs.appendFileSync(logPath, logEntry);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
};

processQueue();

service.listen(port, () => {
    console.log(`Server running on port ${port}`)
});