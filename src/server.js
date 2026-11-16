import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { generateReply } from "./services/ai.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "32kb" }));
app.use(express.static("public"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later."
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    application: "DCO AI",
    version: "0.1.0"
  });
});

app.post("/api/chat", apiLimiter, async (req, res) => {
  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Please provide conversation messages."
      });
    }

    if (messages.length > 20) {
      return res.status(400).json({
        error: "Maximum 20 messages per request."
      });
    }

    const reply = await generateReply(messages);

    return res.json({
      success: true,
      reply
    });
  } catch (error) {
    console.error("DCO AI chat error:", error.message);

    return res.status(500).json({
      error: "DCO AI could not process your request. Please try again."
    });
  }
});

app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  res.status(400).json({
    error: "Invalid request."
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("--------------------------------");
  console.log("       DCO AI SERVER");
  console.log("--------------------------------");
  console.log("Status: ONLINE");
  console.log(`Port: ${PORT}`);
  console.log("Application: DCO Cyber Solutions");
  console.log("--------------------------------");
});
