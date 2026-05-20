# LU Essentials Store — Product Inventory Dashboard

Help! I just lost my 13th iPhone charger!

Relatable. But don't worry, the LU School Essentials store has got your back! It's a store that sells high-demand school essentials (chargers, headphones, heaters, blue light glasses, comforters, etc.).

The LU School Essentials web store is a modern, responsive single-page web application built with **Vue 3 (Composition API)**, **TypeScript**, and **Pinia** to manage product listings and stock levels for a high-demand school essentials store.

---

## 🚀 Setup & Run Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.19.0 or >=22.12.0)
- npm (installed with Node)

### Installation

1. Clone or copy the project files to your local machine.
2. Open your terminal in the root directory:
   ```bash
   cd "LU Essentials Store"
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Development Server

Run the local Vite development server:

```bash
npm run dev
```

Once started, open the local URL (usually `http://localhost:5173`) in your browser.

### Run Tests

Run the Vitest unit test suite:

```bash
npm run test:unit
```

### Production Build

Build and optimize the application for production:

```bash
npm run build
```

---

## 🛠️ Project Evolution & Features

The project was built in multiple phases, evolving from a simple table with filters to a highly responsive, bulk-saving system:

1. **Planning**: First, highlight keywords in the requirements document. Use **AI** to understand pinia and plan out project structure.
2. **Initialize**: Initialized the project with Vite, TypeScript, Vue 3, and Pinia, then built out the desired folder structure.
3. **Database**: Created mock async product loading functions, simulating internet latency.
4. **Stores**: Created basic add, inline stock update, and delete actions that modified the states directly.
5. **Filters**: Created the filter logic and UI, including case-insensitive name search, category dropdowns, in-stock toggle, and price-based sorting.
6. **Bulk Saving Design**: Implemented a local draft mode, where changes are staged in the UI and committed to the database in bulk.
7. **Polished UI/UX**: Integrated TailwindCSS and Shadcn for visual consistency, toasts. Added no-stock/low-stock visual cues and ARIA labels for a11y.
8. **Code Quality**: Used **AI** to catch hidden bugs, suggest code documentations, find edge cases for unit tests, draft README.md.

---

## 📐 Design Decisions & Rejected Alternatives

### 1. UI Styling: Tailwind CSS & Shadcn UI

- **Decision**: I used Tailwind CSS with Shadcn UI components.
- **Why**: This helped me move faster with styling while keeping the UI consistent. Tailwind made layout and spacing quick to adjust, and Shadcn gave me clean, unified components without having to build everything from scratch. If clients do not like this, I can easily swap Shadcn components with custom components!

### 2. State Sync Strategy: Write-Back

- **Decision**: I used a write-back approach where changes are first saved as draft on the user's client, then committed when the user hits "Submit."
- **Why**: This gives us very fast performance and reduced load on the database. The user doesn't exit draft mode and see their changes made official until the database write succeeds. However, the trade-off is that if the user refreshes, then the draft changes are gone. We can persist this to localStorage, but if localStorage breaks, the draft changes are also lost, too.
- **Alternatives Rejected**:
  - Write-through: In this approach, if the user needs to make 10 changes, they'd have to wait for each change to succeed before making the next one. Worse, this means 10 API calls will be made, although 1 is enough.
  - Write-around: In this approach, the app writes to the database first and updates the UI later. However, I also rejected this because it causes parts of the UI to go out of sync, so end users can't clearly see what changes have been made.

### 3. Logic Separation: Filters Store vs. Products Store

- **Decision**: I separated filter-related state into filtersStore and product-related state into productStore.
- **Why**: They both should persist across page reloads (via localStorage), but Filters (search query, sort order) are UI state, and thus shouldn't be coupled with product data. Keeping them separate made the product store much cleaner and easier to understand.

### 4. Architectural Boundaries: Decoupled Filter & Product Actions

- **Decision**: I made the filters pass query values into a pure getFilteredProductList function instead of having the product store directly depend on the filters store.
- **Why**: This keeps the stores more independent. It also makes testing easier because I can test the filtering logic without setting up a full mock store.

### 5. Local Storage: Custom Pinia Plugin

- **Decision**: I wrote a custom Pinia persistence plugin in src/plugins/persistedState.ts.
- **Why**: I wanted to understand how Pinia persistence works under the hood, especially store.$patch and store.$subscribe. Writing it myself also kept the project from depending on a third-party package for a fairly small feature. In future projects, however, I should use dependencies instead of re-inventing the wheel.

### 6. Thin Components: Separation of Logic

- **Decision**: I kept Vue components mostly focused on presentation and local UI state, like whether a modal is open.
- **Why**: The main data logic lives in the stores, which makes it easier to test and keeps the components simpler. I'm glad this was part of the requirements, as it helped me organize everything cleanly!

### 7. Extensibility: RouterView

- **Decision**: I added RouterView and a navigation bar right from the start.
- **Why**: Because routing is foundational and is almost always seen on every web apps, I chose to set up routing early to make it easier to add more pages later, such as product details, history, or user management.

### 8. Unit Testing: 1 Normal Case, 2 Edge Cases

- **Decision**: I focused testing on store actions and filter utilities. Each test suite includes a normal case and at least two edge cases.
- **Why**: This gave me the most useful coverage without making the test suite too fragile. The stores contain the most important logic, so testing them gave me the most confidence.
