# Event Monitoring Documentation

## Overview
The Smet Gaming Ecosystem includes comprehensive event monitoring to track all on-chain activities across contracts. This system provides real-time alerts, analytics, and a web dashboard for monitoring contract health and user activity.

## Architecture

### Core Components
- **EventMonitor** - Base monitoring class for event tracking
- **SmetEventMonitor** - Specialized monitor for Smet contracts
- **RealTimeMonitor** - Live monitoring with alerts
- **DashboardService** - Data aggregation for visualization
- **NotificationService** - Multi-platform alert system

### Monitored Contracts
- **SmetReward** - Reward distribution events
- **SmetGold** - Token transfer and minting events
- **SmetHero** - NFT minting and transfer events
- **SmetLoot** - Multi-token operations

## Key Events Tracked

### SmetReward Events
- `Opened` - Reward box opened by user
- `RewardOut` - Reward distributed to user
- `Paused/Unpaused` - Contract pause state changes
- `FeeUpdated` - Fee configuration changes
- `VRFConfigUpdated` - VRF parameter changes

### Token Events (All Contracts)
- `Transfer` - Token/NFT transfers
- `Approval` - Spending approvals
- `Paused/Unpaused` - Contract pause states

### Administrative Events
- `TimelockSet` - Timelock address updates
- `OwnershipTransferred` - Ownership changes
- `RoleGranted/Revoked` - Access control changes

## Usage

### Start Real-Time Monitoring
```bash
# Start monitoring with CLI
npx ts-node scripts/monitor-cli.ts start

# Start with specific configuration
NODE_ENV=production npx ts-node scripts/real-time-monitor.ts start
```

### Web Dashboard
```bash
# Start dashboard server
npx ts-node scripts/monitor-cli.ts dashboard

# Access at http://localhost:3000
```

### Get Historical Data
```bash
# Get recent events
npx ts-node scripts/monitor-cli.ts events SmetReward Opened 100

# Get system metrics
npx ts-node scripts/monitor-cli.ts metrics 24
```

### Docker Deployment
```bash
# Start monitoring stack
docker-compose -f docker-compose.monitor.yml up -d

# View logs
docker-compose -f docker-compose.monitor.yml logs -f monitor
```

## Configuration

### Environment Variables
```bash
# Network Configuration
RPC_URL=https://rpc.api.lisk.com
CHAIN_ID=1135

# Webhook URLs
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Dashboard
DASHBOARD_PORT=3000
GRAFANA_PASSWORD=secure_password
```

### Monitoring Configuration
Edit `config/monitoring.json`:
```json
{
  "contracts": {
    "SmetReward": {
      "address": "0x...",
      "events": ["Opened", "RewardOut"]
    }
  },
  "monitoring": {
    "pollInterval": 5000,
    "cacheTimeout": 300000
  }
}
```

## Alert System

### Automatic Alerts
- **Large Transfers** - Transfers above threshold
- **Contract Paused** - Any contract pause event
- **High Frequency** - Unusual activity spikes
- **Failed Transactions** - Transaction failures
- **Emergency Actions** - Critical administrative actions

### Notification Channels
- **Discord** - Rich embeds with transaction links
- **Slack** - Formatted messages with context
- **Telegram** - Markdown formatted alerts
- **Email** - HTML formatted notifications
- **Webhooks** - Custom integrations

## Dashboard Features

### Real-Time Metrics
- Total rewards distributed
- Active user count
- Transaction volume
- Contract health status

### Analytics
- Hourly activity charts
- Top user rankings
- Reward distribution analysis
- Contract usage statistics

### Recent Activity Feed
- Live event stream
- Transaction details
- Block information
- User interactions

## API Endpoints

### Metrics API
```bash
GET /api/metrics?hours=24          # System metrics
GET /api/contracts                 # Contract statistics
GET /api/rewards                   # Reward analytics
GET /api/health                    # System health
```

### Webhook Endpoint
```bash
POST /webhook                      # Receive notifications
```

## Programmatic Usage

### Basic Event Monitoring
```typescript
import { SmetEventMonitor } from "./event-monitor";

const monitor = new SmetEventMonitor(provider);
await monitor.setupContracts();

// Listen for specific events
monitor.onEvent("Opened", (event) => {
  console.log(`Reward opened by ${event.args.opener}`);
});

await monitor.startMonitoring();
```

### Custom Alerts
```typescript
import { RealTimeMonitor } from "./real-time-monitor";

const monitor = new RealTimeMonitor(provider);

// Add custom alert
monitor.addAlert({
  eventName: "Transfer",
  condition: (args) => parseFloat(ethers.formatEther(args.value)) > 1000,
  action: (event) => console.log("Large transfer detected!")
});

await monitor.start();
```

### Dashboard Integration
```typescript
import { DashboardService } from "./dashboard-service";

const dashboard = new DashboardService(provider);
await dashboard.initialize();

// Get metrics
const metrics = await dashboard.getMetrics(24);
console.log(`Active users: ${metrics.activeUsers}`);
```

## Monitoring Best Practices

### Performance
- Use appropriate polling intervals
- Implement caching for expensive queries
- Batch event processing when possible
- Monitor resource usage

### Reliability
- Implement retry logic for failed requests
- Use circuit breakers for external services
- Set up health checks and monitoring
- Plan for network interruptions

### Security
- Secure webhook endpoints
- Validate all incoming data
- Use rate limiting
- Monitor for suspicious patterns

### Alerting
- Avoid alert fatigue with proper thresholds
- Use different severity levels
- Implement escalation procedures
- Test notification channels regularly

## Troubleshooting

### Common Issues
1. **Connection Errors** - Check RPC URL and network
2. **Missing Events** - Verify contract addresses and ABIs
3. **High Memory Usage** - Adjust cache settings
4. **Notification Failures** - Check webhook URLs and tokens

### Debug Commands
```bash
# Test connections
npx ts-node scripts/monitor-cli.ts test

# Check recent events
npx ts-node scripts/monitor-cli.ts events SmetReward Opened 10

# Verify configuration
cat config/monitoring.json
```

### Log Analysis
```bash
# View monitoring logs
tail -f logs/monitor.log

# Docker logs
docker-compose -f docker-compose.monitor.yml logs monitor
```

## Scaling and Performance

### Horizontal Scaling
- Deploy multiple monitor instances
- Use load balancers for dashboard
- Implement event deduplication
- Share state via Redis

### Optimization
- Use WebSocket connections for real-time data
- Implement event filtering at source
- Cache frequently accessed data
- Use database for historical data

### Monitoring the Monitor
- Set up health checks
- Monitor resource usage
- Track alert delivery success
- Measure response times

## Integration Examples

### Discord Bot Integration
```javascript
// Discord.js example
client.on('ready', () => {
  // Subscribe to webhook notifications
  setupWebhookListener();
});
```

### Grafana Dashboard
```yaml
# Grafana datasource configuration
apiVersion: 1
datasources:
  - name: Smet Monitor
    type: prometheus
    url: http://monitor:3000/metrics
```

### Custom Analytics
```typescript
// Export data for analysis
const analytics = new EventAnalytics(provider);
const report = await analytics.generateDailyReport();
await exportToCSV(report);
```