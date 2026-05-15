const BASE = "http://localhost:8080/api";

export const api = {
  // OCR
  processOcr: (image, targetChar) =>
    fetch(`${BASE}/ocr/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image, targetChar }),
    }).then((r) => r.json()),

  // Progress
  getProgress: (sessionId) =>
    fetch(`${BASE}/progress/${sessionId}`).then((r) => r.json()),

  markCorrect: (sessionId, charType, charValue) =>
    fetch(`${BASE}/progress/correct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, charType, charValue }),
    }).then((r) => r.json()),

  markWrong: (sessionId) =>
    fetch(`${BASE}/progress/wrong`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).then((r) => r.json()),

  // Test
  evaluateTest: (answers) =>
    fetch(`${BASE}/test/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    }).then((r) => r.json()),

  generateTestQueue: (alphabetsDone, numbersDone, count = 10) =>
    fetch(`${BASE}/test/generate-queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alphabetsDone, numbersDone, count }),
    }).then((r) => r.json()),
};
