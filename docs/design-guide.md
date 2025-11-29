# Bondarys Design Guide

## 🎨 Design Philosophy

### Core Design Principles
1. **Luxury First**: ทุกองค์ประกอบต้องดูหรูหรา มีระดับ
2. **Universal Accessibility**: ใช้งานง่ายสำหรับทุกวัย
3. **Modern Minimalism**: เรียบง่าย ทันสมัย ไม่ซับซ้อน
4. **Family-Centric**: ออกแบบเพื่อครอบครัวโดยเฉพาะ
5. **Safety Priority**: ความปลอดภัยเป็นสิ่งสำคัญที่สุด

### Design Goals
- **เด็ก**: สนุก ใช้งานง่าย ปลอดภัย
- **ผู้ใหญ่**: ครบครัน ดูมีระดับ ปลอดภัย
- **ผู้สูงอายุ**: ใช้งานง่าย ตัวอักษรใหญ่ ชัดเจน

## 🎨 Color System

### Primary Color Palette

#### 🌹 Luxury Rose Gold
```css
/* Primary Rose Gold - ใช้สำหรับองค์ประกอบหลัก */
--primary-rose-gold: #E8B4A1;
--secondary-rose-gold: #D4A574;
--tertiary-rose-gold: #F2D7C7;
--accent-rose-gold: #D19A83;

/* Rose Gold Usage */
- โลโก้และแบรนด์
- ปุ่มสำคัญและ CTA
- การไฮไลท์หลัก
- สถานะออนไลน์
```

#### ⚪ Pure White
```css
/* Pure White - ใช้สำหรับพื้นหลังและข้อความ */
--pure-white: #FFFFFF;
--off-white: #FAFAFA;
--light-gray: #F5F5F5;
--text-white: #FFFFFF;

/* White Usage */
- พื้นหลังหลัก
- การ์ดและคอนเทนเนอร์
- ข้อความบนพื้นหลังสีเข้ม
- ช่องว่างและแบ่งส่วน
```

#### 🟡 Luxury Gold
```css
/* Luxury Gold - ใช้สำหรับไฮไลท์และฟีเจอร์พิเศษ */
--primary-gold: #FFD700;
--secondary-gold: #FFC107;
--accent-gold: #FFB300;
--deep-gold: #FF8F00;

/* Gold Usage */
- ไอคอนและขอบ
- ฟีเจอร์พรีเมียม
- รางวัลและความสำเร็จ
- ไฮไลท์และเอฟเฟกต์
```

### Color Combinations

#### Primary Combinations
```css
/* Main Brand Combination */
.primary-combination {
  background: linear-gradient(135deg, #D32F2F 0%, #F44336 100%);
  color: #FFFFFF;
  border: 2px solid #FFD700;
}

/* Secondary Combination */
.secondary-combination {
  background: linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%);
  color: #D32F2F;
  border: 2px solid #FFD700;
}

/* Accent Combination */
.accent-combination {
  background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
  color: #D32F2F;
  border: 2px solid #D32F2F;
}
```

#### Status Colors
```css
/* Success - Green */
--success-light: #E8F5E8;
--success-medium: #4CAF50;
--success-dark: #2E7D32;

/* Warning - Orange */
--warning-light: #FFF3E0;
--warning-medium: #FF9800;
--warning-dark: #E65100;

/* Error - Red */
--error-light: #FFEBEE;
--error-medium: #F44336;
--error-dark: #C62828;

/* Info - Blue */
--info-light: #E3F2FD;
--info-medium: #2196F3;
--info-dark: #1565C0;
```

## 📝 Typography

### Font Family
```css
/* iOS */
font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;

/* Android */
font-family: 'Roboto', 'Noto Sans Thai', sans-serif;

/* Web */
font-family: 'SF Pro Display', 'Roboto', 'Noto Sans Thai', sans-serif;
```

### Font Hierarchy

#### Headings
```css
/* H1 - Main Headings */
.heading-1 {
  font-family: 'SF Pro Display', sans-serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  color: #D32F2F;
}

/* H2 - Section Headings */
.heading-2 {
  font-family: 'SF Pro Display', sans-serif;
  font-size: 28px;
  font-weight: 600;
  line-height: 1.3;
  color: #D32F2F;
}

/* H3 - Subsection Headings */
.heading-3 {
  font-family: 'SF Pro Display', sans-serif;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
  color: #D32F2F;
}

/* H4 - Card Headings */
.heading-4 {
  font-family: 'SF Pro Display', sans-serif;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.4;
  color: #D32F2F;
}
```

#### Body Text
```css
/* Body Large - สำหรับข้อความสำคัญ */
.body-large {
  font-family: 'SF Pro Text', sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.5;
  color: #333333;
}

/* Body Medium - สำหรับข้อความทั่วไป */
.body-medium {
  font-family: 'SF Pro Text', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: #333333;
}

/* Body Small - สำหรับข้อความรอง */
.body-small {
  font-family: 'SF Pro Text', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
  color: #666666;
}

/* Caption - สำหรับคำอธิบาย */
.caption {
  font-family: 'SF Pro Text', sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.3;
  color: #999999;
}
```

#### Special Text
```css
/* Emergency Text */
.emergency-text {
  font-family: 'SF Pro Display', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #FF1744;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Premium Text */
.premium-text {
  font-family: 'SF Pro Display', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #FFD700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Button Text */
.button-text {
  font-family: 'SF Pro Display', sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

## 🎯 Component Design

### Buttons

#### Primary Button
```css
.primary-button {
  background: linear-gradient(135deg, #D32F2F 0%, #F44336 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-family: 'SF Pro Display', sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(211, 47, 47, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(211, 47, 47, 0.4);
}

.primary-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.3);
}
```

#### Secondary Button
```css
.secondary-button {
  background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
  color: #D32F2F;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-family: 'SF Pro Display', sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.secondary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.4);
}
```

#### Emergency Button
```css
.emergency-button {
  background: linear-gradient(135deg, #FF1744 0%, #D32F2F 100%);
  color: #FFFFFF;
  border: 3px solid #FFD700;
  border-radius: 50px;
  padding: 20px 32px;
  font-family: 'SF Pro Display', sans-serif;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 8px 24px rgba(255, 23, 68, 0.4);
  animation: pulse 2s infinite;
  cursor: pointer;
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 1000;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 8px 24px rgba(255, 23, 68, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(255, 23, 68, 0.6);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 8px 24px rgba(255, 23, 68, 0.4);
  }
}
```

### Cards

#### Luxury Card
```css
.luxury-card {
  background: linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%);
  border-radius: 16px;
  border: 2px solid #FFD700;
  box-shadow: 0 8px 32px rgba(211, 47, 47, 0.1);
  padding: 20px;
  margin: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.luxury-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(211, 47, 47, 0.15);
}

.luxury-card-header {
  color: #D32F2F;
  font-family: 'SF Pro Display', sans-serif;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.luxury-card-content {
  color: #333333;
  font-family: 'SF Pro Text', sans-serif;
  font-size: 16px;
  line-height: 1.5;
}
```

#### Family Member Card
```css
.member-card {
  background: linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%);
  border-radius: 16px;
  border: 2px solid #FFD700;
  padding: 16px;
  margin: 8px;
  box-shadow: 0 4px 16px rgba(211, 47, 47, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.member-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(211, 47, 47, 0.15);
}

.member-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid #FFD700;
  object-fit: cover;
}

.member-name {
  color: #D32F2F;
  font-family: 'SF Pro Display', sans-serif;
  font-size: 18px;
  font-weight: 600;
  margin: 8px 0 4px 0;
}

.member-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #FFD700;
}

.status-online {
  background: #4CAF50;
}

.status-offline {
  background: #9E9E9E;
}

.status-emergency {
  background: #FF1744;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}
```

### Input Fields

#### Luxury Input
```css
.luxury-input {
  background: linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%);
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  padding: 16px 20px;
  font-family: 'SF Pro Text', sans-serif;
  font-size: 16px;
  color: #333333;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.luxury-input:focus {
  border-color: #FFD700;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
}

.luxury-input::placeholder {
  color: #999999;
  font-family: 'SF Pro Text', sans-serif;
  font-size: 16px;
}

.luxury-input.error {
  border-color: #F44336;
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
}

.luxury-input.success {
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}
```

### Navigation

#### Bottom Tab Navigation
```css
.tab-navigation {
  background: linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%);
  border-top: 2px solid #FFD700;
  box-shadow: 0 -4px 16px rgba(211, 47, 47, 0.1);
  padding: 12px 0 8px 0;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.tab-item.active {
  background: linear-gradient(135deg, #D32F2F 0%, #F44336 100%);
  color: #FFFFFF;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(211, 47, 47, 0.3);
}

.tab-item:not(.active) {
  color: #999999;
}

.tab-item:not(.active):hover {
  color: #D32F2F;
  transform: translateY(-1px);
}

.tab-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.tab-label {
  font-family: 'SF Pro Display', sans-serif;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

## 🎨 Layout System

### Grid System
```css
/* 12-Column Grid */
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
  padding: 16px;
}

.grid-item-1 { grid-column: span 1; }
.grid-item-2 { grid-column: span 2; }
.grid-item-3 { grid-column: span 3; }
.grid-item-4 { grid-column: span 4; }
.grid-item-6 { grid-column: span 6; }
.grid-item-8 { grid-column: span 8; }
.grid-item-12 { grid-column: span 12; }

/* Responsive Grid */
@media (max-width: 768px) {
  .grid-item-4 { grid-column: span 6; }
  .grid-item-6 { grid-column: span 12; }
  .grid-item-8 { grid-column: span 12; }
}

@media (max-width: 480px) {
  .grid-item-2 { grid-column: span 6; }
  .grid-item-3 { grid-column: span 6; }
  .grid-item-4 { grid-column: span 12; }
}
```

### Spacing System
```css
/* Spacing Scale */
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
}

/* Usage */
.section {
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.card {
  padding: var(--space-md);
  margin: var(--space-sm);
}

.button {
  padding: var(--space-md) var(--space-lg);
  margin: var(--space-sm);
}
```

### Container System
```css
/* Container Sizes */
.container-sm {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.container-md {
  max-width: 768px;
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.container-lg {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.container-xl {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-md);
}
```

## 🎯 Age-Appropriate Design

### Children (5-12 years)
```css
/* Child Theme */
.child-theme {
  --primary-color: #FF1744;
  --secondary-color: #FFD700;
  --background-color: #FFFFFF;
  --text-color: #D32F2F;
  --border-radius: 20px;
  --shadow: 0 8px 32px rgba(255, 23, 68, 0.2);
}

/* Large Touch Targets */
.child-button {
  min-width: 60px;
  min-height: 60px;
  border-radius: 20px;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #FF1744 0%, #F44336 100%);
  color: #FFFFFF;
  border: 3px solid #FFD700;
  box-shadow: 0 8px 32px rgba(255, 23, 68, 0.3);
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* Fun Icons */
.child-icon {
  font-size: 32px;
  margin: 8px;
  animation: wiggle 3s infinite;
}

@keyframes wiggle {
  0%, 7% { transform: rotateZ(0); }
  15% { transform: rotateZ(-15deg); }
  20% { transform: rotateZ(10deg); }
  25% { transform: rotateZ(-10deg); }
  30% { transform: rotateZ(6deg); }
  35% { transform: rotateZ(-4deg); }
  40%, 100% { transform: rotateZ(0); }
}
```

### Seniors (65+ years)
```css
/* Senior Theme */
.senior-theme {
  --primary-color: #D32F2F;
  --secondary-color: #FFD700;
  --background-color: #FFFFFF;
  --text-color: #000000;
  --border-radius: 12px;
  --shadow: 0 4px 16px rgba(211, 47, 47, 0.1);
  --contrast-ratio: 4.5:1;
}

/* Large Text */
.senior-text {
  font-size: 20px;
  line-height: 1.6;
  font-weight: 500;
  color: #000000;
}

.senior-heading {
  font-size: 28px;
  line-height: 1.3;
  font-weight: 600;
  color: #D32F2F;
  margin-bottom: 16px;
}

/* Large Buttons */
.senior-button {
  min-width: 80px;
  min-height: 80px;
  font-size: 20px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #D32F2F 0%, #F44336 100%);
  color: #FFFFFF;
  border: 3px solid #FFD700;
  box-shadow: 0 4px 16px rgba(211, 47, 47, 0.3);
  padding: 20px 32px;
}

/* High Contrast */
.senior-card {
  background: #FFFFFF;
  border: 3px solid #D32F2F;
  border-radius: 12px;
  padding: 24px;
  margin: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.senior-input {
  font-size: 20px;
  padding: 20px;
  border: 3px solid #D32F2F;
  border-radius: 12px;
  background: #FFFFFF;
  color: #000000;
}
```

## 🎨 Animation & Transitions

### Micro-interactions
```css
/* Hover Effects */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(211, 47, 47, 0.15);
}

/* Press Effects */
.press-effect {
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

.press-effect:active {
  transform: translateY(0) scale(0.98);
}

/* Loading Animations */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #F5F5F5;
  border-top: 4px solid #D32F2F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Success Animation */
.success-checkmark {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

## 🎨 Icon System

### Icon Guidelines
```css
/* Icon Sizes */
.icon-xs { font-size: 12px; }
.icon-sm { font-size: 16px; }
.icon-md { font-size: 24px; }
.icon-lg { font-size: 32px; }
.icon-xl { font-size: 48px; }

/* Icon Colors */
.icon-primary { color: #D32F2F; }
.icon-secondary { color: #FFD700; }
.icon-white { color: #FFFFFF; }
.icon-gray { color: #999999; }

/* Icon with Background */
.icon-with-bg {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #D32F2F 0%, #F44336 100%);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #FFD700;
}
```

### Common Icons
```css
/* Navigation Icons */
.icon-home { content: "🏠"; }
.icon-calendar { content: "📅"; }
.icon-add { content: "➕"; }
.icon-apps { content: "📱"; }
.icon-profile { content: "👤"; }

/* Action Icons */
.icon-call { content: "📞"; }
.icon-message { content: "💬"; }
.icon-location { content: "📍"; }
.icon-emergency { content: "🚨"; }
.icon-settings { content: "⚙️"; }

/* Status Icons */
.icon-online { content: "🟢"; }
.icon-offline { content: "⚫"; }
.icon-away { content: "🟡"; }
.icon-busy { content: "🔴"; }
```

## 🎨 Accessibility

### High Contrast Mode
```css
/* High Contrast Theme */
.high-contrast {
  --background-color: #000000;
  --text-color: #FFFFFF;
  --accent-color: #FFD700;
  --border-color: #FFD700;
  --primary-color: #FF1744;
  --secondary-color: #FFD700;
}

.high-contrast .luxury-card {
  background: #000000;
  border: 3px solid #FFD700;
  color: #FFFFFF;
}

.high-contrast .luxury-button {
  background: #FF1744;
  color: #FFFFFF;
  border: 3px solid #FFD700;
}
```

### Screen Reader Support
```css
/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus Indicators */
.focus-visible {
  outline: 3px solid #FFD700;
  outline-offset: 2px;
}
```

This design guide ensures that Bondarys maintains a luxurious, modern appearance while being accessible and easy to use for all family members, regardless of age or technical ability. 