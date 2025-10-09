# 📸 Adding Screenshots to README

## Steps to Add Your Screenshots

### 1. Save Your Screenshots

Save these three screenshots to `public/screenshots/`:

1. **Input Interface** (First screenshot)
   - Save as: `public/screenshots/input-interface.png`
   - Shows: Resume and job description input textareas

2. **Analysis Results** (Second screenshot)
   - Save as: `public/screenshots/analysis-results.png`
   - Shows: Match score (30%) with matched (green) and missing (red) keywords

3. **Suggestions** (Third screenshot)
   - Save as: `public/screenshots/suggestions.png`
   - Shows: AI-generated suggestions with copy button

### 2. Using macOS Screenshot Tool

```bash
# Option A: Take new screenshots
# Press: Cmd + Shift + 5
# Select area and save to Downloads
# Then move to project:
mv ~/Downloads/screenshot1.png public/screenshots/input-interface.png
mv ~/Downloads/screenshot2.png public/screenshots/analysis-results.png
mv ~/Downloads/screenshot3.png public/screenshots/suggestions.png

# Option B: If you already have the screenshots
# Just drag and drop them into the public/screenshots/ folder
```

### 3. Verify Screenshots

```bash
# Check that all screenshots are in place
ls -la public/screenshots/

# Should show:
# input-interface.png
# analysis-results.png
# suggestions.png
```

### 4. Commit and Push

```bash
git add public/screenshots/
git add README.md
git commit -m "Add demo screenshots to README"
git push
```

---

## 🎨 Screenshot Guidelines

### Recommended Specs:
- **Format:** PNG (for transparency and quality)
- **Width:** 1200-1600px (retina displays)
- **Aspect Ratio:** 16:9 or similar
- **File Size:** < 500KB each (compress if needed)

### What to Capture:
1. **Input Interface:** Full view showing both textareas with sample content
2. **Analysis Results:** Scroll to show the score circle and keyword pills
3. **Suggestions:** Show 2-3 suggestion cards with the copy button visible on hover

### Optional: Optimize Images

```bash
# Install imagemagick (if needed)
brew install imagemagick

# Resize and optimize
mogrify -resize 1600x -quality 85 public/screenshots/*.png
```

---

## ✅ After Adding Screenshots

Your README will automatically display them! The demo section is already configured:

```markdown
## 📸 Demo

### 1. Input Interface
![Input Interface](./public/screenshots/input-interface.png)

### 2. Analysis Results with Match Score
![Analysis Results](./public/screenshots/analysis-results.png)

### 3. AI-Powered Suggestions
![Smart Suggestions](./public/screenshots/suggestions.png)
```

GitHub will render these beautifully in your README! 🎉
