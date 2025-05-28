# AI Chat Interface

A modern, responsive AI chat interface built with React. Features include message management, payment integration, auto-refill functionality, and a beautiful dark theme UI.

## Features

- 🤖 **AI Chat Interface** - Clean, modern chat UI with typing indicators
- 💳 **Payment Integration** - Support for wallet balance and card payments
- 🔄 **Auto-Refill** - Automatic message pack purchases when running low
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🌙 **Dark Theme** - Beautiful dark UI with smooth animations
- 💬 **Multi-Chat Support** - Create and manage multiple conversations
- 📊 **Usage Tracking** - Monitor message usage and purchase history

## Tech Stack

- **React 18** - Modern React with hooks
- **Lucide React** - Beautiful icon library
- **Webpack 5** - Module bundler with hot reload
- **Babel** - JavaScript transpiler

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd ai-chat-interface
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The app will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates a `dist` folder with the production build.

## Deployment

### Netlify (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repo to Netlify
3. Netlify will automatically detect the build settings from `netlify.toml`
4. Deploy!

The app is configured with:

- Build command: `npm run build`
- Publish directory: `dist`
- Redirects for SPA routing

### Manual Deployment

1. Run `npm run build`
2. Upload the `dist` folder contents to your web server
3. Configure your server to serve `index.html` for all routes

## Project Structure

```
ai-chat-interface/
├── src/
│   ├── components/
│   │   └── Sidebar.jsx
│   ├── AIChatInterface.jsx
│   ├── styles.js
│   └── index.js
├── public/
│   └── index.html
├── dist/                 # Build output
├── netlify.toml         # Netlify configuration
├── webpack.config.js    # Webpack configuration
└── package.json
```

## Configuration

The app includes several configurable features:

- **Message Packs** - Defined in `MESSAGE_PACK_OPTIONS`
- **Auto-Refill Settings** - Threshold and pack selection
- **Payment Methods** - Wallet balance and card integration
- **UI Themes** - Customizable via `styles.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
