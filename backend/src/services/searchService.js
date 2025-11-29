const User = require('../models/User');
const hourse = require('../models/hourse');
const Message = require('../models/Message');
const EmergencyAlert = require('../models/EmergencyAlert');
const SafetyCheck = require('../models/SafetyCheck');

class SearchService {
  constructor() {
    this.searchTypes = {
      USERS: 'users',
      FAMILIES: 'families',
      MESSAGES: 'messages',
      ALERTS: 'alerts',
      SAFETY_CHECKS: 'safety_checks',
      ALL: 'all',
    };

    this.searchFields = {
      users: ['firstName', 'lastName', 'email', 'profile.displayName', 'profile.bio'],
      families: ['name', 'description'],
      messages: ['content'],
      alerts: ['message', 'type'],
      safety_checks: ['message'],
    };
  }

  // Main search function
  async search(query, options = {}) {
    try {
      const {
        type = this.searchTypes.ALL,
        limit = 20,
        skip = 0,
        sortBy = 'relevance',
        sortOrder = 'desc',
        filters = {},
        userId = null,
      } = options;

      const searchQuery = await this.buildSearchQuery(query, type, filters, userId);
      const sortOptions = this.buildSortOptions(sortBy, sortOrder);

      let results = {};

      if (type === this.searchTypes.ALL || type === this.searchTypes.USERS) {
        results.users = await this.searchUsers(searchQuery.users, sortOptions, limit, skip);
      }

      if (type === this.searchTypes.ALL || type === this.searchTypes.FAMILIES) {
        results.families = await this.searchFamilies(searchQuery.families, sortOptions, limit, skip);
      }

      if (type === this.searchTypes.ALL || type === this.searchTypes.MESSAGES) {
        results.messages = await this.searchMessages(searchQuery.messages, sortOptions, limit, skip);
      }

      if (type === this.searchTypes.ALL || type === this.searchTypes.ALERTS) {
        results.alerts = await this.searchAlerts(searchQuery.alerts, sortOptions, limit, skip);
      }

      if (type === this.searchTypes.ALL || type === this.searchTypes.SAFETY_CHECKS) {
        results.safetyChecks = await this.searchSafetyChecks(searchQuery.safetyChecks, sortOptions, limit, skip);
      }

      // Combine and rank results if searching all types
      if (type === this.searchTypes.ALL) {
        results = this.combineAndRankResults(results, query);
      }

      return {
        query,
        type,
        results,
        total: this.getTotalCount(results),
        limit,
        skip,
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // Build search query based on type and filters
  async buildSearchQuery(query, type, filters, userId) {
    const searchQueries = {};

    // Base text search
    const textSearch = {
      $regex: query,
      $options: 'i',
    };

    // Users search
    if (type === this.searchTypes.ALL || type === this.searchTypes.USERS) {
      searchQueries.users = {
        $or: [
          { firstName: textSearch },
          { lastName: textSearch },
          { email: textSearch },
          { 'profile.displayName': textSearch },
          { 'profile.bio': textSearch },
        ],
        status: 'active',
      };

      // Apply user-specific filters
      if (filters.role) {
        searchQueries.users.role = filters.role;
      }
      if (filters.hourse) {
        searchQueries.users.hourse = filters.hourse;
      }
      if (userId) {
        searchQueries.users._id = { $ne: userId };
      }
    }

    // Families search
    if (type === this.searchTypes.ALL || type === this.searchTypes.FAMILIES) {
      searchQueries.families = {
        $or: [
          { name: textSearch },
          { description: textSearch },
        ],
        status: 'active',
      };

      // Apply hourse-specific filters
      if (filters.privacy) {
        searchQueries.families['settings.privacy'] = filters.privacy;
      }
      if (userId) {
        searchQueries.families.$or = [
          { admin: userId },
          { members: userId },
          { 'settings.privacy': 'public' },
        ];
      }
    }

    // Messages search
    if (type === this.searchTypes.ALL || type === this.searchTypes.MESSAGES) {
      searchQueries.messages = {
        content: textSearch,
        type: { $in: ['text', 'file'] },
      };

      // Apply message-specific filters
      if (filters.chatId) {
        searchQueries.messages.chat = filters.chatId;
      }
      if (filters.senderId) {
        searchQueries.messages.sender = filters.senderId;
      }
      if (filters.dateFrom) {
        searchQueries.messages.createdAt = { $gte: new Date(filters.dateFrom) };
      }
      if (filters.dateTo) {
        searchQueries.messages.createdAt = { ...searchQueries.messages.createdAt, $lte: new Date(filters.dateTo) };
      }
    }

    // Alerts search
    if (type === this.searchTypes.ALL || type === this.searchTypes.ALERTS) {
      searchQueries.alerts = {
        $or: [
          { message: textSearch },
          { type: textSearch },
        ],
      };

      // Apply alert-specific filters
      if (filters.status) {
        searchQueries.alerts.status = filters.status;
      }
      if (filters.type) {
        searchQueries.alerts.type = filters.type;
      }
      if (userId) {
        const userFamilies = await this.getUserFamilies(userId);
        searchQueries.alerts.$or = [
          { user: userId },
          { hourse: { $in: userFamilies } },
        ];
      }
    }

    // Safety checks search
    if (type === this.searchTypes.ALL || type === this.searchTypes.SAFETY_CHECKS) {
      searchQueries.safetyChecks = {
        message: textSearch,
      };

      // Apply safety check-specific filters
      if (filters.status) {
        searchQueries.safetyChecks.status = filters.status;
      }
      if (userId) {
        const userFamilies = await this.getUserFamilies(userId);
        searchQueries.safetyChecks.$or = [
          { user: userId },
          { hourse: { $in: userFamilies } },
        ];
      }
    }

    return searchQueries;
  }

  // Build sort options
  buildSortOptions(sortBy, sortOrder) {
    const order = sortOrder === 'desc' ? -1 : 1;

    switch (sortBy) {
      case 'relevance':
        return { score: { $meta: 'textScore' } };
      case 'date':
        return { createdAt: order };
      case 'name':
        return { firstName: order, lastName: order };
      case 'updated':
        return { updatedAt: order };
      default:
        return { createdAt: order };
    }
  }

  // Search users
  async searchUsers(query, sortOptions, limit, skip) {
    try {
      const users = await User.find(query)
        .select('-password -refreshTokens')
        .populate('hourse', 'name')
        .sort(sortOptions)
        .limit(limit)
        .skip(skip);

      return users.map(user => ({
        type: 'user',
        id: user._id,
        title: `${user.firstName} ${user.lastName}`,
        subtitle: user.email,
        description: user.profile?.bio || '',
        avatar: user.profile?.avatar,
        hourse: user.hourse?.name,
        relevance: this.calculateRelevance(user, query),
        createdAt: user.createdAt,
      }));
    } catch (error) {
      console.error('Search users error:', error);
      return [];
    }
  }

  // Search families
  async searchFamilies(query, sortOptions, limit, skip) {
    try {
      const families = await hourse.find(query)
        .populate('admin', 'firstName lastName')
        .populate('members', 'firstName lastName')
        .sort(sortOptions)
        .limit(limit)
        .skip(skip);

      return families.map(hourse => ({
        type: 'hourse',
        id: hourse._id,
        title: hourse.name,
        subtitle: `${hourse.members.length} members`,
        description: hourse.description || '',
        admin: hourse.admin,
        memberCount: hourse.members.length,
        privacy: hourse.settings?.privacy,
        relevance: this.calculateRelevance(hourse, query),
        createdAt: hourse.createdAt,
      }));
    } catch (error) {
      console.error('Search families error:', error);
      return [];
    }
  }

  // Search messages
  async searchMessages(query, sortOptions, limit, skip) {
    try {
      const messages = await Message.find(query)
        .populate('sender', 'firstName lastName profile.avatar')
        .populate('chat', 'name type')
        .sort(sortOptions)
        .limit(limit)
        .skip(skip);

      return messages.map(message => ({
        type: 'message',
        id: message._id,
        title: message.content.substring(0, 100),
        subtitle: `From ${message.sender.firstName} ${message.sender.lastName}`,
        description: message.content,
        sender: message.sender,
        chat: message.chat,
        messageType: message.type,
        relevance: this.calculateRelevance(message, query),
        createdAt: message.createdAt,
      }));
    } catch (error) {
      console.error('Search messages error:', error);
      return [];
    }
  }

  // Search alerts
  async searchAlerts(query, sortOptions, limit, skip) {
    try {
      const alerts = await EmergencyAlert.find(query)
        .populate('user', 'firstName lastName')
        .populate('hourse', 'name')
        .sort(sortOptions)
        .limit(limit)
        .skip(skip);

      return alerts.map(alert => ({
        type: 'alert',
        id: alert._id,
        title: `${alert.type} Alert`,
        subtitle: `From ${alert.user.firstName} ${alert.user.lastName}`,
        description: alert.message || '',
        alertType: alert.type,
        status: alert.status,
        user: alert.user,
        hourse: alert.hourse,
        relevance: this.calculateRelevance(alert, query),
        createdAt: alert.createdAt,
      }));
    } catch (error) {
      console.error('Search alerts error:', error);
      return [];
    }
  }

  // Search safety checks
  async searchSafetyChecks(query, sortOptions, limit, skip) {
    try {
      const safetyChecks = await SafetyCheck.find(query)
        .populate('user', 'firstName lastName')
        .populate('requestedBy', 'firstName lastName')
        .populate('hourse', 'name')
        .sort(sortOptions)
        .limit(limit)
        .skip(skip);

      return safetyChecks.map(check => ({
        type: 'safety_check',
        id: check._id,
        title: 'Safety Check',
        subtitle: `Requested by ${check.requestedBy?.firstName} ${check.requestedBy?.lastName}`,
        description: check.message || '',
        status: check.status,
        user: check.user,
        requestedBy: check.requestedBy,
        hourse: check.hourse,
        relevance: this.calculateRelevance(check, query),
        createdAt: check.createdAt,
      }));
    } catch (error) {
      console.error('Search safety checks error:', error);
      return [];
    }
  }

  // Combine and rank results
  combineAndRankResults(results, query) {
    const allResults = [];

    // Add users
    if (results.users) {
      allResults.push(...results.users);
    }

    // Add families
    if (results.families) {
      allResults.push(...results.families);
    }

    // Add messages
    if (results.messages) {
      allResults.push(...results.messages);
    }

    // Add alerts
    if (results.alerts) {
      allResults.push(...results.alerts);
    }

    // Add safety checks
    if (results.safetyChecks) {
      allResults.push(...results.safetyChecks);
    }

    // Sort by relevance
    allResults.sort((a, b) => b.relevance - a.relevance);

    return {
      combined: allResults,
      users: results.users || [],
      families: results.families || [],
      messages: results.messages || [],
      alerts: results.alerts || [],
      safetyChecks: results.safetyChecks || [],
    };
  }

  // Calculate relevance score
  calculateRelevance(item, query) {
    let score = 0;
    const queryLower = query.toLowerCase();

    // Check exact matches
    if (item.title && item.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    if (item.subtitle && item.subtitle.toLowerCase().includes(queryLower)) {
      score += 5;
    }

    if (item.description && item.description.toLowerCase().includes(queryLower)) {
      score += 3;
    }

    // Check partial matches
    const queryWords = queryLower.split(' ');
    queryWords.forEach(word => {
      if (item.title && item.title.toLowerCase().includes(word)) {
        score += 2;
      }
      if (item.subtitle && item.subtitle.toLowerCase().includes(word)) {
        score += 1;
      }
    });

    // Boost recent items
    if (item.createdAt) {
      const daysSinceCreation = (Date.now() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 7) {
        score += 1;
      }
    }

    return score;
  }

  // Get total count
  getTotalCount(results) {
    let total = 0;

    if (results.combined) {
      total = results.combined.length;
    } else {
      if (results.users) total += results.users.length;
      if (results.families) total += results.families.length;
      if (results.messages) total += results.messages.length;
      if (results.alerts) total += results.alerts.length;
      if (results.safetyChecks) total += results.safetyChecks.length;
    }

    return total;
  }

  // Get user families for filtering
  async getUserFamilies(userId) {
    try {
      const user = await User.findById(userId).populate('hourse');
      const families = [];

      if (user.hourse) {
        families.push(user.hourse._id);
      }

      // Get families where user is a member
      const memberFamilies = await hourse.find({ members: userId });
      families.push(...memberFamilies.map(f => f._id));

      return families;
    } catch (error) {
      console.error('Get user families error:', error);
      return [];
    }
  }

  // Advanced search with filters
  async advancedSearch(query, filters = {}) {
    try {
      const {
        type,
        dateFrom,
        dateTo,
        status,
        category,
        location,
        radius,
        limit = 50,
        skip = 0,
      } = filters;

      let searchQuery = {};

      // Text search
      if (query) {
        searchQuery.$text = { $search: query };
      }

      // Date range
      if (dateFrom || dateTo) {
        searchQuery.createdAt = {};
        if (dateFrom) searchQuery.createdAt.$gte = new Date(dateFrom);
        if (dateTo) searchQuery.createdAt.$lte = new Date(dateTo);
      }

      // Status filter
      if (status) {
        searchQuery.status = status;
      }

      // Category filter
      if (category) {
        searchQuery.category = category;
      }

      // Location-based search
      if (location && radius) {
        searchQuery.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [location.lng, location.lat],
            },
            $maxDistance: radius * 1000, // Convert km to meters
          },
        };
      }

      let results = [];

      switch (type) {
        case 'users':
          results = await User.find(searchQuery)
            .select('-password -refreshTokens')
            .populate('hourse', 'name')
            .limit(limit)
            .skip(skip);
          break;

        case 'families':
          results = await hourse.find(searchQuery)
            .populate('admin', 'firstName lastName')
            .populate('members', 'firstName lastName')
            .limit(limit)
            .skip(skip);
          break;

        case 'messages':
          results = await Message.find(searchQuery)
            .populate('sender', 'firstName lastName')
            .populate('chat', 'name')
            .limit(limit)
            .skip(skip);
          break;

        case 'alerts':
          results = await EmergencyAlert.find(searchQuery)
            .populate('user', 'firstName lastName')
            .populate('hourse', 'name')
            .limit(limit)
            .skip(skip);
          break;

        default:
          throw new Error('Invalid search type');
      }

      return {
        query,
        filters,
        results,
        total: results.length,
        limit,
        skip,
      };
    } catch (error) {
      console.error('Advanced search error:', error);
      throw error;
    }
  }

  // Search suggestions
  async getSearchSuggestions(query, type = 'all') {
    try {
      const suggestions = [];

      if (type === 'all' || type === 'users') {
        const users = await User.find({
          $or: [
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
          ],
          status: 'active',
        })
          .select('firstName lastName email')
          .limit(5);

        suggestions.push(...users.map(user => ({
          type: 'user',
          text: `${user.firstName} ${user.lastName}`,
          value: user._id,
        })));
      }

      if (type === 'all' || type === 'families') {
        const families = await hourse.find({
          name: { $regex: query, $options: 'i' },
          status: 'active',
        })
          .select('name')
          .limit(5);

        suggestions.push(...families.map(hourse => ({
          type: 'hourse',
          text: hourse.name,
          value: hourse._id,
        })));
      }

      return suggestions;
    } catch (error) {
      console.error('Get search suggestions error:', error);
      return [];
    }
  }
}

module.exports = new SearchService(); 