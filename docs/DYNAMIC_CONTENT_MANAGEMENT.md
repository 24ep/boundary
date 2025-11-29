# Dynamic Content Management System

## Overview

The Dynamic Content Management System is a comprehensive solution that allows administrators to create, manage, and display dynamic content across the Bondarys platform. It features a drag-and-drop visual editor similar to Adobe Experience Manager, enabling non-technical users to create engaging content without coding knowledge.

## Features

### 🎨 Visual Drag-and-Drop Editor
- **Component Library**: Pre-built components including text, images, videos, buttons, containers, and spacers
- **Real-time Preview**: See changes instantly as you build
- **Component Properties**: Customize each component with dedicated property panels
- **Responsive Design**: Components adapt to different screen sizes


### 🎯 Content Types
1. **Marketing Pages**: Pre-login content to attract users
2. **News/Inspiration**: Family updates and inspirational content
3. **Popup Modals**: Promotional and announcement popups

### 📊 Analytics & Tracking
- View tracking for all content
- Click and conversion analytics
- User interaction monitoring
- Performance metrics

## Architecture

### Frontend (Admin Console)
```
admin/components/
├── ContentEditor.tsx          # Main drag-and-drop editor
├── DynamicContentManager.tsx  # Content management interface
└── ContentCard.tsx           # Content display cards
```

### Backend API
```
backend/src/routes/
└── dynamicContentRoutes.ts   # Content management endpoints
```


### Database Schema
```
content_pages              # Main content storage
content_analytics          # View/click tracking
content_templates          # Pre-built templates
content_views             # Individual view records
content_interactions      # User interactions
```

## Usage Guide

### Creating Content

1. **Access the Editor**
   - Navigate to "Dynamic Content" in the admin sidebar
   - Click "Create Content" or "Use Template"

2. **Build with Components**
   - Drag components from the left panel to the canvas
   - Click components to edit their properties
   - Use the preview mode to see the final result

3. **Configure Display Settings**
   - Set content type and status
   - Configure display rules and triggers

4. **Save and Publish**
   - Save as draft for testing
   - Publish when ready for users

### Component Types

#### Text Component
- **Properties**: Content, font size, color, alignment
- **Use Cases**: Headlines, descriptions, body text

#### Image Component
- **Properties**: Image URL, alt text, caption, width
- **Use Cases**: Hero images, illustrations, photos

#### Button Component
- **Properties**: Text, action URL, style, size
- **Use Cases**: Call-to-action buttons, navigation

#### Container Component
- **Properties**: Background color, padding, margins
- **Use Cases**: Layout organization, grouping

#### Spacer Component
- **Properties**: Height
- **Use Cases**: Vertical spacing, layout control


## API Endpoints

### Content Management
- `GET /cms/content/pages` - List content pages
- `POST /cms/content/pages` - Create new content
- `PUT /cms/content/pages/:id` - Update content
- `DELETE /cms/content/pages/:id` - Delete content

### Content Tracking
- `POST /cms/content/pages/:id/view` - Track view
- `POST /cms/content/pages/:id/interaction` - Track interaction

### Analytics
- `GET /cms/content/pages/:id/analytics` - Get analytics
- `GET /cms/content/templates` - Get templates

## Database Setup

Run the database schema to set up the content management system:

```sql
-- Execute the schema file
\i backend/src/database/dynamic_content_schema.sql
```

This will create:
- Content pages table with JSONB components
- Analytics tracking tables
- Template system
- Performance indexes

## Best Practices

### Content Creation
1. **Start with Templates**: Use pre-built templates for common layouts
2. **Responsive Design**: Design with different screen sizes in mind
3. **Test Thoroughly**: Preview on different screen sizes
4. **Optimize Images**: Use appropriate image sizes and formats

### Performance
1. **Limit Components**: Keep pages under 20 components for best performance
2. **Optimize Images**: Compress images before uploading
3. **Use Templates**: Reuse successful layouts
4. **Monitor Analytics**: Track performance and optimize based on data


## Troubleshooting

### Common Issues

1. **Components Not Rendering**
   - Check component props are valid
   - Verify image URLs are accessible
   - Ensure proper JSON structure

2. **Content Not Displaying**
   - Check content status is "published"
   - Verify display settings and rules
   - Confirm API endpoints are accessible

3. **Analytics Not Tracking**
   - Check network connectivity
   - Verify API authentication
   - Ensure proper error handling

### Debug Mode
Enable debug logging to troubleshoot content issues:

```typescript
// In your application configuration
console.log('Content loaded:', content);
console.log('Component props:', component.props);
```

## Future Enhancements

### Planned Features
- **Advanced Components**: Video players, forms, carousels
- **A/B Testing**: Test different content versions
- **Personalization**: User-specific content delivery
- **Advanced Analytics**: Heat maps, user journey tracking
- **Content Scheduling**: Time-based content publishing
- **Multi-language Support**: Localized content management

### Integration Opportunities
- **Email Marketing**: Sync with email campaigns
- **Social Media**: Cross-platform content sharing
- **Push Notifications**: Content-based notifications
- **User Segmentation**: Targeted content delivery

## Support

For technical support or feature requests:
- Check the documentation first
- Review the API endpoints
- Test with the provided templates
- Contact the development team for advanced issues

---

*This system provides a powerful, user-friendly way to manage dynamic content across the Bondarys platform, enabling marketing teams to create engaging experiences without technical expertise.*
