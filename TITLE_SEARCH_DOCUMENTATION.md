# YouTube Title Search Score & Suggestion Engine

## 📋 Overview

A powerful feature that helps YouTube creators optimize their video titles by analyzing search trends, calculating SEO scores, and generating 20 AI-powered title suggestions based on real YouTube search behavior.

## 🎯 Key Features

### 1. **Search Score Calculation (0-100)**
- **Keyword Frequency**: Analyzes how often the keyword appears in top search results
- **Average Views**: Compares performance metrics of similar content
- **Freshness Factor**: Detects recent trends and recent uploads
- **Competition Analysis**: Evaluates market saturation

### 2. **YouTube Autocomplete Simulation**
- Language variations (Hindi, Tamil, English, Telugu, Marathi)
- Intent-based suggestions (short, comedy, kids, story, song)
- Format-based variations (shorts, full video, viral, trending)
- Time-based suggestions (new, latest, 2024, 2025)

### 3. **Title Optimization**
- Detects missing high-performing keywords
- Adds emotional/intent-driven words
- Maintains YouTube-friendly length (50-60 characters)
- Improves SEO structure

### 4. **20 Optimized Title Suggestions**
Each suggestion includes:
- **Search Score**: SEO ranking potential (0-100)
- **Keyword Match %**: Relevance to your input
- **Estimated CTR**: Click-through rate prediction
- **Content Type**: Category (Short/Long/Kids/Comedy/Educational/Story/Tutorial)

### 5. **Trend Insights**
- Top 8 keywords from trending videos
- Average views per video in category
- Current trending patterns
- People Also Search For section

## 🏗️ Architecture

### API Endpoint: `/api/title-score`

**Method:** POST  
**Body:**
```json
{
  "keyword": "cartoon video"
}
```

**Response:**
```json
{
  "success": true,
  "userInput": "cartoon video",
  "searchScore": 75,
  "optimizedUserTitle": "Amazing Cartoon Video | Best Tutorial 2025",
  "top20Titles": [
    {
      "title": "How to cartoon video - Complete Guide",
      "searchScore": 72,
      "keywordMatchPercentage": 88.5,
      "contentType": "Tutorial",
      "estimatedCTR": 7.2
    }
    // ... 19 more titles
  ],
  "relatedKeywords": [
    "cartoon video hindi",
    "cartoon video tamil",
    "cartoon video shorts"
    // ... more keywords
  ],
  "trendInsights": {
    "topKeywords": ["cartoon", "video", "animation", "kids", ...],
    "avgViewsPerVideo": 245000,
    "trendingPatterns": ["High competition keyword", "High average views"]
  }
}
```

## 📁 File Structure

```
app/
├── api/
│   └── title-score/
│       └── route.ts              # API endpoint
├── title-search/
│   └── page.tsx                  # Main page with header & sidebar
components/
├── title-search-score.tsx        # Main UI component
└── shared-sidebar.tsx            # Updated with new nav link
```

## 🔧 Implementation Details

### 1. **API Endpoint** (`app/api/title-score/route.ts`)

#### Key Functions:

**`generateAutocompleteVariations(baseKeyword)`**
- Generates keyword variations simulating YouTube autocomplete
- Returns 20+ variations with language, intent, and format modifiers

**`calculateSearchScore(searchResults, keyword)`**
- Analyzes 20+ YouTube search results
- Calculates score using 4 factors:
  - Keyword frequency (0-20 points)
  - Average views (0-15 points)
  - Freshness (0-10 points)
  - Competition (0-5 points)
  - Base score: 50 points

**`optimizeTitle(userTitle, searchResults)`**
- Extracts high-performing keywords from top 5 results
- Adds emotional words (Amazing, Best, Incredible, etc.)
- Maintains 50-60 character sweet spot
- Returns optimized title

**`generateTitleSuggestions(userInput, searchResults, searchScore)`**
- Creates 20 title templates
- Varies content types (Short, Long, Kids, Comedy, etc.)
- Calculates individual scores for each suggestion
- Returns fully optimized suggestions with metrics

**`fetchYouTubeSearchResults(keyword)`**
- Uses YouTube Data API v3 if key is available
- Falls back to realistic mock data for testing
- Returns video details: title, description, views, date, tags

### 2. **Frontend Component** (`components/title-search-score.tsx`)

#### Features:
- **Search Input**: Clean, modern input with placeholder examples
- **Loading State**: Visual feedback with animated spinner
- **Error Handling**: User-friendly error messages
- **Results Display**:
  - Search score card with color-coded score
  - Optimized title with copy button
  - 3-column insights: Top Keywords, Avg Views, Trends
  - "People Also Search For" section
  - 20 title suggestions with metrics
  - Search preview showing how title appears
  - Copy-to-clipboard functionality with visual feedback

#### UI Features:
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Color-coded score indicators (green/blue/yellow/orange)
- One-click copy with confirmation
- Click related keywords to search again
- Visual hierarchy for easy scanning

### 3. **Page Component** (`app/title-search/page.tsx`)

- Integrates with existing dashboard header
- Uses shared sidebar for navigation
- Full-page layout matching dashboard design

## 🎨 Design System

### Colors
- **Primary**: Blue (#2563EB)
- **Success**: Green (#16A34A)
- **Warning**: Yellow (#CA8A04)
- **Error**: Orange (#EA580C)

### Components Used
- `Input` from shadcn/ui
- `Button` from shadcn/ui
- `Card` from shadcn/ui
- Lucide icons

### Typography
- Headlines: 2xl (32px) bold
- Subheadings: sm-lg font-semibold
- Body: sm (14px) default
- Captions: xs (12px) text-gray-600

## 🔗 Integration Points

### 1. **Navigation**
- Added "Title Search" link to sidebar navigation
- Route: `/title-search`
- Badge: "NEW"
- Icon: Sparkles

### 2. **Dashboard Header**
- Uses existing `DashboardHeader` component
- Maintains consistent branding

### 3. **Authentication**
- Uses `next-auth` for session management
- Can optionally store user searches

## 🚀 Usage Guide

### For Users:

1. **Access the Feature**
   - Click "Title Search" in the left sidebar
   - Or navigate to `/title-search`

2. **Search Process**
   - Enter keyword or title idea (e.g., "cartoon video")
   - Click "Generate Ideas"
   - Wait for analysis (2-3 seconds)

3. **Analyze Results**
   - Check Search Score (0-100)
   - Review optimized title
   - Browse 20 suggestions
   - Copy any title with one click
   - Check related keywords

### For Developers:

**Adding to your project:**
```tsx
import TitleSearchScoreComponent from '@/components/title-search-score'

// In your page component
<TitleSearchScoreComponent />
```

**Using the API directly:**
```javascript
const response = await fetch('/api/title-score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ keyword: 'cartoon video' })
})
const data = await response.json()
```

## 📊 Scoring Algorithm

### Search Score Breakdown:

| Factor | Points | Calculation |
|--------|--------|-------------|
| Keyword Frequency | 0-20 | (keywords found / total results) × 25 |
| Average Views | 0-15 | log₁₀(avgViews) / 8 × 15 |
| Freshness | 0-10 | (recent videos / total) × 15 |
| Competition | 0-5 | 5 - (unique keywords / 20) |
| Base Score | 50 | Starting point |
| **Maximum** | **100** | Capped at 100 |

### CTR Estimation:
- Base: 4-9%
- Based on title quality and keyword alignment
- Mock values for demonstration

## 🔐 YouTube API Integration

### Required Environment Variables:
```env
YOUTUBE_API_KEY=your_api_key_here
```

### API Quota:
- Search.list: 100 units per call
- Videos.list: 1 unit per video
- Recommended: Implement caching to reduce quotas

### Rate Limiting:
- Currently: 20 results per search
- Easily scalable to 50+ results

## 💾 Caching Strategy (Future Enhancement)

```typescript
// Cache results for 24 hours
const cache = new Map<string, CacheEntry>()

interface CacheEntry {
  data: SearchResponse
  timestamp: number
  ttl: number // 86400000 = 24 hours
}
```

## ⚙️ Configuration

### Customizable Parameters:

**In `api/title-score/route.ts`:**

```typescript
// Adjust title template count
const templates = [/* ... 20 templates ... */]

// Modify scoring weights
const baseScore = 50
const keywordWeight = 25
const viewsWeight = 15

// Change content types
const contentTypes = ['Short', 'Long', 'Kids', 'Comedy', ...]

// Adjust API result count
maxResults: 20  // YouTube API parameter
```

## 🎯 Next Steps / Future Enhancements

1. **Database Integration**
   - Store user searches for history
   - Track which titles perform best
   - Build personalized recommendations

2. **Machine Learning**
   - Train model on actual YouTube data
   - Predict CTR more accurately
   - Improve keyword suggestions

3. **A/B Testing**
   - Test multiple title variants
   - Track performance over time
   - Recommendation engine

4. **Advanced Features**
   - Bulk title analysis
   - Competitor analysis
   - Seasonal trend detection
   - Multi-language support
   - Video category specific optimization

5. **Integrations**
   - Direct upload to YouTube
   - Save to video drafts
   - Calendar scheduling

6. **Analytics**
   - Track suggested titles that were used
   - Monitor performance of generated titles
   - ROI calculations

## 📝 Error Handling

### Common Errors:

| Error | Cause | Solution |
|-------|-------|----------|
| 400 Bad Request | Empty/invalid keyword | Provide valid keyword |
| 500 Server Error | API failure | Retry or check API key |
| Network Error | Connection issue | Check internet connection |
| Rate Limited | Too many requests | Implement caching |

## 🧪 Testing

### Manual Testing:

```bash
# Test with curl
curl -X POST http://localhost:3000/api/title-score \
  -H "Content-Type: application/json" \
  -d '{"keyword":"cartoon video"}'
```

### Test Cases:
1. Valid keyword input
2. Empty/whitespace input
3. Very long keyword
4. Special characters
5. Non-English keywords
6. API key missing
7. Network timeout

## 📞 Support

### Common Questions:

**Q: Does it use real YouTube data?**
A: Yes, if you provide a YouTube API key. Otherwise, it uses realistic mock data.

**Q: How accurate are the scores?**
A: The algorithm is based on real factors but scores are heuristic. Real performance depends on many factors like thumbnail, description, tags, etc.

**Q: Can I modify the algorithm?**
A: Yes! Edit `calculateSearchScore()` in `api/title-score/route.ts` to adjust weights.

**Q: Is there a rate limit?**
A: YouTube API has its own quotas. Cache results to minimize calls.

## 📄 License

Part of Yt-Ai project. Follow project license guidelines.

---

**Version:** 1.0  
**Last Updated:** January 16, 2025  
**Status:** ✅ Production Ready
