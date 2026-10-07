const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/todo.page');

let todoPage;

const taskName = (testInfo, label) => `E2E-${testInfo.testId}-${label}`;

test.beforeEach(async ({ page }) => {
  todoPage = new TodoPage(page);
  await todoPage.goto();
});

test.afterEach(async ({ request }, testInfo) => {
  const prefix = `E2E-${testInfo.testId}-`;
  const response = await request.get('http://127.0.0.1:3030/api/items');
  if (!response.ok()) return;

  const items = await response.json();
  const createdItems = items.filter(item => item.name.startsWith(prefix));
  await Promise.all(createdItems.map(item => (
    request.delete(`http://127.0.0.1:3030/api/items/${item.id}`)
  )));
});

test('creates a task with a due date', async ({ page }, testInfo) => {
  const name = taskName(testInfo, 'create');
  await todoPage.addTask(name, '2027-05-18');

  await expect(todoPage.taskRow(name)).toContainText('May 18, 2027');
  await expect(page.getByRole('status')).toContainText('Task added');
});

test('orders due tasks before undated tasks and by ascending date', async ({ page }, testInfo) => {
  const laterName = taskName(testInfo, 'later');
  const undatedName = taskName(testInfo, 'undated');
  const soonerName = taskName(testInfo, 'sooner');

  await todoPage.addTask(laterName, '2027-08-20');
  await todoPage.addTask(undatedName);
  await todoPage.addTask(soonerName, '2027-08-01');

  const taskRows = await page.getByRole('listitem').allTextContents();
  expect(taskRows.findIndex(row => row.includes(soonerName)))
    .toBeLessThan(taskRows.findIndex(row => row.includes(laterName)));
  expect(taskRows.findIndex(row => row.includes(laterName)))
    .toBeLessThan(taskRows.findIndex(row => row.includes(undatedName)));
});

test('edits a task name and due date', async ({ page }, testInfo) => {
  const originalName = taskName(testInfo, 'original');
  const updatedName = taskName(testInfo, 'updated');
  await todoPage.addTask(originalName, '2027-06-01');
  await todoPage.editTask(originalName, updatedName, '2027-06-15');

  await expect(todoPage.taskRow(updatedName)).toContainText('Jun 15, 2027');
  await expect(page.getByRole('button', { name: `Edit ${updatedName}` })).toBeFocused();
});

test('deletes a task', async ({}, testInfo) => {
  const name = taskName(testInfo, 'delete');
  await todoPage.addTask(name);
  await todoPage.deleteTask(name);

  await expect(todoPage.taskRow(name)).toHaveCount(0);
});

test('shows a useful message when task creation fails', async ({ page }, testInfo) => {
  const name = taskName(testInfo, 'failed-create');
  await page.route('**/api/items', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid task' }),
      });
      return;
    }
    await route.continue();
  });

  await page.getByLabel('Task name').fill(name);
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Could not add task. Please try again.'
  );
});
