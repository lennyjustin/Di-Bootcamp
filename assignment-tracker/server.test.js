import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./server.js";

async function withServer(run) {
  const pool = {
    async query() {
      return { rows: [{ result: 1 }], rowCount: 1 };
    },
  };
  const app = await createApp(pool);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

test("portal entry page is served with security headers", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(baseUrl);
    const page = await response.text();
    assert.equal(response.status, 200);
    assert.match(page, /Daymark Learning Portal/);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.ok(response.headers.get("content-security-policy"));
  });
});

test("health endpoint verifies database connectivity", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });
  });
});

test("server implementation and database schema are not publicly served", async () => {
  await withServer(async (baseUrl) => {
    const [serverResponse, schemaResponse] = await Promise.all([
      fetch(`${baseUrl}/server.js`),
      fetch(`${baseUrl}/schema.sql`),
    ]);
    assert.equal(serverResponse.status, 404);
    assert.equal(schemaResponse.status, 404);
  });
});

test("cross-origin account creation is rejected", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://attacker.example",
      },
      body: JSON.stringify({
        displayName: "Test Student",
        email: "student@example.com",
        password: "a-long-test-password",
      }),
    });
    assert.equal(response.status, 403);
    assert.match((await response.json()).error, /Cross-origin/);
  });
});
