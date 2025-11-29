# 📱 วิธีการเปิดแอพ Bondarys

## 🚀 **วิธีเปิดแอพแบบง่าย (แนะนำ)**

### **1. รันบน Localhost (Development)**
```bash
# Windows
scripts\run-localhost.bat

# Linux/Mac
./scripts/run-localhost.sh
```

### **2. รันด้วย Docker Compose (Production-like)**
```bash
# รันทั้งหมดพร้อมกัน
docker-compose up

# รันในพื้นหลัง
docker-compose up -d
```

## 📱 **เปิดแอพบนมือถือ**

### **Android**
1. **ติดตั้ง Android Studio**
2. **เปิด Terminal ในโฟลเดอร์ mobile**
3. **รันคำสั่ง:**
```bash
cd mobile
npx react-native run-android
```

### **iOS**
1. **ติดตั้ง Xcode**
2. **เปิด Terminal ในโฟลเดอร์ mobile**
3. **รันคำสั่ง:**
```bash
cd mobile
npx react-native run-ios
```

## 🌐 **เปิดแอพบนเว็บ**

### **Frontend (ถ้ามี)**
```bash
cd frontend
npm start
```
**เปิดที่:** http://localhost:3000

### **Backend API**
```bash
cd backend
npm run dev
```
**เปิดที่:** http://localhost:3000

## 📋 **ขั้นตอนการเปิดแอพแบบละเอียด**

### **ขั้นตอนที่ 1: ตรวจสอบ Prerequisites**
```bash
# ตรวจสอบ Node.js
node --version

# ตรวจสอบ npm
npm --version

# ตรวจสอบ Docker (optional)
docker --version
```

### **ขั้นตอนที่ 2: ติดตั้ง Dependencies**
```bash
# ติดตั้ง Backend
cd backend
npm install
cd ..

# ติดตั้ง Mobile
cd mobile
npm install
cd ..
```

### **ขั้นตอนที่ 3: ตั้งค่า Environment**
```bash
# คัดลอกไฟล์ environment
copy .env.example .env

# แก้ไขไฟล์ .env ตามต้องการ
notepad .env
```

### **ขั้นตอนที่ 4: รัน Services**
```bash
# รัน Backend
cd backend
npm run dev

# รัน Metro (ใน Terminal ใหม่)
cd mobile
npx react-native start
```

### **ขั้นตอนที่ 5: รันแอพบนมือถือ**
```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

## 🔧 **การแก้ไขปัญหา**

### **ปัญหา: Port ถูกใช้งาน**
```bash
# ดู port ที่ใช้งาน
netstat -ano | findstr :3000

# หยุด process ที่ใช้ port
taskkill /PID <PID> /F
```

### **ปัญหา: Metro ไม่เชื่อมต่อ**
```bash
# รีเซ็ต Metro cache
npx react-native start --reset-cache
```

### **ปัญหา: Android Build ล้มเหลว**
```bash
# Clean build
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### **ปัญหา: iOS Build ล้มเหลว**
```bash
# Clean build
cd ios
xcodebuild clean
cd ..
npx react-native run-ios
```

## 📱 **การทดสอบแอพ**

### **บน Emulator/Simulator**
- **Android**: เปิด Android Studio → AVD Manager → Run
- **iOS**: เปิด Xcode → Simulator → Run

### **บนมือถือจริง**
- **Android**: เปิด Developer Options → USB Debugging
- **iOS**: เชื่อมต่อผ่าน USB และเชื่อถือ Developer Certificate

## 🌐 **URLs สำคัญ**

| Service | URL | คำอธิบาย |
|---------|-----|----------|
| Backend API | http://localhost:3000 | API Server |
| API Docs | http://localhost:3000/api-docs | API Documentation |
| Health Check | http://localhost:3000/health | Service Health |
| Metro Bundler | http://localhost:8081 | React Native Bundler |
| Redis | redis://localhost:6379 | Cache |

## 🎯 **คำสั่งด่วน**

### **เปิดแอพทั้งหมดพร้อมกัน**
```bash
# ใช้ script ที่เตรียมไว้
scripts\run-localhost.bat
```

### **เปิดเฉพาะ Backend**
```bash
cd backend
npm run dev
```

### **เปิดเฉพาะ Mobile**
```bash
cd mobile
npx react-native start
```

### **เปิดเฉพาะ Redis**
```bash
docker run -d --name bondarys-redis -p 6379:6379 redis:7-alpine
```

## 📞 **การขอความช่วยเหลือ**

### **Logs ที่สำคัญ**
```bash
# Backend logs
tail -f backend/logs/app.log

# Metro logs
# ดูใน Terminal ที่รัน Metro

# Docker logs
docker logs bondarys-backend
docker logs bondarys-redis
```

### **ตรวจสอบ Status**
```bash
# ตรวจสอบ services
docker ps

# ตรวจสอบ ports
netstat -ano | findstr :3000
netstat -ano | findstr :8081
```

## 🎉 **เมื่อเปิดแอพสำเร็จ**

คุณจะเห็น:
- ✅ Backend API ทำงานที่ port 3000
- ✅ Metro Bundler ทำงานที่ port 8081
- ✅ Redis ทำงานที่ port 6379
- 📱 แอพเปิดบนมือถือหรือ emulator

**ยินดีด้วย! แอพ Bondarys พร้อมใช้งานแล้ว!** 🚀✨ 