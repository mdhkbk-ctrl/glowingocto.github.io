const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB bağlantısı (İsteğe bağlı - basit versiyon için JSON dosya kullanabilirsiniz)
mongoose.connect('mongodb://localhost:27017/iptv_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB bağlantısı başarılı');
}).catch(err => {
    console.log('MongoDB bağlantı hatası:', err);
});

// Model
const DeviceSchema = new mongoose.Schema({
    macAddress: {
        type: String,
        required: true,
        unique: true
    },
    m3uUrl: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Device = mongoose.model('Device', DeviceSchema);

// API Routes

// Tüm cihazları getir
app.get('/api/devices', async (req, res) => {
    try {
        const devices = await Device.find();
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: 'Cihazlar getirilemedi' });
    }
});

// MAC adresine göre cihaz getir
app.get('/api/devices/:macAddress', async (req, res) => {
    try {
        const device = await Device.findOne({ macAddress: req.params.macAddress });
        if (!device) {
            return res.status(404).json({ error: 'Cihaz bulunamadı' });
        }
        res.json(device);
    } catch (error) {
        res.status(500).json({ error: 'Cihaz getirilemedi' });
    }
});

// Yeni cihaz ekle veya güncelle
app.post('/api/devices', async (req, res) => {
    try {
        const { macAddress, m3uUrl } = req.body;
        
        // MAC adresi formatını kontrol et
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        if (!macRegex.test(macAddress)) {
            return res.status(400).json({ error: 'Geçersiz MAC adresi formatı' });
        }

        // URL formatını kontrol et
        try {
            new URL(m3uUrl);
        } catch {
            return res.status(400).json({ error: 'Geçersiz URL formatı' });
        }

        // Var olan cihazı güncelle veya yeni cihaz oluştur
        const device = await Device.findOneAndUpdate(
            { macAddress },
            { 
                macAddress, 
                m3uUrl,
                updatedAt: new Date()
            },
            { 
                upsert: true, 
                new: true 
            }
        );

        res.json({ message: 'Cihaz başarıyla kaydedildi', device });
    } catch (error) {
        res.status(500).json({ error: 'Cihaz kaydedilemedi' });
    }
});

// Cihaz sil
app.delete('/api/devices/:macAddress', async (req, res) => {
    try {
        const result = await Device.deleteOne({ macAddress: req.params.macAddress });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Cihaz bulunamadı' });
        }
        res.json({ message: 'Cihaz başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ error: 'Cihaz silinemedi' });
    }
});

app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} adresinde çalışıyor`);
});