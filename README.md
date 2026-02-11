# Doubleday Expressions Limited - Official Website

A modern, responsive, and SEO-optimized website for Doubleday Expressions Limited, a leading ISO management consulting firm in Nigeria.

## 🚀 Features

- **Modern Design**: Clean, professional interface built with React and Tailwind CSS
- **SEO Optimized**: Comprehensive meta tags, structured data, and semantic HTML
- **Responsive**: Mobile-first design that works on all devices
- **Fast Performance**: Built with Vite for lightning-fast load times
- **Smooth Animations**: Engaging user experience with subtle transitions
- **Accessible**: WCAG compliant with proper semantic markup

## 🛠️ Tech Stack

- **React 18** - Modern UI library
- **Vite** - Next generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **PostCSS** - CSS transformation tool

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn package manager

## 🔧 Installation

1. Clone or extract the project files

2. Navigate to the project directory:
```bash
cd doubleday-website
```

3. Install dependencies:
```bash
npm install
```

## 🏃 Running the Development Server

Start the development server:
```bash
npm run dev
```

The website will be available at `http://localhost:3000`

## 🏗️ Building for Production

Create an optimized production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

Preview the production build locally:
```bash
npm run preview
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. Create a free account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm install -g vercel`
3. Run: `vercel`
4. Follow the prompts

### Option 2: Netlify

1. Create account at [netlify.com](https://netlify.com)
2. Drag and drop the `dist` folder to Netlify
3. Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Option 3: Traditional Hosting

1. Build the project: `npm run build`
2. Upload the contents of the `dist` folder to your web server
3. Configure your server to serve `index.html` for all routes

## 📱 Sections

The website includes the following sections:
- **Home** - Hero section with company overview
- **About** - Company history, vision, mission, and philosophy
- **Services** - Detailed service offerings
- **Projects** - Notable projects and accomplishments
- **Clients** - Trusted client portfolio
- **Team** - Key consultants and their expertise
- **Contact** - Contact information and location

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.js` to modify the color scheme:
```javascript
colors: {
  'brand-blue': {
    // Customize these values
    900: '#1e3a8a',
    // ... other shades
  },
}
```

### Adding/Editing Content

All content is in `src/App.jsx`. Look for the following sections:
- `services` array - Service offerings
- `stats` array - Company statistics
- `team` array - Team members
- Contact information in the contact section

## 🔍 SEO Features

- Semantic HTML5 structure
- Meta tags for social media (Open Graph, Twitter Cards)
- Schema.org structured data for business information
- Sitemap ready
- Mobile-friendly and responsive
- Fast loading times with code splitting
- Accessible navigation

## 📊 Performance Optimization

- Code splitting for faster initial load
- Lazy loading of components
- Optimized images and assets
- Minimal JavaScript bundle size
- CSS purging in production

## 📄 License

© 2024 Doubleday Expressions Limited. All rights reserved.

## 📞 Support

For technical support or questions, contact:
- Email: doubledayexpressions@gmail.com
- Phone: +234 803 335 3229

## 🤝 Contributing

This is a private company website. For updates or modifications, please contact the development team.

---

Built with ❤️ for Doubleday Expressions Limited
