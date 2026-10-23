const API_URL = "https://phishguard-api-b4hf.onrender.com/analyze";
const scanBtn = document.getElementById("scanBtn");
const siteUrl = document.getElementById("siteUrl");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const scoreEl = document.getElementById("score");
const verdictEl = document.getElementById("verdict");
const explanationEl = document.getElementById("explanation");
const indicatorsEl = document.getElementById("indicators");
const apiNoteEl = document.getElementById("apiNote");

function showStatus(message) { statusEl.textContent = message; }
function verdictClass(score) { return score <= 30 ? "low" : score <= 70 ? "medium" : "high"; }

async function getCurrentTabUrl() {
  const tabs = await chrome.tabs.query({active:true,currentWindow:true});
  const tab = tabs && tabs[0];
  if (!tab || !tab.url) throw new Error("Current tab URL is unavailable.");
  if (!/^https?:\/\//i.test(tab.url)) throw new Error("Only regular http/https websites can be scanned.");
  return tab.url;
}

async function scan() {
  scanBtn.disabled = true;
  scanBtn.textContent = "Scanning…";
  resultEl.classList.add("hidden");
  apiNoteEl.classList.add("hidden");
  showStatus("Connecting to PhishGuard analysis engine…");

  try {
    const url = await getCurrentTabUrl();
    siteUrl.textContent = url;
    const response = await fetch(API_URL, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({text:url,type:"url"})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "The analysis service returned an error.");

    const rawScore = Number(data.risk_score);
    if (!Number.isFinite(rawScore)) throw new Error("The API response did not contain a valid risk score.");

    const details = [data.note, data.explanation, ...(Array.isArray(data.indicators) ? data.indicators.map(x => typeof x === "string" ? x : JSON.stringify(x)) : [])]
      .filter(Boolean).join(" ").toLowerCase();
    const aiUnavailable = /ai.{0,35}(unavailable|not available|failed|could not|couldn't)|(?:unavailable|not available).{0,35}ai/.test(details);

    // A rule-only result is not enough evidence to label a site low risk.
    const unverified = data.analysis_status === "unverified";
    const score = unverified ? null : Math.max(0, Math.min(100, Math.round(rawScore)));
    scoreEl.replaceChildren(document.createTextNode(score === null ? "—" : String(score)));
    const small = document.createElement("small");
    small.textContent = score === null ? "" : "/100";
    scoreEl.appendChild(small);

    verdictEl.className = "verdict " + (score === null ? "medium" : verdictClass(score));
    verdictEl.textContent = unverified ? "UNVERIFIED" : (score === null ? "INCONCLUSIVE" : (data.verdict || (score <= 30 ? "LOW RISK" : score <= 70 ? "MEDIUM RISK" : "HIGH RISK")));
    explanationEl.textContent = unverified
      ? "No live threat-intelligence check is configured, so this URL could not be verified. A low rule-based score does not mean the website is safe."
      : (score === null
        ? "PhishGuard could not complete its analysis. This website has not been verified as safe; use caution and do not enter sensitive information."
        : (data.explanation || "No explanation was returned."));

    indicatorsEl.replaceChildren();
    const indicators = Array.isArray(data.indicators) ? data.indicators : [];
    if (indicators.length) {
      indicators.slice(0,8).forEach(item => {
        const li = document.createElement("li");
        li.textContent = typeof item === "string" ? item : JSON.stringify(item);
        indicatorsEl.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = score === null ? "No reliable verdict: AI analysis did not complete." : "No common indicators were returned.";
      indicatorsEl.appendChild(li);
    }

    if (data.note) {
      apiNoteEl.textContent = data.note;
      apiNoteEl.classList.remove("hidden");
    } else if (score === null) {
      apiNoteEl.textContent = "AI check unavailable — no safety verdict can be given.";
      apiNoteEl.classList.remove("hidden");
    }

    resultEl.classList.remove("hidden");
    showStatus(unverified || score === null ? "Scan incomplete — site safety is unverified." : "Scan complete.");

    try {
      const old = await chrome.storage.local.get({scanHistory:[]});
      const history = [{url:url,risk_score:score,verdict:verdictEl.textContent,scannedAt:new Date().toISOString()},...old.scanHistory.filter(x=>x.url!==url)].slice(0,10);
      await chrome.storage.local.set({scanHistory:history});
    } catch (_) {}
  } catch (error) {
    showStatus(error.message || "Could not scan this website. Please try again.");
  } finally {
    scanBtn.disabled = false;
    scanBtn.textContent = "↻  Scan again";
  }
}

scanBtn.addEventListener("click",scan);
getCurrentTabUrl().then(url=>{siteUrl.textContent=url;}).catch(error=>{siteUrl.textContent=error.message;});