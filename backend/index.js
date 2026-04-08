const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { nanoid } = require('nanoid');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const cloudinaryUploader = cloudinary.uploader;
const jwt = require('jsonwebtoken');

const Snippet = require('./models/Snippet');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/textdrop')
  .then(() => console.log('✅ Connected to MongoDB'))
  .then(() => {
    Snippet.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// WebSocket Room State
const rooms = new Map();
const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

wss.on('connection', async (ws, req) => {
  const snippetId = req.url.split('/').pop();
  if (!snippetId) return ws.close();

  const socketId = nanoid();
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  ws.userData = { id: socketId, color, username: `User-${socketId.slice(0, 4)}` };

  if (!rooms.has(snippetId)) {
    let expiresAt = null;
    let existing = null;
    try {
      existing = await Snippet.findOne({ id: snippetId });
      if (existing) expiresAt = existing.expiresAt;
    } catch (e) { console.error('DB Load Error in WS:', e); }

    const newRoom = {
      files: existing?.files && existing?.files.length > 0
        ? existing.files
        : [{ id: nanoid(5), name: 'main.js', content: existing?.content || '', language: existing?.language || 'javascript' }],
      uploads: existing?.uploads || [],
      participants: new Set(),
      timer: null
    };

    // --- Server-Side Sync Expiry Timer ---
    if (expiresAt) {
      const delay = new Date(expiresAt).getTime() - Date.now();
      if (delay > 0) {
        newRoom.timer = setTimeout(async () => {
          const roomToPurge = rooms.get(snippetId);
          if (roomToPurge) {
            const msg = JSON.stringify({ type: 'burned' });
            roomToPurge.participants.forEach(client => {
              if (client.readyState === 1) {
                client.send(msg);
                client.close();
              }
            });
            rooms.delete(snippetId);
            await Snippet.deleteOne({ id: snippetId }); // --- Permanent DB Wipe ---
            console.log(`🔥 Room ${snippetId} burned from server timer.`);
          }
        }, delay);
      }
    }

    rooms.set(snippetId, newRoom);
  }
  const room = rooms.get(snippetId);
  room.participants.add(ws);

  const broadcastPresence = () => {
    const users = Array.from(room.participants).map(p => p.userData);
    const presenceMsg = JSON.stringify({ type: 'presence', users });
    room.participants.forEach(client => {
      if (client.readyState === 1) client.send(presenceMsg);
    });
  };

  ws.send(JSON.stringify({ type: 'init', files: room.files, uploads: room.uploads }));
  broadcastPresence();

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'op') {
        const file = room.files.find(f => f.id === data.fileId);
        if (file) {
          file.content = data.content;
          room.participants.forEach(client => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify({ 
                type: 'op', 
                fileId: data.fileId, 
                content: data.content, 
                from: socketId 
              }));
            }
          });
        }
      } else if (data.type === 'tab_action') {
        // Handle remote tab creation/deletion/rename
        if (data.action === 'create') {
          room.files.push(data.tab);
        } else if (data.action === 'delete') {
          room.files = room.files.filter(f => f.id !== data.tabId);
        } else if (data.action === 'rename') {
          const file = room.files.find(f => f.id === data.tabId);
          if (file) file.name = data.newName;
        } else if (data.action === 'lang_change') {
          const file = room.files.find(f => f.id === data.tabId);
          if (file) file.language = data.newLang;
        }

        // Broadcast the change to all (including sender for sync confirmation if needed, but usually just others)
        room.participants.forEach(client => {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify({ type: 'tab_sync', ...data }));
          }
        });
      } else if (data.type === 'image_upload') {
        const { token, imageData, name } = data;
        
        // 1. Verify Authentication
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          const userId = decoded.userId;

          // 2. Validate File Size (5MB = 5 * 1024 * 1024 bytes)
          const sizeInBytes = (imageData.length * 3) / 4;
          if (sizeInBytes > 5 * 1024 * 1024) {
            return ws.send(JSON.stringify({ type: 'error', message: 'File size exceeds 5MB limit' }));
          }

          // 3. Upload to Cloudinary
          cloudinaryUploader.upload(imageData, {
            folder: 'codeshare_uploads',
            resource_type: 'auto'
          }, async (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Error:', error);
              return ws.send(JSON.stringify({ type: 'error', message: 'Upload failed' }));
            }

            // 4. Save to Database
            const snippet = await Snippet.findOne({ id: snippetId });
            if (snippet) {
              snippet.uploads.push({
                url: result.secure_url,
                name: name || 'Asset',
                public_id: result.public_id,
                resource_type: result.resource_type
              });
              await snippet.save();
            }

            // 4.5. Update Room State (RAM)
            room.uploads.push({
              url: result.secure_url,
              name: name || 'Uploaded Asset',
              from: ws.userData.username,
              resource_type: result.resource_type,
              createdAt: new Date()
            });

            // 5. Broadcast Link to Room
            const uploadMsg = JSON.stringify({ 
              type: 'image_received', 
              url: result.secure_url, 
              name: name || 'Uploaded Asset',
              from: ws.userData.username,
              resource_type: result.resource_type
            });
            room.participants.forEach(client => {
              if (client.readyState === 1) client.send(uploadMsg);
            });
          });
        } catch (err) {
          ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized: Invalid token' }));
        }
      }
    } catch (err) { console.error('WS Error:', err); }
  });

  ws.on('close', () => {
    room.participants.delete(ws);
    broadcastPresence();
  });
});

// --- Snippet Routes ---
app.get('/api/snippets/check/:id', async (req, res) => {
  try {
    const exists = await Snippet.exists({ id: req.params.id });
    res.json({ available: !exists });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/snippets', async (req, res) => {
  try {
    const id = req.body.id || nanoid(10);
    const snippet = new Snippet({ ...req.body, id });
    await snippet.save();
    res.status(201).json(snippet);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Forking a snippet
app.post('/api/snippets/:id/fork', async (req, res) => {
  try {
    const original = await Snippet.findOne({ id: req.params.id });
    if (!original) return res.status(404).json({ error: 'Snippet not found' });

    const newId = nanoid(10);
    const forkedSnippet = new Snippet({
      id: newId,
      files: original.files || [{ id: nanoid(5), name: 'main.js', content: original.content, language: original.language }],
      title: `Copy of ${original.title || 'Untitled'}`,
      author: req.body.authorId, // Set new owner if logged in
      forkOf: original.id
    });

    await forkedSnippet.save();
    res.status(201).json(forkedSnippet);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/snippets/:id', async (req, res) => {
  try {
    const viewerId = req.headers['x-viewer-id']; // Optional header
    let identifier = { id: req.params.id };

    let snippet = await Snippet.findOne(identifier);
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });

    // Skip view count if it's the author
    const isAuthor = viewerId && snippet.author && snippet.author.toString() === viewerId;

    if (!isAuthor) {
      snippet.viewCount += 1;
      await snippet.save();

      // Handle self-destruct (1 view limit)
      if (snippet.maxViews > 0 && snippet.viewCount >= snippet.maxViews) {
        const idToPurge = snippet.id;
        await Snippet.deleteOne({ _id: snippet._id });

        // --- Total Purge (RAM) ---
        setTimeout(() => {
          if (rooms.has(idToPurge)) {
            const room = rooms.get(idToPurge);
            const msg = JSON.stringify({ type: 'burned' });
            room.participants.forEach(client => {
              if (client.readyState === 1) {
                client.send(msg);
                client.close();
              }
            });
            rooms.delete(idToPurge);
            console.log(`🔥 Room ${idToPurge} purged from memory.`);
          }
        }, 1000); // 1s grace period for recipient to see the message
      }
    }

    res.json(snippet);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/snippets/:id', async (req, res) => {
  try {
    const { id: newId } = req.body;
    if (newId && newId !== req.params.id) {
      const exists = await Snippet.exists({ id: newId });
      if (exists) return res.status(400).json({ error: 'Custom URL already taken' });
    }
    const snippet = await Snippet.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { returnDocument: 'after', upsert: true }
    );

    // --- Reset Sync Timer if Expiry Changed ---
    if (req.body.expiresAt && rooms.has(req.params.id)) {
      const room = rooms.get(req.params.id);
      if (room.timer) clearTimeout(room.timer);

      const delay = new Date(req.body.expiresAt).getTime() - Date.now();
      if (delay > 0) {
        room.timer = setTimeout(async () => {
          const roomToPurge = rooms.get(req.params.id);
          if (roomToPurge) {
            const msg = JSON.stringify({ type: 'burned' });
            roomToPurge.participants.forEach(client => {
              if (client.readyState === 1) {
                client.send(msg);
                client.close();
              }
            });
            rooms.delete(req.params.id);
            await Snippet.deleteOne({ id: req.params.id }); // --- Permanent DB Wipe ---
          }
        }, delay);
      }
    }

    // --- Broadcast Expiry/Meta Change to Room ---
    if (rooms.has(req.params.id)) {
      const room = rooms.get(req.params.id);
      const metaMsg = JSON.stringify({
        type: 'meta',
        expiresAt: snippet.expiresAt,
        maxViews: snippet.maxViews,
        createdAt: snippet.createdAt
      });
      room.participants.forEach(client => {
        if (client.readyState === 1) client.send(metaMsg);
      });
    }

    res.json(snippet);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const axios = require('axios');

// Execution Configs
const CODEX_API = 'https://api.codex.design';
const JUDGE0_CE_API = 'https://ce.judge0.com';
const PISTON_PYDIS = 'https://piston.pydis.com/api/v2/execute';

const EXEC_LANGS = {
  javascript: { codex: 'js', judge: 63, piston: 'javascript' },
  typescript: { codex: 'ts', judge: 74, piston: 'typescript' },
  python: { codex: 'py', judge: 71, piston: 'python' },
  cpp: { codex: 'cpp', judge: 54, piston: 'cpp' },
  rust: { judge: 73, piston: 'rust' },
  java: { codex: 'java', judge: 62, piston: 'java' },
  php: { judge: 68, piston: 'php' },
  go: { codex: 'go', judge: 60, piston: 'go' },
  ruby: { judge: 72, piston: 'ruby' },
  csharp: { codex: 'cs', judge: 51, piston: 'csharp' },
  sql: { judge: 82, piston: 'sql' },
  json: {},
  markdown: {},
  text: {}
};

app.post('/api/execute', async (req, res) => {
  const { language, content, files } = req.body;
  const config = EXEC_LANGS[language];
  if (!config) return res.status(400).json({ error: 'Unsupported language' });

  // 1. Try Piston (PyDis or similar) - Usually fastest if open
  if (config.piston) {
    try {
      const { data } = await axios.post(PISTON_PYDIS, {
        language: config.piston,
        version: '*',
        files: files || [{ name: `main.${language}`, content }]
      }, { timeout: 8000 });
      return res.json(data.run);
    } catch (e) { console.warn('Piston (PyDis) failed, trying extras...'); }
  }

  // 2. Try CodeX (Very stable public compiler)
  if (config.codex) {
    try {
      const { data } = await axios.post(CODEX_API, {
        language: config.codex,
        code: content
      }, { timeout: 8000 });
      
      if (data.status === 200) {
        return res.json({
          stdout: data.output || '',
          stderr: data.error || '',
          output: (data.output || '') + (data.error || ''),
          code: data.error ? 1 : 0
        });
      }
    } catch (e) { console.warn('CodeX failed, trying Judge0...'); }
  }

  // 3. Try Judge0 Community Edition
  try {
    const { data } = await axios.post(`${JUDGE0_CE_API}/submissions?base64_encoded=true&wait=true`, {
      language_id: config.judge,
      source_code: Buffer.from(content).toString('base64'),
    }, { timeout: 10000 });

    const stdout = data.stdout ? Buffer.from(data.stdout, 'base64').toString() : '';
    const stderr = data.stderr ? Buffer.from(data.stderr, 'base64').toString() : '';
    const compile_output = data.compile_output ? Buffer.from(data.compile_output, 'base64').toString() : '';
    const message = data.message ? Buffer.from(data.message, 'base64').toString() : '';

    return res.json({
      stdout,
      stderr: stderr || compile_output || message,
      output: (stdout || '') + (stderr || compile_output || message || ''),
      code: data.status.id === 3 ? 0 : 1
    });
  } catch (err) {
    console.error('All Execution APIs failed:', err.message);
    res.status(503).json({ error: 'Public compilers are currently congested. Please try again later.' });
  }
});

app.delete('/api/snippets/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findOneAndDelete({ id: req.params.id });
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
    res.json({ message: 'Snippet deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
