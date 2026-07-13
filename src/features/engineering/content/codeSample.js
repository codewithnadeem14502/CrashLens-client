// Verified against crashLens-sdk/README.md and src/index.js's actual
// module.exports - every method shown here is a real public API export
// (init, requestHandler, errorHandler, startTransaction, setupGlobalHandlers).

export const CODE_SAMPLES = [
  {
    label: "Install",
    lang: "sh",
    code: `npm install crashlens`,
  },
  {
    label: "Report errors from an Express app",
    lang: "js",
    code: `const express = require("express");
const crashlens = require("crashlens");

crashlens.init({
  dsn: process.env.CRASHLENS_DSN,
  environment: process.env.CRASHLENS_ENVIRONMENT || "production",
});

crashlens.setupGlobalHandlers();

const app = express();
app.use(crashlens.requestHandler());

app.get("/orders/:id", async (req, res) => {
  const transaction = crashlens.startTransaction({
    method: req.method,
    route: "/orders/:id",
  });

  const order = await db.orders.findById(req.params.id);

  res.json(order);
  await transaction.finish({ statusCode: res.statusCode });
});

app.use(crashlens.errorHandler());
app.listen(4000);`,
  },
];
