const request = require('supertest');
const app = require('../server');

describe('Server Health Check', () => {
  test('GET /api/health should return server status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  test('GET /api/nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Route not found');
  });
});

describe('Authentication Routes', () => {
  test('GET /api/auth/google should redirect to Google OAuth', async () => {
    // This will fail without proper Google OAuth setup, but we can test the route exists
    const response = await request(app)
      .get('/api/auth/google')
      .expect(302); // Redirect status

    expect(response.headers.location).toContain('accounts.google.com');
  });

  test('GET /api/auth/me without token should return 401', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .expect(401);

    expect(response.body).toHaveProperty('message', 'Access token required');
  });
});

describe('Recipe Routes', () => {
  test('GET /api/recipes should return recipes list', async () => {
    const response = await request(app)
      .get('/api/recipes')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('recipes');
    expect(response.body).toHaveProperty('pagination');
  });

  test('POST /api/recipes/generate without auth should return 401', async () => {
    const response = await request(app)
      .post('/api/recipes/generate')
      .send({ ingredients: ['chicken', 'rice'] })
      .expect(401);

    expect(response.body).toHaveProperty('message', 'Access token required');
  });
});
