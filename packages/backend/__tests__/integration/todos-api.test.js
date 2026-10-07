const request = require('supertest');
const { app, db } = require('../../src/app');

const createItem = async (item) => {
  const response = await request(app)
    .post('/api/items')
    .send(item)
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  return response.body;
};

beforeEach(() => {
  db.prepare('DELETE FROM items').run();
});

afterAll(() => {
  db.close();
});

describe('TODO item API integration', () => {
  test('creates items with optional due dates and sorts dates before undated items', async () => {
    const undatedItem = await createItem({ name: 'Undated task' });
    const laterItem = await createItem({ name: 'Later task', due_date: '2027-02-01' });
    const firstSameDateItem = await createItem({
      name: 'First same-date task',
      due_date: '2027-01-15',
    });
    const earlierItem = await createItem({ name: 'Earlier task', due_date: '2027-01-01' });
    const secondSameDateItem = await createItem({
      name: 'Second same-date task',
      due_date: '2027-01-15',
    });

    const response = await request(app).get('/api/items');

    expect(response.status).toBe(200);
    expect(response.body.map(item => item.id)).toEqual([
      earlierItem.id,
      firstSameDateItem.id,
      secondSameDateItem.id,
      laterItem.id,
      undatedItem.id,
    ]);
  });

  test('rejects impossible due dates when creating items', async () => {
    const response = await request(app)
      .post('/api/items')
      .send({ name: 'Invalid date task', due_date: '2027-02-30' });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/valid YYYY-MM-DD date/);
  });

  test('updates an item and allows clearing its due date', async () => {
    const item = await createItem({
      name: 'Original task',
      due_date: '2027-03-01',
    });

    const response = await request(app)
      .patch(`/api/items/${item.id}`)
      .send({ name: 'Updated task', due_date: null });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: item.id,
      name: 'Updated task',
      due_date: null,
    });
  });

  test('preserves omitted fields in a partial update', async () => {
    const item = await createItem({
      name: 'Keep this date',
      due_date: '2027-04-12',
    });

    const response = await request(app)
      .patch(`/api/items/${item.id}`)
      .send({ name: 'Renamed task' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Renamed task');
    expect(response.body.due_date).toBe('2027-04-12');
  });

  test('validates update payloads and missing items', async () => {
    const item = await createItem({ name: 'Task to update' });

    const emptyUpdate = await request(app).patch(`/api/items/${item.id}`).send({});
    expect(emptyUpdate.status).toBe(400);

    const invalidDate = await request(app)
      .patch(`/api/items/${item.id}`)
      .send({ due_date: 'not-a-date' });
    expect(invalidDate.status).toBe(400);

    const missingItem = await request(app)
      .patch('/api/items/999999')
      .send({ name: 'Missing task' });
    expect(missingItem.status).toBe(404);
  });
});
