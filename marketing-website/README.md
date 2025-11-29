# Bondarys Marketing Website

A modern, responsive marketing website for the Bondarys family management application. Built with React, TypeScript, Tailwind CSS, and featuring internationalization support for Thai and English languages.

## 🌟 Features

- **Multi-language Support**: Thai and English with automatic browser language detection
- **Responsive Design**: Mobile-first approach with beautiful UI on all devices
- **Modern Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS
- **Smooth Animations**: Framer Motion for engaging user interactions
- **SEO Optimized**: Meta tags, Open Graph, and structured content
- **Fast Performance**: Optimized build with code splitting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bondarys/bondarys.git
   cd bondarys/marketing-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
marketing-website/
├── src/
│   ├── components/
│   │   ├── sections/          # Page sections
│   │   ├── Navbar.tsx         # Navigation component
│   │   ├── Footer.tsx         # Footer component
│   │   └── LoadingSpinner.tsx # Loading component
│   ├── pages/                 # Page components
│   ├── locales/               # Translation files
│   ├── i18n.ts               # Internationalization setup
│   ├── App.tsx               # Main app component
│   └── main.tsx              # Entry point
├── public/                   # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
└── vite.config.ts           # Vite configuration
```

## 🌍 Internationalization

The website supports Thai and English languages with automatic browser language detection.

### Adding New Languages

1. Create a new translation file in `src/locales/`
2. Add the language to the `resources` object in `src/i18n.ts`
3. Update the language switcher in `Navbar.tsx`

### Translation Structure

```json
{
  "nav": {
    "home": "Home",
    "features": "Features"
  },
  "hero": {
    "title": "Main Title",
    "subtitle": "Subtitle"
  }
}
```

## 🎨 Customization

### Colors

Update the color scheme in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    500: '#0ea5e9',
    600: '#0284c7',
  },
  secondary: {
    50: '#fdf4ff',
    500: '#d946ef',
    600: '#c026d3',
  }
}
```

### Typography

The website uses Inter for English and Sarabun for Thai text. Fonts are loaded from Google Fonts in `index.html`.

## 📱 Pages

- **Home**: Hero section, features overview, statistics
- **Features**: Detailed feature descriptions and comparisons
- **Pricing**: Plan tiers and pricing information
- **About**: Company information, mission, vision, timeline
- **Contact**: Contact form and company details

## 🛠️ Build & Deploy

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy

The built files are in the `dist/` directory and can be deployed to any static hosting service:

- **Vercel**: Connect your repository for automatic deployments
- **Netlify**: Drag and drop the `dist/` folder
- **GitHub Pages**: Use GitHub Actions for deployment
- **AWS S3**: Upload files to an S3 bucket

## 🔧 Configuration

### Environment Variables

Create a `.env` file for environment-specific settings:

```env
VITE_APP_TITLE=Bondarys
VITE_APP_DESCRIPTION=Family Management Application
```

### Vite Configuration

Modify `vite.config.ts` for build optimization:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          i18n: ['react-i18next', 'i18next'],
        },
      },
    },
  },
})
```

## 📊 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Bundle Size**: Optimized with code splitting
- **Loading Speed**: Fast initial load with lazy loading
- **SEO**: Fully optimized for search engines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Email: hello@bondarys.com
- Documentation: [docs.bondarys.com](https://docs.bondarys.com)
- Issues: [GitHub Issues](https://github.com/bondarys/bondarys/issues)

---

Built with ❤️ by the Bondarys Team 