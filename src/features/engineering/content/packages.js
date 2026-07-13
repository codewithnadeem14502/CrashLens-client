// Real runtime dependencies, verified against each repo's package.json.
// Links point at the package's public npm registry page.

const npm = (name) => `https://www.npmjs.com/package/${name}`;

export const PACKAGES = [
  { name: "crashlens", url: npm("crashlens"), note: "This product's own SDK" },
  { name: "react", url: npm("react") },
  { name: "react-router-dom", url: npm("react-router-dom") },
  { name: "tailwindcss", url: npm("tailwindcss") },
  { name: "@radix-ui/react-dialog", url: npm("@radix-ui/react-dialog"), note: "+ 23 more @radix-ui packages" },
  { name: "recharts", url: npm("recharts") },
  { name: "react-icons", url: npm("react-icons") },
  { name: "axios", url: npm("axios") },
  { name: "express", url: npm("express") },
  { name: "mongoose", url: npm("mongoose") },
  { name: "amqplib", url: npm("amqplib") },
  { name: "jsonwebtoken", url: npm("jsonwebtoken") },
  { name: "joi", url: npm("joi") },
  { name: "helmet", url: npm("helmet") },
  { name: "winston", url: npm("winston") },
  { name: "ioredis", url: npm("ioredis") },
  { name: "express-rate-limit", url: npm("express-rate-limit") },
  { name: "cron-parser", url: npm("cron-parser") },
  { name: "nodemailer", url: npm("nodemailer") },
  { name: "vitest", url: npm("vitest") },
];
