# Issue #91 - Troubleshooting Guide: Admin Statistics Page

## Overview

This guide provides solutions for common issues encountered with the admin statistics page.

## Common Issues and Solutions

### Issue: Page Shows "Loading statistics..." Indefinitely

**Symptoms:**
- Page stuck in loading state
- Statistics never appear
- No error message shown

**Causes:**
1. RPC endpoint unreachable
2. Contract address misconfigured
3. Network connectivity issues

**Solutions:**

```bash
# 1. Verify RPC endpoint is reachable
curl -X POST https://rpc.sepolia-api.lisk.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Should return: {"jsonrpc":"2.0","result":"0x...","id":1}

# 2. Check contract address in environment
echo $NEXT_PUBLIC_REWARD_CONTRACT_ADDRESS

# 3. Verify contract exists on chain
curl -X POST https://rpc.sepolia-api.lisk.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["'$NEXT_PUBLIC_REWARD_CONTRACT_ADDRESS'","latest"],"id":1}'

# Should return non-empty result (not "0x")

# 4. Check browser console
# Open DevTools (F12) → Console tab
# Look for errors related to RPC calls
```

**Resolution:**
- Restart application: `npm run start`
- Check RPC endpoint status
- Verify contract address is correct
- Check network connectivity

---

### Issue: Error "Failed to load statistics. Please try again later."

**Symptoms:**
- Red error card displayed
- Error message shown
- No data displayed

**Causes:**
1. Contract ABI mismatch
2. Event signature changed
3. RPC rate limiting
4. Contract doesn't emit expected events

**Solutions:**

```typescript
// Check event signatures in browser console
const eventSignature = 'Opened(address,uint256)';
const eventTopic = ethers.id(eventSignature);
console.log('Event topic:', eventTopic);

// Verify this matches contract's actual event
```

**Debug Steps:**
1. Open browser DevTools → Network tab
2. Look for failed requests to RPC
3. Check response status code
4. Review error message in console
5. Verify contract ABI is correct

---

### Issue: Statistics Show Zero or Incorrect Values

**Symptoms:**
- `totalBoxesOpened: 0`
- `uniqueUsers: 0`
- `totalFeesCollected: 0n`

**Causes:**
1. No events have been emitted
2. Fetching from wrong block range
3. Event parsing failing silently

**Solutions:**

```bash
# 1. Check if contract has emitted events
# Using etherscan or other block explorer
# Search for contract address and verify event logs

# 2. Check event fetch in browser console
const logs = await publicClient.getLogs({
  address: '0x...',
  event: parseAbiItem('event Opened(address indexed opener, uint256 indexed reqId)'),
  fromBlock: 0n,
  toBlock: 'latest',
});
console.log('Logs found:', logs.length);

# 3. Verify block range
# Check current block number
curl -X POST https://rpc.sepolia-api.lisk.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Resolution:**
- Verify contract is properly configured as reward contract
- Check that reward boxes have been opened
- Verify events are being emitted
- Monitor blockchain activity

---

### Issue: Page Refreshes Every 60 Seconds Without User Interaction

**Symptoms:**
- Data refreshes automatically every 60 seconds
- User sees the page update
- Network requests spike regularly

**Causes:**
- This is expected behavior (feature working correctly)
- Or: Multiple instances of component mounted

**Solutions:**

```typescript
// Verify auto-refresh is intentional
// In statistics/page.tsx, check useEffect cleanup

useEffect(() => {
  const interval = setInterval(fetchStatistics, 60000);
  return () => clearInterval(interval); // This cleanup prevents issues
}, []);

// If refresh is too frequent, adjust interval
const REFRESH_INTERVAL = 120000; // 2 minutes instead of 60 seconds
```

**To Disable Auto-Refresh:**
```typescript
// Comment out or remove interval
// const interval = setInterval(fetchStatistics, 60000);
```

---

### Issue: Charts Display "Cannot read property 'map' of undefined"

**Symptoms:**
- Console error in TimeSeriesChart
- Chart section blank
- Other sections work fine

**Causes:**
1. Data not in expected format
2. Chart component receiving null/undefined
3. Type mismatch in data structure

**Solutions:**

```typescript
// Add defensive programming in chart component
export const TimeSeriesChart = ({ 
  title, 
  data = [], // Default to empty array
  type = 'bar' 
}: TimeSeriesChartProps) => {
  if (!data || data.length === 0) {
    return <div className="p-4">No data available</div>;
  }

  return (
    // Chart code
  );
};
```

**Debug Process:**
1. Log data before rendering: `console.log('Chart data:', data);`
2. Verify data structure matches expected format
3. Add null checks in components
4. Use TypeScript for better type safety

---

### Issue: Permission Denied - Access Denied to Statistics Page

**Symptoms:**
- Redirected to login page
- Cannot access `/admin/statistics`
- "Not authorized" message

**Causes:**
1. User not logged in
2. User not admin role
3. ProtectedRoute not configured correctly

**Solutions:**

```typescript
// Verify authentication
// Check if user is logged in
const user = await getSession(); // or your auth method
console.log('Current user:', user);
console.log('User role:', user?.role);

// Verify admin check
if (user?.role !== 'admin') {
  // User is not admin
  redirect('/login');
}
```

**Resolution:**
1. Log in with admin account
2. Verify user has admin role in database
3. Check ProtectedRoute component configuration
4. Verify authentication provider is configured

---

### Issue: Charts Look Weird or Distorted

**Symptoms:**
- Charts appear stretched/compressed
- Labels overlapping
- Chart doesn't fit container

**Causes:**
1. Container width too narrow
2. Chart library responsive sizing issue
3. CSS conflicts

**Solutions:**

```typescript
// Ensure parent container has proper sizing
<div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
  {/* Chart needs proper width */}
  <TimeSeriesChart data={stats.dailyStats} />
</div>

// In chart component, use responsive sizing
import { ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    {/* Chart content */}
  </BarChart>
</ResponsiveContainer>
```

**Responsive Design Check:**
```bash
# Test responsive layout
# Chrome DevTools → Device Emulation
# Test at: 375px, 768px, 1024px, 1920px
```

---

### Issue: High Memory Usage / Page Becomes Slow

**Symptoms:**
- Page increasingly slow over time
- Browser tab using excessive memory
- Charts become unresponsive

**Causes:**
1. Memory leak from event listeners
2. Uncleaned intervals
3. Large dataset processing

**Solutions:**

```typescript
// Ensure cleanup in useEffect
useEffect(() => {
  fetchStatistics();

  const interval = setInterval(fetchStatistics, 60000);

  return () => {
    clearInterval(interval); // Cleanup interval
    // Cleanup other listeners
  };
}, []);

// Avoid storing unnecessary data
// Don't keep large event arrays in component state
```

**Performance Monitoring:**
```javascript
// In browser console
console.log('Memory usage:', performance.memory);

// Monitor growth
setInterval(() => {
  console.log('Memory:', (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB');
}, 5000);
```

---

### Issue: Network Tab Shows Failed RPC Requests

**Symptoms:**
- Browser DevTools → Network tab shows 503/504 errors
- RPC calls timing out
- Statistics page sometimes works, sometimes doesn't

**Causes:**
1. RPC endpoint overloaded
2. Network connectivity issues
3. Rate limiting

**Solutions:**

```bash
# 1. Try backup RPC endpoint
export NEXT_PUBLIC_RPC_URL=https://backup-rpc.example.com
npm run start

# 2. Check RPC status
curl -X POST https://rpc.sepolia-api.lisk.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_net_version","params":[],"id":1}'

# 3. Implement exponential backoff retry
```

**Retry Implementation:**
```typescript
async function fetchWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

const events = await fetchWithRetry(
  () => StatisticsService.getOpenedEvents()
);
```

---

### Issue: Reward Distribution Chart Shows Incorrect Data

**Symptoms:**
- Percentages don't add up to 100%
- Missing rewards
- Wrong token names

**Causes:**
1. Data aggregation bug
2. Reward data structure issue
3. Missing token metadata

**Solutions:**

```typescript
// Debug reward distribution calculation
const rewardDistribution = {};
const rewardOutEvents = /* fetch events */;

rewardOutEvents.forEach(event => {
  const key = event.tokenAddress;
  rewardDistribution[key] = (rewardDistribution[key] || 0) + 1;
});

// Verify totals
const total = Object.values(rewardDistribution).reduce((a, b) => a + b, 0);
console.log('Total rewards:', total);
console.log('Distribution:', rewardDistribution);

// Check percentages
Object.entries(rewardDistribution).forEach(([token, count]) => {
  const percentage = (count / total) * 100;
  console.log(`${token}: ${percentage.toFixed(2)}%`);
});
```

---

### Issue: "Statistics Service is not defined" Error

**Symptoms:**
- Console error: `Cannot read property 'getStatistics' of undefined`
- Statistics page won't load
- Type errors in IDE

**Causes:**
1. StatisticsService not exported correctly
2. Import path incorrect
3. File not found

**Solutions:**

```typescript
// Verify export in services/statistics.ts
export class StatisticsService {
  static async getStatistics() {
    // ...
  }
}

// Verify import in page component
import { StatisticsService } from '@/services/statistics';

// Check file path
// Should be at: frontend/src/services/statistics.ts
```

---

### Issue: User Engagement Metrics Show Negative or Unrealistic Numbers

**Symptoms:**
- `dailyActiveUsers: -5`
- `averageClaimsPerUser: 999`
- Numbers larger than `totalBoxesOpened`

**Causes:**
1. Timestamp calculation error
2. Set size miscalculation
3. Integer overflow

**Solutions:**

```typescript
// Debug engagement metrics calculation
const now = Date.now() / 1000;
const oneDayAgo = now - 86400;

console.log('Current timestamp:', now);
console.log('24h ago:', oneDayAgo);

const dailyEvents = events.filter(e => e.timestamp > oneDayAgo);
console.log('Daily events:', dailyEvents.length);

const dailyUsers = new Set(dailyEvents.map(e => e.opener));
console.log('Daily unique users:', dailyUsers.size);

// Verify numbers are reasonable
if (dailyUsers.size < 0 || dailyUsers.size > totalUsers) {
  console.warn('Invalid daily users count');
}
```

---

## Browser DevTools Debugging

### Opening DevTools

- **Chrome/Edge**: F12 or Right-click → Inspect
- **Firefox**: F12 or Right-click → Inspect Element
- **Safari**: Develop → Show Web Inspector

### Key Tabs

1. **Console**: Check for JavaScript errors
2. **Network**: Monitor RPC requests
3. **Elements**: Inspect DOM structure
4. **Performance**: Measure page load time
5. **Storage**: Check localStorage/sessionStorage

### Common Console Commands

```javascript
// Check current statistics in memory
window.__statistics // If exposed

// Monitor RPC calls
console.log('Last RPC response:', window.__lastRpcResponse);

// Test event fetching
await fetch('https://rpc.sepolia-api.lisk.com', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_blockNumber',
    params: [],
    id: 1
  })
}).then(r => r.json()).then(console.log);
```

---

## Log File Analysis

### Application Logs

```bash
# View logs
tail -f /var/log/smet-frontend.log

# Search for errors
grep "error" /var/log/smet-frontend.log

# Filter by component
grep "statistics" /var/log/smet-frontend.log
```

### Common Error Patterns

```
ERROR: Cannot fetch events - RPC connection failed
ERROR: Invalid contract address: 0x...
ERROR: User not authenticated
ERROR: Timeout waiting for block data
```

---

## Performance Diagnosis

### Measuring Load Time

```javascript
// In browser console
performance.measure('statistics-load');
performance.getEntriesByType('measure');

// Or use Performance API
const start = performance.now();
// ... operation ...
const duration = performance.now() - start;
console.log('Operation took:', duration, 'ms');
```

### Network Waterfall Analysis

1. Open DevTools → Network tab
2. Reload page
3. Note timing for:
   - RPC calls
   - Component rendering
   - API requests

---

## Contacting Support

If issues persist:

1. **Check Documentation**: Review all guides
2. **Search Issues**: Look for similar problems
3. **Collect Information**:
   - Browser and version
   - Error messages and logs
   - Steps to reproduce
   - Contract address and network
4. **Report Issue**: Create GitHub issue with details

---

## Related Documentation

- **ISSUE_91_API_DOCUMENTATION.md**: API reference
- **ISSUE_91_IMPLEMENTATION_GUIDE.md**: Implementation details
- **ISSUE_91_DEPLOYMENT_GUIDE.md**: Deployment procedures
- **ISSUE_91_PERFORMANCE_GUIDE.md**: Performance optimization
