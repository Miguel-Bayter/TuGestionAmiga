# TuGestionAmiga - Functional Behavior Analysis & Requirements

## 1. Introduction

This document describes the expected functional behavior of the **TuGestionAmiga** application, a library management system that handles book loans and sales. It outlines how the system should operate from both user and administrator perspectives, identifies current functional patterns, and proposes necessary improvements for a robust, production-ready environment.

**Critical Requirement:** A key priority for the evolution of this application is the implementation of **Internationalization (i18n)** to support multiple languages, initially English and Spanish.

---

## 2. User Roles & Authentication

### 2.1. Roles

The system must support two distinct roles with strict permission boundaries:

*   **Administrator (ADMIN):** Full access to system management including books, users, loans, and returns processing.
*   **User (USER):** Access to personal shopping, book rental, and profile management features.

### 2.2. Authentication Flow

*   **Registration:** Users must be able to create an account by providing a name, valid email address, and password. The system must prevent duplicate email registrations.
*   **Login:** Users authenticate using their email and password credentials. Upon successful authentication, the system must establish a persistent session state that survives page reloads.
*   **Route Protection:** Unauthenticated users attempting to access protected routes (e.g., `/carrito`, `/prestamos`, `/cuenta`) must be automatically redirected to the login page.
*   **Password Recovery:** A password recovery mechanism must be available, allowing users to request a temporary reset code and set a new password securely.

---

## 3. Core Features Behavior (User Perspective)

### 3.1. Book Catalog & Discovery

*   **Browsing:** Authenticated users should see a visual gallery of available books. Each book card must display the title, author, description, and a dynamic availability status indicator.
*   **Availability Logic:** A book is considered "Available" if it has positive stock for either purchase (`stock_compra > 0`) OR rental (`stock_renta > 0`). This dual-stock model allows the same book to be available for both operations independently.
*   **Details View:** Clicking on a book should open a detailed modal or page showing the full description, specific stock levels (for transparency), pricing information, and action buttons (Buy/Rent).
*   **Search & Filtering:** Users should be able to filter the catalog by title, author, or category keywords to quickly find desired books.

### 3.2. Shopping Cart & Checkout

*   **Persistent Cart:** The shopping cart must persist across sessions using the database table `carrito_item`. If a user logs out and returns later, their selected items should remain in the cart.
*   **Adding Items:** Users can add books to their cart with a specified quantity. The system must validate in real-time that the requested quantity does not exceed the available purchase stock (`stock_compra`).
*   **Cart Management:** Users can view their cart contents, see individual item prices and total cost, adjust quantities, and remove unwanted items.
*   **Checkout Process:**
    *   The checkout action must be atomic and transactional.
    *   Stock availability must be validated one final time immediately before confirming the purchase to prevent race conditions.
    *   Upon successful completion, the system generates purchase records in the `compra` table, deducts the purchased quantity from `stock_compra`, and clears the user's cart.
    *   If any item is out of stock during final validation, the entire transaction must fail gracefully with a clear error message indicating which items are unavailable.

### 3.3. Loan Management (Rentals)

*   **Creation:** Users can rent a book if `stock_renta > 0`. This creates an active loan record in the `prestamo` table with an initial status of "Activo".
*   **Duration:** Loans begin with a default rental period of 15 days from the loan creation date.
*   **Extensions:**
    *   Users can extend a loan's due date, adding 5 additional days per extension.
    *   **Constraint:** A maximum of 2 extensions per loan is permitted for regular users to ensure fair circulation.
    *   **Constraint:** Extensions are only allowed for loans with "Activo" status (not overdue, returned, or cancelled).
*   **Visibility:** Users must have a dedicated "My Loans" view displaying all current and past loans with due dates, status, extension count, and action buttons.

### 3.4. User Profile

*   **Account Information:** Users can view their registered name and email address in a profile section.
*   **Transaction History:** A read-only history displaying past purchases (from `compra` table) and loan records (from `prestamo` table), including dates and status.
*   **Password Management:** Users can change their password by providing the current password for verification, then entering and confirming a new password. The new password must be hashed before storage.

---

## 4. Administrative Features Behavior

The **Admin Panel** (`/admin`) serves as the centralized control center for library operations.

### 4.1. Inventory Management

*   **CRUD Operations:** Administrators can Create, Read, Update, and Delete book records from the system.
*   **Dual Stock Control:** Admins must be able to independently set and adjust both `stock_compra` (purchase inventory) and `stock_renta` (rental inventory) for each book.
*   **Pricing:** Admins can set and update the `valor` (price) field for each book.
*   **Cover Management:** Admins can upload image files to serve as book covers. The system attempts to automatically match uploaded images to book titles based on filename similarity.

### 4.2. Loan Supervision

*   **Global Loan View:** Admins can view a comprehensive list of all loans from all users, with filtering capabilities by user name, email, or book title.
*   **Return Processing:** Only Administrators can mark a loan as returned. This action must:
    *   Update the loan status to "Devuelto" (Returned).
    *   Increment the `stock_renta` for the corresponding book.
    *   Record the actual return date in `fecha_devolucion_real`.

### 4.3. User Management

*   **User Oversight:** Admins can view a complete list of registered users with their roles and account details.
*   **Account Editing:** Admins can update user information such as name, email, or force a password reset when necessary.
*   **User Deletion:** Admins can delete user accounts, but the system must enforce referential integrity by preventing deletion of users with:
    *   Active (unreturned) loans
    *   Historical transaction data that must be preserved for auditing purposes

---

## 5. Technical Behavior & System Constraints

*   **API-First Design:** The frontend application must act purely as a consumer of the REST API. All business logic including stock validation, price calculations, and authorization rules must reside exclusively on the backend.
*   **Stateless API:** The API should be primarily stateless, relying on authentication tokens or headers (currently `x-user-id`) to identify the requesting user in each request.
*   **Data Integrity:** Critical operations such as checkout and loan returns must use database transactions to ensure atomicity and consistency. If any step fails, the entire operation must roll back to prevent partial updates.
*   **Standardized Error Handling:** The system must return consistent HTTP status codes with descriptive JSON error messages:
    *   `400` - Bad Request (invalid input, missing required fields)
    *   `401` - Unauthorized (authentication required)
    *   `403` - Forbidden (insufficient permissions)
    *   `404` - Not Found (resource doesn't exist)
    *   `409` - Conflict (business rule violation, e.g., insufficient stock)
*   **Security:** Passwords must be hashed using bcrypt before storage. Sensitive configuration (database credentials) must be managed through environment variables, never hardcoded.

---

## 6. Proposed Improvements

To elevate the application to professional, production-ready standards, the following improvements are strongly recommended:

### 6.1. Internationalization (i18n) - **High Priority**

*   **Requirement:** The entire user interface (all labels, buttons, form fields, error messages, notifications) and backend API responses must be fully localizable to support multiple languages.
*   **Implementation Approach:**
    *   Integrate the `react-i18next` library for the React frontend to handle translation management.
    *   Create translation resource files in JSON format for each supported language (initially English and Spanish).
    *   Store translation files in `frontend/public/locales/{language}/translation.json`.
*   **Language Switching:** Implement a language selector component (dropdown or toggle) in the navigation bar allowing users to switch between English and Spanish dynamically without page reload.
*   **Code Standardization:** Replace ALL hardcoded text strings throughout the codebase with translation keys (e.g., `{t('login.submit_button')}` instead of `"Login"`).
*   **Backend Localization:** API error messages and validation messages should also be internationalized, with the backend accepting a language preference header to return appropriately localized responses.

### 6.2. Security Enhancements

*   **Token-Based Authentication:** Replace the current simple `x-user-id` header mechanism with industry-standard **JSON Web Tokens (JWT)**. This prevents users from trivially impersonating others by modifying request headers.
*   **Input Validation:** Implement a robust validation library (such as Zod or Joi) on the backend to rigorously validate all incoming request bodies, query parameters, and path parameters against defined schemas.
*   **Rate Limiting:** Add rate limiting middleware to API endpoints to prevent brute-force attacks and denial-of-service attempts.

### 6.3. Architecture & Code Quality

*   **Type Safety:** Migrate the entire codebase to **TypeScript** to catch type-related errors at compile time, improve IDE autocomplete, and enhance overall developer experience.
*   **Testing Strategy:** 
    *   Expand current end-to-end tests (Cypress) to cover all critical user flows.
    *   Add unit tests for backend business logic using Jest or Vitest.
    *   Implement integration tests for API endpoints.
*   **Code Organization:** Refactor the monolithic `server.js` into modular route handlers, controllers, and service layers for better maintainability.

### 6.4. User Experience (UX)

*   **Toast Notifications:** Replace browser `alert()` calls with elegant toast notification components (using libraries like react-hot-toast) for success confirmations and error feedback.
*   **Pagination:** Implement server-side pagination for the book catalog and administrative data tables to efficiently handle large datasets without performance degradation.
*   **Responsive Design:** Polish the mobile and tablet layouts, ensuring that administrative tables scroll horizontally on smaller screens and all touch targets meet accessibility guidelines.
*   **Loading States:** Add loading spinners or skeleton screens during asynchronous operations to provide visual feedback and improve perceived performance.

---

## 7. Conclusion

This document serves as the functional specification for the TuGestionAmiga library management system. It defines expected behaviors, constraints, and a roadmap for improvement with **Internationalization** as the top priority enhancement to support a broader user base across multiple languages.
