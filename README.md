# Warehouse Dispatch System

## 1. Project Overview
The Nexus system is a web-based prototype designed to digitalize safety incident dispatch requests and resource allocations in industrial environments. It strictly enforces business rules regarding request limits, capacity management, status transitions, and role-based access.

## 2. Setup Instructions
To run this project locally, ensure you have **Node.js** installed.
1. Open a terminal and navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the database and insert seed data:
   ```bash
   node src/db/init.js
   ```
4. Start the server:
   ```bash
   node src/server.js
   ```
5. Open your browser and navigate to `http://localhost:3000`.

## 3. Seed Data Details
The SQLite database comes pre-loaded with the following data:
* **Users:**
  * `user1` (Role: User)
  * `user2` (Role: User)
  * `admin1` (Role: Administrator)
* **Resources:**
  * `S101` (Capacity: 10, Status: Active)
  * `S102` (Capacity: 5, Status: Active)
  * `S103` (Capacity: 0, Status: Inactive)

## 4. Demo Workflow Steps
1. **User Login:** Select "User 1" from the simulated login dropdown.
2. **Submit Request:** Select resource `S101`, enter a base value (e.g., `500`), and click Submit. Note the Rs.50 charge.
3. **Cancel Request (Optional):** Click 'Cancel' next to your newly created request in the table.
4. **Admin Login:** Switch the role dropdown to "Administrator".
5. **Process Request:** Locate an active request, use the dropdown to advance its status to `APPROVED/ASSIGNED`, then click Update. Notice that invalid jumps (e.g., to `COMPLETED`) are not available in the dropdown.

## 5. Limitations
* **Authentication:** Uses a mocked HTTP header simulation (`X-User-Id` / `X-Role`) instead of real JWTs or session cookies to simplify assessment review. No real passwords are stored or utilized.
* **Database:** SQLite is used as a local file-based database. It is not suitable for large-scale distributed deployments.
* **Capacity Management:** Resource capacity is decremented upon request creation, but concurrent high-volume requests could require queue management in a real-world scenario.

---
### Included Documentation
* `Requirements_Document.md`: Requirement analysis, Use Case & Class UML diagrams.
* `AI_Test_Report.md`: Test execution evidence, defect logs, and AI usage summaries.
* `AI_Usage_Log.md`: Detailed step-by-step prompts utilized to build the system.
