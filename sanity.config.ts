import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { schemaTypes } from './schemas';

export default defineConfig({
  name: 'austin-stem-buddies',
  title: 'Austin STEM Buddies',
  projectId: '<your-project-id>',
  dataset: 'production',
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
  basePath: '/admin',
}); 