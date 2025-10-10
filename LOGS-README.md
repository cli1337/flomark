# 📋 Flomark Log Viewer

Easy-to-use script for viewing all Flomark application logs in one place.

## 🚀 Quick Start

```bash
# Make script executable (first time only)
chmod +x logs.sh

# Run interactive menu
./logs.sh

# Or use direct commands
./logs.sh backend    # View backend logs
./logs.sh nginx      # View nginx error logs
./logs.sh access     # View access logs
./logs.sh all        # View all logs in parallel
```

## 📋 Available Options

### Interactive Menu

When you run `./logs.sh` without arguments, you'll see an interactive menu:

```
╔════════════════════════════════════════╗
║       📋 Flomark Log Viewer 📋         ║
╚════════════════════════════════════════╝

Select logs to view:

  Backend Logs:
    1) Backend (PM2) - Live tail
    2) Backend (PM2) - Last 100 lines
    3) Backend (PM2) - Error logs only

  Nginx Logs:
    4) Nginx - Access logs (live tail)
    5) Nginx - Error logs (live tail)
    6) Nginx - Access logs (last 100 lines)
    7) Nginx - Error logs (last 100 lines)

  System Logs:
    8) System journal (flomark-backend service)
    9) System journal (nginx)

  All Logs:
    10) View all logs in parallel

  Log Management:
    11) Clear/rotate PM2 logs
    12) Show disk usage by logs

    0) Exit
```

### Command Line Options

```bash
# View specific logs directly
./logs.sh backend    # Backend logs (PM2)
./logs.sh nginx      # Nginx error logs
./logs.sh apache     # Apache error logs
./logs.sh access     # Web server access logs
./logs.sh error      # Web server error logs
./logs.sh all        # All logs in parallel (requires multitail)
```

## 📊 What Logs Are Available?

### 1. Backend Logs (PM2)
- **Live tail**: Real-time backend application logs
- **Last 100 lines**: Recent backend activity
- **Error only**: Only error messages from backend

**Location**: `~/.pm2/logs/flomark-backend-*.log`

### 2. Web Server Access Logs
- Shows all HTTP requests to your application
- Includes status codes, request paths, response times
- Useful for monitoring traffic and debugging routing issues

**Nginx location**: `/var/log/nginx/access.log`  
**Apache location**: `/var/log/apache2/flomark-access.log`

### 3. Web Server Error Logs
- Shows web server errors
- Proxy errors
- Configuration issues

**Nginx location**: `/var/log/nginx/error.log`  
**Apache location**: `/var/log/apache2/flomark-error.log`

### 4. System Journal
- System-level logs from systemd
- Service start/stop events
- System errors

## 🔧 Log Management

### Clear Old Logs

```bash
./logs.sh
# Select option 11: Clear/rotate PM2 logs
```

This clears old PM2 logs to free up disk space.

### Check Disk Usage

```bash
./logs.sh
# Select option 12: Show disk usage by logs
```

Shows how much disk space your logs are using.

### Rotate Logs Automatically

#### PM2 Log Rotation

Install PM2 log rotate module:

```bash
pm2 install pm2-logrotate

# Configure rotation
pm2 set pm2-logrotate:max_size 10M        # Rotate when log reaches 10MB
pm2 set pm2-logrotate:retain 7            # Keep 7 old logs
pm2 set pm2-logrotate:compress true       # Compress old logs
```

#### Nginx Log Rotation

Nginx logs are automatically rotated by logrotate. Check configuration:

```bash
cat /etc/logrotate.d/nginx
```

#### Apache Log Rotation

Apache logs are automatically rotated by logrotate. Check configuration:

```bash
cat /etc/logrotate.d/apache2  # Debian/Ubuntu
cat /etc/logrotate.d/httpd    # RHEL/CentOS
```

## 🎯 Common Use Cases

### Debugging Backend Issues

```bash
./logs.sh
# Select option 3: Backend error logs only
```

This shows only backend errors, filtering out noise.

### Monitoring Traffic

```bash
./logs.sh access
```

Watch incoming requests in real-time.

### Checking Recent Activity

```bash
./logs.sh
# Select option 2: Last 100 lines
```

Quick snapshot of recent backend activity.

### Comprehensive Monitoring

```bash
./logs.sh all
```

View all logs side-by-side (installs multitail if needed).

## 📦 Requirements

- **PM2**: For backend logs
- **sudo**: For accessing web server logs
- **multitail** (optional): For parallel log viewing
  ```bash
  # Debian/Ubuntu
  sudo apt-get install multitail
  
  # RHEL/CentOS/Fedora
  sudo yum install multitail  # or dnf install multitail
  ```

## 🔍 Troubleshooting

### "flomark-backend is not running in PM2"

Start the backend:

```bash
cd backend
pm2 start src/server.js --name flomark-backend
pm2 save
```

### "Permission denied" when viewing web server logs

You need sudo access. Run the script with sudo:

```bash
sudo ./logs.sh
```

### Logs growing too large

1. Enable PM2 log rotation (see above)
2. Clear old logs: `./logs.sh` → option 11
3. Check disk usage: `./logs.sh` → option 12

### Web server logs not found

Make sure your web server is properly configured and the log paths exist:

```bash
# Nginx
ls -la /var/log/nginx/

# Apache (Debian/Ubuntu)
ls -la /var/log/apache2/

# Apache (RHEL/CentOS)
ls -la /var/log/httpd/
```

## 💡 Tips

1. **Use keyboard shortcuts**: Most log viewers support:
   - `Ctrl+C`: Stop viewing
   - `Shift+PageUp/PageDown`: Scroll back
   - `/`: Search (in `less`)

2. **Filter logs**: Use grep to filter:
   ```bash
   pm2 logs flomark-backend | grep ERROR
   ```

3. **Export logs**: Save logs to file:
   ```bash
   pm2 logs flomark-backend --lines 1000 --nostream > backend-logs.txt
   ```

4. **Monitor specific endpoints**:
   ```bash
   sudo tail -f /var/log/nginx/access.log | grep "/api/projects"
   ```

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/log-management/)
- [Nginx Logging](https://docs.nginx.com/nginx/admin-guide/monitoring/logging/)
- [Apache Logging](https://httpd.apache.org/docs/current/logs.html)

## 🆘 Need Help?

If you encounter issues:

1. Check that all services are running:
   ```bash
   pm2 list
   systemctl status nginx    # or apache2/httpd
   ```

2. Verify log file permissions:
   ```bash
   ls -la ~/.pm2/logs/
   sudo ls -la /var/log/nginx/  # or apache2/httpd
   ```

3. Check disk space:
   ```bash
   df -h
   ```

---

**Made with ❤️ for easy log management**

