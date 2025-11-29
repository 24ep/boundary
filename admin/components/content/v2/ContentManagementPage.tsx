'use client'

import React, { Suspense } from 'react'
import { ContentProvider } from './providers/ContentProviderV2'
import { ContentLayout } from './layout/ContentLayoutV2'
import { ContentHeader } from './header/ContentHeaderV2'
import { ContentFilters } from './filters/ContentFiltersV2'
import { ContentListView } from './list/ContentListViewV2'
// Reuse existing editor/templates until V2 versions are implemented
import { ContentEditor } from '../editor/ContentEditor'
import { ContentTemplates } from '../templates/ContentTemplates'
import { ErrorBoundary } from '../../ui/ErrorBoundary'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { SEOMetadata } from '../../ui/SEOMetadata'

/**
 * Content Management Page - Refactored
 */
export const ContentManagementPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <SEOMetadata
        title="Content Management"
        description="Create and manage dynamic content with our powerful drag-and-drop editor. Build marketing pages, news articles, and interactive content."
        keywords={['content management', 'CMS', 'drag and drop', 'dynamic content', 'marketing', 'editor']}
      />
      
      <ContentProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <ContentLayout>
            <ContentHeader />
            <ContentFilters />
            <ContentListView />
            <ContentEditor />
            <ContentTemplates />
          </ContentLayout>
        </Suspense>
      </ContentProvider>
    </ErrorBoundary>
  )
}

export default ContentManagementPage


