# Deployment Guide - Vimanasa Nexus

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

#### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   In Vercel dashboard, add these environment variables:
   ```
   GOOGLE_SHEETS_SPREADSHEET_ID
   GOOGLE_SERVICE_ACCOUNT_EMAIL
   GOOGLE_PRIVATE_KEY
   NEXT_PUBLIC_GEMINI_API_KEY
   ADMIN_USER
   ADMIN_PASSWORD
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

#### Vercel CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

### Option 2: Docker Deployment

#### Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Create .dockerignore

```
node_modules
.next
.git
.env.local
npm-debug.log
README.md
.DS_Store
```

#### Update next.config.mjs

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_ADMIN_USER: process.env.ADMIN_USER,
    NEXT_PUBLIC_ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  },
};

export default nextConfig;
```

#### Build and Run

```bash
# Build image
docker build -t vimanasa-nexus .

# Run container
docker run -p 3000:3000 \
  -e GOOGLE_SHEETS_SPREADSHEET_ID="your_id" \
  -e GOOGLE_SERVICE_ACCOUNT_EMAIL="your_email" \
  -e GOOGLE_PRIVATE_KEY="your_key" \
  -e NEXT_PUBLIC_GEMINI_API_KEY="your_key" \
  -e ADMIN_USER="admin" \
  -e ADMIN_PASSWORD="your_password" \
  vimanasa-nexus
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

---

### Option 3: AWS Deployment

#### Using AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your GitHub repository

2. **Configure Build Settings**
   Amplify auto-detects Next.js. Verify build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Add Environment Variables**
   In Amplify console, add all required environment variables

4. **Deploy**
   - Save and deploy
   - App will be available at `https://branch-name.amplifyapp.com`

#### Using EC2

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro or larger
   - Open port 80 and 443

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install -y nginx
   ```

4. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd vimanasa-nexus
   npm install
   
   # Create .env.local with your variables
   nano .env.local
   
   # Build
   npm run build
   ```

5. **Run with PM2**
   ```bash
   pm2 start npm --name "vimanasa-nexus" -- start
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/vimanasa-nexus
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable and restart:
   ```bash
   sudo ln -s /etc/nginx/sites-available/vimanasa-nexus /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

### Option 4: DigitalOcean App Platform

1. **Create New App**
   - Go to DigitalOcean App Platform
   - Click "Create App"
   - Connect GitHub repository

2. **Configure**
   - Detected as Node.js app
   - Build command: `npm run build`
   - Run command: `npm start`

3. **Add Environment Variables**
   Add all required variables in App settings

4. **Deploy**
   - Click "Deploy"
   - App will be live at `https://your-app.ondigitalocean.app`

---

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Google Sheets properly set up and shared
- [ ] Service account has correct permissions
- [ ] API keys are valid and have sufficient quota
- [ ] Changed default admin password
- [ ] Tested all features locally
- [ ] Build completes without errors
- [ ] `.env.local` is in `.gitignore`
- [ ] SSL certificate configured (production)
- [ ] Domain configured (if applicable)

## Post-Deployment Verification

1. **Test Authentication**
   - Can you log in with credentials?
   - Does logout work?

2. **Test Data Loading**
   - Dashboard shows metrics
   - All tabs load data from Google Sheets
   - Sync button refreshes data

3. **Test AI Assistant**
   - Can send messages
   - Receives responses
   - Context is included

4. **Test Performance**
   - Page loads quickly
   - No console errors
   - Animations work smoothly

## Monitoring

### Vercel
- Built-in analytics and monitoring
- Check deployment logs in dashboard

### Self-Hosted
```bash
# View PM2 logs
pm2 logs vimanasa-nexus

# Monitor resources
pm2 monit

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Verify all dependencies installed
- Check for syntax errors

### Environment Variables Not Working
- Restart the application after changes
- Verify variable names match exactly
- Check for typos in values

### Google Sheets Connection Fails
- Verify service account email
- Check private key formatting
- Ensure spreadsheet is shared

### AI Not Responding
- Verify Gemini API key
- Check API quota
- Review error logs

## Scaling Considerations

### For High Traffic
- Use CDN for static assets
- Enable caching
- Consider serverless functions
- Use database instead of Google Sheets
- Implement rate limiting

### For Multiple Users
- Add proper authentication system
- Implement role-based access control
- Add audit logging
- Set up monitoring and alerts

---

© 2026 Vimanasa Services LLP
