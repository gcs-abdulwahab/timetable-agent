import { defineConfig } from 'prisma-config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  client: {
    output: './lib/generated/prisma',
  },
  // Add other config options as needed
});
