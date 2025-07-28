// Star Wars Holographic Photo Booth App
// A fun and interactive photo booth with real-time filters and countdown timer

class PhotoBooth {
    constructor() {
        // DOM Elements
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.captureBtn = document.getElementById('captureBtn');
        this.switchCameraBtn = document.getElementById('switchCameraBtn');
        this.flipCameraBtn = document.getElementById('flipCameraBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.retakeBtn = document.getElementById('retakeBtn');
        this.startCameraBtn = document.getElementById('startCameraBtn');
        this.permissionModal = document.getElementById('permissionModal');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.previewSection = document.getElementById('previewSection');
        this.galleryContainer = document.getElementById('galleryContainer');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.filterStatus = document.getElementById('filterStatus');
        this.countdownTimer = document.getElementById('countdownTimer');
        this.liveFilterIndicator = document.getElementById('liveFilterIndicator');
        this.mirrorIndicator = document.getElementById('mirrorIndicator');

        // App State
        this.stream = null;
        this.currentFilter = 'none';
        this.capturedImage = null;
        this.savedPhotos = this.loadSavedPhotos();
        this.liveFilterCanvas = null;
        this.countdownActive = false;
        this.isMirrored = true; // Default to mirrored (selfie mode)

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateGallery();
        this.showPermissionModal();
    }

    bindEvents() {
        // Camera controls
        this.captureBtn.addEventListener('click', () => this.capturePhoto());
        this.switchCameraBtn.addEventListener('click', () => this.switchCamera());
        this.flipCameraBtn.addEventListener('click', () => this.flipCamera());
        this.startCameraBtn.addEventListener('click', () => this.startCamera());

        // Preview controls
        this.saveBtn.addEventListener('click', () => this.savePhoto());
        this.retakeBtn.addEventListener('click', () => this.retakePhoto());

        // Filter buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterName = e.currentTarget.dataset.filter;
                this.applyFilter(filterName);
            });
        });

        // Camera event handlers
        this.video.addEventListener('loadedmetadata', () => {
            this.hideLoadingSpinner();
            this.startFilterPreview();
        });

        this.video.addEventListener('error', (e) => {
            console.error('Camera error:', e);
            this.hideLoadingSpinner();
            this.showError('Failed to access camera. Please check permissions.');
        });
    }

    // Modal and UI Management
    showPermissionModal() {
        this.permissionModal.style.display = 'flex';
    }

    hidePermissionModal() {
        this.permissionModal.style.display = 'none';
    }

    showLoadingSpinner() {
        this.loadingSpinner.style.display = 'flex';
    }

    hideLoadingSpinner() {
        this.loadingSpinner.style.display = 'none';
    }

    // Camera Management
    async startCamera() {
        this.showLoadingSpinner();
        this.hidePermissionModal();

        try {
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;

            // Enable buttons once video is ready
            this.video.addEventListener('canplay', () => {
                this.captureBtn.disabled = false;
                this.switchCameraBtn.disabled = false;
                this.flipCameraBtn.disabled = false;
                this.applyMirrorEffect();
            });

        } catch (error) {
            console.error('Camera access error:', error);
            this.hideLoadingSpinner();
            this.showError('Camera access denied. Please allow camera permissions and refresh the page.');
        }
    }

    async switchCamera() {
        if (!this.stream) return;

        this.showLoadingSpinner();

        try {
            // Stop current stream
            this.stream.getTracks().forEach(track => track.stop());

            // Get available video devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            if (videoDevices.length < 2) {
                this.hideLoadingSpinner();
                this.showError('No additional cameras found.');
                return;
            }

            // Switch to next camera
            const currentDeviceId = this.stream.getVideoTracks()[0].getSettings().deviceId;
            const nextDevice = videoDevices.find(device => device.deviceId !== currentDeviceId) || videoDevices[0];

            const constraints = {
                video: {
                    deviceId: { exact: nextDevice.deviceId },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;

            // Re-apply mirror effect after camera switch
            setTimeout(() => {
                this.applyMirrorEffect();
            }, 100);

        } catch (error) {
            console.error('Camera switch error:', error);
            this.hideLoadingSpinner();
            this.showError('Failed to switch camera.');
        }
    }

    // Mirror Mode Management
    flipCamera() {
        this.isMirrored = !this.isMirrored;

        // Update button appearance
        if (this.isMirrored) {
            this.flipCameraBtn.innerHTML = '<i class="fas fa-mirror"></i> Mirror Mode';
            this.flipCameraBtn.style.background = 'linear-gradient(135deg, #4169E1 0%, #1E90FF 100%)';
        } else {
            this.flipCameraBtn.innerHTML = '<i class="fas fa-eye"></i> Normal Mode';
            this.flipCameraBtn.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
        }

        this.applyMirrorEffect();

        const mode = this.isMirrored ? 'Mirror' : 'Normal';
        this.showSuccess(`${mode} mode activated!`);
    }

    applyMirrorEffect() {
        if (this.isMirrored) {
            this.video.style.transform = 'scaleX(-1)';
            if (this.liveFilterCanvas) {
                this.liveFilterCanvas.style.transform = 'scaleX(-1)';
            }
            if (this.mirrorIndicator) {
                this.mirrorIndicator.style.display = 'block';
                this.mirrorIndicator.innerHTML = '<i class="fas fa-mirror"></i> Mirror Mode';
                this.mirrorIndicator.style.background = 'rgba(65, 105, 225, 0.8)';
            }
        } else {
            this.video.style.transform = 'scaleX(1)';
            if (this.liveFilterCanvas) {
                this.liveFilterCanvas.style.transform = 'scaleX(1)';
            }
            if (this.mirrorIndicator) {
                this.mirrorIndicator.style.display = 'block';
                this.mirrorIndicator.innerHTML = '<i class="fas fa-eye"></i> Normal Mode';
                this.mirrorIndicator.style.background = 'rgba(255, 215, 0, 0.8)';
                this.mirrorIndicator.style.color = '#000';
            }
        }
    }

    // Photo Capture with Countdown
    capturePhoto() {
        if (!this.stream || this.countdownActive) return;
        this.startCountdown();
    }

    startCountdown() {
        this.countdownActive = true;
        this.captureBtn.disabled = true;
        this.captureBtn.innerHTML = '<i class="fas fa-clock"></i> Countdown Active';

        let countdown = 5;
        const countdownNumber = this.countdownTimer.querySelector('.countdown-number');
        const countdownText = this.countdownTimer.querySelector('.countdown-text');

        this.countdownTimer.style.display = 'block';
        countdownText.textContent = 'Get Ready!';

        const countdownInterval = setInterval(() => {
            countdownNumber.textContent = countdown;

            if (countdown <= 3) {
                countdownText.textContent = 'Say Cheese!';
                countdownNumber.style.animation = 'countdownGlow 0.3s ease-in-out';
                this.countdownTimer.style.animation = 'countdownPulse 0.5s ease-in-out infinite';
            }

            if (countdown === 1) {
                this.addCameraFlash();
            }

            countdown--;

            if (countdown < 0) {
                clearInterval(countdownInterval);
                this.countdownTimer.style.display = 'none';
                this.countdownActive = false;
                this.captureBtn.disabled = false;
                this.captureBtn.innerHTML = '<i class="fas fa-lightsaber"></i> Capture Holo';
                this.takePhoto();
            }
        }, 1000);
    }

    takePhoto() {
        if (!this.stream) return;

        const context = this.canvas.getContext('2d');
        const videoWidth = this.video.videoWidth;
        const videoHeight = this.video.videoHeight;

        this.canvas.width = videoWidth;
        this.canvas.height = videoHeight;
        context.drawImage(this.video, 0, 0, videoWidth, videoHeight);

        this.capturedImage = this.canvas.toDataURL('image/jpeg', 0.8);
        this.showPreview();
        this.showSuccess('Hologram captured successfully!');
    }

    // Camera Flash Effect
    addCameraFlash() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            z-index: 1000;
            animation: flashEffect 0.3s ease-out;
            pointer-events: none;
        `;

        if (!document.querySelector('#flash-styles')) {
            const style = document.createElement('style');
            style.id = 'flash-styles';
            style.textContent = `
                @keyframes flashEffect {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(flash);

        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 300);
    }

    // Filter Management
    applyFilter(filterName) {
        this.currentFilter = filterName;

        if (this.filterStatus) {
            this.filterStatus.style.display = 'block';
            this.filterStatus.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Applying ${filterName} filter...`;
        }

        // Update active filter button
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filterName) {
                btn.classList.add('active');
            }
        });

        // Show/hide live filter canvas and indicator
        if (this.liveFilterCanvas) {
            if (filterName === 'none') {
                this.liveFilterCanvas.style.display = 'none';
                if (this.liveFilterIndicator) {
                    this.liveFilterIndicator.style.display = 'none';
                }
            } else {
                this.liveFilterCanvas.style.display = 'block';
                if (this.liveFilterIndicator) {
                    this.liveFilterIndicator.style.display = 'block';
                    this.liveFilterIndicator.innerHTML = `<i class="fas fa-magic"></i> ${filterName.charAt(0).toUpperCase() + filterName.slice(1)} Active`;
                }
            }
        }

        if (this.capturedImage) {
            this.updatePreviewWithFilter();
        } else {
            setTimeout(() => {
                if (this.filterStatus) {
                    this.filterStatus.style.display = 'none';
                }
            }, 1000);
        }
    }

    applyFilterToCanvas(context, width, height) {
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;

        switch (this.currentFilter) {
            case 'grayscale':
                for (let i = 0; i < data.length; i += 4) {
                    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                    data[i] = gray;
                    data[i + 1] = gray;
                    data[i + 2] = gray;
                }
                break;

            case 'sepia':
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                    data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                    data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
                }
                break;

            case 'invert':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];
                    data[i + 1] = 255 - data[i + 1];
                    data[i + 2] = 255 - data[i + 2];
                }
                break;

            case 'blur':
                const tempData = new Uint8ClampedArray(data);
                for (let y = 2; y < height - 2; y++) {
                    for (let x = 2; x < width - 2; x++) {
                        const idx = (y * width + x) * 4;
                        for (let c = 0; c < 3; c++) {
                            let sum = 0;
                            let count = 0;
                            for (let dy = -2; dy <= 2; dy++) {
                                for (let dx = -2; dx <= 2; dx++) {
                                    const nIdx = ((y + dy) * width + (x + dx)) * 4;
                                    if (nIdx >= 0 && nIdx < data.length) {
                                        sum += tempData[nIdx + c];
                                        count++;
                                    }
                                }
                            }
                            data[idx + c] = sum / count;
                        }
                    }
                }
                break;

            case 'brightness':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.3);
                    data[i + 1] = Math.min(255, data[i + 1] * 1.3);
                    data[i + 2] = Math.min(255, data[i + 2] * 1.3);
                }
                break;
        }

        context.putImageData(imageData, 0, 0);

        if (this.filterStatus) {
            setTimeout(() => {
                this.filterStatus.style.display = 'none';
            }, 500);
        }
    }

    // Real-time Filter Preview
    startFilterPreview() {
        if (!this.stream) return;

        this.liveFilterCanvas = document.createElement('canvas');
        this.liveFilterCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            border-radius: 15px;
        `;

        const cameraContainer = document.querySelector('.camera-container');
        if (cameraContainer) {
            cameraContainer.style.position = 'relative';
            cameraContainer.appendChild(this.liveFilterCanvas);
        }

        this.filterPreviewLoop();
    }

    filterPreviewLoop() {
        if (!this.stream || !this.video.videoWidth || !this.liveFilterCanvas) return;

        const context = this.liveFilterCanvas.getContext('2d');
        const videoWidth = this.video.videoWidth;
        const videoHeight = this.video.videoHeight;

        this.liveFilterCanvas.width = videoWidth;
        this.liveFilterCanvas.height = videoHeight;

        context.clearRect(0, 0, videoWidth, videoHeight);
        context.drawImage(this.video, 0, 0, videoWidth, videoHeight);

        if (this.currentFilter !== 'none') {
            this.applyFilterToCanvas(context, videoWidth, videoHeight);
        }

        requestAnimationFrame(() => this.filterPreviewLoop());
    }

    // Preview Management
    showPreview() {
        const context = this.previewCanvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            const maxWidth = 600;
            const maxHeight = 400;
            let { width, height } = img;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            this.previewCanvas.width = width;
            this.previewCanvas.height = height;

            context.drawImage(img, 0, 0, width, height);

            if (this.currentFilter !== 'none') {
                this.applyFilterToCanvas(context, width, height);
            }

            this.previewSection.style.display = 'block';
            this.previewSection.scrollIntoView({ behavior: 'smooth' });
        };

        img.src = this.capturedImage;
    }

    updatePreviewWithFilter() {
        if (!this.capturedImage) return;

        const context = this.previewCanvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            const maxWidth = 600;
            const maxHeight = 400;
            let { width, height } = img;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            this.previewCanvas.width = width;
            this.previewCanvas.height = height;

            context.clearRect(0, 0, width, height);
            context.drawImage(img, 0, 0, width, height);

            if (this.currentFilter !== 'none') {
                this.applyFilterToCanvas(context, width, height);
            }
        };

        img.src = this.capturedImage;
    }

    retakePhoto() {
        this.hidePreview();
        this.capturedImage = null;
    }

    hidePreview() {
        this.previewSection.style.display = 'none';
    }

    // Photo Management
    savePhoto() {
        if (!this.capturedImage) return;

        const context = this.previewCanvas.getContext('2d');
        const filteredImageData = this.previewCanvas.toDataURL('image/jpeg', 0.8);

        const photo = {
            id: Date.now(),
            data: filteredImageData,
            filter: this.currentFilter,
            timestamp: new Date().toISOString(),
            filename: `photo_${Date.now()}.jpg`
        };

        this.savedPhotos.unshift(photo);
        this.saveToLocalStorage();
        this.updateGallery();
        this.hidePreview();
        this.showSuccess('Photo saved successfully!');
    }

    updateGallery() {
        if (this.savedPhotos.length === 0) {
            this.galleryContainer.innerHTML = `
                <div class="empty-gallery">
                    <i class="fas fa-photo-video"></i>
                    <p>No holograms yet. Start capturing galactic memories!</p>
                </div>
            `;
            return;
        }

        this.galleryContainer.innerHTML = this.savedPhotos.map(photo => `
            <div class="gallery-item fade-in">
                <img src="${photo.data}" alt="Saved photo" loading="lazy">
                <div class="gallery-item-overlay">
                    <button onclick="photoBooth.deletePhoto(${photo.id})" title="Delete photo">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    deletePhoto(photoId) {
        if (confirm('Are you sure you want to delete this photo?')) {
            this.savedPhotos = this.savedPhotos.filter(photo => photo.id !== photoId);
            this.saveToLocalStorage();
            this.updateGallery();
            this.showSuccess('Photo deleted successfully!');
        }
    }

    // Local Storage Management
    loadSavedPhotos() {
        try {
            const saved = localStorage.getItem('photoBoothPhotos');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading saved photos:', error);
            return [];
        }
    }

    saveToLocalStorage() {
        try {
            if (this.savedPhotos.length > 50) {
                this.savedPhotos = this.savedPhotos.slice(0, 50);
            }
            localStorage.setItem('photoBoothPhotos', JSON.stringify(this.savedPhotos));
        } catch (error) {
            console.error('Error saving photos:', error);
            this.showError('Failed to save photo. Storage might be full.');
        }
    }

    // Notification System
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1002;
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;

        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Debug method
    testFilter(filterName) {
        console.log('Testing filter:', filterName);
        this.applyFilter(filterName);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.photoBooth = new PhotoBooth();

    // Add debug commands to console
    console.log('Star Wars Photo Booth initialized! Debug commands available:');
    console.log('- photoBooth.testFilter("grayscale")');
    console.log('- photoBooth.testFilter("sepia")');
    console.log('- photoBooth.testFilter("invert")');
    console.log('- photoBooth.testFilter("blur")');
    console.log('- photoBooth.testFilter("brightness")');
    console.log('- photoBooth.testFilter("none")');
});

// Handle page visibility changes to pause/resume camera
document.addEventListener('visibilitychange', () => {
    if (window.photoBooth && window.photoBooth.stream) {
        if (document.hidden) {
            window.photoBooth.stream.getTracks().forEach(track => track.enabled = false);
        } else {
            window.photoBooth.stream.getTracks().forEach(track => track.enabled = true);
        }
    }
});

// Handle beforeunload to clean up camera stream
window.addEventListener('beforeunload', () => {
    if (window.photoBooth && window.photoBooth.stream) {
        window.photoBooth.stream.getTracks().forEach(track => track.stop());
    }
}); 