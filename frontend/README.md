# JoorApp Frontend

A modern React + TypeScript application with role-based authentication and multi-language support.

## Features

- **Role-based Authentication**: Separate modules for Super Admin and Company users
- **Internationalization**: Support for English and German languages
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **TypeScript**: Full type safety throughout the application
- **SCSS Styling**: Component-based styling with SCSS modules
- **React Router**: Client-side routing with protected routes
- **Context API**: State management for authentication and user roles

## Project Structure

```
src/
├── api/                    # API layer and HTTP client
├── assets/                 # Static assets (images, styles)
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── common/            # Shared components (Header, Sidebar, Footer)
│   └── modules/           # Feature-specific modules
│       ├── company/       # Company user module
│       └── superadmin/    # Super Admin module
├── context/               # React Context providers
├── i18n/                  # Internationalization files
├── App.tsx                # Main application component
└── main.tsx               # Application entry point
```

## User Roles

### Super Admin
- Access to user management
- Company management
- System settings
- Audit logs
- Reports and analytics

### Company
- Company dashboard
- Order management
- Product management
- Customer management
- Analytics and reports

## Demo Accounts

The application includes demo accounts for testing:

- **Super Admin**: 
  - Email: `superadmin@example.com`
  - Password: `admin123`

- **Company**: 
  - Email: `company@example.com`
  - Password: `company123`

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **i18next** - Internationalization
- **SCSS** - Styling
- **Axios** - HTTP client

## API Integration

The application is designed to work with a backend API. Update the API base URL in `src/api/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Internationalization

The application supports multiple languages. To add a new language:

1. Create a new JSON file in `src/i18n/` (e.g., `fr.json`)
2. Add the language to the resources in `src/i18n/index.ts`
3. Update the language detection configuration

## Styling

Each component has its own SCSS file following the BEM methodology:

```scss
.component {
  &__element {
    // styles
  }
  
  &--modifier {
    // styles
  }
}
```

## Security Features

- Role-based route protection
- JWT token handling
- Input validation
- XSS protection
- CSRF protection (when integrated with backend)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new files
3. Write SCSS following BEM methodology
4. Add proper error handling
5. Include responsive design
6. Test on multiple devices

## License

This project is proprietary software. All rights reserved.
