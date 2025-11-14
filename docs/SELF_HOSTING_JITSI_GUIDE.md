# Complete Guide: Self-Hosting Jitsi Meet on Hostinger VPS

## Overview

This guide provides a comprehensive, step-by-step plan for setting up your own Jitsi Meet server on a Hostinger VPS, giving you complete control over your video conferencing infrastructure.

---

## 🎯 Why Self-Host?

### Benefits:
- ✅ **Complete Control**: Full customization of UI, branding, and features
- ✅ **No Usage Limits**: Unlimited meetings and participants (within server capacity)
- ✅ **No External Branding**: Remove all Jitsi/8x8 branding completely
- ✅ **Privacy**: All data stays on your server
- ✅ **Cost Predictable**: Fixed monthly VPS cost vs. per-minute JaaS pricing
- ✅ **Custom Features**: Add recording, streaming, custom integrations

### Drawbacks:
- ❌ Requires technical expertise (Linux, Docker, networking)
- ❌ You handle maintenance, updates, security patches
- ❌ Need to manage server scaling as usage grows
- ❌ Responsible for uptime and reliability

---

## 📋 Prerequisites

### 1. Hostinger VPS Requirements

**Minimum Specs (for testing/small teams):**
- 2 vCPUs
- 4GB RAM
- 40GB SSD Storage
- Ubuntu 22.04 LTS

**Recommended Specs (for production):**
- 4 vCPUs
- 8GB RAM
- 80GB SSD Storage
- Ubuntu 22.04 LTS

**For Heavy Usage (50+ concurrent users):**
- 8+ vCPUs
- 16GB+ RAM
- 160GB+ SSD Storage
- Ubuntu 22.04 LTS

### 2. Domain Name
- You need a domain name (e.g., `meet.yourdomain.com`)
- DNS configured to point to your VPS IP address

### 3. Skills Needed
- Basic Linux command line
- Understanding of DNS and SSL certificates
- Familiarity with SSH

---

## 🚀 Installation Plan

### Phase 1: Server Setup (Day 1)

#### Step 1: Purchase Hostinger VPS
1. Go to [Hostinger VPS Plans](https://www.hostinger.com/vps-hosting)
2. Choose appropriate plan (start with VPS 2 for testing)
3. Select Ubuntu 22.04 LTS as operating system
4. Complete purchase and note down:
   - Server IP address
   - Root password
   - SSH access details

#### Step 2: Initial Server Configuration
```bash
# Connect to your VPS via SSH
ssh root@your-server-ip

# Update system packages
apt update && apt upgrade -y

# Set timezone
timedatectl set-timezone America/New_York  # Change to your timezone

# Create a non-root user
adduser jitsi
usermod -aG sudo jitsi

# Set up firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 10000/udp
ufw allow 3478/udp
ufw allow 5349/tcp
ufw enable
```

#### Step 3: Configure Domain DNS
1. Log into your domain registrar
2. Create an A record:
   - **Host**: `meet` (or your preferred subdomain)
   - **Points to**: Your VPS IP address
   - **TTL**: 3600 (or automatic)
3. Wait for DNS propagation (15 minutes to 48 hours)
4. Verify: `nslookup meet.yourdomain.com`

---

### Phase 2: Jitsi Installation (Day 1-2)

#### Step 1: Install Jitsi Meet
```bash
# Switch to jitsi user
su - jitsi

# Set hostname
sudo hostnamectl set-hostname meet.yourdomain.com

# Add Jitsi repository
sudo apt install -y gnupg2 nginx-full
wget -qO - https://download.jitsi.org/jitsi-key.gpg.key | sudo apt-key add -
sudo sh -c "echo 'deb https://download.jitsi.org stable/' > /etc/apt/sources.list.d/jitsi-stable.list"

# Update and install Jitsi
sudo apt update
sudo apt install -y jitsi-meet

# During installation:
# - Enter your domain: meet.yourdomain.com
# - Choose "Generate a new self-signed certificate" (we'll replace with Let's Encrypt)
```

#### Step 2: Install SSL Certificate (Let's Encrypt)
```bash
# Run the Let's Encrypt certificate script
sudo /usr/share/jitsi-meet/scripts/install-letsencrypt-cert.sh

# Enter your email address when prompted
# Certificate will auto-renew
```

#### Step 3: Test Basic Installation
1. Open browser and go to `https://meet.yourdomain.com`
2. You should see the Jitsi Meet interface
3. Try creating a test meeting

---

### Phase 3: Customization & Branding (Day 2-3)

#### Step 1: Remove Jitsi Branding

Edit the interface config:
```bash
sudo nano /etc/jitsi/meet/meet.yourdomain.com-config.js
```

Add/modify these settings:
```javascript
var config = {
    // ... existing config ...
    
    // Branding
    defaultLogoUrl: 'images/watermark.svg',  // Your logo
    
    // Disable Jitsi branding
    SHOW_JITSI_WATERMARK: false,
    JITSI_WATERMARK_LINK: 'https://yourdomain.com',
    
    // App name
    APP_NAME: 'MeetSpace',
    NATIVE_APP_NAME: 'MeetSpace',
    PROVIDER_NAME: 'Your Company',
    
    // UI customization
    TOOLBAR_ALWAYS_VISIBLE: true,
    SETTINGS_SECTIONS: [ 'devices', 'language', 'moderator', 'profile', 'calendar' ],
    
    // Features
    prejoinPageEnabled: false,  // Disable prejoin
    disableDeepLinking: true,
    
    // ... more customization
};
```

#### Step 2: Custom Logo & Styling
```bash
# Navigate to assets directory
cd /usr/share/jitsi-meet

# Backup originals
sudo cp images/watermark.svg images/watermark.svg.backup
sudo cp images/logo-deep-linking.png images/logo-deep-linking.png.backup

# Upload your logo files (use SCP or SFTP)
# Replace watermark.svg and logo-deep-linking.png with your branding

# Custom CSS
sudo nano css/custom.css

# Add your custom styles, then include in index.html
```

#### Step 3: Interface Customization
```bash
sudo nano /usr/share/jitsi-meet/interface_config.js
```

Customize buttons, colors, and UI elements.

---

### Phase 4: Advanced Features (Day 3-5)

#### Step 1: Enable Recording (Optional)
```bash
# Install Jibri for recording
sudo apt install -y jibri

# Configure Jibri
sudo nano /etc/jitsi/jibri/jibri.conf

# Set up recording storage
sudo mkdir -p /srv/recordings
sudo chown jibri:jibri /srv/recordings
```

#### Step 2: Authentication (Secure Your Server)
```bash
# Install JWT authentication
sudo apt install -y lua5.2 liblua5.2-dev luarocks
sudo luarocks install basexx
sudo luarocks install luajwtjitsi

# Configure JWT
sudo nano /etc/prosody/conf.avail/meet.yourdomain.com.cfg.lua

# Add authentication settings
VirtualHost "meet.yourdomain.com"
    authentication = "token"
    app_id = "your_app_id"
    app_secret = "your_app_secret"
```

#### Step 3: Load Balancing (For Growth)
When you need to scale:
- Set up multiple Jitsi Video Bridges (JVB)
- Use a load balancer (HAProxy or Nginx)
- Separate signaling from media servers

---

### Phase 5: Integration with Your App (Day 5-7)

#### Update Your React App

Replace the JaaS connection with your self-hosted server:

```typescript
// In MeetingRoom.tsx
<JitsiMeeting
  domain="meet.yourdomain.com"  // Your domain instead of 8x8.vc
  roomName={roomName}  // No JAAS_APP_ID prefix needed
  configOverwrite={{
    startWithAudioMuted: false,
    startWithVideoMuted: false,
    prejoinPageEnabled: false,
    // ... all your custom config
  }}
  interfaceConfigOverwrite={{
    SHOW_JITSI_WATERMARK: false,
    // ... your custom interface config
  }}
  // No JWT needed unless you enabled authentication
  onApiReady={handleJitsiEvents.onApiReady}
  getIFrameRef={(iframeRef) => {
    // ... iframe styling
  }}
/>
```

#### Secure API Access (Optional)
If you want to control who can create meetings:
1. Implement JWT token generation in your backend
2. Pass tokens to the Jitsi iframe
3. Configure Jitsi to validate tokens

---

## 💰 Cost Comparison

### JaaS (Jitsi as a Service)
- Free tier: Limited minutes
- Paid: ~$0.03-0.05 per minute per participant
- **Example**: 100 hours/month with 5 avg participants = $900-1500/month

### Self-Hosted on Hostinger VPS
- **VPS 2** (4GB RAM): ~$8-12/month - Good for testing
- **VPS 3** (8GB RAM): ~$15-20/month - Good for small teams (10-20 users)
- **VPS 4** (16GB RAM): ~$30-40/month - Good for medium usage (50+ users)

**Breakeven Point**: If you expect more than 10-20 hours of meetings per month, self-hosting becomes cost-effective.

---

## 🔒 Security Checklist

- ✅ Enable firewall (UFW)
- ✅ Install SSL certificate (Let's Encrypt)
- ✅ Keep system updated (`apt update && apt upgrade`)
- ✅ Enable JWT authentication if needed
- ✅ Use strong passwords
- ✅ Monitor server logs regularly
- ✅ Set up automated backups
- ✅ Configure fail2ban for SSH protection
- ✅ Limit room creation (optional)

---

## 📊 Monitoring & Maintenance

### Weekly Tasks:
```bash
# Check system resources
htop

# Check Jitsi logs
sudo tail -f /var/log/jitsi/jvb.log
sudo tail -f /var/log/prosody/prosody.log

# Check disk space
df -h

# Update system
sudo apt update && sudo apt upgrade -y
```

### Monthly Tasks:
- Review usage statistics
- Check certificate expiration
- Test backup restoration
- Update Jitsi packages

---

## 🆘 Troubleshooting

### Common Issues:

**1. Can't connect to meeting:**
- Check firewall: `sudo ufw status`
- Verify ports 10000/udp and 443/tcp are open
- Check DNS: `nslookup meet.yourdomain.com`

**2. Video/audio not working:**
- Check JVB logs: `sudo tail -f /var/log/jitsi/jvb.log`
- Verify NAT configuration
- Check browser console for errors

**3. Poor quality/lag:**
- Check server resources: `htop`
- May need to upgrade VPS plan
- Consider adding additional JVB servers

**4. SSL certificate issues:**
```bash
sudo /usr/share/jitsi-meet/scripts/install-letsencrypt-cert.sh
```

---

## 🎓 Learning Resources

- [Official Jitsi Handbook](https://jitsi.github.io/handbook/)
- [Jitsi Community Forum](https://community.jitsi.org/)
- [Hostinger VPS Tutorials](https://www.hostinger.com/tutorials/vps)
- [Docker Jitsi Meet](https://github.com/jitsi/docker-jitsi-meet) - Alternative Docker-based setup

---

## 🚀 Timeline Summary

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1** | 2-4 hours | VPS setup, DNS configuration |
| **Phase 2** | 2-3 hours | Jitsi installation, SSL setup |
| **Phase 3** | 4-8 hours | Customization, branding |
| **Phase 4** | 8-16 hours | Advanced features (optional) |
| **Phase 5** | 4-8 hours | App integration, testing |
| **Total** | 1-5 days | Depending on complexity |

---

## 💡 Recommendations

### Start Small:
1. **Week 1**: Set up basic Jitsi on VPS 2, test with your team
2. **Week 2-3**: Customize branding, integrate with your app
3. **Week 4**: Add authentication and advanced features
4. **Ongoing**: Monitor usage, upgrade VPS as needed

### Alternative: Docker Setup
For easier deployment and scaling, consider using [Docker Jitsi Meet](https://github.com/jitsi/docker-jitsi-meet):
- Easier to deploy and manage
- Better for scaling
- Simpler updates

---

## 📞 Support Options

1. **Hostinger Support**: 24/7 for VPS issues
2. **Jitsi Community**: Forum for technical questions
3. **Paid Consulting**: Consider hiring a DevOps engineer for initial setup (~$500-1000)

---

## ✅ Next Steps

1. Purchase Hostinger VPS (start with VPS 2 for testing)
2. Follow Phase 1 to set up server
3. Configure your domain DNS
4. Install Jitsi following Phase 2
5. Test thoroughly before migrating from JaaS
6. Gradually customize and add features

**Important**: Keep JaaS as fallback until your self-hosted solution is stable and tested!

---

*Document Version: 1.0*  
*Last Updated: November 2025*  
*Questions? Refer to official Jitsi documentation or Hostinger support*
