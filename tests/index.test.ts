import request from 'supertest';
import express from 'express';
import { describe, it, expect } from '@jest/globals';
import bodyParser from 'body-parser';

const testServer = express();
testServer.use(bodyParser.json());

interface Notification {
    recipientId: string;
    notificationType: string;
    content: string;
}

const queue: Notification[] = [];

testServer.post('/notify', (req, res) => {
    const { recipientId, notificationType, content } = req.body;

    if (!recipientId || !notificationType || !content) {
        return res.status(400).json({ error: 'Empty required fields.' });
    }

    queue.push({ recipientId, notificationType, content });
    return res.status(202).json({ message: 'Notification received and queued.' });
});

describe('Notification API', () => {
    it('should return 202 for a valid notification request', async () => {
        const response = await request(testServer)
            .post('/notify')
            .send({ recipientId: '987', notificationType: 'message', content: 'String test message.' });
        expect(response.status).toBe(202);
        expect(response.body).toEqual({ message: 'Notification received and queued.' });
    });

    it('should return 400 for a request with missing fields', async () => {
        const response = await request(testServer)
            .post('/notify')
            .send({ recipientId: '987', message: 'String teste message' });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Empty required fields.' });
    });
});