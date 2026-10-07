const { expect } = require('@playwright/test');

class TodoPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Your tasks' })).toBeVisible();
  }

  taskRow(name) {
    return this.page.getByRole('listitem').filter({ hasText: name });
  }

  async addTask(name, dueDate) {
    await this.page.getByLabel('Task name').fill(name);
    if (dueDate) {
      await this.page.getByLabel('Due date').fill(dueDate);
    }
    await this.page.getByRole('button', { name: 'Add task' }).click();
    await expect(this.page.getByText('Task added')).toBeVisible();
    await expect(this.taskRow(name)).toBeVisible();
  }

  async editTask(name, updatedName, dueDate) {
    await this.taskRow(name).getByRole('button', { name: `Edit ${name}` }).click();
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel('Task name').fill(updatedName);
    await dialog.getByLabel('Due date').fill(dueDate);
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(this.taskRow(updatedName)).toBeVisible();
  }

  async deleteTask(name) {
    const row = this.taskRow(name);
    await row.getByRole('button', { name: `Delete ${name}` }).click();
    await expect(row).toHaveCount(0);
  }
}

module.exports = { TodoPage };
