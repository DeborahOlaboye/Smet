import express from 'express';
import { ethers } from 'hardhat';
import { DashboardService } from './dashboard-service';
import { RealTimeMonitor } from './real-time-monitor';
import { NotificationService, NotificationConfig } from './notification-service';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Services
let dashboardService: DashboardService;
let monitor: RealTimeMonitor;
let notificationService: NotificationService;

// Initialize services
async function initializeServices() {
  const provider = ethers.provider;
  
  dashboardService = new DashboardService(provider);
  await dashboardService.initialize();
  
  monitor = new RealTimeMonitor(provider);
  
  notificationService = new NotificationService();
  NotificationConfig.setupProduction(notificationService);
  
  console.log('✅ Services initialized');
}

// API Routes
app.get('/api/metrics', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const metrics = await dashboardService.getMetrics(hours);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

app.get('/api/contracts', async (req, res) => {
  try {
    const stats = await dashboardService.getContractStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contract stats' });
  }
});

app.get('/api/rewards', async (req, res) => {
  try {
    const analytics = await dashboardService.getRewardAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reward analytics' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    const health = await dashboardService.getTransactionHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health data' });
  }
});

// Webhook endpoint for notifications
app.post('/webhook', (req, res) => {
  console.log('📡 Webhook received:', req.body);
  res.json({ status: 'received' });
});

// Dashboard HTML
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Smet Gaming Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .metric { text-align: center; }
        .metric h3 { margin: 0; color: #666; }
        .metric .value { font-size: 2em; font-weight: bold; color: #333; }
        .activity { max-height: 400px; overflow-y: auto; }
        .event { padding: 10px; border-bottom: 1px solid #eee; }
        .event:last-child { border-bottom: none; }
        .refresh { background: #007cba; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        .refresh:hover { background: #005a87; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 Smet Gaming Dashboard</h1>
        
        <div class="card">
            <h2>📊 Metrics (Last 24h)</h2>
            <div class="metrics" id="metrics">
                <div class="metric">
                    <h3>Total Rewards</h3>
                    <div class="value" id="totalRewards">-</div>
                </div>
                <div class="metric">
                    <h3>Total Transfers</h3>
                    <div class="value" id="totalTransfers">-</div>
                </div>
                <div class="metric">
                    <h3>Active Users</h3>
                    <div class="value" id="activeUsers">-</div>
                </div>
                <div class="metric">
                    <h3>Total Volume</h3>
                    <div class="value" id="totalVolume">-</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>📋 Contract Status</h2>
            <div id="contracts"></div>
        </div>

        <div class="card">
            <h2>🔥 Recent Activity</h2>
            <div class="activity" id="activity"></div>
        </div>

        <button class="refresh" onclick="loadData()">🔄 Refresh</button>
    </div>

    <script>
        async function loadData() {
            try {
                // Load metrics
                const metrics = await fetch('/api/metrics').then(r => r.json());
                document.getElementById('totalRewards').textContent = metrics.totalRewards;
                document.getElementById('totalTransfers').textContent = metrics.totalTransfers;
                document.getElementById('activeUsers').textContent = metrics.activeUsers;
                document.getElementById('totalVolume').textContent = parseFloat(metrics.totalVolume).toFixed(2) + ' ETH';

                // Load contracts
                const contracts = await fetch('/api/contracts').then(r => r.json());
                const contractsDiv = document.getElementById('contracts');
                contractsDiv.innerHTML = contracts.map(c => 
                    \`<div style="margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 4px;">
                        <strong>\${c.name}</strong> - \${c.totalEvents} events
                        <br><small>\${c.address}</small>
                    </div>\`
                ).join('');

                // Load recent activity
                const activityDiv = document.getElementById('activity');
                activityDiv.innerHTML = metrics.recentActivity.map(event => 
                    \`<div class="event">
                        <strong>\${event.contract}.\${event.event}</strong>
                        <br><small>Block \${event.blockNumber} - \${new Date(event.timestamp * 1000).toLocaleString()}</small>
                    </div>\`
                ).join('');

            } catch (error) {
                console.error('Failed to load data:', error);
            }
        }

        // Load data on page load
        loadData();
        
        // Auto-refresh every 30 seconds
        setInterval(loadData, 30000);
    </script>
</body>
</html>
  `);
});

// Start server
async function startServer() {
  await initializeServices();
  
  app.listen(port, () => {
    console.log(\`🚀 Dashboard server running at http://localhost:\${port}\`);
  });
}

// Export for use in other scripts
export { app, initializeServices };

// Start if called directly
if (require.main === module) {
  startServer().catch(console.error);
}