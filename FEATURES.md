# Core Features Documentation

## 1. Dashboard / Home Screen

**Functionality:** Display account overview with current balance and recent transactions.

**User Flow:**

- User opens app → Splash screen → Dashboard loads
- View total balance, income, and expense summaries
- See recent transactions (last 5-10 items)

**Components & Data:**

- `BalanceCard` - Display balance summary
- `TransactionList` - Show recent transactions
- `TransactionContext` - Manage transaction state
- Data: Balance total, income/expense totals, recent transaction array

**Integration:**

- Fetch transactions from SQLite database on screen load
- Update context with transaction data
- Real-time balance calculation from transaction sum

---

## 2. Add Transaction

**Functionality:** Allow users to record income or expense transactions with details.

**User Flow:**

- User taps "Add" button → Modal/form opens
- Select type (income/expense) and category
- Enter amount, description, and date
- Confirm → Transaction saved → Return to dashboard

**Components & Data:**

- `AddTransactionModal` - Form UI
- `DateTimePicker` - Date selection
- Form inputs: type, amount, category, description, date
- Data structure: `{ id, type, amount, category, description, date, timestamp }`

**Integration:**

- Validate amount input (positive number)
- Save to SQLite via `db.ts`
- Dispatch action to `TransactionContext`
- Refresh dashboard balance and transaction list

---

## 3. Transaction List / History

**Functionality:** Display all transactions with filtering and sorting options.

**User Flow:**

- User navigates to History/Transactions screen
- View all transactions (paginated or scrollable)
- Filter by category, type, or date range
- Tap transaction → View/edit details

**Components & Data:**

- `TransactionItem` - Individual transaction row
- `TransactionList` - List container with filtering UI
- Filter state: category, type, date range
- Data: Full transaction array with metadata

**Integration:**

- Query database with filters applied
- Sort by date (newest first)
- Display formatted amounts and dates
- Handle pagination for large datasets

---

## 4. Edit & Delete Transaction

**Functionality:** Modify or remove existing transactions.

**User Flow:**

- User taps transaction item → Detail view opens
- Option to Edit or Delete
- Edit: Modify fields → Save changes
- Delete: Confirm → Transaction removed

**Components & Data:**

- Detail screen with edit form
- Confirmation dialog for delete
- Data: Individual transaction object

**Integration:**

- Load transaction from context/database
- Update database with new values
- Remove from context on delete
- Trigger dashboard refresh

---

## 5. Categories Management

**Functionality:** Organize transactions by predefined or custom categories.

**Categories Structure:**

```
Income: Salary, Freelance, Investment, Bonus
Expenses: Food, Transport, Utilities, Healthcare, Entertainment, Shopping, Other
```

**Components & Data:**

- Category selection dropdown in forms
- Category constants in `constants/`
- Data: Category enum/array with icons

**Integration:**

- Predefined categories in constants
- Store category with each transaction
- Use for filtering and statistics

---

## 6. Statistics & Reports

**Functionality:** Visualize spending patterns and income/expense breakdown.

**User Flow:**

- User navigates to Stats screen
- View charts: Monthly overview, category breakdown
- Toggle between income/expense views
- Select date range (week, month, year)

**Components & Data:**

- `BalanceChart` - Income vs Expense bars
- `CategoryChart` - Pie/bar chart by category
- `react-native-gifted-charts` for visualization
- Aggregated data: totals by category, daily/monthly totals

**Integration:**

- Calculate totals from transaction array
- Group by category, date period
- Format data for chart libraries
- Update charts on transaction changes

---

## 7. Data Persistence

**Functionality:** Store transactions securely using SQLite database.

**User Flow:**

- Transactions auto-save when added/modified
- Data persists across app sessions
- No network required (offline-first)

**Components & Data:**

- `db.ts` - Database operations (CRUD)
- SQLite via `expo-sqlite`
- Tables: transactions (id, type, amount, category, description, date, timestamp)

**Integration:**

- Initialize database on app start
- Execute SQL queries for all transaction operations
- Handle database errors gracefully
- Backup/export data (future feature)

---

## User Flow Summary

```
App Launch
  ↓
Dashboard (Home)
  ├→ Tap "Add" → Add Transaction Modal → Confirm → Dashboard Updated
  ├→ Swipe/Tap Transaction → View Details → Edit/Delete → Dashboard Updated
  ├→ Tap "History" → Transaction List (Filtered/Sorted) → Tap Item → Details
  ├→ Tap "Stats" → Charts & Reports → Toggle View → Dashboard
  └→ Tap "Settings" → Settings Screen → Manage Preferences
```

---

## Data Flow Architecture

```
User Action (UI)
  ↓
Component (AddTransactionModal, TransactionItem)
  ↓
TransactionContext (State Management)
  ↓
db.ts (Database Operations)
  ↓
SQLite Database
  ↓
Context Update → UI Refresh
```

---

## Key UI Elements

- **Bottom Tab Navigation:** Home, History, Stats, Settings
- **Floating Action Button:** Quick add transaction
- **Cards:** Balance display, transaction items
- **Modals:** Add/edit transaction forms
- **Charts:** Bar and pie charts for statistics
- **Forms:** Date picker, amount input, category dropdown

---

# Best Practices for Code Efficiency & Performance

## 1. Component Architecture & Reusability

### Breaking Down UI into Reusable Components

**Goal:** Minimize code duplication and improve maintainability

#### Single Responsibility Principle

- Each component should have ONE primary purpose
- Examples in this app:
  - `BalanceCard` → Display balance summary only
  - `TransactionItem` → Render single transaction only
  - `AddTransactionModal` → Handle transaction input form only

#### Creating Atomic Components

```typescript
// Good: Small, reusable component
const Badge = ({ label, color }: { label: string; color: string }) => (
  <View style={[styles.badge, { backgroundColor: color }]}>
    <Text style={styles.badgeText}>{label}</Text>
  </View>
);

// Usage in multiple places
<Badge label="Income" color="#10b981" />
<Badge label="Expense" color="#ef4444" />
```

#### Props-Driven Component Customization

- Pass data and callbacks as props instead of hardcoding
- Avoid prop drilling (excessive nested props) by using Context API
- Use TypeScript interfaces for prop validation:

```typescript
interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  onDelete?: (id: string) => void;
}
```

#### Component Composition Pattern

- Build complex UIs by composing smaller components
- Wrap related components in container components
- Example structure:

```
TransactionList (container)
  ├── SearchBar (reusable)
  ├── FilterButtons (reusable)
  └── ScrollView
      └── TransactionItem (reusable, repeated)
```

---

## 2. State Management & Data Handling

### Efficient State Management

#### Use Context API for Global State

- Store shared state (transactions, user settings) in Context
- `TransactionContext` centrally manages all transaction data
- Reduces prop drilling through deep component trees

#### Implement Selective Re-rendering

```typescript
// Only components using specific context value re-render on changes
const TransactionListMemo = React.memo(({ transactionId }) => {
  return <TransactionItem transaction={getTransaction(transactionId)} />;
});
```

#### Avoid State Duplication

- Single source of truth for each data piece
- Derived data (totals, counts) calculated from primary data
- Don't store redundant copies in multiple places

### Optimizing Data Storage

#### Database Query Optimization

- **Index frequently queried fields:** dates, categories, transaction types

```typescript
// In database initialization
CREATE INDEX idx_date ON transactions(date);
CREATE INDEX idx_category ON transactions(category);
CREATE INDEX idx_type ON transactions(type);
```

#### Pagination for Large Datasets

- Don't load all transactions at once
- Implement lazy loading:

```typescript
const ITEMS_PER_PAGE = 20;

const loadMoreTransactions = (pageNumber: number) => {
  const offset = pageNumber * ITEMS_PER_PAGE;
  const transactions = queryTransactions(offset, ITEMS_PER_PAGE);
  appendToList(transactions);
};
```

#### Data Filtering at Database Level

- Filter in SQL queries, not in JavaScript
- Reduces memory usage and improves performance

```typescript
// Good: Filter in database
const expenses = db.getAllTransactions('WHERE type = "expense"');

// Avoid: Filter in app
const allTxns = db.getAllTransactions();
const expenses = allTxns.filter((t) => t.type === "expense");
```

#### Compress Large Data Objects

- Store minimal necessary fields
- Calculate display formats on-render
- Example:

```typescript
// Efficient storage
{
  id, type, amount, category, timestamp;
}

// Calculate when needed
const date = new Date(timestamp).toLocaleDateString();
const formattedAmount = `$${amount.toFixed(2)}`;
```

---

## 3. Error Handling & State Management

### Robust Error Handling

#### Try-Catch Pattern for Database Operations

```typescript
const saveTransaction = async (transaction: Transaction) => {
  try {
    const result = await db.insert("transactions", transaction);
    context.addTransaction(result);
    return { success: true };
  } catch (error) {
    console.error("Save failed:", error);
    // Show user-friendly error message
    showError("Failed to save transaction. Please try again.");
    return { success: false, error: error.message };
  }
};
```

#### User-Friendly Error Messages

- Display helpful messages, not technical errors
- Guide users on how to fix issues

```typescript
// Bad
Alert.alert("Error", error.toString());

// Good
Alert.alert("Invalid Input", "Please enter a valid amount (0.01 or higher)");
```

#### Validation Before Operations

- Validate all user inputs before saving

```typescript
const validateTransaction = (txn: Partial<Transaction>) => {
  const errors: string[] = [];

  if (!txn.amount || txn.amount <= 0) errors.push("Amount must be positive");
  if (!txn.category) errors.push("Please select a category");
  if (!txn.type) errors.push("Please select transaction type");

  return { isValid: errors.length === 0, errors };
};
```

#### Graceful Degradation

- App remains functional if features fail
- Fallback UI for missing data

```typescript
<View>
  {transactionsList.length > 0 ? (
    <TransactionList items={transactionsList} />
  ) : (
    <EmptyStateMessage text="No transactions yet. Add one to get started!" />
  )}
</View>
```

---

## 4. Responsive Layout Design

### Mobile-First Approach

- Design for smallest screen first
- Progressively enhance for larger screens
- Use relative sizing (percentages, flex) instead of fixed pixels

### Flexible Layout Patterns

```typescript
// Responsive grid
const screenWidth = Dimensions.get("window").width;
const itemsPerRow = screenWidth > 768 ? 3 : 2;
const itemWidth = screenWidth / itemsPerRow;

<View style={{ flexDirection: "row", flexWrap: "wrap" }}>
  {items.map((item) => (
    <View key={item.id} style={{ width: itemWidth }}>
      {/* Item content */}
    </View>
  ))}
</View>;
```

### Safe Area & Device Considerations

```typescript
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MyScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Content adapts to notches, safe areas */}
    </View>
  );
};
```

### Breakpoint Strategy

```typescript
const useResponsive = () => {
  const windowWidth = Dimensions.get("window").width;

  return {
    isSmall: windowWidth < 480, // phones
    isMedium: windowWidth < 768, // tablets
    isLarge: windowWidth >= 768, // large tablets
  };
};
```

### Font Scaling

- Use `RFValue` (React Native Responsive Font Size) for text
- Or calculate dynamically based on screen size:

```typescript
const calculateFontSize = (baseSize: number) => {
  const screenWidth = Dimensions.get("window").width;
  return (screenWidth / 375) * baseSize; // 375 is iPhone baseline
};

const fontSize = calculateFontSize(16); // Scales proportionally
```

---

## 5. Reducing App Load Times

### Code Splitting & Lazy Loading

#### Lazy Load Screens

```typescript
// Use React.lazy for heavy screens (only in web; alternatives for React Native)
const StatsScreen = React.lazy(() => import("./screens/Stats"));

// For React Native, use dynamic imports
const loadStatsScreen = () => import("./screens/Stats");
```

#### Dynamic Component Loading

- Don't render heavy components until needed
- Use conditional rendering strategically

### Performance Optimization Techniques

#### Memoization

```typescript
// Prevent unnecessary re-renders
const TransactionItemMemo = React.memo(
  TransactionItem,
  (prevProps, nextProps) => prevProps.transaction.id === nextProps.transaction.id
);
```

#### Reduce Bundle Size

- Use lightweight libraries over heavy ones
- Tree-shake unused code (ensure package.json exports are optimized)
- Example alternatives:
  - Use native Date/Intl over moment.js
  - Use TailwindCSS (already included) instead of extra CSS libraries

#### Optimize Images

- Compress images before app release
- Use WebP format when possible
- Lazy load images in long lists

```typescript
<Image
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  defaultSource={require("./placeholder.png")} // Fallback
/>
```

#### Defer Non-Critical Operations

```typescript
// Run heavy calculations/animations after initial render
useEffect(() => {
  const timer = setTimeout(() => {
    calculateComplexStatistics();
  }, 1000);

  return () => clearTimeout(timer);
}, []);
```

### Database Performance

#### Connection Pooling & Caching

```typescript
// Cache frequently accessed data
let cachedCategories: Category[] | null = null;

const getCategories = async () => {
  if (cachedCategories) return cachedCategories;

  cachedCategories = await db.query("SELECT * FROM categories");
  return cachedCategories;
};
```

#### Batch Operations

```typescript
// Add multiple transactions in one operation
const addBulkTransactions = async (transactions: Transaction[]) => {
  return db.transaction(async (txn) => {
    for (const t of transactions) {
      await txn.execute("INSERT INTO transactions (...) VALUES (...)", [...t]);
    }
  });
};
```

#### Async/Await for Non-Blocking Operations

```typescript
// Don't block UI thread for database operations
const loadTransactionsAsync = async () => {
  setLoading(true);
  try {
    const txns = await queryTransactionsAsync();
    setTransactions(txns);
  } finally {
    setLoading(false);
  }
};
```

### Startup Time Optimization

#### Prioritize Initial Data Loading

```typescript
// Load only essential data first
const initializeApp = async () => {
  // Critical: Load balance immediately
  const balance = await db.getBalance();
  setBalance(balance);

  // Non-critical: Load stats later
  setTimeout(() => loadStatistics(), 500);
};
```

#### Service Worker Pattern (for data sync)

- Pre-fetch data intelligently
- Sync data in background without blocking UI
- Queue offline actions to sync when connection restored

---

## Summary of Key Efficiency Principles

| Area            | Best Practice                                           |
| --------------- | ------------------------------------------------------- |
| **Components**  | Small, single-responsibility, reusable, memoized        |
| **State**       | Centralized with Context, no duplication                |
| **Data**        | Database filtering, pagination, indexed queries         |
| **Errors**      | Try-catch blocks, user-friendly messages, validation    |
| **UI**          | Flex layouts, responsive design, safe areas             |
| **Performance** | Lazy loading, memoization, async operations, caching    |
| **Storage**     | Efficient schema, minimal fields, compression           |
| **Load Time**   | Code splitting, image optimization, prioritized loading |
