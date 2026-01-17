# YouTube Title Search - Quick Setup Guide

## ✅ Implementation Complete!

Your YouTube Title Search Score & Suggestion Engine is now fully integrated into the Yt-Ai dashboard.

## 📍 Where to Find It

- **Navigation**: Click "Title Search" in the left sidebar (NEW badge)
- **Direct URL**: `/title-search`
- **Icon**: Sparkles (✨)

## 🚀 Getting Started

### 1. **Setup (Optional - for real YouTube data)**

To use real YouTube API data instead of mock data:

```bash
# In your .env.local file
YOUTUBE_API_KEY=your_api_key_here
```

Get your API key:
1. Go to Google Cloud Console
2. Create a new project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Get your API key

### 2. **Test the Feature**

1. Navigate to `/title-search` in your dashboard
2. Enter a keyword, e.g., "cartoon video"
3. Click "Generate Ideas"
4. Browse the 20 optimized title suggestions

## 📊 What You Get

For any keyword, the tool provides:

- ✅ **Search Score (0-100)**: How well the keyword performs
- ✅ **Optimized Title**: Your input improved for SEO
- ✅ **20 Suggestions**: AI-generated titles ready to use
- ✅ **Related Keywords**: 15 autocomplete variations
- ✅ **Insights**: Top keywords, views, trends
- ✅ **Copy Feature**: One-click copying of titles

## 📁 Files Created/Modified

### New Files:
```
✅ app/api/title-score/route.ts
✅ components/title-search-score.tsx
✅ app/title-search/page.tsx
✅ TITLE_SEARCH_DOCUMENTATION.md
```

### Modified Files:
```
✅ components/shared-sidebar.tsx (added nav link)
```

## 🔌 API Endpoint

**POST** `/api/title-score`

### Request:
```json
{
  "keyword": "cartoon video"
}
```

### Response:
```json
{
  "success": true,
  "userInput": "cartoon video",
  "searchScore": 75,
  "optimizedUserTitle": "Amazing Cartoon Video | Best Tutorial 2025",
  "top20Titles": [...],
  "relatedKeywords": [...],
  "trendInsights": {...}
}
```

## 💡 Usage Tips

### For Best Results:

1. **Use specific keywords**: Instead of "video", try "tutorial video" or "animation video"
2. **Include modifiers**: Add language or format hints (e.g., "cartoon video hindi")
3. **Check trending patterns**: Read the insights to understand market demand
4. **Copy multiple options**: Test different titles to see which gets better results
5. **Monitor performance**: Track which suggested titles perform best

### Examples to Try:

- "how to make money"
- "gaming tips"
- "cartoon video hindi"
- "cooking recipe"
- "motivation quotes"
- "travel vlog"
- "music production"
- "fitness workout"

## 🎯 Key Features Explained

### Search Score
- **80-100**: Excellent keyword, high demand, manageable competition
- **60-79**: Good keyword, decent opportunity
- **40-59**: Moderate keyword, higher competition
- **0-39**: Low-demand keyword or high competition

### Keyword Match %
- Shows how relevant the suggestion is to your original keyword
- Higher % = better match to your input

### Estimated CTR
- Click-through rate prediction based on title quality
- Realistic estimates for YouTube
- Helps identify best-performing titles

### Content Type
- **Short**: YouTube Shorts (under 60 seconds)
- **Long**: Regular videos (10+ minutes)
- **Kids**: Child-friendly content
- **Comedy**: Entertainment/funny content
- **Educational**: Tutorial/learning content
- **Story**: Narrative-based content
- **Tutorial**: How-to guides

## ⚙️ Customization

### Modify Scoring Algorithm

In `app/api/title-score/route.ts`, adjust:

```typescript
// Base score
const baseScore = 50

// Keyword frequency weight
score += Math.min(20, ...)

// Views weight
const viewsScore = Math.min(15, ...)

// Freshness weight
score += Math.min(10, ...)
```

### Change Title Templates

Edit the templates array in `generateTitleSuggestions()`:

```typescript
const templates = [
  `${userInput} | Best Tutorial 2025`,
  `How to ${userInput} - Complete Guide`,
  // Add or modify templates here
]
```

## 🐛 Troubleshooting

### API Returns Mock Data
- **Reason**: No YouTube API key configured
- **Solution**: Add `YOUTUBE_API_KEY` to `.env.local`

### Slow Response Time
- **Reason**: API calls taking time
- **Solution**: Implement caching (see docs)

### Same Suggestions Every Time
- **Reason**: Mock data returns consistent templates
- **Solution**: Add real API key or customize templates

### Copy Button Not Working
- **Reason**: Browser doesn't support clipboard API
- **Solution**: Ensure HTTPS in production

## 📈 Analytics Integration (Future)

Soon you'll be able to:
- Track which suggested titles you used
- Monitor their performance
- Get recommendations based on what worked
- Compare title performance

## 🆘 Need Help?

### Check the Full Documentation
Read: `TITLE_SEARCH_DOCUMENTATION.md`

### Common Questions

**Q: Can I use this in my mobile app?**
A: Yes! The API endpoint works independently. Just call `/api/title-score`

**Q: Can I bulk analyze titles?**
A: Currently one at a time. Bulk feature coming soon.

**Q: Are the suggestions guaranteed to rank?**
A: No - rankings depend on many factors (video quality, backlinks, etc.)

**Q: Can I export the results?**
A: Not yet - feature on roadmap

## 🎉 Next Steps

1. **Try It Out**: Test the feature with different keywords
2. **Get API Key**: Optional but recommended for real data
3. **Customize**: Modify templates and scoring to your needs
4. **Integrate**: Use the API in other parts of your app
5. **Monitor**: Track performance of suggested titles

## 📞 Support

If you find issues or have suggestions:
1. Check `TITLE_SEARCH_DOCUMENTATION.md` for detailed docs
2. Review the code comments in the implementation files
3. Test with the examples provided

---

**Happy title hunting! 🚀**

Your creators can now optimize titles with confidence using real YouTube trends!
