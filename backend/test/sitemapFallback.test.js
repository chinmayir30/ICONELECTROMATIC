import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import prisma from "../src/db.js";
import { createSitemapHandler } from "../src/routes/sitemap.js";

after(async () => {
  await prisma.$disconnect();
});

test("sitemap serves the root public fallback when the database query fails", async () => {
  const fallbackPath = fileURLToPath(
    new URL("../../public/sitemap.fallback.xml", import.meta.url)
  );
  const expectedXml = await readFile(fallbackPath, "utf8");
  const handler = createSitemapHandler({
    prismaClient: {
      product: {
        findMany: async () => {
          throw new Error("Database unavailable");
        },
      },
    },
  });
  const headers = {};
  let statusCode;
  let responseBody;
  const response = {
    setHeader(name, value) {
      headers[name] = value;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    send(body) {
      responseBody = body;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  await handler({}, response);

  assert.equal(statusCode, 200);
  assert.match(headers["Content-Type"], /application\/xml/);
  assert.match(headers["Cache-Control"], /max-age=60/);
  assert.equal(responseBody, expectedXml);
});
