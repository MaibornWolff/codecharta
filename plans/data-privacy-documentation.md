# Data Privacy Documentation Plan

## Status: COMPLETED

## Goal
Make it clear that CodeCharta doesn't send user data anywhere without their intent.

## Tasks

### 1. Update landing page (gh-pages/_includes/features.html)
- Replace "Powerful CLI" card with "Data Privacy" card
- Add image: assets/images/features/privacy.png (need to create or source)
- Text: Emphasize client-side processing, no data leaves machine

### 2. Update README.md
- Already has mentions on lines 81 and 94
- Strengthen/clarify these statements
- Consider adding to Features section header

### 3. Create new documentation page
- Location: gh-pages/_docs/01-overview/07-data-privacy.md
- Content: Explain data privacy guarantees
- Cover both analysis (ccsh) and visualization
- Mention no usage tracking

## Implementation Summary

### Files Modified
1. **README.md**
   - Added prominent "Your Data Stays Local" section after "What is CodeCharta"
   - Removed redundant privacy notes in Features section (consolidated to main section)

2. **gh-pages/_includes/features.html**
   - Replaced "Powerful CLI" card with "Your Data Stays Local" card
   - Links to new data-privacy documentation page

3. **gh-pages/_docs/01-overview/07-data-privacy.md** (NEW)
   - Comprehensive data privacy documentation
   - Explains local processing for both analysis and visualization
   - Confirms no tracking/analytics
   - Describes offline capabilities
   - References open-source transparency

4. **gh-pages/_data/navigation.yml**
   - Added "Data Privacy" entry to Overview section navigation

5. **gh-pages/assets/images/features/privacy.svg** (NEW)
   - Created green shield with lock icon
   - Represents secure, local data processing

## Review Feedback Addressed

1. **Data Privacy Doc - Line 16**: Added clarification that GitHub's analytics may apply when visiting docs/repo, but that's managed by GitHub, not by us
2. **Data Privacy Doc - Line 27**: Changed to "Examples include:" to clarify the list is examples
3. **Data Privacy Doc - Line 38**: Removed "Questions?" section at the end
4. **Features HTML**: Replaced "Powerful CLI" with "Your Data Stays Local" (back to 6 cards as originally intended)

## Notes
- Verified: No analytics/tracking in codebase (checked _config.yml and source code)
- Created SVG icon at assets/images/features/privacy.svg
- Image concept: Green shield with lock (secure, local data)
- Messaging is consistent across all three locations (landing page, README, docs)
- Landing page has 6 feature cards (replaced "Powerful CLI" with "Your Data Stays Local")
