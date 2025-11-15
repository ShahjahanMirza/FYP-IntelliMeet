# IntelliMeet Self-Hosting Guide: Cheapest & Best Options

## 🎯 What You're Self-Hosting

When you self-host Jitsi Meet, you're running your own video conferencing infrastructure consisting of:

### **Components:**

1. **Jitsi Meet (Web Interface)** - The frontend web app
2. **Jitsi Videobridge (JVB)** - Routes video/audio between participants  
3. **Jicofo** - Conference focus, manages sessions
4. **Prosody** - XMPP server for signaling
5. **Nginx** - Web server & reverse proxy
6. **Coturn** (Optional) - TURN server for NAT traversal

**What you DON'T need to self-host:**
- Your IntelliMeet React app (can stay on Vercel/Netlify)
- Supabase database (already hosted)

---

## 💰 Cheapest Self-Hosting Options (Ranked)

### **🥇 Option 1: Hostinger VPS (CHEAPEST)**

**Cost: $4.99 - $7.99/month**

**Why Hostinger?**
- ✅ Cheapest VPS option
- ✅ Easy Docker support
- ✅ Good bandwidth
- ✅ 24/7 support
- ✅ Located worldwide

**Recommended Plan:**
- **VPS 1**: $4.99/month
  - 1 vCPU
  - 4 GB RAM
  - 50 GB NVMe SSD
  - 1 TB Bandwidth
  - **Capacity**: 10-20 concurrent users

- **VPS 2**: $7.99/month (Recommended)
  - 2 vCPU
  - 8 GB RAM
  - 100 GB NVMe SSD
  - 2 TB Bandwidth
  - **Capacity**: 30-50 concurrent users

**Link**: https://www.hostinger.com/vps-hosting

---

### **🥈 Option 2: Contabo VPS**

**Cost: €4.99 (~$5.50)/month**

**Why Contabo?**
- ✅ Best price-to-performance ratio
- ✅ Huge resources for cheap
- ✅ No bandwidth limits
- ⚠️ Slower support
- ⚠️ Servers mainly in EU

**Recommended Plan:**
- **VPS S**: €4.99/month
  - 4 vCPU
  - 8 GB RAM
  - 100 GB NVMe
  - Unlimited bandwidth
  - **Capacity**: 50-80 concurrent users

**Link**: https://contabo.com/en/vps/

---

### **🥉 Option 3: Hetzner Cloud**

**Cost: €4.51 (~$5)/month**

**Why Hetzner?**
- ✅ Excellent performance
- ✅ Great network
- ✅ EU data privacy compliant
- ✅ Best uptime
- ⚠️ Mainly EU servers

**Recommended Plan:**
- **CX21**: €4.51/month
  - 2 vCPU
  - 4 GB RAM
  - 40 GB SSD
  - 20 TB traffic
  - **Capacity**: 20-30 concurrent users

**Link**: https://www.hetzner.com/cloud

---

### **Option 4: DigitalOcean**

**Cost: $24/month**

**Why DigitalOcean?**
- ✅ Best documentation
- ✅ 1-click Jitsi app
- ✅ Global data centers
- ✅ Great API
- ❌ More expensive

**Recommended Plan:**
- **Basic Droplet**: $24/month
  - 2 vCPU
  - 4 GB RAM
  - 80 GB SSD
  - 4 TB transfer
  - **Capacity**: 30-50 concurrent users

**Link**: https://www.digitalocean.com/pricing/droplets

---

### **Option 5: Linode (Akamai)**

**Cost: $24/month**

**Similar to DigitalOcean**
- Good documentation
- Global presence
- Reliable

**Link**: https://www.linode.com/pricing/

---

### **Option 6: Vultr**

**Cost: $12/month**

**Why Vultr?**
- ✅ Good middle ground
- ✅ Many locations
- ✅ Easy to use

**Recommended Plan:**
- **Regular Performance**: $12/month
  - 2 vCPU
  - 4 GB RAM
  - 80 GB SSD
  - 3 TB bandwidth
  - **Capacity**: 25-40 concurrent users

**Link**: https://www.vultr.com/pricing/

---

## 🏆 **VERDICT: Best Options for IntelliMeet**

### **For Students/Budget (FYP):**
1. **Hostinger VPS 2** - $7.99/month ✅ BEST VALUE
2. **Contabo VPS S** - €4.99/month (if EU is okay)
3. **Hetzner CX21** - €4.51/month (EU servers)

### **For Production/Business:**
1. **Vultr** - $12/month (good balance)
2. **DigitalOcean** - $24/month (best support)
3. **Hetzner** - €9.90/month (CPX31 for more capacity)

---

## 📋 What You Need to Self-Host

### **Minimum Server Requirements:**
- **CPU**: 2 cores
- **RAM**: 4-8 GB
- **Storage**: 40-100 GB SSD
- **Bandwidth**: 500 GB - 1 TB/month
- **OS**: Ubuntu 22.04 LTS (recommended)

### **Domain Requirements:**
- A domain name ($10-15/year)
  - Example: `meet.intellimeet.com`
  - Can buy from Namecheap, GoDaddy, Cloudflare

### **SSL Certificate:**
- Let's Encrypt (FREE)
- Auto-renewed every 90 days
- Jitsi installer handles this

---

## 🚀 Step-by-Step Self-Hosting Guide

### **Step 1: Buy VPS (Recommended: Hostinger)**

1. Go to https://www.hostinger.com/vps-hosting
2. Choose **VPS 2** plan ($7.99/month)
3. Select **Ubuntu 22.04** as OS
4. Choose location closest to you (for better latency)
5. Complete payment

### **Step 2: Buy Domain**

1. Go to Namecheap or Cloudflare
2. Buy domain: `intellimeet.com` ($10-15/year)
3. Point subdomain `meet.intellimeet.com` to your VPS IP
   - Add A record: `meet` → `YOUR_VPS_IP`

### **Step 3: Install Jitsi Meet (Docker - EASIEST)**

SSH into your server:
```bash
ssh root@YOUR_VPS_IP
```

Run installation script:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Create directory
mkdir -p ~/jitsi-meet && cd ~/jitsi-meet

# Download Jitsi Docker setup
wget https://github.com/jitsi/docker-jitsi-meet/archive/refs/heads/master.zip
unzip master.zip
cd docker-jitsi-meet-master

# Copy environment file
cp env.example .env

# Edit .env file
nano .env
```

**Configure .env:**
```bash
# Change these values:
PUBLIC_URL=https://meet.intellimeet.com
ENABLE_LETSENCRYPT=1
LETSENCRYPT_DOMAIN=meet.intellimeet.com
LETSENCRYPT_EMAIL=your-email@example.com

# Generate strong passwords (Jitsi will auto-generate if left blank)
JICOFO_AUTH_PASSWORD=<generate-random>
JVB_AUTH_PASSWORD=<generate-random>
JIGASI_XMPP_PASSWORD=<generate-random>
JIBRI_RECORDER_PASSWORD=<generate-random>
JIBRI_XMPP_PASSWORD=<generate-random>
```

**Start Jitsi:**
```bash
# Create config directories
mkdir -p ~/.jitsi-meet-cfg/{web,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb,jigasi,jibri}

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

**Done!** Your Jitsi server is now running at `https://meet.intellimeet.com`

---

### **Step 4: Update Your IntelliMeet App**

Update `src/components/MeetingRoom.tsx`:

```typescript
// Change this line:
// OLD:
domain="8x8.vc"
roomName={`${JAAS_APP_ID}/${roomName}`}

// NEW:
domain="meet.intellimeet.com"  // Your self-hosted domain
roomName={roomName}  // Just the room name, no app ID needed
jwt={undefined}  // Remove JWT requirement
```

Remove JaaS App ID (not needed anymore):
```typescript
// DELETE this line:
const JAAS_APP_ID = "vpaas-magic-cookie-caa4035db06e460dbe6aaebdb5d45cee";
```

---

## 🎨 Customization (Make it 100% IntelliMeet)

### **1. Custom Branding**

SSH into server and edit config:
```bash
cd ~/jitsi-meet/docker-jitsi-meet-master
nano web/interface_config.js
```

Change:
```javascript
APP_NAME: 'IntelliMeet',
NATIVE_APP_NAME: 'IntelliMeet',
PROVIDER_NAME: 'IntelliMeet',
SHOW_JITSI_WATERMARK: false,
SHOW_WATERMARK_FOR_GUESTS: false,
SHOW_BRAND_WATERMARK: false,
```

### **2. Add Your Logo**

Upload logo to server:
```bash
# Place your logo.png in:
~/jitsi-meet/docker-jitsi-meet-master/web/images/watermark.png
```

Restart services:
```bash
docker-compose restart
```

---

## 💸 Total Cost Breakdown

### **Monthly Costs:**
| Item | Cost |
|------|------|
| Hostinger VPS 2 | $7.99 |
| Domain (yearly ÷ 12) | ~$1 |
| SSL Certificate | FREE |
| **Total/month** | **~$9** |

### **One-Time Costs:**
- Domain registration: $10-15/year
- Setup time: 1-2 hours

### **What You Get:**
- ✅ Unlimited meetings
- ✅ Unlimited duration
- ✅ 30-50 concurrent users
- ✅ Full control & customization
- ✅ Your own branding
- ✅ No usage fees
- ✅ Privacy & data ownership

---

## 📊 Cost Comparison

### **JaaS (8x8 Hosted) Paid Plans:**
- **Starter**: ~$100/month (25 participants)
- **Professional**: ~$300/month (100 participants)
- **Enterprise**: Custom pricing

### **Self-Hosted (Hostinger):**
- **$9/month** for 50 participants
- **Savings**: $91-291/month
- **Annual savings**: $1,092 - $3,492

---

## 🔧 Scaling Your Self-Hosted Setup

### **When to upgrade:**

**Current: 1 Server (50 users)**
- Cost: $9/month

**Growing: Load Balanced (200 users)**
- 1x Jitsi Meet server (web)
- 2x Videobridge servers
- Cost: ~$30/month

**Large: Multi-Region (1000+ users)**
- Multiple regions (US, EU, Asia)
- Multiple videobridges per region
- Cost: ~$100-200/month

---

## 🛡️ Security & Maintenance

### **Automatic Updates:**
```bash
# Add to crontab
docker-compose pull && docker-compose up -d
```

### **Backups:**
```bash
# Backup config
tar -czf jitsi-backup.tar.gz ~/.jitsi-meet-cfg
```

### **Monitoring:**
- Install Uptime Robot (FREE)
- Monitor `https://meet.intellimeet.com`

---

## 🎯 Summary

**Cheapest Option: Hostinger VPS 2**
- **Cost**: $7.99/month
- **Setup Time**: 1-2 hours
- **Capacity**: 30-50 users
- **Total Investment**: ~$9/month ($108/year)

**What You're Hosting:**
- Jitsi Meet server (video conferencing backend)
- NOT your IntelliMeet app (stays on Vercel)
- NOT your database (stays on Supabase)

**Next Steps:**
1. Buy Hostinger VPS ($7.99/month)
2. Buy domain on Namecheap (~$12/year)
3. Follow Step 3 installation guide
4. Update your app to use `meet.intellimeet.com`
5. Enjoy unlimited meetings! 🎉

**Need Help?**
- Hostinger has 24/7 support
- Jitsi community: https://community.jitsi.org/
- Official docs: https://jitsi.github.io/handbook/
