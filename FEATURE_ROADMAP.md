# Imakwa Feature Roadmap

## Overview
Imakwa is a civic Q&A platform designed for general citizens in Southeast Nigeria to ask hard questions, engage in informed public discourse, and hold leaders accountable.

---

## Phase 1: MVP (Core Foundation)
**Status:** Current
**Priority:** Critical for launch

### ✅ Completed
- [x] User Authentication (Email/OTP)
- [x] Question browsing and discovery
- [x] Topic browsing and following
- [x] Basic Q&A structure

### 🔄 In Development
- [ ] Answer/Response System
- [ ] Real-time Notifications
- [ ] Content Moderation & Safety

---

## Phase 2: User Experience & Engagement
**Timeline:** Weeks 3-6
**Target Users:** General citizens

### 1. User Profiles & Reputation System
**Why:** Build community trust and encourage quality contributions

**Features:**
- [ ] User profile with customizable bio and avatar
- [ ] Follower/following system
- [ ] Reputation score based on:
  - Questions asked (5 points each)
  - Quality answers (10 points each)
  - Upvotes received (1 point each)
  - Community engagement (5 points per week)
- [ ] User badges:
  - "New Citizen" (0-50 points)
  - "Active Contributor" (51-200 points)
  - "Community Leader" (200+ points)
  - "Expert Verified" (for professionals)
- [ ] User activity feed/history
- [ ] User stats (questions asked, answers given, topics followed)

**Technical:**
- Add `users` table with reputation columns
- Create badge system in `lib/badges.ts`
- Reputation calculation function

### 2. Answer/Response System
**Why:** Enable bidirectional conversation and knowledge sharing

**Features:**
- [ ] Post answers to questions
- [ ] Answer editing and deletion
- [ ] Rich text editing for answers (formatting, links, lists)
- [ ] Upvote/downvote answers
- [ ] Answer ranking (by votes, recency, or community consensus)
- [ ] Mark answer as "Helpful" or "Not Helpful"
- [ ] Comments on answers (nested discussions)
- [ ] Answer visibility controls (public, private, draft)

**Technical:**
- Add `answers` table
- Add `answer_votes` table
- Add `answer_comments` table
- Create answer components
- Answer sorting logic

### 3. Advanced Discovery Features
**Why:** Help users find relevant content

**Features:**
- [ ] Trending questions (by region, category, time)
- [ ] Trending topics (hot topics this week)
- [ ] Personalized recommendations based on:
  - Followed topics
  - Viewed questions
  - User location/state
- [ ] Search across all questions and answers
- [ ] Advanced filters:
  - By date range
  - By number of answers
  - By topic category
  - By state
- [ ] Saved questions (bookmarks)
- [ ] Search history

**Technical:**
- Add trending calculation algorithm
- Add recommendation engine
- Enhanced search functionality
- Bookmarks table

---

## Phase 3: Safety & Moderation
**Timeline:** Weeks 7-9
**Critical for community health**

### 1. Content Moderation & Safety
**Why:** Maintain platform integrity and user safety

**Features:**
- [ ] Report/flag inappropriate content (spam, hate speech, misinformation)
- [ ] Reporting reasons:
  - Offensive language
  - Harassment
  - Misinformation
  - Spam
  - Irrelevant content
  - Other (with custom reason)
- [ ] Admin moderation dashboard
- [ ] Automated spam detection
- [ ] Community guidelines enforcement
- [ ] Content removal and warnings
- [ ] User suspension for violations
- [ ] Moderation logs and audit trail

**Technical:**
- Add `reports` table
- Add `moderation_logs` table
- Create moderation admin panel
- Spam detection rules

### 2. Engagement Analytics
**Why:** Track platform health and user engagement

**Features:**
- [ ] Question analytics:
  - View count
  - Answer count
  - Follower engagement
  - Trending status
- [ ] User analytics:
  - Activity metrics
  - Engagement rate
  - Reputation trends
- [ ] Platform analytics:
  - Daily active users
  - New questions/answers
  - Top topics
  - Regional engagement breakdown

**Technical:**
- Add analytics tables
- Create dashboard screens
- Analytics calculation engine

---

## Phase 4: Real-time & Notifications
**Timeline:** Weeks 10-12
**Enhances engagement**

### 1. Notifications & Real-time Updates
**Why:** Keep users engaged and informed

**Features:**
- [ ] Notification types:
  - New answer to your question
  - New comment on your answer
  - Someone followed you
  - New question in followed topic
  - Trending topic notification
  - Upvote on your answer
- [ ] Push notifications (iOS/Android)
- [ ] In-app notification center
- [ ] Notification preferences/settings
- [ ] Real-time updates using WebSocket or polling
- [ ] Notification history
- [ ] Mark as read/unread

**Technical:**
- Add `notifications` table
- Push notification setup (Firebase, OneSignal)
- Real-time sync mechanism
- Notification preferences table

---

## Phase 5: Accessibility & Localization
**Timeline:** Weeks 13-15
**Inclusive platform**

### 1. Accessibility & Localization
**Why:** Reach broader audience and ensure inclusivity

**Features:**
- [ ] Multi-language support:
  - English (default)
  - Igbo
  - Yoruba
  - Pidgin English
- [ ] Right-to-left (RTL) support for future Arabic content
- [ ] Screen reader optimization (WCAG 2.1 AA)
- [ ] High contrast mode
- [ ] Adjustable text size
- [ ] Keyboard navigation support
- [ ] Alt text for all images

**Technical:**
- i18n (internationalization) setup
- Localization strings in JSON
- Accessibility audit
- Component accessibility improvements

---

## Phase 6: Advanced Features
**Timeline:** Weeks 16+
**Competitive differentiation**

### 1. Offline Support
**Why:** Work in areas with poor connectivity

**Features:**
- [ ] Cache recent questions and answers
- [ ] Draft question/answer composition offline
- [ ] Sync when connectivity restored
- [ ] Offline indicator UI

**Technical:**
- Enhanced AsyncStorage usage
- Offline queue mechanism
- Sync conflict resolution

### 2. Social Sharing & Growth
**Why:** Viral growth and wider reach

**Features:**
- [ ] Share questions/answers on social media
- [ ] Share civic engagement campaigns
- [ ] Referral program (invite friends, earn badges)
- [ ] Social login (Google, Apple, Facebook)
- [ ] Deep linking for questions/topics

**Technical:**
- Social share SDK integration
- Referral tracking
- Social login providers
- Deep linking setup

### 3. Expert/Verified User Features
**Why:** Build trust and authority

**Features:**
- [ ] Expert application process
- [ ] Expert verification by admins
- [ ] Expert badge on profile and answers
- [ ] Expert-only content sections
- [ ] Expert directory
- [ ] Expert credentials display

**Technical:**
- Expert application form
- Admin verification workflow
- Expert profile enhancements
- Expert filter in search

---

## Phase 7: Regional Expansion
**Timeline:** Post-MVP
**Scale strategy**

### Features
- [ ] Support for other Southeast states
- [ ] Support for other Nigerian regions
- [ ] Regional moderation teams
- [ ] Regional events/campaigns

---

## Database Schema Updates

### New Tables
```
1. users (enhanced)
   - reputation_score
   - badge_level
   - user_since
   - verification_status

2. answers
   - id, question_id, user_id
   - content, created_at, updated_at
   - vote_count, is_helpful_count

3. answer_votes
   - id, answer_id, user_id
   - vote_type (upvote/downvote)

4. answer_comments
   - id, answer_id, user_id
   - content, created_at

5. notifications
   - id, user_id, type
   - related_id, read_at

6. reports
   - id, content_type, content_id
   - report_reason, reported_by

7. bookmarks
   - id, user_id, question_id

8. moderation_logs
   - id, action, content_id
   - performed_by, reason

9. analytics
   - id, metric_type, value
   - timestamp
```

---

## Success Metrics

- **Engagement:** 50%+ weekly active user rate
- **Content Quality:** Average 2+ answers per question
- **Community Health:** <5% of content flagged as inappropriate
- **User Retention:** 30% month-over-month retention
- **Accessibility:** WCAG 2.1 AA compliance

---

## Dependencies & Integrations

- Firebase Cloud Messaging (notifications)
- Supabase Realtime (WebSocket)
- Sentry (error tracking)
- i18n (localization)
- Accessibility libraries

---

## Notes

- All features should be built with **accessibility-first** mindset
- Community moderation should involve trusted community members
- Regular user research with general citizens to validate features
- Iterate based on user feedback
