#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const sourceDir = './solana-buyback';
const targetDir = './refit-next';

// Create necessary directories
const createDirs = [
  'app/api/shipping',
  'app/api/webhooks',
  'app/api/orders',
  'app/(routes)/sell',
  'app/(routes)/shop',
  'app/(routes)/orders',
  'app/(routes)/profile',
  'app/(routes)/about',
  'components',
  'lib',
  'services',
  'utils',
  'contexts',
  'public',
  'styles'
];

createDirs.forEach(dir => {
  const fullPath = path.join(targetDir, dir);
  fs.mkdirSync(fullPath, { recursive: true });
  console.log(`Created directory: ${fullPath}`);
});

// Copy configuration files
const configFiles = [
  { from: '.env.example', to: '.env.example' },
  { from: 'tailwind.config.js', to: 'tailwind.config.js' },
  { from: 'postcss.config.js', to: 'postcss.config.js' },
  { from: 'jest.config.js', to: 'jest.config.js' },
  { from: 'jest.setup.js', to: 'jest.setup.js' },
];

configFiles.forEach(({ from, to }) => {
  const sourcePath = path.join(sourceDir, from);
  const targetPath = path.join(targetDir, to);
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied: ${from} -> ${to}`);
  }
});

// Copy components
const components = fs.readdirSync(path.join(sourceDir, 'src/components'))
  .filter(file => file.endsWith('.jsx') || file.endsWith('.js'));

components.forEach(component => {
  const sourcePath = path.join(sourceDir, 'src/components', component);
  const targetPath = path.join(targetDir, 'components', component);
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`Copied component: ${component}`);
});

// Copy services
const services = fs.readdirSync(path.join(sourceDir, 'src/services'))
  .filter(file => file.endsWith('.js'));

services.forEach(service => {
  const sourcePath = path.join(sourceDir, 'src/services', service);
  const targetPath = path.join(targetDir, 'services', service);
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`Copied service: ${service}`);
});

// Copy utils
const utils = fs.readdirSync(path.join(sourceDir, 'src/utils'))
  .filter(file => file.endsWith('.js'));

utils.forEach(util => {
  const sourcePath = path.join(sourceDir, 'src/utils', util);
  const targetPath = path.join(targetDir, 'utils', util);
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`Copied util: ${util}`);
});

// Copy lib files
const libFiles = fs.readdirSync(path.join(sourceDir, 'src/lib'))
  .filter(file => file.endsWith('.js'));

libFiles.forEach(lib => {
  const sourcePath = path.join(sourceDir, 'src/lib', lib);
  const targetPath = path.join(targetDir, 'lib', lib);
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`Copied lib: ${lib}`);
});

// Copy contexts
const contexts = fs.readdirSync(path.join(sourceDir, 'src/contexts'))
  .filter(file => file.endsWith('.jsx') || file.endsWith('.js'));

contexts.forEach(context => {
  const sourcePath = path.join(sourceDir, 'src/contexts', context);
  const targetPath = path.join(targetDir, 'contexts', context);
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`Copied context: ${context}`);
});

// Copy public assets
if (fs.existsSync(path.join(sourceDir, 'public'))) {
  const publicFiles = fs.readdirSync(path.join(sourceDir, 'public'));
  publicFiles.forEach(file => {
    const sourcePath = path.join(sourceDir, 'public', file);
    const targetPath = path.join(targetDir, 'public', file);
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied public asset: ${file}`);
  });
}

// Copy styles
fs.copyFileSync(
  path.join(sourceDir, 'src/index.css'),
  path.join(targetDir, 'app/globals.css')
);
console.log('Copied global styles');

// Create next.config.js
const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        stream: false,
      };
    }
    return config;
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SHIPPO_API_KEY: process.env.VITE_SHIPPO_API_KEY,
    NEXT_PUBLIC_SOLANA_RPC_HOST: process.env.VITE_SOLANA_RPC_HOST,
    NEXT_PUBLIC_SOLANA_NETWORK: process.env.VITE_SOLANA_NETWORK,
  },
}

module.exports = nextConfig;
`;

fs.writeFileSync(path.join(targetDir, 'next.config.js'), nextConfig);
console.log('Created next.config.js');

console.log('\nMigration complete! Next steps:');
console.log('1. cd refit-next');
console.log('2. Convert page components to Next.js App Router format');
console.log('3. Move API routes from pages/api to app/api');
console.log('4. Update import paths');
console.log('5. npm run dev');
