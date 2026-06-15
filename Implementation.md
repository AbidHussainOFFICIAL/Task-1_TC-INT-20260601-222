Task Title: Multi-Vendor Service Marketplace Platform

Objective 
Build a complete service marketplace platform where customers can browse services, hire 
freelancers/service providers, submit service requests, and track project progress. 
The platform should simulate real-world systems like Fiverr, Upwork, and local service 
marketplaces.

Technologies 
Frontend 
● React.js 
● Tailwind CSS 
● Axios 
● React Router 
Backend 
● Node.js 
● Express.js 
Database 
● MongoDB Atlas 
Authentication 
● JWT 
● bcrypt 
File Upload 
● Cloudinary

Feature 1: Authentication & Authorization (The Foundation)Backend Work: Create the User Schema with roles (Customer, Service Provider, Admin). Implement the Registration route (hashing passwords with bcrypt) and Login route (generating a JWT). Create a protect middleware to verify the JWT for locked routes.  Frontend Work: Design the Sign-up and Login forms using Tailwind CSS. Set up a global Context (like AuthContext) in React to store the logged-in user's data and token. Build Protected Routes in React Router to block unauthenticated users from visiting dashboards.  

Authentication & Authorization 
Implement: 
● User Registration 
● Login / Logout 
● Password Hashing 
● JWT Authentication 
● Role-Based Access 
Roles: 
● Customer 
● Service Provider 
● Admin

Feature 2: Service Provider ProfilesBackend Work: Create a Profile Schema linked to the User ID. Build an endpoint to Create/Update Profile details (Skills, Experience, Pricing, Portfolio). Integrate Cloudinary to handle user profile picture uploads.  Frontend Work: Design a "Complete Profile" form page for Service Providers where they can upload a picture and list skills. Build a public-facing Profile View page so customers can see a freelancer's details. 

Service Provider Profiles 
Each provider must be able to: 
● Create profile 
● Upload profile picture 
● Add skills 
● Add experience 
● Add pricing 
● Add portfolio items

Feature 3: Service Listings CRUDBackend Work: Create a Service Schema containing Title, Description, Category, Price, and Delivery Time linked to the provider's ID. Write API routes to Create, Read, Update, and Delete (CRUD) these listings. (Ensure only the provider who created the listing can update or delete it).  Frontend Work: Build a dashboard management page for freelancers with a "Create New Service" form and a list of their active services with "Edit" and "Delete" buttons.  

 Service Listings 
Providers can: 
● Create service listings 
● Edit listings 
● Delete listings 
Example: 
● Website Development 
● Logo Design 
● Social Media Management 
● Content Writing 
Each listing should contain: 
● Title 
● Description 
● Category 
● Price 
● Delivery Time

Feature 4: Marketplace Search & Filter EngineBackend Work: Create a public marketplace endpoint (GET /api/services) that accepts query parameters for searching text strings and filtering records by category.  Frontend Work: Create the main Marketplace Explorer page. Add a search input field and a category dropdown menu. Use Axios to pass these inputs to the backend endpoint and dynamically map the returning services as cards.  

Feature 5: Service Request & Order SystemBackend Work: Create a Project/Request Schema containing fields for Requirements, Budget, Deadline, Customer ID, Provider ID, Service ID, and a default status set to 'Pending'. Build an API route for customers to submit this data.  Frontend Work: Add a "Hire Me" or "Order Service" button on the service details page that opens a form modal. Let the customer input their specific budget, deadline, and requirements, then send it to the server.  

 Service Request System 
Customers can: 
● Browse services 
● Search services 
● Filter by category 
● Submit service request 
Request must contain: 
● Requirements 
● Budget 
● Deadline 

Feature 6: Project Tracking Module WorkflowBackend Work: Write a status update endpoint (PATCH /api/projects/:id/status) that allows providers or customers to advance a project through the strict pipeline: Pending → Accepted → In Progress → Completed → Delivered.  Frontend Work: Create a tracking UI card or timeline bar inside the dashboard that visually highlights the current status of the project, complete with action buttons (e.g., an "Accept Project" button for providers or a "Mark as Delivered" button). 

Project Tracking Module 
Status Workflow: 
Pending 
↓ 
Accepted 
↓ 
In Progress 
↓ 
Completed 
↓ 
Delivered 
Users should be able to track progress.

Feature 7: Review & Rating SystemBackend Work: Create a Review Schema. Build an API route allowing customers to post a review (1-5 star score + text feedback) only if the project status is 'Delivered'. Create a database hook to automatically recalculate the provider's average star rating.  Frontend Work: When a project hits "Delivered," show a review form to the customer. On the freelancer’s public profile page, display their total average star rating score prominently.

 Review & Rating System 
Customers can: 
● Rate provider (1-5) 
● Leave feedback 
Average rating must be displayed. 

Feature 8: The Dashboards OverviewsBackend Work: Write aggregated API routes to pull distinct data matrices for different user states:Customer: Fetch active requests and completed project lists.  Provider: Run database summaries calculating total earnings, active contracts, and new orders.  Admin: Use MongoDB aggregates to compute system-wide user counts, total active services, and project volumes.  Frontend Work: Build three distinct dashboard layouts. Based on the user's logged-in role, route them to their specific view populated with the matching statistics cards and tables.  

Dashboard 
Customer Dashboard: 
● Active Requests 
● Completed Projects 
● Profile Management 
Provider Dashboard: 
● Earnings Overview 
● Active Projects 
● Pending Requests 
Admin Dashboard: 
● User Statistics 
● Service Statistics 
● Project Statistics 
8. Responsive Design 
Must support: 
● Desktop 
● Tablet 
● Mobile

Suggested Extra FeaturesToast Notifications (Frontend): Install react-hot-toast or react-toastify. This pops up clean success/error messages on screen (e.g., "Logged in successfully!", "Order Submitted!") instead of ugly browser alerts.Search Debouncing (Frontend): Implement a tiny debounce function on the marketplace search bar. This prevents sending an API request on every single keystroke, drastically saving your backend performance.Stripe Sandbox Integration (Bonus Challenge): Add a mockup payment step using Stripe Checkout when a user places an order. You don't need real money; running it in Test Mode looks incredibly professional.  Real-Time Status Indicators (Bonus Challenge): Use basic polling or integrate Socket.io so when a provider hits "Accepted," the customer sees the change immediately without manual page refreshes.  

