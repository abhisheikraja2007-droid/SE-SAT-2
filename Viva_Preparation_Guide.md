# Viva Rehearsal Guide: Nexus System

Use this guide to rehearse and prepare for your assessment Viva (oral defense/demonstration). 

## 1. Demonstrate the Compulsory Workflow
Be prepared to share your screen and click through the following exact sequence:
1. **Create Dispatch Request:** As `User 1`, select resource `S101` and enter `1500`. Hit Submit.
2. **Validate:** Show that the charge is `Rs.0` (because >= 1000). Show that submitting for `S103` is blocked because it is Inactive.
3. **View Request:** Point out the unique Req ID and the status as `SUBMITTED`.
4. **Admin Process:** Switch to the Administrator role. Locate the request. Open the dropdown and show that you can only select `APPROVED/ASSIGNED` or `CANCELLED`. Select `APPROVED/ASSIGNED` and submit.
5. **Complete:** Change the status to `IN_PROGRESS` and then to `COMPLETED`.
6. **User Cancellation:** Switch back to `User 2`, create a new request, and click `Cancel`. Switch to `Admin` to prove the Admin can see it marked as `CANCELLED`.

## 2. Key Technical Explanations

### Question: Explain a boundary rule you implemented.
**Answer Script:** "I implemented the active-request limit (BR1). A user is strictly blocked from having more than 5 active requests at a time. The system calculates this by querying the `ServiceRequest` table for requests tied to the user's ID where the status is NOT `COMPLETED` and NOT `CANCELLED`. If the count is 5 or more, the backend rejects it."

### Question: How did you handle 'revalidation' or 'failure without partial update'?
**Answer Script:** "I enforced transaction atomicity using `BEGIN TRANSACTION`, `COMMIT`, and `ROLLBACK` in `RequestService.js`. When a request is submitted, we (1) insert the request, (2) decrement resource capacity, and (3) record the status history. If the capacity update fails, the `catch` block triggers a `ROLLBACK`, meaning the initial request insert is entirely wiped out, guaranteeing no orphaned data or partial updates."

### Question: What is an AI suggestion you reviewed and accepted/rejected?
**Answer Script:** "While developing the database inserts, I noticed that asynchronous SQLite callbacks were causing race conditions, making my transactions fail to rollback properly. The AI suggested wrapping the SQLite methods in JavaScript `Promises` and using `async/await`. I accepted this suggestion because it ensured my `BEGIN TRANSACTION` and `COMMIT` blocks executed sequentially, which guaranteed the atomicity requirement of the assessment."
