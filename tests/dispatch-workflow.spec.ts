import { test, expect } from '@playwright/test';

test.describe.serial('Warehouse Dispatch System - Workflow & Business Rules (T1 - T12)', () => {

  test.beforeAll(async ({ request }) => {
    // Reset the SQLite database to fresh initial seed data
    const res = await request.post('http://localhost:3000/api/reset-db');
    expect(res.ok()).toBeTruthy();
  });

  test('T1: Submit the same dispatch request twice. Assert the UI blocks the duplicate and the system enforces the rule.', async ({ page, request }) => {
    await page.goto('/');

    // Select User 1 persona
    await page.selectOption('#roleSelect', { label: 'User 1' });
    await expect(page.locator('#currentUserLabel')).toContainText('user1');

    // Select active resource S101
    await expect(page.locator('#resourceSelect option')).toHaveCount(3);
    await page.selectOption('#resourceSelect', { value: '1' }); // S101
    await page.fill('#nameInput', 'Duplicate Test User');
    await page.fill('#phoneInput', '9876543210');
    await page.fill('#descriptionInput', 'Batch Dispatch Item');
    await page.fill('#baseValue', '500');

    // First submission
    await page.click('#submitRequestBtn');
    await expect(page.locator('#success-container')).toContainText('Request submitted successfully!');
    await expect(page.locator('#requestsTable tbody tr')).toHaveCount(1);

    // Attempt second submission with exact same details
    await page.click('#submitRequestBtn');

    // Assert UI / backend displays duplicate rejection message
    await expect(page.locator('#error-container')).toContainText('Duplicate request already submitted');

    // Assert request count in UI is still 1
    await expect(page.locator('#requestsTable tbody tr')).toHaveCount(1);

    // Assert direct API call also enforces duplicate rejection
    const apiRes = await request.post('http://localhost:3000/api/requests', {
      headers: {
        'X-User-Id': '1',
        'X-Role': 'User',
      },
      data: {
        resourceId: 1,
        baseValue: 500,
        name: 'Duplicate Test User',
        phone: '9876543210',
        description: 'Batch Dispatch Item',
      },
    });
    expect(apiRes.status()).toBe(400);
    const body = await apiRes.json();
    expect(body.error).toContain('Duplicate request already submitted');
  });

  test('T2: Attempt to create active-request counts 4, 5, and 6. Assert requests 4 and 5 succeed, and the 6th is rejected.', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#roleSelect', { label: 'User 1' });

    // User 1 already has 1 request from T1. Let's create requests 2 and 3:
    for (let i = 2; i <= 3; i++) {
      await page.fill('#nameInput', `User Req ${i}`);
      await page.fill('#phoneInput', `987654321${i}`);
      await page.fill('#descriptionInput', `Dispatch Item ${i}`);
      await page.fill('#baseValue', `${500 + i}`);
      await page.click('#submitRequestBtn');
      await expect(page.locator('#success-container')).toContainText('Request submitted successfully!');
    }

    // Now attempt Request 4:
    await page.fill('#nameInput', 'User Req 4');
    await page.fill('#phoneInput', '9876543214');
    await page.fill('#descriptionInput', 'Dispatch Item 4');
    await page.fill('#baseValue', '504');
    await page.click('#submitRequestBtn');
    await expect(page.locator('#success-container')).toContainText('Request submitted successfully!');

    // Now attempt Request 5:
    await page.fill('#nameInput', 'User Req 5');
    await page.fill('#phoneInput', '9876543215');
    await page.fill('#descriptionInput', 'Dispatch Item 5');
    await page.fill('#baseValue', '505');
    await page.click('#submitRequestBtn');
    await expect(page.locator('#success-container')).toContainText('Request submitted successfully!');

    // Assert requests 4 and 5 succeeded and total active requests for User 1 is 5
    await expect(page.locator('#requestsTable tbody tr')).toHaveCount(5);

    // Now attempt Request 6:
    await page.fill('#nameInput', 'User Req 6');
    await page.fill('#phoneInput', '9876543216');
    await page.fill('#descriptionInput', 'Dispatch Item 6');
    await page.fill('#baseValue', '506');
    await page.click('#submitRequestBtn');

    // Assert the 6th request is rejected by the business rule (BR1)
    await expect(page.locator('#error-container')).toContainText('Maximum of 5 active requests allowed');

    // Assert table still only contains 5 requests
    await expect(page.locator('#requestsTable tbody tr')).toHaveCount(5);
  });

  test('T3: Select the inactive resource S103. Assert the submission is rejected and system state is unchanged.', async ({ page }) => {
    await page.goto('/');

    // Switch to User 2 (who currently has 0 requests)
    await page.selectOption('#roleSelect', { label: 'User 2' });
    await expect(page.locator('#currentUserLabel')).toContainText('user2');

    // Initial state: User 2 has 0 requests
    await expect(page.locator('#requestsTable tbody tr.req-row')).toHaveCount(0);

    // Select inactive resource S103 (id 3)
    await expect(page.locator('#resourceSelect option')).toHaveCount(3);
    await page.selectOption('#resourceSelect', { value: '3' });

    await page.fill('#nameInput', 'Inactive Resource Test');
    await page.fill('#phoneInput', '9876543210');
    await page.fill('#descriptionInput', 'Attempting S103 allocation');
    await page.fill('#baseValue', '600');

    await page.click('#submitRequestBtn');

    // Assert submission is rejected with inactive resource error (BR2)
    await expect(page.locator('#error-container')).toContainText('Requested resource is inactive');

    // Assert system state is unchanged: no new row in table
    await expect(page.locator('#requestsTable tbody tr.req-row')).toHaveCount(0);

    // Verify S103 still shows capacity 0 and Inactive in dropdown
    const s103Text = await page.locator('#resourceSelect option[value="3"]').innerText();
    expect(s103Text).toContain('Inactive');
    expect(s103Text).toContain('Cap: 0');
  });

  test('T4: Test base values of 999, 1000, and 1001. Assert the applicable charge calculates strictly as Rs.50 for 999, and Rs.0 for 1000 and 1001.', async ({ page }) => {
    await page.goto('/');

    // 1. Boundary check for 999
    await page.fill('#baseValue', '999');
    await expect(page.locator('#calculatedCharge')).toHaveText('Rs. 50');
    await expect(page.locator('#previewTotal')).toHaveText('Rs. 1049');

    // 2. Boundary check for 1000
    await page.fill('#baseValue', '1000');
    await expect(page.locator('#calculatedCharge')).toHaveText('Rs. 0');
    await expect(page.locator('#previewTotal')).toHaveText('Rs. 1000');

    // 3. Boundary check for 1001
    await page.fill('#baseValue', '1001');
    await expect(page.locator('#calculatedCharge')).toHaveText('Rs. 0');
    await expect(page.locator('#previewTotal')).toHaveText('Rs. 1001');
  });

  test('T5: Complete one valid submission using S101. Assert a successful record is created and the state updates.', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#roleSelect', { label: 'User 2' });

    // Select active S101
    await expect(page.locator('#resourceSelect option')).toHaveCount(3);
    await page.selectOption('#resourceSelect', { value: '1' });

    const s101Before = await page.locator('#resourceSelect option[value="1"]').innerText();
    const capBefore = parseInt(s101Before.match(/Cap:\s*(\d+)/)?.[1] || '0', 10);

    await page.fill('#nameInput', 'Valid Applicant');
    await page.fill('#phoneInput', '9123456789');
    await page.fill('#descriptionInput', 'Expedited electronics dispatch');
    await page.fill('#baseValue', '800');

    await page.click('#submitRequestBtn');

    // Assert success
    await expect(page.locator('#success-container')).toContainText('Request submitted successfully!');

    // Assert table row created with S101, Rs. 800, Rs. 50 charge, and SUBMITTED status
    const firstRow = page.locator('#requestsTable tbody tr.req-row').first();
    await expect(firstRow).toContainText('S101');
    await expect(firstRow).toContainText('Rs. 800');
    await expect(firstRow).toContainText('Rs. 50');
    await expect(firstRow).toContainText('SUBMITTED');

    // Assert capacity of S101 decreased by exactly 1
    const s101After = await page.locator('#resourceSelect option[value="1"]').innerText();
    const capAfter = parseInt(s101After.match(/Cap:\s*(\d+)/)?.[1] || '0', 10);
    expect(capAfter).toBe(capBefore - 1);
  });

  test('T6: Submit with missing mandatory details (e.g., blank name or invalid 9-digit phone). Assert the form is rejected without partial backend updates.', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#roleSelect', { label: 'User 2' });
    await expect(page.locator('#currentUserLabel')).toContainText('user2');

    // Wait for User 2 table data to load (User 2 has 1 request created in T5)
    await expect(page.locator('#requestsTable tbody tr.req-row')).toHaveCount(1);
    const initialCount = 1;

    // 1. Missing name (blank name)
    await page.fill('#nameInput', '');
    await page.fill('#phoneInput', '9876543210');
    await page.fill('#descriptionInput', 'Some description');
    await page.fill('#baseValue', '500');

    // Trigger submission
    await page.click('#submitRequestBtn');
    await expect(page.locator('#error-container')).toContainText('Name cannot be blank');

    // 2. Invalid 9-digit phone
    await page.fill('#nameInput', 'Valid Name');
    await page.fill('#phoneInput', '987654321'); // 9 digits
    await page.click('#submitRequestBtn');
    await expect(page.locator('#error-container')).toContainText('Phone must contain exactly 10 digits');

    // Assert no partial backend updates or records created
    await expect(page.locator('#requestsTable tbody tr.req-row')).toHaveCount(initialCount);
  });

  test('T7: Mock a backend response changing resource eligibility right before clicking submit. Assert the transaction is wholly rejected.', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#roleSelect', { label: 'User 2' });
    await expect(page.locator('#currentUserLabel')).toContainText('user2');

    // Wait for User 2 table data to load
    await expect(page.locator('#requestsTable tbody tr.req-row')).toHaveCount(1);
    const initialCount = 1;

    // Fill valid form
    await page.selectOption('#resourceSelect', { value: '2' }); // S102
    await page.fill('#nameInput', 'Concurrent Test User');
    await page.fill('#phoneInput', '9876543210');
    await page.fill('#descriptionInput', 'Concurrent dispatch check');
    await page.fill('#baseValue', '500');

    // Intercept network POST to mock race condition / backend resource eligibility change
    await page.route('**/api/requests', route => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Requested resource is inactive or capacity exhausted.' })
        });
      }
      return route.continue();
    });

    await page.click('#submitRequestBtn');

    // Assert transaction is rejected and UI shows error
    await expect(page.locator('#error-container')).toContainText('Requested resource is inactive or capacity exhausted');

    // Remove route mocking
    await page.unroute('**/api/requests');

    // Assert no record was added
    await page.click('#refreshBtn');
    await expect(page.locator('#requestsTable tbody tr.req-row')).toHaveCount(initialCount);
  });

  test('T8: Log in as User 1 and attempt to trigger an admin-only status change. Assert access is denied.', async ({ page, request }) => {
    await page.goto('/');

    // User 1 tries to call PUT /api/requests/:id/status directly with an admin transition
    const userRes = await request.put('http://localhost:3000/api/requests/1/status', {
      headers: {
        'X-User-Id': '1',
        'X-Role': 'User'
      },
      data: {
        status: 'APPROVED/ASSIGNED'
      }
    });

    // Assert access is denied with 403 Forbidden
    expect(userRes.status()).toBe(403);
    const data = await userRes.json();
    expect(data.error).toContain('Forbidden: Users can only CANCEL requests');
  });

  test('T9: Log in as Admin. Attempt to skip from SUBMITTED directly to COMPLETED. Assert failure. Then advance stages validly and assert success.', async ({ page, request }) => {
    await page.goto('/');

    // Log in as Admin
    await page.selectOption('#roleSelect', { label: 'Administrator' });
    await expect(page.locator('#currentUserLabel')).toContainText('admin1');
    await expect(page.locator('#admin-portal')).toBeVisible();

    // Pick an existing request in SUBMITTED state (e.g. Req 1)
    const req1Row = page.locator('#req-row-1');
    await expect(req1Row).toBeVisible();
    await expect(req1Row).toContainText('SUBMITTED');

    // 1. Attempt to skip from SUBMITTED directly to COMPLETED via API
    const skipRes = await request.put('http://localhost:3000/api/requests/1/status', {
      headers: {
        'X-User-Id': '3',
        'X-Role': 'Administrator'
      },
      data: {
        status: 'COMPLETED'
      }
    });
    expect(skipRes.status()).toBe(400);
    const skipData = await skipRes.json();
    expect(skipData.error).toContain('Cannot skip stages');

    // 2. Advance validly: SUBMITTED -> APPROVED/ASSIGNED
    await req1Row.locator('.status-select').selectOption('APPROVED/ASSIGNED');
    await req1Row.locator('.update-btn').click();
    await expect(page.locator('#success-container')).toContainText('Request updated to APPROVED/ASSIGNED');
    await expect(req1Row).toContainText('APPROVED/ASSIGNED');

    // 3. Advance validly: APPROVED/ASSIGNED -> IN_PROGRESS
    await req1Row.locator('.status-select').selectOption('IN_PROGRESS');
    await req1Row.locator('.update-btn').click();
    await expect(page.locator('#success-container')).toContainText('Request updated to IN_PROGRESS');
    await expect(req1Row).toContainText('IN_PROGRESS');

    // 4. Advance validly: IN_PROGRESS -> COMPLETED
    await req1Row.locator('.status-select').selectOption('COMPLETED');
    await req1Row.locator('.update-btn').click();
    await expect(page.locator('#success-container')).toContainText('Request updated to COMPLETED');
    await expect(req1Row).toContainText('COMPLETED');
  });

  test('T10: Cancel an eligible request, then attempt to cancel it again. Assert the first cancellation updates the state once, and the repeat is rejected.', async ({ page, request }) => {
    await page.goto('/');

    // Log in as User 2
    await page.selectOption('#roleSelect', { label: 'User 2' });
    await expect(page.locator('#currentUserLabel')).toContainText('user2');

    // Submit a fresh eligible request
    await page.selectOption('#resourceSelect', { value: '2' }); // S102
    await page.fill('#nameInput', 'Cancel Test User');
    await page.fill('#phoneInput', '9876543210');
    await page.fill('#descriptionInput', 'To be cancelled');
    await page.fill('#baseValue', '500');
    await page.click('#submitRequestBtn');
    await expect(page.locator('#success-container')).toContainText('Request submitted successfully!');

    // Locate the newly created row
    const targetRow = page.locator('#requestsTable tbody tr.req-row').first();
    await expect(targetRow).toContainText('SUBMITTED');

    // First cancellation via UI
    await targetRow.locator('.cancel-btn').click();
    await expect(page.locator('#success-container')).toContainText('Request updated to CANCELLED');
    await expect(targetRow).toContainText('CANCELLED');

    // Extract request ID from the row (e.g. REQ-7)
    const text = await targetRow.locator('td').first().innerText();
    const reqId = text.replace('REQ-', '').trim();

    // Attempt repeat cancellation via API
    const repeatRes = await request.put(`http://localhost:3000/api/requests/${reqId}/status`, {
      headers: {
        'X-User-Id': '2',
        'X-Role': 'User'
      },
      data: {
        status: 'CANCELLED'
      }
    });

    expect(repeatRes.status()).toBe(400);
    const repeatData = await repeatRes.json();
    expect(repeatData.error).toContain('Request is already cancelled');

    // Assert the status in DOM is still CANCELLED
    await page.click('#refreshBtn');
    await expect(targetRow).toContainText('CANCELLED');
  });

  test('T11: Submit a request, trigger a page reload (simulating restart), and assert the created record still exists in the DOM.', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#roleSelect', { label: 'User 2' });

    // Create a distinctive request
    const uniqueDesc = `PersistCheck-${Date.now()}`;
    await page.selectOption('#resourceSelect', { value: '1' });
    await page.fill('#nameInput', 'Persistence User');
    await page.fill('#phoneInput', '9876543210');
    await page.fill('#descriptionInput', uniqueDesc);
    await page.fill('#baseValue', '950');
    await page.click('#submitRequestBtn');

    await expect(page.locator('#success-container')).toContainText('Request submitted successfully!');
    const createdRow = page.locator('#requestsTable tbody tr.req-row').first();
    const createdReqId = await createdRow.locator('td').first().innerText();

    // Trigger page reload (simulating restart / reload)
    await page.reload();

    // Reselect User 2
    await page.selectOption('#roleSelect', { label: 'User 2' });

    // Assert the created record still exists in the DOM after reload
    await expect(page.locator('#requestsTable')).toContainText(createdReqId);
    await expect(page.locator('#requestsTable')).toContainText('Rs. 950');
    await expect(page.locator('#requestsTable')).toContainText('Rs. 50');
  });

  test('T12: Submit a request for S101, intercept the network to mock a master data price change, and assert the historical request UI retains the original snapshot value.', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#roleSelect', { label: 'User 2' });

    // Submit request for S101
    await page.selectOption('#resourceSelect', { value: '1' }); // S101
    await page.fill('#nameInput', 'Snapshot Applicant');
    await page.fill('#phoneInput', '9876543210');
    await page.fill('#descriptionInput', 'Snapshot Test Item');
    await page.fill('#baseValue', '500');
    await page.click('#submitRequestBtn');

    await expect(page.locator('#success-container')).toContainText('Request submitted successfully!');
    const historicalRow = page.locator('#requestsTable tbody tr.req-row').first();
    await expect(historicalRow).toContainText('S101');
    await expect(historicalRow).toContainText('Rs. 500');
    await expect(historicalRow).toContainText('Rs. 50');

    // Intercept GET /api/resources to mock master data change: S101 code renamed to "S101-MODIFIED"
    await page.route('**/api/resources', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, code: 'S101-MODIFIED', capacity: 2, status: 'Active' },
          { id: 2, code: 'S102', capacity: 4, status: 'Active' },
          { id: 3, code: 'S103', capacity: 0, status: 'Inactive' }
        ])
      });
    });

    // Refresh data in UI
    await page.click('#refreshBtn');

    // Verify master data dropdown shows the modified master code
    await expect(page.locator('#resourceSelect')).toContainText('S101-MODIFIED');

    // Assert the historical request record in the table still retains the original snapshot "S101" and values
    await expect(historicalRow).toContainText('S101');
    await expect(historicalRow).not.toContainText('S101-MODIFIED');
    await expect(historicalRow).toContainText('Rs. 500');
    await expect(historicalRow).toContainText('Rs. 50');

    await page.unroute('**/api/resources');
  });

});
