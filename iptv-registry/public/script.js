const API_URL = 'http://localhost:3000/api';

// Sayfa yüklendiğinde cihazları listele
document.addEventListener('DOMContentLoaded', () => {
    loadDevices();
    
    // Form submit event'i
    document.getElementById('deviceForm').addEventListener('submit', handleSubmit);
});

async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        macAddress: formData.get('macAddress').toUpperCase(),
        m3uUrl: formData.get('m3uUrl')
    };
    
    try {
        const response = await fetch(`${API_URL}/devices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Cihaz başarıyla kaydedildi!', 'success');
            e.target.reset();
            loadDevices();
        } else {
            showMessage(result.error || 'Bir hata oluştu', 'error');
        }
    } catch (error) {
        showMessage('Bağlantı hatası', 'error');
    }
}

async function loadDevices() {
    try {
        const response = await fetch(`${API_URL}/devices`);
        const devices = await response.json();
        
        const devicesList = document.getElementById('devicesList');
        
        if (devices.length === 0) {
            devicesList.innerHTML = '<p>Henüz kayıtlı cihaz yok.</p>';
            return;
        }
        
        devicesList.innerHTML = devices.map(device => `
            <div class="device-item">
                <div class="device-info">
                    <h3>MAC: ${device.macAddress}</h3>
                    <p><strong>M3U URL:</strong> ${device.m3uUrl}</p>
                    <p><small>Kayıt: ${new Date(device.createdAt).toLocaleString('tr-TR')}</small></p>
                    <p><small>Güncelleme: ${new Date(device.updatedAt).toLocaleString('tr-TR')}</small></p>
                </div>
                <button class="btn btn-danger" onclick="deleteDevice('${device.macAddress}')">Sil</button>
            </div>
        `).join('');
    } catch (error) {
        showMessage('Cihazlar yüklenemedi', 'error');
    }
}

async function deleteDevice(macAddress) {
    if (!confirm('Bu cihazı silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/devices/${macAddress}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage('Cihaz başarıyla silindi', 'success');
            loadDevices();
        } else {
            showMessage('Silme işlemi başarısız', 'error');
        }
    } catch (error) {
        showMessage('Bağlantı hatası', 'error');
    }
}

function showMessage(message, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}