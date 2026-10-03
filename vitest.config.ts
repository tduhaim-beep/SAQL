import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/{domain,application,integration,security}/**/*.spec.ts"],
    coverage: { reporter: ["text", "json-summary"] },
  },
});
