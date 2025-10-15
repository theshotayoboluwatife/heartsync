# Analytics & Tracking Setup for TrustMatch

## Google Analytics 4 Setup

### Basic Configuration
1. **Create GA4 Property**
   - Property name: TrustMatch Dating App
   - Reporting time zone: Europe/Paris
   - Currency: EUR

2. **Install Tracking Code**
   ```html
   <!-- Add to client/index.html -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

### Custom Events to Track
1. **User Registration**
   ```javascript
   gtag('event', 'sign_up', {
     method: 'replit_auth'
   });
   ```

2. **Profile Completion**
   ```javascript
   gtag('event', 'profile_complete', {
     completion_percentage: 100
   });
   ```

3. **Mini-Challenge Participation**
   ```javascript
   gtag('event', 'mini_challenge_complete', {
     challenge_id: 'coffee_or_tea',
     category: 'preferences'
   });
   ```

4. **Rating Submission**
   ```javascript
   gtag('event', 'rating_submitted', {
     rating_value: 5,
     target_user_id: 'user_123'
   });
   ```

5. **Match Created**
   ```javascript
   gtag('event', 'match_created', {
     match_type: 'mutual_like'
   });
   ```

6. **Premium Subscription**
   ```javascript
   gtag('event', 'purchase', {
     transaction_id: 'txn_123',
     value: 9.99,
     currency: 'EUR',
     items: [{
       item_id: 'premium_monthly',
       item_name: 'Premium Monthly Subscription',
       category: 'subscription',
       quantity: 1,
       price: 9.99
     }]
   });
   ```

## Facebook/Meta Pixel Setup

### Installation
```html
<!-- Add to client/index.html -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
```

### Custom Events
```javascript
// Registration
fbq('track', 'CompleteRegistration');

// Profile completed
fbq('track', 'Lead');

// Premium subscription
fbq('track', 'Purchase', {
  value: 9.99,
  currency: 'EUR'
});
```

## Social Media Analytics

### Instagram Analytics to Track
- **Profile visits**: Growth rate, source analysis
- **Reach**: Organic vs paid, demographics
- **Engagement**: Likes, comments, shares, saves
- **Stories**: Views, completion rate, interactions
- **Link clicks**: Bio link performance
- **Hashtag performance**: Reach by hashtag
- **Best posting times**: Engagement by time/day

### TikTok Analytics to Track
- **Video views**: Completion rate, replay rate
- **Profile views**: Conversion to followers
- **Engagement**: Likes, comments, shares
- **Follower growth**: Daily/weekly trends
- **Traffic**: Link clicks from bio
- **Trending performance**: Hashtag/sound success

### Facebook Analytics to Track
- **Page insights**: Reach, engagement, demographics
- **Post performance**: Organic vs paid reach
- **Audience**: Age, gender, location, interests
- **Link clicks**: Traffic to app
- **Ad performance**: CPM, CPC, CTR, conversions

## Key Performance Indicators (KPIs)

### Marketing KPIs
- **Cost Per Acquisition (CPA)**: Total marketing spend / New users
- **Return on Ad Spend (ROAS)**: Revenue / Ad spend
- **Click-Through Rate (CTR)**: Clicks / Impressions
- **Conversion Rate**: Registrations / Website visits
- **Social Media Engagement**: (Likes + Comments + Shares) / Followers
- **Follower Growth Rate**: (New followers / Total followers) × 100
- **Hashtag Reach**: Total impressions from hashtags
- **Influencer ROI**: Revenue from influencer campaigns / Cost

### App Performance KPIs
- **Daily Active Users (DAU)**: Users active in last 24 hours
- **Monthly Active Users (MAU)**: Users active in last 30 days
- **User Retention**: % users returning after 1, 7, 30 days
- **Session Duration**: Average time per session
- **Profile Completion Rate**: % users completing full profile
- **Mini-Challenge Participation**: % users completing challenges
- **Rating Activity**: % eligible users submitting ratings
- **Match Rate**: % swipes resulting in matches
- **Premium Conversion**: % users upgrading to premium
- **Churn Rate**: % users becoming inactive

## Tracking Dashboard Setup

### Weekly Marketing Report
- **User Acquisition**: New registrations by source
- **Social Media**: Follower growth, engagement rates
- **Content Performance**: Top performing posts/videos
- **Paid Advertising**: Spend, impressions, conversions
- **Website Traffic**: Visits, bounce rate, conversion

### Monthly Business Report
- **User Growth**: MAU, retention, churn
- **Revenue**: Premium subscriptions, conversion rate
- **Engagement**: Profile completion, mini-challenges
- **Trust System**: Rating activity, average scores
- **Feature Usage**: Most/least used features

## Tools and Services

### Analytics Tools
- **Google Analytics 4**: Web/app analytics
- **Facebook Analytics**: Social media insights
- **TikTok Analytics**: Video performance
- **Instagram Insights**: Content performance
- **Mixpanel**: User behavior tracking (optional)

### Social Media Management
- **Buffer/Hootsuite**: Post scheduling
- **Canva**: Content creation
- **Later**: Instagram planning
- **TikTok Creator Studio**: Video management

### Email Marketing
- **Mailchimp**: Email campaigns
- **ConvertKit**: Creator-focused email
- **Klaviyo**: E-commerce focused (if needed)

### Customer Support
- **Intercom**: In-app messaging
- **Zendesk**: Support ticket system
- **Crisp**: Live chat (lightweight option)

## Implementation Code Examples

### React Component for Tracking
```javascript
// client/src/lib/analytics.ts
export const trackEvent = (eventName: string, parameters?: any) => {
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, parameters);
  }
  
  // Facebook Pixel
  if (typeof fbq !== 'undefined') {
    fbq('track', eventName, parameters);
  }
};

// Usage in components
import { trackEvent } from '@/lib/analytics';

const handleRegistration = () => {
  // ... registration logic
  trackEvent('sign_up', { method: 'replit_auth' });
};
```

### Server-Side Tracking
```javascript
// server/analytics.ts
export const trackServerEvent = (eventName: string, userId: string, data: any) => {
  // Log to analytics service
  console.log(`Analytics: ${eventName}`, { userId, ...data });
  
  // Send to external analytics if needed
  // await sendToMixpanel(eventName, { userId, ...data });
};
```

## Privacy and Compliance

### GDPR Compliance
- **Cookie consent**: Implement cookie banner
- **Data processing**: Clear privacy policy
- **User rights**: Data export/deletion options
- **Consent management**: Track user preferences

### Data Retention
- **Analytics data**: 26 months (GA4 default)
- **User data**: According to privacy policy
- **Marketing data**: Until user unsubscribes
- **Financial data**: As required by law

## Monthly Review Process

### Week 1: Data Collection
- Export all analytics data
- Compile social media metrics
- Review user feedback
- Analyze conversion funnels

### Week 2: Analysis
- Identify trends and patterns
- Compare to previous month
- Assess campaign performance
- Calculate ROI for each channel

### Week 3: Strategy Adjustment
- Reallocate budget based on performance
- Adjust content strategy
- Plan new campaigns
- Update targeting parameters

### Week 4: Reporting
- Create stakeholder reports
- Set next month's goals
- Plan content calendar
- Schedule strategy meetings