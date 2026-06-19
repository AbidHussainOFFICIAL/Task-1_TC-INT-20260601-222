Feature 8: Dashboard Overviews
Background
The platform already has a single Dashboard.jsx that serves all roles but only shows project lists and service CRUD. Feature 8 upgrades this into three distinct, role-aware dashboard views — each populated with aggregated statistics cards and role-specific data tables.

The three roles and what they need:

Role	Stats needed
Customer	Active request count, completed project count, total spend, quick project list
Service Provider	Total earnings (sum of budgets on Delivered projects), active contract count, pending request count, average rating
Admin	Total users (by role), total active services, project volumes (by status), total reviews
User Review Required
IMPORTANT

Admin Role Access: The existing User schema already has role: 'Admin'. However there is currently no way to create an Admin user through the UI — it must be seeded directly in MongoDB. The plan assumes at least one Admin account exists in the database for testing.

IMPORTANT

Dashboard Split Strategy: The current Dashboard.jsx is one large file (~700 lines) serving all roles. The plan refactors it into role-specific sub-views rendered conditionally, rather than creating separate routes/pages. This keeps the routing unchanged (/dashboard) while cleanly separating the UI logic per role.

NOTE

No new DB schemas needed: All stats are derived from existing User, Project, Service, and Review collections via MongoDB aggregation queries.

Proposed Changes
Backend
[NEW] backend/routes/dashboard.js
A new dedicated router at GET /api/dashboard/stats (protected). Returns a different payload shape based on req.user.role:

Customer payload:

json

{
  "role": "Customer",
  "stats": {
    "activeCount": 3,
    "completedCount": 5,
    "totalSpend": 1240
  },
  "recentProjects": [ ...last 5 projects populated with service title & provider name ]
}
Provider payload:

json

{
  "role": "Service Provider",
  "stats": {
    "totalEarnings": 4800,
    "activeCount": 2,
    "pendingCount": 1,
    "averageRating": 4.7,
    "reviewCount": 11
  },
  "recentProjects": [ ...last 5 received projects with customer name & service title ]
}
Admin payload:

json

{
  "role": "Admin",
  "stats": {
    "totalUsers": 42,
    "customerCount": 30,
    "providerCount": 11,
    "adminCount": 1,
    "totalActiveServices": 18,
    "totalProjects": 87,
    "projectsByStatus": {
      "Pending": 10, "Accepted": 5, "In Progress": 12,
      "Completed": 20, "Delivered": 40
    },
    "totalReviews": 35
  }
}
Implementation details:

Use Project.aggregate() with $match + $group for earnings and counts
Use User.countDocuments() for user stats
Use Service.countDocuments({ active: true }) for service count
Use Review.countDocuments() for review total
Pull averageRating / reviewCount directly from the provider's Profile document (already denormalised in Feature 7)
[MODIFY] backend/index.js
Register the new route:

js

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);
Frontend
[NEW] frontend/src/pages/CustomerDashboard.jsx
Dedicated view for Customers. Displays:

Stats row — 3 stat cards: Active Requests, Completed Projects, Total Spend
Project list — reuses the existing project cards + ProjectTimeline + review panel (extracted as a shared component or inlined)
Fetches: GET /api/dashboard/stats on mount.

[NEW] frontend/src/pages/ProviderDashboard.jsx
Dedicated view for Providers. Displays:

Stats row — 4 stat cards: Total Earnings, Active Projects, Pending Requests, Average Rating (with mini star display)
Service management section — reuses the existing service CRUD form and listing (lifted from the current Dashboard.jsx)
Received projects list — reuses project cards with action buttons (Accept / Start / Complete)
Fetches: GET /api/dashboard/stats + GET /api/services/provider.

[NEW] frontend/src/pages/AdminDashboard.jsx
Dedicated view for Admins. Displays:

User stats — 3 cards: Total Users, Customers, Providers
Platform stats — 3 cards: Active Services, Total Projects, Total Reviews
Project status breakdown — a simple visual bar or table showing count per status stage
No project actions (admin is read-only in this MVP)
Fetches: GET /api/dashboard/stats.

[MODIFY] frontend/src/pages/Dashboard.jsx
Becomes a thin router component. Reads user.role from AuthContext and renders the appropriate sub-dashboard:

jsx

if (user.role === 'Admin')            return <AdminDashboard />;
if (user.role === 'Service Provider') return <ProviderDashboard />;
return <CustomerDashboard />;
The existing service CRUD code, project list code, and ProjectTimeline / StarPicker components will be lifted out of Dashboard.jsx into the relevant new files, keeping the refactor clean. ProjectTimeline and StarPicker will be moved to frontend/src/components/ so all dashboards can share them.

[NEW] frontend/src/components/ProjectTimeline.jsx
Extract the existing ProjectTimeline inline component from Dashboard.jsx into a standalone shared component.

[NEW] frontend/src/components/StarPicker.jsx
Extract the existing StarPicker inline component from Dashboard.jsx into a standalone shared component.

[NEW] frontend/src/components/StatCard.jsx
A reusable stats card component used by all three dashboards:

jsx

<StatCard label="Total Earnings" value="$4,800" icon="💰" accent="#10b981" />
Renders a clean card with an icon, large numeric value, and label. Supports an accent colour prop for the left border / icon tint.

[MODIFY] frontend/src/App.css
Add CSS for:

.stats-grid — responsive 3–4 column grid for stat cards
.stat-card — individual stat card styles (border-left accent, hover lift)
.admin-table — simple striped table for admin project-status breakdown
Verification Plan
Automated Tests
bash

# In frontend/
npm run build   # must exit with 0 errors
npm run lint    # must exit with 0 errors
Manual Verification
Test Case	Steps	Expected
TC-1 Customer Stats	Log in as Customer → visit /dashboard	See Active Requests, Completed, Spend stat cards above project list
TC-2 Provider Stats	Log in as Provider → visit /dashboard	See Earnings, Active, Pending, Rating cards above services + projects
TC-3 Admin Stats	Log in as Admin → visit /dashboard	See user counts, service count, project volumes, review count
TC-4 Role Isolation	Log in as Customer, inspect network tab	Confirm /api/dashboard/stats returns role: "Customer" payload only
TC-5 Earnings Accuracy	Manually deliver a project with budget $500	Provider's Total Earnings card reflects the new total
TC-6 Responsive Layout	Resize to 375 px wide	Stat cards stack to single column, no overflow
