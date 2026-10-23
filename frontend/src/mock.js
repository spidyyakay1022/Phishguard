// DEMO MODE ONLY. Fake analysis that runs inside the browser.
// It never contacts the backend. The UI shows a "Demo mode" badge when this is used.

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function mockAnalyze({ type, content }) {
  await wait(1200);
  const text = content.toLowerCase();
  const signals = [];
  let score = 8;

  if (/https?:\/\/\d{1,3}(\.\d{1,3}){3}/.test(text)) {
    score += 30;
    signals.push({ label: "Link uses a raw IP address", detail: "Real companies use domain names, not numbers.", kind: "fact" });
  }
  if (/(bit\.ly|tinyurl|t\.co|goo\.gl)/.test(text)) {
    score += 15;
    signals.push({ label: "Shortened link hides the real destination", detail: "The final address cannot be seen before clicking.", kind: "fact" });
  }
  if (/(login|verify|secure|update|account)[-.]/.test(text) && type === "url") {
    score += 20;
    signals.push({ label: "Domain contains words like login or verify", detail: "Attackers add these words to look official.", kind: "heuristic" });
  }
  if (/(urgent|immediately|within 24|suspended|blocked|last warning)/.test(text)) {
    score += 25;
    signals.push({ label: "Pressure and urgency in the wording", detail: "Scams try to make you act before you think.", kind: "heuristic" });
  }
  if (/(otp|password|pin|cvv|card number)/.test(text)) {
    score += 25;
    signals.push({ label: "Asks for a password, OTP or card detail", detail: "Genuine banks never ask for these by message.", kind: "heuristic" });
  }
  score = Math.min(score, 98);

  return {
    risk_score: score,
    summary:
      score >= 50
        ? "This looks like a phishing attempt. Do not click or reply."
        : "No strong phishing signs found, but stay careful.",
    signals,
    recommendations:
      score >= 50
        ? ["Do not click any link in it.", "Do not share OTPs, passwords or card details.", "Report it and delete it."]
        : ["If you did not expect it, contact the sender through their official website."],
    source: "demo",
  };
}
