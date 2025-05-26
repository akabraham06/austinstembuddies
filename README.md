# Austin STEM Buddies Website

A modern, responsive website for Austin STEM Buddies, a UT Austin philanthropy organization dedicated to promoting STEM education among elementary school children.

## Features

- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Content management with Sanity CMS
- Firebase authentication for admin access
- Google Sheets integration for member tracking
- Interactive forms for membership and partnerships

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2024-05-20
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_GOOGLE_SHEET_ID=your_google_sheet_id
   NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
   ```

4. Set up Sanity Studio:
   - Create a new Sanity project at [sanity.io](https://sanity.io)
   - Get your project ID and add it to the `.env.local` file
   - Deploy Sanity Studio:
     ```bash
     npm run sanity deploy
     ```

5. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Add your Firebase configuration to the `.env.local` file

6. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - React components
- `/schemas` - Sanity CMS schemas
- `/lib` - Utility functions and configurations

## Content Management

The website uses Sanity CMS for content management. The following content types are available:

- Events
- Members
- Partners

Access the CMS at `/admin` after deployment.

## Deployment

The website can be deployed to Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
