# Marketing CMS Implementation

This document outlines the implementation of a Content Management System (CMS) for marketing pages in the Bondarys application.

## Overview

The Marketing CMS allows administrators to manage marketing content including:
- Marketing slides for onboarding/landing pages
- Hero sections
- Feature highlights
- Customer testimonials
- FAQ content

## Architecture

### Backend Components

#### 1. Database Schema
- **Migration**: `backend/src/migrations/006_marketing_cms_content.sql`
- **Tables**:
  - `marketing_content`: Main content table for marketing content
  - `marketing_content_meta`: Metadata for marketing content
  - `marketing_content_files`: File attachments for marketing content
  - `content_types`: Marketing-specific content types
  - `categories`: Marketing content categories

#### 2. API Endpoints
- **Base URL**: `/cms/marketing`
- **Endpoints**:
  - `GET /content` - Get all marketing content
  - `GET /content/:id` - Get specific marketing content
  - `POST /content` - Create new marketing content
  - `PUT /content/:id` - Update marketing content
  - `DELETE /content/:id` - Delete marketing content
  - `GET /slides` - Get marketing slides specifically

#### 3. Controller
- **File**: `backend/src/controllers/CMSController.ts`
- **Methods**:
  - `getMarketingContent()` - Fetch marketing content with filters
  - `getMarketingContentById()` - Get specific content
  - `createMarketingContent()` - Create new content
  - `updateMarketingContent()` - Update existing content
  - `deleteMarketingContent()` - Delete content
  - `getMarketingSlides()` - Get slides for mobile app

### Frontend Components

#### 1. Mobile App
- **Service**: `mobile/src/services/marketingService.ts`
  - Caching implementation with 5-minute timeout
  - Fallback content for offline scenarios
  - TypeScript interfaces for type safety

- **Screen**: `mobile/src/screens/auth/MarketingScreen.tsx`
  - Dynamic content loading from CMS
  - Loading states and error handling
  - Fallback to default slides if API fails

#### 2. Admin Console
- **Component**: `admin/src/components/MarketingContentManager.tsx`
  - Full CRUD operations for marketing content
  - Rich form interface for slide content
  - Analytics dashboard
  - Content type management

## Content Types

### Marketing Slide
```json
{
  "title": "Stay Connected",
  "subtitle": "With Your Family",
  "description": "Keep your loved ones close...",
  "icon": "home-heart",
  "gradient": ["#FA7272", "#FFBBB4"],
  "features": [
    "Real-time location tracking",
    "Instant family messaging",
    "Safety alerts & notifications"
  ],
  "slide_order": 1
}
```

### Marketing Hero
```json
{
  "headline": "Connect Your Family",
  "subheadline": "Stay close, stay safe, stay connected",
  "cta_text": "Get Started",
  "cta_action": "navigate_to_signup",
  "background_image": "hero-bg.jpg",
  "background_gradient": ["#FA7272", "#FFBBB4"]
}
```

### Marketing Feature
```json
{
  "title": "Real-time Location Sharing",
  "description": "Know where your family is at all times",
  "icon": "map-marker",
  "features": [
    "Live location updates",
    "Geofencing alerts",
    "Location history"
  ],
  "display_order": 1
}
```

## Features

### 1. Content Management
- Create, read, update, delete marketing content
- Rich text editing for descriptions
- Image and file management
- Content versioning
- Draft/published/archived status

### 2. Content Types
- Marketing slides for onboarding
- Hero sections for landing pages
- Feature highlights
- Customer testimonials
- FAQ content

### 3. Caching & Performance
- 5-minute cache timeout for API responses
- Fallback content for offline scenarios
- Optimized database queries
- Lazy loading for large content sets

### 4. Admin Interface
- Tabbed interface for different content types
- Rich form controls for slide content
- Analytics dashboard
- Bulk operations
- Content preview

## Usage

### For Developers

#### Adding New Content Types
1. Add content type to database migration
2. Update TypeScript interfaces
3. Add form fields to admin interface
4. Update mobile service to handle new type

#### Customizing Marketing Slides
1. Access admin console at `/marketing`
2. Create new marketing slide content
3. Configure slide properties (title, subtitle, description, etc.)
4. Set priority for display order
5. Publish content

### For Content Managers

#### Creating Marketing Content
1. Navigate to Marketing CMS in admin console
2. Click "Create New Marketing Content"
3. Fill in content details:
   - Title and slug
   - Status (draft/published/archived)
   - Priority for ordering
   - Featured flag
4. Configure slide-specific content:
   - Slide title and subtitle
   - Description text
   - Icon name
   - Gradient colors
   - Feature list
   - Slide order
5. Save and publish

#### Managing Content
- Use the table view to see all content
- Filter by status, type, or category
- Edit content by clicking the edit icon
- Delete content with confirmation
- View analytics in the Analytics tab

## API Examples

### Get Marketing Slides
```javascript
const slides = await marketingService.getMarketingSlides();
```

### Create Marketing Content
```javascript
const content = await marketingService.createMarketingContent({
  title: "New Slide",
  slug: "new-slide",
  content: JSON.stringify(slideData),
  status: "published",
  priority: 1,
  is_featured: true
});
```

### Clear Cache
```javascript
marketingService.clearCache(); // Clear all cache
marketingService.clearCacheFor('marketing-slides'); // Clear specific cache
```

## Database Schema

### marketing_content Table
```sql
CREATE TABLE marketing_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type_id UUID REFERENCES content_types(id),
    category_id UUID REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT,
    excerpt TEXT,
    featured_image_url TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    priority INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Considerations

- Content validation on both client and server
- SQL injection prevention with parameterized queries
- XSS protection for content fields
- Authentication required for admin operations
- Rate limiting on API endpoints

## Performance Optimizations

- Database indexing on frequently queried fields
- Caching with configurable timeouts
- Lazy loading for large content sets
- Optimized queries with proper joins
- CDN integration for media files

## Future Enhancements

1. **A/B Testing**: Support for multiple versions of marketing content
2. **Analytics**: Detailed analytics for content performance
3. **Localization**: Multi-language support for marketing content
4. **Templates**: Pre-built templates for common marketing content
5. **Scheduling**: Schedule content publication
6. **Workflow**: Content approval workflow for teams
7. **Preview**: Live preview of marketing content before publishing

## Troubleshooting

### Common Issues

1. **Content not loading**: Check API endpoints and network connectivity
2. **Cache issues**: Clear cache using `marketingService.clearCache()`
3. **Form validation**: Ensure all required fields are filled
4. **Image uploads**: Check file size limits and supported formats

### Debug Mode

Enable debug logging in the marketing service:
```javascript
// Add to marketingService.ts
const DEBUG = true;
if (DEBUG) {
  console.log('Marketing service debug:', data);
}
```

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
