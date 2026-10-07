import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const initialItems = [
  { id: 1, name: 'Buy milk', due_date: '2026-10-08', created_at: '2026-10-01 10:00:00' },
  { id: 2, name: 'Call doctor', due_date: null, created_at: '2026-10-01 11:00:00' },
];

const compareItems = (first, second) => {
  if (first.due_date === null && second.due_date !== null) return 1;
  if (first.due_date !== null && second.due_date === null) return -1;
  return first.due_date?.localeCompare(second.due_date || '') ||
    first.created_at.localeCompare(second.created_at) || first.id - second.id;
};

let items = [];

const server = setupServer(
  rest.get('/api/items', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(items));
  }),

  rest.post('/api/items', (req, res, ctx) => {
    const { name, due_date: dueDate } = req.body;
    const item = {
      id: Math.max(0, ...items.map(existingItem => existingItem.id)) + 1,
      name,
      due_date: dueDate,
      created_at: new Date().toISOString(),
    };
    items = [...items, item].sort(compareItems);
    return res(ctx.status(201), ctx.json(item));
  }),

  rest.patch('/api/items/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    const existingItem = items.find(item => item.id === id);
    if (!existingItem) {
      return res(ctx.status(404), ctx.json({ error: 'Item not found' }));
    }

    const updatedItem = { ...existingItem, ...req.body };
    items = items.map(item => item.id === id ? updatedItem : item).sort(compareItems);
    return res(ctx.status(200), ctx.json(updatedItem));
  }),

  rest.delete('/api/items/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    items = items.filter(item => item.id !== id);
    return res(ctx.status(200), ctx.json({ id }));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  items = initialItems.map(item => ({ ...item }));
});
afterAll(() => server.close());

describe('App Component', () => {
  beforeEach(() => {
    items = initialItems.map(item => ({ ...item }));
  });

  test('loads tasks and displays their due-date information', async () => {
    render(<App />);

    expect(await screen.findByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('Call doctor')).toBeInTheDocument();
    expect(screen.getByText('No due date')).toBeInTheDocument();
  });

  test('creates a task with a due date', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/Task name/), 'Submit expenses');
    fireEvent.change(screen.getByLabelText('Due date'), {
      target: { value: '2026-10-15' },
    });
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(await screen.findByText('Submit expenses')).toBeInTheDocument();
    expect(screen.getByText('Oct 15, 2026')).toBeInTheDocument();
  });

  test('edits a task name and due date', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Edit Buy milk' }));
    const dialog = screen.getByRole('dialog');
    const dialogQueries = within(dialog);
    const nameInput = dialogQueries.getByLabelText(/Task name/);
    await user.clear(nameInput);
    await user.type(nameInput, 'Buy oat milk');
    fireEvent.change(dialogQueries.getByLabelText('Due date'), {
      target: { value: '2026-10-20' },
    });
    await user.click(dialogQueries.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Buy oat milk')).toBeInTheDocument();
    expect(screen.getByText('Oct 20, 2026')).toBeInTheDocument();
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
  });

  test('deletes a task', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Delete Buy milk' }));

    await waitFor(() => {
      expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
    });
  });

  test('announces a loading error', async () => {
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Internal error' }));
      })
    );

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load tasks. Please try again.'
    );
  });

  test('shows an empty state when no tasks exist', async () => {
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    render(<App />);

    expect(await screen.findByText('No tasks yet. Add one above.')).toBeInTheDocument();
  });
});