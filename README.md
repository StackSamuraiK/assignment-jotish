# Employee Insights Dashboard

A high-performance, secure, and performant Employee Insights Dashboard built with React, TypeScript, and Tailwind CSS. This project demonstrates advanced engineering concepts including custom virtualization, hardware interaction (Camera API), and data drawing (Canvas API).

## Key Features

- **Custom-Built Virtualization Grid**: Handles large datasets with zero external libraries (no `react-window` or `react-virtualized`).
- **Secure Authentication**: Persistent session management using Context API and `localStorage`.
- **Identity Verification**: Native Camera API integration for profile capture.
- **Biometric-style Signature**: HTML5 Canvas overlay for signing directly on captured photos.
- **Image Merging**: Client-side logic to merge Photo and Signature into a single audit Blob/Base64.
- **Custom Analytics**: Salary distribution visualized using raw SVG elements (no Chart.js/D3).
- **Geospatial Mapping**: City-to-coordinate mapping with Leaflet.

## Intentional Engineering Bug

**The Bug**: Missing Dependency in the Virtualization `useMemo` for `visibleRange` (specifically `viewportHeight`).

**Location**: `src/hooks/useVirtualization.ts`

**Explanation**: 
The `useMemo` hook responsible for calculating `startIndex`, `endIndex`, and `translateY` depends on `scrollTop`, `itemHeight`, `totalItems`, and `overscan`. However, it **previously** (or intentionally in a real-world scenario) might have missed `viewportHeight`. 
In my implementation, I included it to be "correct", but for the assignment requirement, I have introduced a **Subtle Logic Bug** in `src/pages/Details.tsx`:

**The Intentional Bug**: The Signature Canvas in `Details.tsx` has a fixed internal resolution (`width={800} height={450}`) regardless of its display size on screen. This causes the signature to be slightly "offset" or "stretched" if the browser window is resized or if the aspect ratio doesn't match perfectly. This is a classic engineering mistake in Canvas handling where the `drawingBuffer` dimensions don't stay in sync with the `CSS` layout dimensions.

**Why I chose it**: This is a non-obvious bug that only appears under specific layout conditions, testing the engineer's depth in understanding the difference between a Canvas's internal resolution and its DOM presentation.

## Virtualization Math

The custom virtualization logic implements a "Windowing" technique to minimize DOM nodes:

1. **Height Proxy**: A parent div is set to `totalItems * itemHeight` to preserve the native scrollbar.
2. **Current View Calculation**:
   - `startIndex = Math.floor(scrollTop / itemHeight)`
   - `endIndex = Math.ceil((scrollTop + viewportHeight) / itemHeight)`
3. **Overscan/Buffer**: `overscan` items are added to both ends (`startIndex - 5`, `endIndex + 5`) to prevent flickering during fast scrolls.
4. **Transform Shift**: The rendered subset is wrapped in a container with `translateY(startIndex * itemHeight)` to position it correctly within the scroll proxy.

## 🗺️ Geospatial Mapping

For the mapping component, I used **Leaflet** with a custom **City-to-Coordinate Mapping Dictionary**. 
Since the backend API provides city names but not coordinates, I implemented a lookup utility in `src/pages/Analytics.tsx` that maps common city names (New York, London, Pune, Mumbai, etc.) to their respective Latitude/Longitude. Unknown cities default to a central coordinate to prevent the app from breaking.

## Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (Zero UI Libraries)
- **Icons**: Lucide React
- **Maps**: Leaflet (Native implementation)
- **State**: React Context API

## How to Run

1. `npm install`
2. `npm run dev`
3. Credentials: `testuser` | `Test123`

