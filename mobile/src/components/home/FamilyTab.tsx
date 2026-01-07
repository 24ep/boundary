import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { FamilyLocationMap } from './FamilyLocationMap';
import { FamilyMoodSummary } from './FamilyMoodSummary';
import { FamilyMemberDrawer } from './FamilyMemberDrawer';
import { ScalePressable } from '../common/ScalePressable';
import { homeStyles } from '../../styles/homeStyles';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { typography } from '../../styles/typography';

interface FamilyTabProps {
  familyStatusMembers: any[];
  familyLocations: any[];
  emotionData: any[];
  selectedFamily: any;
}

export const FamilyTab: React.FC<FamilyTabProps> = ({
  familyStatusMembers,
  familyLocations,
  emotionData,
  selectedFamily,
}) => {
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);

  const handleMemberPress = (member: any) => {
    setSelectedMember(member);
    setDrawerVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Family</Text>
      </View>

      {/* Members Horizontal Scroll */}
      <View style={styles.section}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersScroll}>
          {familyStatusMembers.map((member, index) => (
            <ScalePressable key={index} style={styles.memberItem} onPress={() => handleMemberPress(member)}>
              <View style={[styles.avatarContainer, { borderColor: member.status === 'online' ? '#10B981' : '#E5E7EB' }]}>
                {member.avatar ? (
                  <Image source={{ uri: member.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: '#FFB6C1', alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 20 }}>{member.name.charAt(0)}</Text>
                  </View>
                )}
                {member.status === 'online' && <View style={styles.onlineBadge} />}
              </View>
              <Text style={styles.memberName} numberOfLines={1}>{member.name.split(' ')[0]}</Text>
            </ScalePressable>
          ))}
          <ScalePressable style={styles.memberItem} onPress={() => { /* Add member logic */ }}>
            <View style={[styles.avatarContainer, { borderColor: '#E5E7EB', borderStyle: 'dashed', borderWidth: 2 }]}>
              <View style={[styles.avatar, { backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' }]}>
                <IconMC name="plus" size={24} color="#9CA3AF" />
              </View>
            </View>
            <Text style={styles.memberName}>Add</Text>
          </ScalePressable>
        </ScrollView>
      </View>

      {/* Mood Summary */}
      <View style={styles.sectionPadding}>
        <FamilyMoodSummary
          onPress={() => console.log("Go to Mood Analyst")}
          emotionData={emotionData}
        />
      </View>

      {/* Location Map */}
      <View style={styles.mapSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Family Locations</Text>
          <TouchableOpacity onPress={() => setShowFullMap(true)}>
            <IconMC name="arrow-expand" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity activeOpacity={0.9} onPress={() => setShowFullMap(true)} style={{ height: 250, borderRadius: 24, overflow: 'hidden' }}>
          <FamilyLocationMap
            locations={familyLocations}
            onMemberSelect={(loc: any) => {
              const mem = familyStatusMembers.find(m => m.id === loc.userId) || familyStatusMembers[0]; // fallback
              handleMemberPress(mem);
            }}
          />
          {/* Map Overlay to intercept touches if we want full screen only, but FamilyLocationMap might be interactive. 
                 User requested "click at map it must go to full page". 
                 So we might want a transparent overlay or rely on the touchable wrapper.
             */}
          <View style={StyleSheet.absoluteFill} pointerEvents="box-only" />
        </TouchableOpacity>
      </View>

      {/* Drawers */}
      <FamilyMemberDrawer
        visible={drawerVisible}
        member={selectedMember}
        onClose={() => setDrawerVisible(false)}
      />

      {/* Full Screen Map Modal (Placeholder for now, or just alert) */}
      {/* Implement full screen map modal in next step */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontFamily: typography.heading,
    fontSize: 28,
    color: '#1F2937',
  },
  section: {
    marginBottom: 24,
  },
  sectionPadding: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  membersScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  memberItem: {
    alignItems: 'center',
    gap: 8,
    width: 64,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    borderWidth: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  onlineBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  mapSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: typography.heading,
    color: '#1F2937',
  },
});
