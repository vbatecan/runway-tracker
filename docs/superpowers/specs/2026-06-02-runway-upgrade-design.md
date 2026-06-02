# Runway Tracker Upgrade: Design Specification

This document outlines the architectural and design overhaul for **Runway Tracker**, transforming it from a single-page utility into a comprehensive, multi-view financial management application.

---

## 1. Brand Identity

### 1.1 Visual Concept: "The Ascent"
The new branding moves away from generic finance icons toward a specialized identity that merges data visualization with the concept of a financial "runway."

*   **Logo/Favicon Concept**: A stylized letter **'R'** where the vertical spine is a steady line and the curved loop/leg is formed by an upward-trending line chart. The leg of the 'R' extends into the distance with perspective lines, mimicking a runway.
*   **Color Palette**:
    *   **Primary (Indigo)**: `#4F46E5` (Trust, depth, technology).
    *   **Secondary (Gold)**: `#F59E0B` (Value, alertness, premium utility).
    *   **Backgrounds**: Slate-900 (Dark) / White (Light).
*   **SVG Favicon Specification**:
    ```xml
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 24V8H16C19.3137 8 22 10.6863 22 14C22 16.5 20.5 18.5 18 19.5L24 26" stroke="#4F46E5" stroke-width="3" stroke-linecap="round"/>
      <path d="M10 26L26 26" stroke="#F59E0B" stroke-width="2" stroke-dasharray="2 2"/>
    </svg>
    ```

---

## 2. Layout Architecture

### 2.1 Navigation Hub Sidebar
The application will transition to a **Sidebar-First Layout** to accommodate increasing feature complexity.

*   **Structure**: Fixed left sidebar (collapsible on mobile) with a fluid right-side content area.
*   **Navigation Links**:
    1.  **Dashboard**: Runway projection, high-level charts, and cash position.
    2.  **Subscriptions**: The "Payment Radar" focus area.
    3.  **Transactions**: Granular list of all income and expenses.
    4.  **Settings & Data**: Currency selection, theme, and Import/Export (JSON/CSV).

### 2.2 Layout Components
*   **`Sidebar`**: Contains the Branding, NavLinks, and User Preferences toggle.
*   **`TopBar`**: Contextual header (e.g., "Good Morning, User") and the **Global Payment Radar Banner**.
*   **`ViewContainer`**: Animated transition wrapper for switching between navigation states.

---

## 3. Feature Specifications: "Payment Radar"

The Payment Radar is a specialized subscription tracker designed to eliminate "surprise" renewals.

### 3.1 Global Banner
*   **Logic**: Scans `AppData.expenses` for items where `isRecurring: true`.
*   **Trigger**: If `nextBillingDate` falls within `currentDate + 7 days`.
*   **UI**: A slim, high-contrast bar at the top of the app. 
    *   *Example*: "⚠️ 3 payments due this week (Total: $42.00). [View Details]"

### 3.2 Subscriptions View
*   **Subscription Health Card**:
    *   **Monthly Burn**: Sum of all active monthly recurring costs.
    *   **Annual Burn**: Sum of all active yearly recurring costs.
    *   **Efficiency Score**: A visual indicator based on the ratio of active vs. paused subscriptions.
*   **Chronological Timeline**:
    *   A list of subscriptions sorted by "Next Due Date."
    *   Visual indicators for status: `Active` (Green), `Paused` (Amber), `Cancelled` (Red).
*   **Management Flow**:
    *   **Quick Toggle**: Pause/Resume buttons directly on the list item.
    *   **Edit Modal**: Adjust amount, billing date, or frequency.

---

## 4. Data Flow & Logic

### 4.1 Local-First Persistence
The app continues to use `localStorage` as the primary source of truth, ensuring 100% privacy.

*   **Schema Update**:
    *   `ExpenseItem` will now strictly require `billingDayOfMonth` (1-31) and `frequency`.
    *   A helper utility `calculateNextDueDate(item, referenceDate)` will be implemented to derive dates on the fly.

### 4.2 State Management
*   **Context API**: A centralized `RunwayContext` will handle the `AppData` state.
*   **Derivations**: Runway calculations (months/days remaining) will be memoized using `useMemo` to ensure UI performance during data entry.

---

## 5. User Experience (UX)

### 5.1 Empty States
Each view will feature a "Brand-Aligned" empty state with a clear Call-to-Action (CTA).
*   *Example*: "Your radar is and clear. Add your first subscription to start tracking."

### 5.2 Responsive Strategy
*   **Desktop**: Full sidebar, multi-column dashboard.
*   **Tablet**: Mini-sidebar (icons only), reflowed cards.
*   **Mobile**: Bottom navigation bar, simplified "Radar" list, full-screen modals for data entry.

### 5.3 Micro-interactions
*   **Active Indicator**: The sidebar link for the active view will have a "Runway" line animation underneath.
*   **Success Feedback**: When a subscription is paused, the item will slide down to the "Inactive" section with a subtle fade.

---
