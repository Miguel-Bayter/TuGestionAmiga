# Tu Gestión Amiga - Application Behavior Specification

## Overview

Tu Gestión Amiga is a **library management system** built as a Single Page Application (SPA) using React on the frontend and Node.js/Express on the backend. The application enables users to browse, rent, and purchase books while providing administrative capabilities for managing the library catalog.

**CRITICAL REQUIREMENT**: All user-facing content, interface elements, messages, and labels MUST be in English. The application currently has Spanish content that needs to be fully internationalized (i18n) and translated to English as the primary language.

---

## Core Application Behavior

### 1. Authentication & Authorization System

#### Purpose
Manages user identity, session persistence, and role-based access control to secure different areas of the application.

#### How It Works

**User Registration (`/register`)**
- New users create an account by providing credentials (email, password, name)
- The system validates input and creates a user record in the database
- Passwords are hashed using bcrypt before storage
- After successful registration, users are redirected to the login page

**User Login (`/login`)**
- Users authenticate with email and password
- Backend validates credentials against database records
- On success, user data is stored in localStorage and state management
- Session persists across page refreshes through localStorage recovery
- Users are redirected to the dashboard upon successful login

**Session Management**
- User data is stored in browser localStorage for persistence
- `auth.js` module provides `getStoredUser()` and `subscribeAuth()` functions
- The App component subscribes to auth changes to update UI reactively
- Logout clears localStorage and redirects to login page

**Role-Based Access Control**
- Standard users can access: dashboard, catalog, cart, rentals, account settings
- Admin users have additional access to the `/admin` panel
- `RequireAuth` component wraps protected routes and redirects unauthenticated users
- `RequireAdmin` component adds an additional layer for admin-only routes
- If a non-admin user attempts to access `/admin`, they're redirected

**Protected Routes Implementation**
```
/ → Dashboard (requires authentication)
/rentable → Dashboard view (requires authentication)
/buscar → Search view (requires authentication)
/prestamos → User rentals (requires authentication)
/cuenta → Account settings (requires authentication)
/carrito → Shopping cart (requires authentication)
/ayuda → Help page (requires authentication)
/admin → Admin panel (requires authentication + admin role)
```

---

### 2. Dashboard & Book Catalog

#### Purpose
The main interface for browsing available books, filtering by categories, searching, and viewing book details.

#### How It Works

**Book Display Modes**
- Users can switch between two view modes:
  - **List View**: Horizontal layout with thumbnail on the left, metadata and actions on the right
  - **Grid View**: Vertical card layout with large cover image on top, metadata below
- View preference should be stored in localStorage for consistency across sessions

**Filtering System**
- Users can filter books by categories (e.g., Fiction, Non-Fiction, Science, History)
- Filter buttons have active states (`.filter-btn-active`) when selected
- Multiple filters can be active simultaneously (OR logic)
- "All" option clears filters and shows entire catalog

**Search Functionality**
- Real-time search box filters books by title, author, or ISBN
- Search is case-insensitive and shows results as user types
- Combines with category filters (AND logic: books must match both)
- Empty search shows all books (respecting active category filters)

**Book Information Display**
Each book card shows:
- Cover image (aspect ratio 3:4)
- Title and author
- ISBN
- Publication year
- Price (for purchase)
- Rental price
- Availability status badge (In Stock / Rented / Out of Stock)
- Stock quantity

**Availability Status Logic**
- **In Stock** (green badge): `stock_disponible > 0` and `stock_rentado < stock_total`
- **Rented** (blue badge): `stock_rentado > 0` but `stock_disponible > 0` (partially available)
- **Out of Stock** (red badge): `stock_disponible === 0`

**Action Buttons**
- **Details**: Opens modal/detail view with full book information
- **Add to Cart** (purchase): Adds book to shopping cart for purchase
- **Rent**: Adds book to cart for rental
- Buttons are disabled when stock is unavailable (`.btn-disabled` class)

---

### 3. Shopping Cart System

#### Purpose
Manages items selected for purchase or rental before checkout, allowing users to review and modify their selections.

#### How It Works

**Cart State Management**
- Cart data stored in localStorage for persistence
- Items can be of two types: purchase or rental
- Each item includes: book details, quantity, type (purchase/rental)
- Cart count badge displayed in navigation showing total items

**Adding Items to Cart**
- User clicks "Add to Cart" or "Rent" from catalog
- System checks if item already exists in cart
- If exists: increments quantity (up to available stock)
- If new: adds item with quantity 1
- Visual feedback confirms addition (toast/notification)

**Cart Page (`/carrito`) Features**
- Lists all items in cart with thumbnails
- Shows individual and total prices
- Quantity controls for each item:
  - Increment/decrement buttons
  - Manual quantity input field
  - Maximum limited by `stock_disponible`
- Remove item button for each entry
- Rental duration selector (7, 14, 30 days) for rental items
- Clear cart button to empty entire cart

**Checkout Process**
- Review cart contents and total cost
- Confirm button processes the transaction
- Backend updates stock quantities:
  - Purchase: decrements `stock_disponible`
  - Rental: increments `stock_rentado`, decrements `stock_disponible`
- Creates transaction records in database
- Clears cart after successful checkout
- Shows confirmation message and transaction summary

---

### 4. Rentals Management (`/prestamos`)

#### Purpose
Displays user's active and past rentals, allowing them to track due dates and rental history.

#### How It Works

**Active Rentals View**
- Shows all books currently rented by the user
- Each rental displays:
  - Book cover and title
  - Rental start date
  - Due date / return date
  - Days remaining (calculated client-side)
  - Rental status (Active / Overdue / Returned)
- Color coding:
  - Green: 5+ days remaining
  - Yellow: 1-4 days remaining
  - Red: Overdue

**Rental Status Calculation**
```
Current Date vs Due Date:
- Active: current < due date
- Overdue: current > due date AND not returned
- Returned: return_date is set
```

**Late Fee System**
- Calculated daily after due date passes
- Formula: `days_overdue × daily_late_fee_rate`
- Displayed prominently for overdue items
- Accumulated until book is returned

**Rental History**
- Shows past rentals in chronological order (newest first)
- Indicates if rental was returned on time or late
- Archives rental records for user reference

**Return Process**
- User initiates return from rentals page
- System records return date and time
- Calculates final charges (rental fee + late fees if applicable)
- Updates book stock: decrements `stock_rentado`, increments `stock_disponible`
- Sends confirmation with receipt

---

### 5. User Account Management (`/cuenta`)

#### Purpose
Allows users to view and modify their profile information and account settings.

#### How It Works

**Profile Information Display**
- Shows current user data:
  - Full name
  - Email address
  - Account creation date
  - User role (standard/admin)
  - Total rentals count
  - Total purchases count

**Editable Fields**
- Name: text input
- Email: email input with validation
- Password: password input (requires current password confirmation)
- Profile picture: file upload (if implemented)

**Update Process**
- User modifies field(s) and clicks Save
- Frontend validates inputs:
  - Name: not empty
  - Email: valid format
  - Password: minimum 6 characters, confirmation match
- Backend verifies current password (if changing password/email)
- Updates database record
- Refreshes stored user data in localStorage and state
- Shows success/error feedback

**Security Features**
- Password change requires current password verification
- Email change triggers verification email (recommended)
- Session remains valid after profile updates
- Sensitive operations logged for audit trail

---

### 6. Admin Panel (`/admin`)

#### Purpose
Provides administrative interface for managing the library catalog, users, and viewing system analytics.

#### How It Works

**Access Control**
- Only users with `role: 'admin'` can access
- Enforced by `RequireAdmin` wrapper component
- Non-admin attempts redirect to dashboard with error message

**Book Management Section**

*Adding New Books*
- Form fields:
  - Title (required)
  - Author (required)
  - ISBN (unique, required)
  - Publication year
  - Genre/Category
  - Description
  - Cover image URL or file upload
  - Purchase price
  - Rental price per period
  - Total stock quantity
- Validation ensures no duplicate ISBNs
- Initial stock: `stock_disponible = stock_total`, `stock_rentado = 0`

*Editing Existing Books*
- Search/select book to edit
- Pre-populate form with current values
- Allow modification of all fields except ISBN (or with safeguards)
- Update button saves changes to database
- Stock adjustments:
  - Can increase `stock_total` (increases `stock_disponible`)
  - Decreasing requires validation: `stock_total >= stock_rentado`

*Deleting Books*
- Soft delete recommended (sets `active: false` instead of removing)
- Hard delete only if no rental/purchase history
- Confirmation dialog prevents accidental deletion
- Archive option to hide from catalog but preserve data

**User Management Section**
- View all registered users in paginated table
- Search users by name, email, or user ID
- Filter by role (all, standard, admin)
- User actions:
  - View user details and activity history
  - Edit user role (promote to admin, demote to standard)
  - Suspend/reactivate user accounts
  - Reset user password (generates temporary password)
  - Delete user account (with warnings if active rentals exist)

**Analytics Dashboard**
- Total books in catalog (active)
- Total registered users
- Active rentals count
- Revenue metrics:
  - Total sales (purchases)
  - Total rental income
  - Pending late fees
- Most popular books (by rental/purchase count)
- Charts/graphs for trends over time (optional but recommended)

---

### 7. Help System (`/ayuda`)

#### Purpose
Provides users with guidance, FAQs, and support resources for using the platform.

#### How It Works

**Content Sections**
- Getting Started guide
- How to rent books
- How to purchase books
- Account management help
- Rental policies and terms
- FAQ section with common questions
- Contact support information

**Search Functionality** (recommended enhancement)
- Search box to filter help topics
- Highlights matching terms in results
- Suggests related articles

**Context-Sensitive Help** (recommended enhancement)
- Help button in navigation opens help panel
- When opened from specific pages, shows relevant help first
- Example: On rentals page, shows "Managing Your Rentals" article first

---

### 8. Routing & Navigation

#### Purpose
Enables seamless navigation between different sections of the application while maintaining security and state.

#### How It Works

**Route Structure**
```
Public Routes:
- /login → Login page
- /register → Registration page

Protected Routes (requires authentication):
- / → Dashboard (redirects to login if not authenticated)
- /rentable → Dashboard view
- /buscar → Search view
- /prestamos → User's rentals
- /cuenta → Account settings
- /carrito → Shopping cart
- /ayuda → Help page

Admin Routes (requires authentication + admin role):
- /admin → Admin panel

Catch-all:
- * → Redirects to / (which redirects to login if not authenticated)
```

**Navigation Flow**
1. User enters URL or clicks link
2. React Router matches route definition
3. Route wrapper components check authentication:
   - `RequireAuth`: verifies user is logged in
   - `RequireAdmin`: verifies user has admin role
4. If check passes: renders requested component wrapped in Layout
5. If check fails: redirects to appropriate page (login or dashboard)

**Layout Component**
- Wraps all authenticated pages
- Provides consistent structure:
  - Header with logo, user info, cart count
  - Sidebar navigation (on desktop) or hamburger menu (on mobile)
  - Main content area
  - Footer (optional)
- Maintains across all page transitions
- Only excluded from login/register pages

**Sidebar Navigation**
- Links to all main sections
- Active route highlighted (`.sidebar-link-active`)
- Conditional rendering: shows admin link only if user is admin
- Responsive: collapses to drawer on mobile

---

### 9. Responsive Design & User Experience

#### Purpose
Ensures the application is usable across all device sizes and provides smooth, intuitive interactions.

#### How It Works

**Responsive Breakpoints**
- Tailwind CSS defaults: sm (640px), md (768px), lg (1024px), xl (1280px)
- Layouts adapt at each breakpoint:
  - Mobile (<640px): Single column, stacked elements
  - Tablet (640-1024px): Flexible columns, reduced sidebars
  - Desktop (>1024px): Full multi-column layouts, persistent sidebar

**Layout Adaptations**

*Mobile (<640px)*
- Hamburger menu replaces sidebar
- Single column book cards
- Stacked form inputs
- Bottom navigation bar (recommended)
- Swipe gestures for carousel/gallery

*Tablet (640-1024px)*
- 2-column grid for book catalog
- Collapsible sidebar (toggle button)
- Mixed horizontal/vertical layouts
- Touch-optimized button sizes (min 44×44px)

*Desktop (>1024px)*
- 3-4 column grid for book catalog
- Persistent sidebar navigation
- Hover states for interactive elements
- Keyboard navigation support

**Overflow Prevention**
- Root CSS ensures no horizontal scrolling:
  ```css
  html, body, #root {
    max-width: 100%;
    overflow-x: hidden;
  }
  ```
- Images constrained: `max-width: 100%`
- Development mode overflow detection (in App.jsx):
  - Detects elements exceeding viewport width
  - Highlights offenders with red outline
  - Logs details to console for debugging
  - Only runs in development environment

**Loading States**
- Skeleton screens while fetching data
- Spinner for form submissions
- Disabled buttons during processing
- Progress indicators for uploads

**Error Handling**
- Inline validation messages below form inputs
- Toast notifications for success/error actions
- Graceful error pages for 404, 500 errors
- Retry buttons for failed network requests

**Accessibility** (required improvements - see section below)
- Currently lacking, needs implementation
- Required WCAG 2.1 Level AA compliance

---

## Internationalization (i18n) Requirements

### Current State
The application has i18next configured with HttpBackend and LanguageDetector, but:
- **All content is currently in Spanish** (code comments, UI labels, messages)
- Translation files are not present
- `fallbackLng` is set to 'en' but English translations don't exist
- No language switcher in UI

### Required Implementation

#### 1. Create Translation Files
Create directory structure:
```
public/
  locales/
    en/
      translation.json
      common.json
      errors.json
      validation.json
    es/
      translation.json
      common.json
      errors.json
      validation.json
```

#### 2. English as Primary Language
**ALL** user-facing text must be in English:
- Navigation labels
- Button text
- Form labels and placeholders
- Error messages
- Success messages
- Help documentation
- Email notifications
- Date and time formats

#### 3. Translation Keys Structure
```json
{
  "navigation": {
    "dashboard": "Dashboard",
    "rentals": "My Rentals",
    "account": "Account",
    "cart": "Cart",
    "help": "Help",
    "admin": "Admin Panel",
    "logout": "Logout"
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "email": "Email Address",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "forgotPassword": "Forgot Password?",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "signUp": "Sign Up",
    "signIn": "Sign In"
  },
  "books": {
    "title": "Title",
    "author": "Author",
    "isbn": "ISBN",
    "price": "Price",
    "rentalPrice": "Rental Price",
    "available": "Available",
    "rented": "Rented",
    "outOfStock": "Out of Stock",
    "addToCart": "Add to Cart",
    "rentBook": "Rent",
    "viewDetails": "Details"
  },
  // ... continue for all sections
}
```

#### 4. Use Translation Hook in Components
```jsx
import { useTranslation } from 'react-i18next';

function Dashboard() {
  const { t } = useTranslation();
  
  return (
    <h1>{t('navigation.dashboard')}</h1>
  );
}
```

#### 5. Language Switcher Component
Add to header/navigation:
```jsx
function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  return (
    <select 
      value={i18n.language} 
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
}
```

#### 6. Format Dates and Numbers
```jsx
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

// Dates
const formattedDate = new Intl.DateTimeFormat(i18n.language, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}).format(new Date());

// Currency
const formattedPrice = new Intl.NumberFormat(i18n.language, {
  style: 'currency',
  currency: 'USD'
}).format(29.99);
```

#### 7. Translate Server-Side Content
Backend error messages and emails must also support i18n:
- Install i18next in Node.js backend
- Create parallel translation structure
- Send locale preference with API requests
- Return translated error messages

---

## Recommended Improvements

### 1. Enhanced Authentication

**Multi-Factor Authentication (MFA)**
- Add optional 2FA via authenticator app or SMS
- Required for admin accounts
- Backup codes for account recovery

**Social Login**
- Integration with Google, Facebook, GitHub OAuth
- Simplifies registration process
- Reduces password management burden

**Password Reset Flow**
- Email-based password reset
- Temporary token with expiration
- Secure token generation and validation

**Session Timeout**
- Automatic logout after 30 minutes of inactivity
- Warning modal at 28 minutes
- "Keep me signed in" option for extended sessions

### 2. Advanced Search & Filtering

**Autocomplete Search**
- Suggest books as user types
- Show matching titles, authors, ISBNs
- Recent searches dropdown

**Advanced Filter Options**
- Filter by:
  - Publication year range
  - Price range (min-max sliders)
  - Language
  - Availability (in stock only, rentals only)
  - Ratings (when review system implemented)
- Filter combinations with AND/OR logic
- Save filter presets

**Sorting Options**
- Sort by:
  - Relevance (search ranking)
  - Title (A-Z, Z-A)
  - Author (A-Z, Z-A)
  - Price (low to high, high to low)
  - Newest first
  - Most popular
  - Highest rated (when review system implemented)

### 3. Enhanced Book Details

**Modal or Dedicated Page**
- Full description and synopsis
- Full cover image (zoomable)
- Genre tags
- Publisher information
- Page count
- Format (hardcover, paperback, digital)
- Ratings and reviews (when implemented)
- Related books carousel
- "Customers who rented this also rented" section

**Preview Feature**
- Read first chapter or sample pages
- Pagination within modal
- Download sample PDF option

### 4. Wishlist Feature

**Purpose**
- Allow users to save books they're interested in for later
- Move items between wishlist and cart

**Implementation**
- Heart/bookmark icon on book cards
- Dedicated wishlist page (`/wishlist`)
- Stored in database per user
- Notifications when wishlisted books go on sale
- Share wishlist with friends/family

### 5. Rating & Review System

**Book Ratings**
- 5-star rating system
- Users can rate only after renting/purchasing
- Average rating displayed on book cards
- Rating distribution chart on detail page

**Written Reviews**
- Text reviews with character limits
- Optional title for review
- Verified purchase/rental badge
- Helpful/not helpful voting on reviews
- Report inappropriate reviews
- Admin moderation of reviews

### 6. Recommendation Engine

**Personalized Recommendations**
- Based on user's rental/purchase history
- Collaborative filtering (users with similar tastes)
- Genre preferences
- "Because you rented X, you might like Y"

**Trending Section**
- Most rented this week/month
- New arrivals
- Staff picks
- Seasonal recommendations

### 7. Notification System

**In-App Notifications**
- Bell icon in header with badge count
- Dropdown panel showing recent notifications
- Mark as read functionality
- Notification types:
  - Rental due soon (3 days before)
  - Rental overdue
  - Book returned successfully
  - Wishlisted book available
  - New books in favorite genres

**Email Notifications**
- User preference settings for which emails to receive
- Notification types:
  - Rental confirmation
  - Rental reminder (3 days before due)
  - Overdue notice
  - Return confirmation
  - Purchase receipt
  - Account changes (password, email)

**Push Notifications** (mobile app)
- For critical reminders
- Opt-in during onboarding

### 8. Advanced Admin Features

**Bulk Operations**
- Import books from CSV/spreadsheet
- Export reports (rentals, sales, inventory)
- Bulk edit (update prices, categories)
- Bulk delete (with safeguards)

**Inventory Management**
- Low stock alerts
- Reorder suggestions based on demand
- Stock history and adjustments log
- Damaged/lost book tracking

**Financial Reporting**
- Revenue dashboards with date ranges
- Rental vs purchase income breakdown
- Late fee collection tracking
- Export financial reports to Excel/PDF
- Tax reporting support

**User Management Enhancements**
- Email users directly from admin panel
- Bulk actions (suspend, send notifications)
- User activity logs
- Fraud detection (unusual activity patterns)

### 9. Accessibility Improvements (CRITICAL)

**Keyboard Navigation**
- All interactive elements accessible via Tab
- Logical tab order
- Focus indicators (visible outlines)
- Keyboard shortcuts (J/K for navigation, etc.)
- Skip to main content link

**Screen Reader Support**
- Semantic HTML5 elements
- ARIA labels for icons and images
- ARIA live regions for dynamic content
- Form field labels and error associations
- Descriptive button text (not just icons)

**Visual Accessibility**
- Sufficient color contrast (WCAG AA minimum 4.5:1)
- Text scalable to 200% without breaking layout
- No information conveyed by color alone
- Focus indicators visible and clear
- Reduced motion option for animations

**Screen Reader Testing Required**
- Test with NVDA (Windows)
- Test with JAWS (Windows)
- Test with VoiceOver (macOS/iOS)
- Test with TalkBack (Android)

### 10. Performance Optimizations

**Code Splitting**
- Lazy load route components with React.lazy()
- Dynamic imports for heavy libraries
- Reduce initial bundle size

**Image Optimization**
- Serve WebP format with fallbacks
- Responsive images (srcset)
- Lazy loading images below fold
- CDN for image hosting

**Caching Strategies**
- Service worker for offline functionality
- Cache API responses with sensible TTLs
- Local storage for non-sensitive data
- Session storage for temporary state

**Database Optimization**
- Index frequently queried fields (ISBN, user_id)
- Paginate large result sets
- Implement Redis for session storage
- Query optimization and N+1 prevention

### 11. Security Enhancements

**Input Validation**
- Server-side validation (never trust client)
- Sanitize all user inputs
- Parameterized queries (prevent SQL injection)
- XSS protection (escape output)

**Rate Limiting**
- Limit login attempts (prevent brute force)
- API rate limits per user/IP
- CAPTCHA on registration/login after failed attempts

**Security Headers**
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HTTPS only)

**Data Protection**
- Encrypt sensitive data at rest
- Hash passwords with bcrypt (already done)
- PCI compliance for payment data (if processing payments)
- Regular security audits
- Dependency vulnerability scanning

### 12. Testing Strategy

**Unit Tests**
- Test utility functions
- Test React components in isolation
- Test API endpoints
- Aim for 80%+ code coverage

**Integration Tests**
- Test auth flow end-to-end
- Test rental workflow
- Test admin operations
- Test cart and checkout

**E2E Tests** (Cypress already configured)
- Critical user journeys:
  - User registration and login
  - Browse and search catalog
  - Add to cart and checkout
  - Rent a book and view rentals
  - Admin add/edit/delete book
- Run on every deployment

**Accessibility Testing**
- Automated: axe-core, Lighthouse
- Manual: keyboard-only navigation
- Screen reader testing

### 13. Analytics & Monitoring

**User Analytics**
- Track user behavior (page views, clicks)
- Funnel analysis (registration, checkout)
- A/B testing for UI improvements
- Heatmaps for engagement patterns

**Application Monitoring**
- Error tracking (Sentry, Rollbar)
- Performance monitoring (response times)
- Uptime monitoring
- Log aggregation and analysis

**Business Metrics**
- Active users (daily, weekly, monthly)
- Conversion rates
- Average order value
- Customer lifetime value
- Churn rate

### 14. Mobile Optimization

**Progressive Web App (PWA)**
- Installable on mobile devices
- Offline functionality
- Add to home screen
- Push notification support

**Mobile-First Design**
- Touch-friendly targets (44px minimum)
- Swipe gestures for navigation
- Bottom navigation bar
- Thumb-friendly button placement

**Performance on Mobile**
- Reduce JavaScript bundle size
- Optimize images for mobile bandwidth
- Lazy load below-the-fold content
- Test on 3G/4G connections

### 15. Backup & Disaster Recovery

**Database Backups**
- Automated daily backups
- Point-in-time recovery capability
- Backup to separate location/cloud
- Regular backup restoration tests

**Application State Backups**
- User data export functionality
- Admin can generate full database dump
- GDPR compliance: user data download

**Disaster Recovery Plan**
- Documented recovery procedures
- Backup server/infrastructure
- Failover strategy
- RTO (Recovery Time Objective) and RPO (Recovery Point Objective) defined

---

## Technical Stack Summary

### Frontend
- **React 18.3.1**: Component library
- **React Router DOM 6.26.1**: Client-side routing
- **Vite 7.3.1**: Build tool and dev server
- **Tailwind CSS 3.4.10**: Utility-first styling
- **i18next**: Internationalization (needs full implementation)

### Backend
- **Node.js**: Runtime environment
- **Express 4.19.2**: Web server framework
- **MySQL2 3.11.0**: Database client
- **bcryptjs 2.4.3**: Password hashing
- **dotenv 16.4.5**: Environment configuration

### Testing
- **Cypress 15.8.2**: End-to-end testing

### Development Tools
- **--watch flag**: Auto-restart server on changes
- Overflow detection in development mode

---

## Critical Action Items

1. **Internationalization**: Implement full English translations using existing i18n setup
2. **Accessibility**: Add WCAG 2.1 AA compliance features
3. **Security Review**: Audit authentication, validate inputs, add rate limiting
4. **Testing**: Expand Cypress test coverage to all critical paths
5. **Documentation**: Create user guide and admin documentation (in English)
6. **Performance**: Implement code splitting and image optimization
7. **Mobile**: Test and optimize for mobile devices
8. **Error Handling**: Implement comprehensive error boundaries and user feedback

---

## Conclusion

Tu Gestión Amiga is a feature-rich library management system with solid foundational architecture. The main areas needing immediate attention are **internationalization to English**, **accessibility improvements**, and **comprehensive testing**. With the recommended enhancements implemented, the application will provide an excellent user experience while maintaining security, performance, and maintainability.

All future development must ensure that **English is the primary language** for all user-facing content, with Spanish or other languages available as secondary options through the i18n system.
