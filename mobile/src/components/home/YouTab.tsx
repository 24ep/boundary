import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { homeStyles } from '../../styles/homeStyles';
import { FamilyMemberDrawer } from './FamilyMemberDrawer';
import { CalendarDrawer } from './CalendarDrawer';
import { ChatbotBriefing } from './ChatbotBriefing';
import { MiniAppsGrid } from './MiniAppsGrid';
import { FinanceSummary } from './FinanceSummary';
import { NewsFeed } from './NewsFeed';
import { useSocket } from '../../contexts/SocketContext';

interface YouTabProps {
  familyStatusMembers: any[];
  familyLocations: any[];
  selectedFamily?: any;
  isFamilyLoading?: boolean;
  onOpenApps: () => void;
  onGoToFinance: () => void;
}

export const YouTab: React.FC<YouTabProps> = ({
  familyStatusMembers,
  selectedFamily,
  isFamilyLoading = false,
  onOpenApps,
  onGoToFinance,
}) => {
  const { onlineUserIds } = useSocket();
  const [showCalendarDrawer, setShowCalendarDrawer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedFamily]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Check if we have a selected hourse
      if (!selectedFamily?.id) {
        return;
      }

      // Removed appointment and shopping loading logic

    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };



  return (
    <ScrollView
      style={homeStyles.cardScrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Daily Briefing Section (Top) */}
      {/* Daily Briefing Section (Top) */}
      <ChatbotBriefing />

      {/* Mini Apps Grid (Secondary) */}
      <MiniAppsGrid onSeeAllPress={onOpenApps} />

      {/* Removed Application List Drawer (Lifted) */}

      {/* Removed Today's Appointments */}
      {/* Removed Shopping List */}



      {/* Finance Summary */}
      <FinanceSummary onGoToFinance={onGoToFinance} />

      {/* News Feed */}
      <NewsFeed />






      {/* hourse Member Drawer */}
      < FamilyMemberDrawer
        visible={drawerVisible}
        member={selectedMember}
        onClose={() => setDrawerVisible(false)}
      />

      {/* Calendar Drawer */}
      <CalendarDrawer
        visible={showCalendarDrawer}
        onClose={() => setShowCalendarDrawer(false)}
      />

      {/* Shopping Drawer removed */}
    </ScrollView >
  );
};
