# Issue #91 - Deployment Guide: Admin Statistics Page

## Overview

This guide provides step-by-step instructions for deploying the admin statistics page to production environments.

## Pre-Deployment Checklist

- [ ] All tests pass locally (`npm run test`)
- [ ] Code review completed
- [ ] TypeScript compilation successful (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Contract addresses verified
- [ ] Environment variables configured
- [ ] Feature flag enabled (if applicable)
- [ ] Documentation reviewed
- [ ] Performance benchmarks met

## Environment Configuration

### Environment Variables

Create `.env.local` or `.env.production` with required variables:

```bash
# Blockchain Configuration
NEXT_PUBLIC_REWARD_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=4242  # Lisk Sepolia
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia-api.lisk.com

# Admin Configuration
NEXT_PUBLIC_ADMIN_ROUTE_PREFIX=/admin
NEXT_PUBLIC_STATS_REFRESH_INTERVAL=60000  # 60 seconds

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G_...
```

### Contract Configuration

Update `frontend/src/config/contracts.ts`:

```typescript
export const REWARD_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_REWARD_CONTRACT_ADDRESS || '0x...';

export const SUPPORTED_CHAINS = {
  4242: {
    name: 'Lisk Sepolia',
    rpc: process.env.NEXT_PUBLIC_RPC_URL,
  },
};
```

## Deployment Steps

### Step 1: Prepare Build Artifacts

```bash
# Install dependencies (if not already done)
npm ci

# Run all checks
npm run typecheck
npm run lint
npm run test

# Build the application
npm run build
```

**Expected Output:**
```
> next build
  ✓ Compiled successfully
  ✓ Linting and checking validity of types
✓ Next.js 14.x.x compiled successfully

Route (pages/api)
...
```

### Step 2: Verify Build Output

```bash
# Check that build artifacts exist
ls -la .next/

# Verify build size
du -sh .next/
```

**Performance Targets:**
- Build time: < 5 minutes
- Total bundle size: < 2MB
- JavaScript chunk size: < 500KB

### Step 3: Test Build Locally

```bash
# Start the production build locally
npm run start

# Visit http://localhost:3000/admin/statistics
# Verify all sections load correctly
# Check browser console for errors
```

### Step 4: Deploy to Staging

#### Vercel Deployment

```bash
# Push to staging branch
git push origin fix/issue-91-admin-statistics-page

# Vercel will automatically build and deploy
# Monitor deployment at https://vercel.com/dashboard
```

#### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY .next ./
COPY public ./public

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build Docker image
docker build -t smet-statistics:latest .

# Run container
docker run \
  -p 3000:3000 \
  -e NEXT_PUBLIC_REWARD_CONTRACT_ADDRESS=0x... \
  -e NEXT_PUBLIC_RPC_URL=https://... \
  smet-statistics:latest
```

#### Traditional Server Deployment

```bash
# SSH into server
ssh user@server.com

# Navigate to project directory
cd /var/www/smet

# Pull latest code
git pull origin fix/issue-91-admin-statistics-page

# Install dependencies
npm ci --only=production

# Build
npm run build

# Restart service
sudo systemctl restart smet-frontend
```

### Step 5: Staging Verification

#### Smoke Tests

```bash
# Test admin access
curl -H "Authorization: Bearer TOKEN" \
  https://staging.smet.com/admin/statistics

# Verify page loads
curl https://staging.smet.com/admin/statistics | grep -q "Statistics" && echo "OK"

# Check API endpoints
curl https://staging.smet.com/api/statistics/data
```

#### Manual QA

1. **Access Control**
   - [ ] Admin can access page
   - [ ] Non-admin is redirected to login
   - [ ] Logout works correctly

2. **Data Loading**
   - [ ] Page shows loading state briefly
   - [ ] Data loads correctly
   - [ ] No console errors
   - [ ] Statistics refresh every 60 seconds

3. **UI Responsiveness**
   - [ ] Desktop layout correct (1920px)
   - [ ] Tablet layout correct (768px)
   - [ ] Mobile layout correct (375px)
   - [ ] Charts render properly

4. **Component Functionality**
   - [ ] StatsCard displays values
   - [ ] TimeSeriesChart shows data
   - [ ] RewardDistributionChart renders pie chart
   - [ ] MostPopularRewardsCard lists rewards
   - [ ] UserEngagementMetrics shows metrics

5. **Error Handling**
   - [ ] Network error displays error message
   - [ ] Retry functionality works
   - [ ] Page recovers after network recovery

#### Performance Testing

```bash
# Load testing
ab -n 1000 -c 10 https://staging.smet.com/admin/statistics

# Performance audit
npx lighthouse https://staging.smet.com/admin/statistics --output=json
```

### Step 6: Production Deployment

#### Merge to Main

```bash
# Create pull request
git push origin fix/issue-91-admin-statistics-page

# After review and approval
git checkout main
git pull origin main
git merge --no-ff fix/issue-91-admin-statistics-page

# Tag release
git tag -a v1.5.0 -m "Release v1.5.0: Add admin statistics page"

# Push to production branch
git push origin main --tags
```

#### Production Build

```bash
# Production environment
export NODE_ENV=production
export NEXT_PUBLIC_REWARD_CONTRACT_ADDRESS=0x[MAINNET_ADDRESS]
export NEXT_PUBLIC_RPC_URL=https://[MAINNET_RPC]

# Build
npm run build

# Start service
npm run start
```

#### Blue-Green Deployment

```bash
# Deploy to green environment
ssh user@green-server.com

# Pull and build
cd /var/www/smet
git pull origin main
npm ci
npm run build
npm run start

# After verification, switch traffic from blue to green
# Using load balancer configuration
```

### Step 7: Post-Deployment Verification

#### Health Checks

```bash
# Monitor error logs
tail -f /var/log/smet-frontend.log

# Check uptime
curl -I https://smet.com/admin/statistics

# Verify metrics
curl https://smet.com/api/health/statistics
```

#### Data Validation

1. Verify statistics service is fetching events
2. Confirm data calculations are correct
3. Check timestamp accuracy
4. Validate engagement metrics

#### User Acceptance

1. Have admin users test the feature
2. Gather feedback on UI/UX
3. Monitor usage patterns
4. Address any issues

## Rollback Procedure

If issues are discovered in production:

### Immediate Rollback

```bash
# Revert to previous commit
git revert HEAD

# Rebuild and redeploy
npm run build
npm run start

# Or use Docker rollback
docker run \
  --name smet-stats-rollback \
  smet-statistics:previous-tag
```

### Manual Rollback Steps

1. **Identify Issue**: Check error logs and metrics
2. **Notify Team**: Alert team of rollback
3. **Disable Feature**: Disable statistics page route
4. **Deploy Previous Version**: Push previous version
5. **Verify**: Confirm application stability
6. **Investigate**: Root cause analysis
7. **Fix and Redeploy**: Once fixed, deploy again

## Monitoring and Maintenance

### Performance Monitoring

```typescript
// Add to page component
if (typeof window !== 'undefined') {
  const metrics = performance.getEntriesByType('measure');
  console.log('Statistics page load metrics:', metrics);
}
```

### Error Monitoring

Integrate with error tracking service:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.captureException(error, {
  tags: {
    feature: 'admin-statistics',
    component: 'StatisticsPage',
  },
});
```

### Usage Metrics

Track admin usage:

```typescript
// Log statistics page views
analytics.track('admin_statistics_view', {
  user_id: user.id,
  timestamp: new Date(),
  duration: loadTime,
});
```

### Logs Configuration

#### Application Logs

```bash
# Enable detailed logging
export LOG_LEVEL=debug
npm run start
```

#### Access Logs (Nginx)

```nginx
access_log /var/log/nginx/smet-access.log combined;
error_log /var/log/nginx/smet-error.log warn;
```

#### System Logs

```bash
# Monitor service
systemctl status smet-frontend
journalctl -u smet-frontend -f
```

## Scheduled Maintenance

### Weekly Tasks

- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Validate data accuracy
- [ ] Check for updates to dependencies

### Monthly Tasks

- [ ] Performance optimization review
- [ ] Security audit
- [ ] Database cleanup (if using caching)
- [ ] Update documentation

### Quarterly Tasks

- [ ] Major dependency updates
- [ ] Architecture review
- [ ] Capacity planning
- [ ] Feature roadmap update

## Disaster Recovery

### Data Recovery

If blockchain data becomes unavailable:

1. **Verify RPC Connection**: Check RPC endpoint health
2. **Switch RPC**: Use backup RPC endpoint
3. **Clear Cache**: Clear any local caches
4. **Restart Service**: Restart application

```bash
# Switch to backup RPC
export NEXT_PUBLIC_RPC_URL=https://backup-rpc.example.com

# Clear cache and restart
redis-cli FLUSHDB  # If using Redis
systemctl restart smet-frontend
```

### Service Restoration

```bash
# 1. Identify issue
systemctl status smet-frontend

# 2. Check logs
tail -n 100 /var/log/smet-frontend.log

# 3. Restart service
systemctl restart smet-frontend

# 4. Verify
curl https://smet.com/admin/statistics
```

## Deployment Schedule

**Recommended Deployment Times:**
- Staging: Any time (instant rollback possible)
- Production: Off-peak hours (e.g., 2-4 AM UTC)
- Never deploy on Friday before weekend

**Communication:**
- Announce deployment in #deployments channel
- Post status updates during deployment
- Notify admins of any maintenance windows

## Documentation Updates

After deployment, update:

- [ ] CHANGELOG.md
- [ ] Release notes
- [ ] Deployment records
- [ ] Knowledge base articles
- [ ] Admin user guides

## Troubleshooting Deployment Issues

### Build Fails

```bash
# Clear build cache
rm -rf .next/
rm -rf node_modules/
npm install
npm run build
```

### Contract Address Not Found

```bash
# Verify contract address in environment
echo $NEXT_PUBLIC_REWARD_CONTRACT_ADDRESS

# Check contract exists on chain
curl -X POST https://rpc.sepolia-api.lisk.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x...","latest"],"id":1}'
```

### Statistics Page Blank

1. Check browser console for errors
2. Verify API is responding
3. Check network requests in DevTools
4. Review application logs
5. Verify admin authentication

### Performance Issues

1. Check Chrome DevTools Performance tab
2. Monitor network waterfall
3. Check RPC endpoint performance
4. Review database queries
5. Consider caching implementation

## Support Contacts

- **Backend Support**: backend-team@smet.com
- **Frontend Support**: frontend-team@smet.com
- **DevOps**: devops@smet.com
- **On-Call**: See PagerDuty

## Related Documentation

- **ISSUE_91_API_DOCUMENTATION.md**: API reference
- **ISSUE_91_IMPLEMENTATION_GUIDE.md**: Implementation details
- **ISSUE_91_TESTING_GUIDE.md**: Testing procedures
- **ISSUE_91_TROUBLESHOOTING_GUIDE.md**: Common issues
