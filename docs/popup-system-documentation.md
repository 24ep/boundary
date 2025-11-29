# Popup System Documentation

## Overview

The Bondarys Popup System is a comprehensive solution for displaying targeted advertisements, promotions, announcements, and emergency notifications to users when they open the application. The system includes both mobile app integration and an admin console for management.

## Features

### 1. Popup Types
- **Advertisement**: Promotional content for products/services
- **Promotion**: Special offers and deals
- **Announcement**: Important app updates and news
- **Emergency**: Critical safety and security alerts

### 2. Targeting & Personalization
- **Target Audience**: All users, Premium users, Family users, Children, Seniors
- **Priority Levels**: Low, Medium, High, Critical
- **Conditions**: User type, Location, Device type, App version
- **Scheduling**: Start/end dates with time-based activation

### 3. Analytics & Tracking
- View count tracking
- Click-through rate (CTR) analysis
- User interaction analytics
- Export capabilities (CSV format)
- Real-time performance metrics

### 4. User Experience
- Smooth animations and transitions
- Responsive design for all screen sizes
- Age-appropriate content filtering
- Frequency control and limits
- Dismissal and preference settings

## Technical Implementation

### Mobile App Integration

#### 1. Popup Modal Component
```typescript
// mobile/src/components/popup/PopupModalSystem.tsx
export const PopupModalSystem: React.FC<PopupModalSystemProps> = ({
  isVisible,
  onClose,
  onAction,
  popupContent,
}) => {
  // Animated modal with priority-based styling
  // Support for images, action buttons, and analytics tracking
}
```

#### 2. Popup Service
```typescript
// mobile/src/services/popupService.ts
export const popupService = {
  getActivePopups: async (userId: string, userType: string),
  getNextPopup: async (userId: string, userType: string),
  recordPopupAction: async (analytics: PopupAnalytics),
  shouldShowPopup: async (userId: string, userType: string),
  // ... other methods
};
```

#### 3. Custom Hook
```typescript
// mobile/src/hooks/usePopup.ts
export const usePopup = () => {
  const {
    currentPopup,
    isPopupVisible,
    checkAndShowPopup,
    closePopup,
    handlePopupAction,
    // ... other methods
  } = usePopup();
};
```

### Backend API

#### 1. Popup Model
```typescript
// backend/src/models/PopupModel.ts
interface IPopup extends Document {
  type: 'ad' | 'promotion' | 'announcement' | 'emergency';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetAudience: 'all' | 'premium' | 'family' | 'children' | 'seniors';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  showCount: number;
  maxShows: number;
  // ... other fields
}
```

#### 2. API Routes
```typescript
// backend/src/routes/popupRoutes.ts
// Public routes
GET /api/popups/active - Get active popups for user
POST /api/popups/analytics - Record popup interactions

// Protected routes
GET /api/popups/user/:userId/settings - Get user popup settings
PUT /api/popups/user/:userId/settings - Update user settings

// Admin routes
GET /api/popups - Get all popups (admin)
POST /api/popups - Create new popup (admin)
PUT /api/popups/:id - Update popup (admin)
DELETE /api/popups/:id - Delete popup (admin)
GET /api/popups/analytics/overview - Get analytics overview
GET /api/popups/analytics/export - Export analytics data
```

#### 3. Controller Methods
```typescript
// backend/src/controllers/PopupController.ts
export class PopupController {
  async getActivePopups(req: Request, res: Response)
  async recordAnalytics(req: Request, res: Response)
  async createPopup(req: Request, res: Response)
  async updatePopup(req: Request, res: Response)
  async deletePopup(req: Request, res: Response)
  async getAnalyticsOverview(req: Request, res: Response)
  async exportAnalytics(req: Request, res: Response)
  // ... other methods
}
```

## Admin Console

### 1. Popup Manager Component
```typescript
// admin/src/components/PopupManager.tsx
export const PopupManager: React.FC = () => {
  // Tabbed interface for popup management and analytics
  // CRUD operations for popups
  // Real-time analytics dashboard
  // Export functionality
};
```

### 2. Features
- **Popup Management**: Create, edit, delete, and activate/deactivate popups
- **Analytics Dashboard**: View performance metrics and user interactions
- **Targeting Controls**: Set audience, conditions, and scheduling
- **Content Editor**: Rich text editor with image upload support
- **Export Tools**: Download analytics data in CSV format

### 3. Usage Guide

#### Creating a New Popup
1. Click "Create New Popup" button
2. Select popup type (ad, promotion, announcement, emergency)
3. Set priority level (low, medium, high, critical)
4. Enter title and message content
5. Add action button (optional)
6. Set target audience and conditions
7. Configure scheduling (start/end dates)
8. Set maximum show count
9. Save and activate

#### Managing Existing Popups
1. View all popups in the "Active Popups" tab
2. Edit popup details using the edit button
3. Delete popups using the delete button
4. Monitor performance in the "Analytics" tab
5. Export data for external analysis

## Configuration

### 1. Environment Variables
```bash
# Popup System Configuration
POPUP_ENABLED=true
POPUP_MAX_PER_DAY=3
POPUP_DEFAULT_FREQUENCY=daily
POPUP_ANALYTICS_RETENTION_DAYS=90
```

### 2. User Settings
```typescript
interface PopupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  maxPerDay: number;
  categories: string[];
}
```

### 3. Analytics Configuration
```typescript
interface PopupAnalytics {
  popupId: string;
  userId: string;
  action: 'view' | 'close' | 'click';
  timestamp: Date;
  sessionId: string;
  userAgent: string;
  ipAddress: string;
}
```

## Security & Privacy

### 1. Data Protection
- User consent for popup display
- GDPR-compliant data collection
- Secure analytics storage
- User preference controls

### 2. Content Moderation
- Admin approval for popup content
- Age-appropriate content filtering
- Emergency override capabilities
- Content expiration management

### 3. Rate Limiting
- Per-user popup frequency limits
- Daily maximum show counts
- Analytics collection throttling
- API rate limiting

## Performance Optimization

### 1. Caching Strategy
- Redis caching for active popups
- User preference caching
- Analytics data aggregation
- CDN for image assets

### 2. Database Optimization
- Indexed queries for popup retrieval
- Efficient analytics aggregation
- Data archival for old records
- Connection pooling

### 3. Mobile App Optimization
- Lazy loading of popup content
- Background analytics sync
- Offline popup storage
- Battery-efficient tracking

## Monitoring & Analytics

### 1. Key Metrics
- **Impressions**: Number of popup views
- **Click-through Rate**: Percentage of clicks vs views
- **Engagement Rate**: User interaction with popup content
- **Conversion Rate**: Actions taken after popup interaction

### 2. Performance Monitoring
- Popup load times
- User interaction patterns
- Device compatibility
- Error tracking and reporting

### 3. A/B Testing
- Content variation testing
- Timing optimization
- Audience targeting refinement
- Performance comparison

## Troubleshooting

### Common Issues

#### 1. Popups Not Showing
- Check user authentication status
- Verify popup scheduling (start/end dates)
- Confirm user preferences and settings
- Check network connectivity

#### 2. Analytics Not Recording
- Verify API endpoint accessibility
- Check user session validity
- Confirm analytics service status
- Review error logs

#### 3. Admin Console Issues
- Verify admin authentication
- Check database connectivity
- Confirm file upload permissions
- Review browser console errors

### Debug Tools
- Popup system logs
- Analytics debugging mode
- User preference inspection
- Network request monitoring

## Future Enhancements

### 1. Advanced Targeting
- Machine learning-based audience segmentation
- Behavioral targeting
- Location-based personalization
- Real-time content adaptation

### 2. Enhanced Analytics
- Predictive analytics
- User journey tracking
- Cross-platform attribution
- Advanced reporting dashboards

### 3. Content Management
- Rich media support (video, interactive content)
- Dynamic content generation
- Multi-language support
- Content versioning

### 4. Integration Features
- Third-party advertising platforms
- Marketing automation tools
- CRM system integration
- Social media integration

## API Reference

### Endpoints

#### GET /api/popups/active
Get active popups for a user
```typescript
Query Parameters:
- userId: string
- userType: string
- timestamp: string

Response:
{
  success: boolean;
  popups: Popup[];
}
```

#### POST /api/popups/analytics
Record popup interaction
```typescript
Body:
{
  popupId: string;
  userId: string;
  action: 'view' | 'close' | 'click';
  timestamp: string;
  sessionId: string;
}

Response:
{
  success: boolean;
  message: string;
}
```

#### GET /api/popups/analytics/overview
Get analytics overview (admin)
```typescript
Query Parameters:
- startDate: string (optional)
- endDate: string (optional)

Response:
{
  success: boolean;
  overview: PopupAnalytics[];
}
```

## Conclusion

The Bondarys Popup System provides a comprehensive solution for targeted content delivery with robust analytics, user-friendly management tools, and scalable architecture. The system ensures optimal user experience while providing powerful tools for content management and performance optimization. 