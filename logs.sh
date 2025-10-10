#!/bin/bash

# Flomark - Log Viewer Script
# View logs for all Flomark components
# Usage: ./logs.sh [option]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Detect web server
WEBSERVER=""
if command -v nginx &> /dev/null && systemctl is-active --quiet nginx; then
    WEBSERVER="nginx"
elif command -v apache2 &> /dev/null && systemctl is-active --quiet apache2; then
    WEBSERVER="apache2"
elif command -v httpd &> /dev/null && systemctl is-active --quiet httpd; then
    WEBSERVER="httpd"
fi

# Function to display menu
show_menu() {
    clear
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════╗"
    echo "║                                        ║"
    echo "║       📋 Flomark Log Viewer 📋         ║"
    echo "║                                        ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${YELLOW}Select logs to view:${NC}"
    echo ""
    echo "  ${GREEN}Backend Logs:${NC}"
    echo "    1) Backend (PM2) - Live tail"
    echo "    2) Backend (PM2) - Last 100 lines"
    echo "    3) Backend (PM2) - Error logs only"
    echo ""
    
    if [ -n "$WEBSERVER" ]; then
        echo -e "  ${GREEN}${WEBSERVER^} Logs:${NC}"
        echo "    4) ${WEBSERVER^} - Access logs (live tail)"
        echo "    5) ${WEBSERVER^} - Error logs (live tail)"
        echo "    6) ${WEBSERVER^} - Access logs (last 100 lines)"
        echo "    7) ${WEBSERVER^} - Error logs (last 100 lines)"
        echo ""
    fi
    
    echo -e "  ${GREEN}System Logs:${NC}"
    echo "    8) System journal (flomark-backend service)"
    echo "    9) System journal (${WEBSERVER:-web server})"
    echo ""
    echo -e "  ${GREEN}All Logs:${NC}"
    echo "    10) View all logs in parallel"
    echo ""
    echo -e "  ${GREEN}Log Management:${NC}"
    echo "    11) Clear/rotate PM2 logs"
    echo "    12) Show disk usage by logs"
    echo ""
    echo "    0) Exit"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to show PM2 logs
show_pm2_logs() {
    echo -e "${GREEN}📋 Backend Logs (PM2)${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    sleep 1
    pm2 logs flomark-backend
}

# Function to show PM2 logs (last N lines)
show_pm2_logs_lines() {
    local lines=${1:-100}
    echo -e "${GREEN}📋 Backend Logs - Last $lines lines${NC}"
    echo ""
    pm2 logs flomark-backend --lines $lines --nostream
    echo ""
    read -p "Press Enter to continue..."
}

# Function to show PM2 error logs
show_pm2_error_logs() {
    echo -e "${GREEN}📋 Backend Error Logs (PM2)${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    sleep 1
    pm2 logs flomark-backend --err
}

# Function to show Nginx/Apache access logs
show_webserver_access_logs() {
    echo -e "${GREEN}📋 ${WEBSERVER^} Access Logs${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    sleep 1
    
    if [ "$WEBSERVER" = "nginx" ]; then
        sudo tail -f /var/log/nginx/access.log
    elif [ "$WEBSERVER" = "apache2" ]; then
        sudo tail -f /var/log/apache2/flomark-access.log 2>/dev/null || sudo tail -f /var/log/apache2/access.log
    elif [ "$WEBSERVER" = "httpd" ]; then
        sudo tail -f /var/log/httpd/flomark-access.log 2>/dev/null || sudo tail -f /var/log/httpd/access_log
    fi
}

# Function to show Nginx/Apache error logs
show_webserver_error_logs() {
    echo -e "${GREEN}📋 ${WEBSERVER^} Error Logs${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    sleep 1
    
    if [ "$WEBSERVER" = "nginx" ]; then
        sudo tail -f /var/log/nginx/error.log
    elif [ "$WEBSERVER" = "apache2" ]; then
        sudo tail -f /var/log/apache2/flomark-error.log 2>/dev/null || sudo tail -f /var/log/apache2/error.log
    elif [ "$WEBSERVER" = "httpd" ]; then
        sudo tail -f /var/log/httpd/flomark-error.log 2>/dev/null || sudo tail -f /var/log/httpd/error_log
    fi
}

# Function to show Nginx/Apache access logs (last N lines)
show_webserver_access_logs_lines() {
    local lines=${1:-100}
    echo -e "${GREEN}📋 ${WEBSERVER^} Access Logs - Last $lines lines${NC}"
    echo ""
    
    if [ "$WEBSERVER" = "nginx" ]; then
        sudo tail -n $lines /var/log/nginx/access.log
    elif [ "$WEBSERVER" = "apache2" ]; then
        sudo tail -n $lines /var/log/apache2/flomark-access.log 2>/dev/null || sudo tail -n $lines /var/log/apache2/access.log
    elif [ "$WEBSERVER" = "httpd" ]; then
        sudo tail -n $lines /var/log/httpd/flomark-access.log 2>/dev/null || sudo tail -n $lines /var/log/httpd/access_log
    fi
    
    echo ""
    read -p "Press Enter to continue..."
}

# Function to show Nginx/Apache error logs (last N lines)
show_webserver_error_logs_lines() {
    local lines=${1:-100}
    echo -e "${GREEN}📋 ${WEBSERVER^} Error Logs - Last $lines lines${NC}"
    echo ""
    
    if [ "$WEBSERVER" = "nginx" ]; then
        sudo tail -n $lines /var/log/nginx/error.log
    elif [ "$WEBSERVER" = "apache2" ]; then
        sudo tail -n $lines /var/log/apache2/flomark-error.log 2>/dev/null || sudo tail -n $lines /var/log/apache2/error.log
    elif [ "$WEBSERVER" = "httpd" ]; then
        sudo tail -n $lines /var/log/httpd/flomark-error.log 2>/dev/null || sudo tail -n $lines /var/log/httpd/error_log
    fi
    
    echo ""
    read -p "Press Enter to continue..."
}

# Function to show system journal
show_system_journal_backend() {
    echo -e "${GREEN}📋 System Journal - Backend${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    sleep 1
    sudo journalctl -u flomark-backend -f 2>/dev/null || pm2 logs flomark-backend
}

# Function to show system journal for web server
show_system_journal_webserver() {
    echo -e "${GREEN}📋 System Journal - ${WEBSERVER^}${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    sleep 1
    
    if [ "$WEBSERVER" = "nginx" ]; then
        sudo journalctl -u nginx -f
    elif [ "$WEBSERVER" = "apache2" ]; then
        sudo journalctl -u apache2 -f
    elif [ "$WEBSERVER" = "httpd" ]; then
        sudo journalctl -u httpd -f
    fi
}

# Function to show all logs in parallel (using multitail if available)
show_all_logs() {
    if command -v multitail &> /dev/null; then
        echo -e "${GREEN}📋 All Logs (Parallel View)${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        echo ""
        sleep 1
        
        if [ "$WEBSERVER" = "nginx" ]; then
            multitail -l "pm2 logs flomark-backend --lines 0" \
                      -l "sudo tail -f /var/log/nginx/access.log" \
                      -l "sudo tail -f /var/log/nginx/error.log"
        elif [ "$WEBSERVER" = "apache2" ]; then
            multitail -l "pm2 logs flomark-backend --lines 0" \
                      -l "sudo tail -f /var/log/apache2/access.log" \
                      -l "sudo tail -f /var/log/apache2/error.log"
        elif [ "$WEBSERVER" = "httpd" ]; then
            multitail -l "pm2 logs flomark-backend --lines 0" \
                      -l "sudo tail -f /var/log/httpd/access_log" \
                      -l "sudo tail -f /var/log/httpd/error_log"
        else
            pm2 logs flomark-backend
        fi
    else
        echo -e "${YELLOW}Installing multitail for better log viewing...${NC}"
        echo -e "${YELLOW}Or view logs separately using other menu options.${NC}"
        echo ""
        read -p "Install multitail? [y/N]: " install_choice
        
        if [[ $install_choice =~ ^[Yy]$ ]]; then
            if command -v apt-get &> /dev/null; then
                sudo apt-get install -y multitail
            elif command -v yum &> /dev/null; then
                sudo yum install -y multitail
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y multitail
            fi
            show_all_logs
        else
            echo ""
            read -p "Press Enter to continue..."
        fi
    fi
}

# Function to clear PM2 logs
clear_pm2_logs() {
    echo -e "${GREEN}🗑️  Clear/Rotate PM2 Logs${NC}"
    echo ""
    echo -e "${YELLOW}This will clear all PM2 logs for flomark-backend${NC}"
    read -p "Are you sure? [y/N]: " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        pm2 flush flomark-backend
        echo -e "${GREEN}✓ Logs cleared${NC}"
    else
        echo -e "${YELLOW}Cancelled${NC}"
    fi
    
    echo ""
    read -p "Press Enter to continue..."
}

# Function to show disk usage by logs
show_log_disk_usage() {
    echo -e "${GREEN}💾 Disk Usage by Logs${NC}"
    echo ""
    
    echo -e "${CYAN}PM2 Logs:${NC}"
    du -sh ~/.pm2/logs/ 2>/dev/null || echo "  No PM2 logs found"
    
    if [ -n "$WEBSERVER" ]; then
        echo ""
        echo -e "${CYAN}${WEBSERVER^} Logs:${NC}"
        if [ "$WEBSERVER" = "nginx" ]; then
            sudo du -sh /var/log/nginx/ 2>/dev/null || echo "  No logs found"
        elif [ "$WEBSERVER" = "apache2" ]; then
            sudo du -sh /var/log/apache2/ 2>/dev/null || echo "  No logs found"
        elif [ "$WEBSERVER" = "httpd" ]; then
            sudo du -sh /var/log/httpd/ 2>/dev/null || echo "  No logs found"
        fi
    fi
    
    echo ""
    echo -e "${CYAN}Total System Log Space:${NC}"
    df -h /var/log 2>/dev/null || echo "  Unable to check"
    
    echo ""
    read -p "Press Enter to continue..."
}

# Main script
main() {
    # Check if PM2 is running flomark-backend
    if ! pm2 list | grep -q "flomark-backend"; then
        echo -e "${RED}Error: flomark-backend is not running in PM2${NC}"
        echo -e "${YELLOW}Start it with: pm2 start backend/src/server.js --name flomark-backend${NC}"
        exit 1
    fi
    
    # If argument provided, run specific command
    if [ -n "$1" ]; then
        case "$1" in
            "backend"|"pm2")
                show_pm2_logs
                ;;
            "nginx"|"apache"|"httpd")
                if [ -n "$WEBSERVER" ]; then
                    show_webserver_error_logs
                else
                    echo -e "${RED}No web server detected${NC}"
                    exit 1
                fi
                ;;
            "access")
                show_webserver_access_logs
                ;;
            "error")
                show_webserver_error_logs
                ;;
            "all")
                show_all_logs
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                echo ""
                echo "Usage: $0 [backend|nginx|apache|access|error|all]"
                exit 1
                ;;
        esac
        exit 0
    fi
    
    # Interactive menu
    while true; do
        show_menu
        read -p "Enter choice [0-12]: " choice
        
        case $choice in
            1)
                show_pm2_logs
                ;;
            2)
                show_pm2_logs_lines 100
                ;;
            3)
                show_pm2_error_logs
                ;;
            4)
                show_webserver_access_logs
                ;;
            5)
                show_webserver_error_logs
                ;;
            6)
                show_webserver_access_logs_lines 100
                ;;
            7)
                show_webserver_error_logs_lines 100
                ;;
            8)
                show_system_journal_backend
                ;;
            9)
                show_system_journal_webserver
                ;;
            10)
                show_all_logs
                ;;
            11)
                clear_pm2_logs
                ;;
            12)
                show_log_disk_usage
                ;;
            0)
                echo -e "${GREEN}Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option${NC}"
                sleep 1
                ;;
        esac
    done
}

# Run main function
main "$@"

