import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./server.js";

async function withServer(run, pool = {
    async query() {
      return { rows: [{ result: 1 }], rowCount: 1 };
    },
  }) {
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

function lessonPool() {
  const token = "a".repeat(64);
  const calls = [];
  const pool = {
    token,
    calls,
    async query(sql, values = []) {
      calls.push({ sql, values });
      if (sql.includes("FROM sessions s")) {
        return {
          rows: [{
            id: "7",
            email: "teacher@example.com",
            role: "teacher",
            display_name: "Test Teacher",
            must_change_password: false,
          }],
          rowCount: 1,
        };
      }
      if (sql === "SELECT teacher_id FROM courses WHERE id = $1") {
        return { rows: [{ teacher_id: "7" }], rowCount: 1 };
      }
      if (sql.startsWith("SELECT COALESCE(MAX(sort_order)")) {
        return { rows: [{ next_order: 0 }], rowCount: 1 };
      }
      if (sql.includes("INSERT INTO lessons")) {
        return {
          rows: [{
            id: "12",
            title: values[1],
            content: values[2],
            resource_url: values[3],
            sort_order: values[4],
          }],
          rowCount: 1,
        };
      }
      if (sql === "SELECT 1") return { rows: [{ result: 1 }], rowCount: 1 };
      throw new Error(`Unexpected test query: ${sql}`);
    },
  };
  return pool;
}

function lessonRequest(baseUrl, token, body) {
  return fetch(`${baseUrl}/api/courses/23/lessons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: baseUrl,
      Cookie: `daymark_session=${token}`,
    },
    body: JSON.stringify(body),
  });
}

test("portal entry page is served with security headers", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(baseUrl);
    const page = await response.text();
    assert.equal(response.status, 200);
    assert.match(page, /Daymark Learning Portal/);
    assert.match(page, /Technology &amp; IT/);
    assert.match(page, /Engineering &amp; Construction/);
    assert.match(page, /Health &amp; Life Sciences/);
    assert.match(page, /Education &amp; Sciences/);
    assert.match(page, /Creative &amp; Professional Skills/);
    assert.match(page, /data-auth-role="teacher"/);
    assert.match(page, /id="teacher-site-title"/);
    assert.match(page, /Teacher accounts are issued by your portal administrator/);
    assert.match(page, /daymark-learning-hero\.png/);
    assert.match(page, /id="home-navigation"/);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.ok(response.headers.get("content-security-policy"));
  });
});

test("homepage serves its student-study hero image", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/daymark-learning-hero.png`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /image\/png/);
    assert.deepEqual(
      [...new Uint8Array(await response.arrayBuffer()).slice(0, 8)],
      [137, 80, 78, 71, 13, 10, 26, 10],
    );
  });
});

test("lesson resources must use HTTPS", async () => {
  const pool = lessonPool();
  await withServer(async (baseUrl) => {
    const response = await lessonRequest(baseUrl, "a".repeat(64), {
      title: "Course introduction",
      content: "Read these notes before starting.",
      resourceUrl: "http://example.com/resource",
    });
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /HTTPS/);
    assert.equal(pool.calls.some(({ sql }) => sql.includes("INSERT INTO lessons")), false);
  }, pool);
});

test("teachers can save ordered course lessons with HTTPS resources", async () => {
  const pool = lessonPool();
  await withServer(async (baseUrl) => {
    const response = await lessonRequest(baseUrl, "a".repeat(64), {
      title: "Course introduction",
      content: "Read these notes before starting.",
      resourceUrl: "https://example.com/resource",
    });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), {
      lesson: {
        id: "12",
        title: "Course introduction",
        content: "Read these notes before starting.",
        resource_url: "https://example.com/resource",
        sort_order: 0,
      },
    });
    assert.equal(pool.calls.some(({ sql }) => sql.includes("INSERT INTO lessons")), true);
  }, pool);
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
