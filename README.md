Here is a comprehensive README.md file tailored exactly to the project we have built. You can copy-paste this directly into the root of your project repository.

TaskFlow - Real-time Collaborative Task Manager
TaskFlow is a full-stack task management application designed for teams. It allows users to create tasks, assign them to multiple team members, track progress in real-time, and receive instant notifications.

Setup Instructions
Follow these steps to get the application running locally on your machine.

Prerequisites
Node.js (v14 or higher)

MongoDB (Ensure MongoDB is running locally or have an Atlas URI)

1. Backend Setup
   Navigate to the backend folder:

Bash

cd backend
Install dependencies:

Bash

npm install
Create a .env file in the backend directory and add the following:

Code snippet

PORT=3000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_super_secret_key_123
Start the server:

Bash

npm run dev
The backend will run on http://localhost:3000

2. Frontend Setup
   Open a new terminal and navigate to the frontend folder:

Bash

cd frontend
Install dependencies:

Bash

npm install
Start the Vite development server:

Bash

npm run dev
The frontend will typically run on http://localhost:5173

3. Running Tests (Backend)
   To verify the business logic and API validation:

Bash

cd backend
npm test
API Contract Documentation
Here are the key endpoints available in the backend API.

Authentication
Method Endpoint Description Body Params
POST /users/register Register a new user { name, email, password }
POST /users/login Login and receive JWT { email, password }

Export to Sheets

Users
Method Endpoint Description Body Params
GET /users Get a list of all users (for dropdowns) -
PATCH /users/profile Update logged-in user's profile { name }

Export to Sheets

Tasks
Method Endpoint Description Body Params
GET /tasks Get all tasks (supports filters) Query: ?status=To Do&priority=High
POST /tasks Create a new task { title, description, status, priority, dueDate, assignedTo: [] }
PATCH /tasks/:id Update a task { status, priority, assignedTo... }
DELETE /tasks/:id Delete a task -

Export to Sheets

Notifications
Method Endpoint Description
GET /notifications Fetch unread notifications for the user
PATCH /notifications/:id/read Mark a specific notification as read

Export to Sheets

Architecture Overview & Design Decisions

1. Database Choice: MongoDB
   Why: Tasks and Users have relationships (Tasks reference Users), but the schema needs to be flexible. MongoDB allows us to easily store arrays of User IDs for the assignedTo field without complex join tables required in SQL.

Modeling: We used Mongoose for schema validation to ensure data consistency (e.g., ensuring status is one of 'To Do', 'In Progress', etc.).

2. Authentication: JWT (JSON Web Tokens)
   Implementation: We chose stateless authentication using JWTs. When a user logs in, the server signs a token containing their userId.

Storage: The token is stored in the browser's localStorage via an AuthContext. This allows the frontend to persist the login session across page refreshes.

Middleware: A custom auth.middleware.ts intercepts protected routes, verifies the token, and attaches the user to the req object.

3. Service-Oriented Architecture (Backend)
   Why: Instead of writing all logic in Controllers, we separated it into Services (task.service.ts).

Benefit: This makes the code Testable. We can write unit tests for the business logic (e.g., "filtering empty strings") without needing to mock the entire Express Request/Response objects.

4. Frontend State Management
   Tools: React Context for Auth, TanStack Query (React Query) for server data.

Why: React Query handles caching, loading states, and automatic refetching. When a socket event arrives, we simply call queryClient.invalidateQueries(['tasks']), and React Query automatically refreshes the UI.

Real-Time Integration (Socket.io)
We integrated Socket.io to ensure all users see the same board state without manually refreshing.

How it works:
Events: The backend emits events on specific actions:

taskCreated: When a new task is added.

taskUpdated: When status, priority, or details change.

notification: Targeted event for specific users when they are assigned.

Frontend Listeners: Inside Dashboard.tsx, we have a useEffect hook listening for these events.

Synchronization:

When taskUpdated is received -> We trigger a data re-fetch.

When notification is received -> We show a Toast popup and increment the "Unread" count on the Bell icon.

Trade-offs & Assumptions

1. Notification Logic
   Decision: We implemented a "Hybrid" notification system. Notifications are sent in real-time (Socket) and saved to the database.

Trade-off: This requires two writes (Socket emit + DB write), but it ensures that if a user is offline when assigned, they will still see the notification in their history when they log in later.

2. User Experience vs. Strict Security
   Assumption: For this project scope, storing JWTs in localStorage is acceptable.

Trade-off: In a high-security banking app, we would use HttpOnly Cookies to prevent XSS attacks. LocalStorage is easier to implement for a prototype/demo.

3. "Created By" logic
   Assumption: The frontend filters tasks based on the token's User ID. We assume the backend token validation is sufficient security to ensure users can only act as themselves.

4. Testing
   Decision: We focused on Unit Testing the Controller and Service layers (Backend) as this contains the critical business rules. Frontend E2E testing (Cypress/Playwright) was omitted for speed but would be the next step for a production app.
