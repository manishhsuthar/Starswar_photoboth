# 📸 Photo Booth Web App

A fun and interactive Photo Booth Web Application that allows users to take real-time selfies using their device's webcam. Built with vanilla HTML5, CSS3, and JavaScript, this lightweight app demonstrates how frontend web technologies can be used to interact with hardware, manage state, and enhance user experience without a backend.

## ✨ Features

### 🎥 Camera Functionality
- **Real-time camera feed** using the `getUserMedia()` API
- **Camera switching** between front and back cameras (if available)
- **High-quality photo capture** with customizable resolution
- **Camera permission handling** with user-friendly prompts

### 🎨 Creative Filters
- **Normal** - Original photo without modifications
- **Grayscale** - Classic black and white effect
- **Sepia** - Vintage warm tone effect
- **Invert** - Color inversion for artistic effects
- **Blur** - Soft blur effect for dreamy photos
- **Brightness** - Enhanced brightness for better lighting

### 📱 User Experience
- **Responsive design** that works on desktop, tablet, and mobile devices
- **Modern UI** with beautiful gradients and smooth animations
- **Intuitive controls** with clear button labels and icons
- **Photo preview** before saving with filter preview
- **Smooth scrolling** and transitions throughout the app

### 💾 Local Storage
- **Persistent photo gallery** using browser's localStorage
- **Automatic photo saving** with metadata (timestamp, filter used)
- **Photo management** with delete functionality
- **Storage optimization** with automatic cleanup (limits to 50 photos)

### 🎯 Additional Features
- **Loading states** with animated spinners
- **Error handling** with user-friendly notifications
- **Camera stream management** (pauses when tab is hidden)
- **Memory management** with proper cleanup
- **Cross-browser compatibility**

## 🚀 Getting Started

### Prerequisites
- A modern web browser with camera support
- HTTPS connection (required for camera access in most browsers)
- Camera permissions enabled

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Allow camera permissions when prompted
4. Start capturing photos!

### Local Development
For local development, you can use a simple HTTP server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 🛠️ Technical Details

### Technologies Used
- **HTML5** - Semantic markup and canvas element
- **CSS3** - Modern styling with gradients, animations, and responsive design
- **Vanilla JavaScript** - No frameworks, pure ES6+ features
- **Web APIs**:
  - `getUserMedia()` for camera access
  - `Canvas API` for image manipulation
  - `localStorage` for data persistence

### Browser Compatibility
- ✅ Chrome 53+
- ✅ Firefox 36+
- ✅ Safari 11+
- ✅ Edge 12+

### File Structure
```
photo-booth/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and animations
├── script.js           # JavaScript functionality
└── README.md          # Project documentation
```

## 🎨 Customization

### Adding New Filters
To add a new filter, modify the `applyFilterToCanvas` method in `script.js`:

```javascript
case 'your-filter-name':
    // Your filter logic here
    for (let i = 0; i < data.length; i += 4) {
        // Modify RGB values
        data[i] = /* red value */;
        data[i + 1] = /* green value */;
        data[i + 2] = /* blue value */;
    }
    break;
```

### Styling Customization
The app uses CSS custom properties and modern CSS features. Key styling areas:
- Color scheme: Modify the gradient values in `styles.css`
- Animations: Adjust timing and easing in the CSS animations
- Layout: Modify the grid and flexbox properties

## 🔧 Troubleshooting

### Camera Not Working
1. Ensure you're using HTTPS or localhost
2. Check browser permissions for camera access
3. Try refreshing the page
4. Check if another app is using the camera

### Photos Not Saving
1. Check if localStorage is available in your browser
2. Clear browser cache and try again
3. Ensure you have sufficient storage space

### Performance Issues
1. Close other camera-using applications
2. Reduce the number of saved photos
3. Use a device with better camera capabilities

## 📱 Mobile Considerations

The app is fully responsive and works great on mobile devices:
- Touch-friendly button sizes
- Optimized layout for small screens
- Camera orientation handling
- Mobile-specific camera constraints

## 🔒 Privacy & Security

- **No data transmission** - All photos are stored locally
- **No tracking** - No analytics or external requests
- **Camera permissions** - Only accessed when explicitly requested
- **Local storage** - Data never leaves your device

## 🤝 Contributing

Feel free to contribute to this project by:
- Adding new filters
- Improving the UI/UX
- Adding new features
- Fixing bugs
- Improving documentation

## 📄 License

This project is open source and available under the [MIT License](LICENCE).

## 🙏 Acknowledgments

- Font Awesome for the beautiful icons
- Google Fonts for the Poppins font family
- The Web APIs that make this possible

---

**Enjoy capturing your moments with the Photo Booth Web App! 📸✨** 
