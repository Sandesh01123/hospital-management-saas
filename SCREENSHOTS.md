# Hospital Management SaaS — Screenshots Guide

This document provides instructions for taking screenshots to showcase the Hospital Management SaaS system.

## Required Screenshots

Take the following screenshots to demonstrate the system's capabilities:

### 1. Dashboard
**File:** `screenshots/dashboard.png`

**What to Capture:**
- Full dashboard page showing all 4 KPI cards
- Patient intake trend chart (7-day)
- Revenue trend chart (7-day)
- Upcoming consultations section

**Tips:**
- Ensure all charts are visible
- Use light data for better visualization
- Zoom out slightly to show full page

**Resolution:** 1920x1080 (recommended)

---

### 2. Book Appointment with Triage
**File:** `screenshots/booking-triage.png`

**What to Capture:**
- Book Appointment form partially filled
- Symptom field showing "chest pain" or similar emergency keyword
- Red "🔴 EMERGENCY" badge visible
- Vital signs section with sample data

**Tips:**
- Use a clear emergency symptom to show triage badge
- Fill in at least 3-4 fields
- Ensure the triage badge is prominent
- Good lighting on the badge

**Resolution:** 1920x1080 (recommended)

---

### 3. Patient History Modal
**File:** `screenshots/patient-history.png`

**What to Capture:**
- Patients page with search results
- Patient history modal open
- Appointment details visible
- Vital signs displayed as chips
- Medical records section visible

**Tips:**
- Use a patient with complete history
- Ensure the modal is fully visible
- Show vital signs chips (temperature, BP, etc.)
- Show both appointment and medical record sections

**Resolution:** 1920x1080 (recommended)

---

### 4. Settings - Branding
**File:** `screenshots/settings-branding.png`

**What to Capture:**
- Settings page with Branding tab active
- Hospital name field filled
- Color pickers showing custom colors
- Live preview of color changes
- Logo upload section

**Tips:**
- Use a custom hospital name (e.g., "City Hospital")
- Choose distinct colors (not default blue/green)
- Show both color pickers
- Ensure the UI shows the color changes

**Resolution:** 1920x1080 (recommended)

---

### 5. Billing Page
**File:** `screenshots/billing.png`

**What to Capture:**
- Billing page with summary cards
- Table showing medical records
- Status badges (Pending, Paid, Cancelled)
- Invoice modal open with GST calculation

**Tips:**
- Show at least 5-10 records
- Ensure different statuses are visible
- Open invoice modal to show GST
- Show the summary cards at top

**Resolution:** 1920x1080 (recommended)

---

### 6. Doctors Page
**File:** `screenshots/doctors.png`

**What to Capture:**
- Doctors page with doctor list
- Status indicators (Active/Inactive)
- Consultation fees visible
- Schedule modal open for a doctor
- Today's appointments in schedule

**Tips:**
- Show at least 5-10 doctors
- Show both active and inactive doctors
- Open schedule modal for one doctor
- Ensure appointments are visible in schedule

**Resolution:** 1920x1080 (recommended)

---

### 7. Reports Page
**File:** `screenshots/reports.png`

**What to Capture:**
- Reports page with 4 report cards
- Patient volume chart visible
- Triage distribution pie chart
- Revenue bar chart
- Department load table

**Tips:**
- Ensure all 4 charts are visible
- Use representative data
- Zoom out to show full page
- Good chart colors for visibility

**Resolution:** 1920x1080 (recommended)

---

## Screenshot Guidelines

### Technical Requirements

**Resolution:**
- Recommended: 1920x1080 (Full HD)
- Minimum: 1280x720 (HD)
- Aspect ratio: 16:9

**Format:**
- File type: PNG (lossless, no compression artifacts)
- File size: < 2MB per screenshot
- Color depth: 24-bit or higher

**Browser:**
- Chrome 120+ or Firefox 120+
- Full-screen mode (F11)
- Hide browser UI (bookmarks, extensions)
- Zoom level: 100%

### Visual Guidelines

**Lighting:**
- Use consistent lighting across all screenshots
- Avoid glare or reflections
- Ensure text is readable
- Good contrast for UI elements

**Content:**
- Use realistic, representative data
- Avoid placeholder or empty states
- Show populated tables and charts
- Include meaningful data points

**Consistency:**
- Use same browser and settings for all screenshots
- Maintain consistent zoom level
- Use same resolution for all screenshots
- Consistent UI state (logged in, same user)

### Privacy and Security

**Before Screenshots:**
- Clear browser history and cookies
- Log out of any personal accounts
- Use demo/test data only
- Remove any personal information

**In Screenshots:**
- Blur or mask any real patient data
- Use fictitious names and phone numbers
- Hide any API keys or credentials
- Remove any personal identifiers

**Specific Data to Anonymize:**
- Real patient names → Use "John Doe", "Jane Smith"
- Real phone numbers → Use "9876543210", "9876543211"
- Real addresses → Use "123 Main St", "456 Oak Ave"
- Real doctor names → Use "Dr. Test Doctor"
- Real hospital names → Use "Test Hospital"

## Taking Screenshots

### Method 1: Browser Screenshot (Recommended)

**Chrome:**
1. Open DevTools (F12)
2. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
3. Type "screenshot"
4. Select "Capture full size screenshot"
5. Save as PNG

**Firefox:**
1. Open DevTools (F12)
2. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
3. Type "screenshot"
4. Select "Capture full page screenshot"
5. Save as PNG

### Method 2: Operating System Screenshot

**Windows:**
1. Press Windows + Shift + S
2. Select area or full screen
3. Saves to clipboard
4. Paste in Paint or Snipping Tool
5. Save as PNG

**Mac:**
1. Press Cmd + Shift + 4 (area) or Cmd + Shift + 3 (full screen)
2. Saves to desktop
3. Open in Preview
4. Save as PNG

### Method 3: Third-Party Tools

**Recommended Tools:**
- Snagit (Windows/Mac)
- Lightshot (Windows/Mac)
- ShareX (Windows)
- CleanShot X (Mac)

**Benefits:**
- Built-in annotation tools
- Better quality compression
- Cloud storage options
- Batch processing

## Post-Processing

### Cropping
- Crop to remove browser UI (address bar, tabs)
- Maintain 16:9 aspect ratio
- Ensure consistent dimensions across screenshots
- Leave no empty space

### Resizing
- If needed, resize to 1920x1080 using high-quality scaling
- Maintain aspect ratio
- Use bicubic or lanczos resampling
- Avoid pixelation

### Annotation (Optional)
- Add arrows or highlights to draw attention
- Use consistent annotation style
- Keep annotations minimal
- Don't obscure important UI elements

### Compression
- Use PNG for lossless quality
- If file size is too large, use PNG compression tools
- Avoid JPEG (introduces artifacts)
- Target file size: < 2MB per screenshot

## Organizing Screenshots

### Folder Structure
```
hospital_saas/
└── screenshots/
    ├── dashboard.png
    ├── booking-triage.png
    ├── patient-history.png
    ├── settings-branding.png
    ├── billing.png
    ├── doctors.png
    └── reports.png
```

### Naming Convention
- Use lowercase with hyphens
- Descriptive names
- No spaces or special characters
- .png extension

### Metadata
- Consider adding EXIF data with:
  - Date taken
  - Browser version
  - Resolution
  - Description

## Using Screenshots

### In Documentation
- Place screenshots in relevant sections
- Add captions describing each screenshot
- Reference screenshots in text
- Use appropriate image size (not too large/small)

### In Presentations
- Use high-resolution screenshots
- Add slide numbers
- Include brief descriptions
- Annotate key features

### In Marketing Materials
- Use consistent style across all screenshots
- Add branding/watermark if needed
- Optimize for web (file size)
- Consider mobile-responsive versions

## Quality Checklist

Before finalizing screenshots, verify:

- [ ] Resolution is 1920x1080 or higher
- [ ] Format is PNG
- [ ] File size is < 2MB
- [ ] All UI elements are visible
- [ ] Text is readable
- [ ] Colors are accurate
- [ ] No personal data is visible
- [ ] Browser UI is hidden or cropped
- [ ] Consistent with other screenshots
- [ ] Good lighting and contrast
- [ ] Realistic, representative data
- [ ] Proper naming convention
- [ ] Organized in screenshots folder

## Troubleshooting

### Blurry Screenshots
- Ensure 100% zoom level
- Use browser screenshot tool instead of OS tool
- Check display scaling settings
- Use higher resolution display

### Large File Size
- Use PNG compression tools (TinyPNG, PNGGauntlet)
- Remove unnecessary empty space
- Check for embedded metadata
- Consider slightly lower resolution if needed

### Inconsistent Colors
- Use same browser and settings
- Check color profile settings
- Disable browser extensions that affect colors
- Use consistent display settings

### Missing UI Elements
- Ensure page is fully loaded
- Wait for animations to complete
- Check if elements are hidden/collapsed
- Verify browser zoom is 100%

---

**Screenshot Guide Version:** 1.0.0  
**Last Updated:** 2026-08-02
