# 🖐️ Gesture Presenter

Control your PDF presentations using hand gestures through your webcam.

![Gesture Presenter](https://img.shields.io/badge/React-18-blue) ![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- **📄 PDF Viewer** - Upload and view any PDF file
- **🖐️ Hand Gesture Control** - Navigate slides with natural hand movements
- **🎯 Real-time Detection** - Powered by Google's MediaPipe
- **🔒 Privacy First** - Everything runs in your browser, no data uploaded
- **📱 Responsive** - Works on desktop and tablets

## 🎮 Gestures

| Gesture | Action |
|---------|--------|
| 🖐️ Open Hand + Swipe Right | Next slide |
| 🖐️ Open Hand + Swipe Left | Previous slide |
| ✊ Fist | Pause gesture detection |
| ☝️ One Finger | Ready state |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A webcam

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/gesture-presenter.git
cd gesture-presenter

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

## 🌐 Deploy to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Click "Deploy"

That's it! Vercel will automatically build and deploy.

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **MediaPipe Hands** - Hand detection
- **PDF.js** - PDF rendering
- **Framer Motion** - Animations

## 📁 Project Structure

```
gesture-presenter/
├── src/
│   ├── components/
│   │   ├── GestureCamera.jsx   # Webcam + gesture display
│   │   ├── PdfViewer.jsx       # PDF rendering
│   │   ├── Header.jsx          # App header
│   │   └── SwipeIndicator.jsx  # Swipe feedback
│   ├── hooks/
│   │   ├── useGesture.js       # Gesture detection logic
│   │   └── usePdfViewer.js     # PDF handling logic
│   ├── App.jsx                 # Main app
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## ⚙️ Configuration

### Gesture Sensitivity

Edit `src/hooks/useGesture.js`:

```javascript
// Swipe threshold (0-1, lower = more sensitive)
if (Math.abs(dx) > 0.15) { ... }

// Cooldown between swipes (ms)
if (now - swipe.lastSwipeTime < 600) { ... }
```

### MediaPipe Settings

```javascript
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,        // 0 = fast, 1 = accurate
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.6,
});
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for anything!

## 🙏 Acknowledgments

- [MediaPipe](https://mediapipe.dev/) for the amazing hand detection
- [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling

---

Made with ❤️ for presentation freedom
