# 🛡️ PhishGuard AI — Intelligent Phishing Detection System

**An AI-powered cybersecurity solution to identify suspicious messages, malicious links, and potential phishing attempts.**

[🌐 Live Website](https://phishguard-akay10.vercel.app/) · [⚙️ Backend API](https://phishguard-api-b4hf.onrender.com/) · [📖 API Documentation](https://phishguard-api-b4hf.onrender.com/docs) · [💻 GitHub Repository](https://github.com/spidyyakay1022/Phishguard)

---

## 📌 About the Project

PhishGuard AI is a cybersecurity project developed to help users recognize potentially fraudulent messages and suspicious links before interacting with them.

Phishing attacks often impersonate trusted organizations, banks, services, or individuals to trick users into clicking malicious links or sharing sensitive information. Many users struggle to identify these threats because phishing messages can appear convincing and legitimate.

PhishGuard combines **rule-based detection and AI-assisted analysis** to evaluate submitted content, generate a risk score, and explain potential warning signs in understandable language.

The goal is to make phishing awareness more accessible by turning technical security signals into practical, user-friendly insights.

## 🎯 Problem Statement

Phishing remains a significant cybersecurity challenge because attackers use social engineering, urgency, impersonation, and deceptive URLs to manipulate users.

Common challenges include:

- Difficulty distinguishing legitimate messages from fraudulent ones.
- Suspicious URLs disguised as trusted websites.
- Messages creating urgency through threats, account suspension, or fake rewards.
- Limited understanding of technical phishing indicators.
- Lack of accessible tools that explain *why* a message may be suspicious.

### Our Solution

PhishGuard AI provides a simple web interface where users can submit a message or link for analysis. The system evaluates potential warning signs and presents a risk score, a verdict, explanations, and recommended safety steps when available.

## ✨ Key Features

### 1. Message Analysis
- Analyze suspicious SMS messages, emails, and other text.
- Identify potential phishing indicators, such as urgency, suspicious requests, and deceptive language.
- Present findings in a user-friendly format.

### 2. Suspicious URL Analysis
- Submit a URL or text containing links for analysis.
- Extract URLs from submitted text.
- Display available URL-related warnings and indicators.

### 3. AI-Assisted Detection
- Combines rule-based checks with an AI analysis layer.
- Uses the Google Gemini API when configured for AI-assisted analysis.
- Converts analysis results into understandable explanations.

### 4. Risk Scoring
- Generates a risk score from 0 to 100.
- Displays the result through a visual risk indicator.
- Helps users understand the potential severity of the detected warning signs.

### 5. Explainable Results
- Presents a verdict and summary of the analysis.
- Displays detected indicators and their details.
- Provides safety recommendations when returned by the backend.

### 6. Web-Based Interface
- Simple interface for submitting content.
- Dedicated analysis and results pages.
- Responsive frontend built with React and Vite.

> **Important:** PhishGuard is a warning and awareness tool, not a guarantee that content is safe or malicious. Users should independently verify suspicious requests through official channels.

## 🧠 How It Works

1. **User Input:** The user submits a suspicious message or URL through the website.
2. **Frontend Processing:** The React frontend validates the input and sends a request to the backend.
3. **API Request:** The FastAPI backend receives the submitted content through the `/analyze` endpoint.
4. **Rule-Based Analysis:** The detection layer checks for suspicious patterns and indicators.
5. **AI-Assisted Analysis:** When configured and available, the Gemini-powered layer contributes additional analysis.
6. **Result Generation:** The backend returns a risk score, verdict, explanation, and available findings.
7. **Result Display:** The frontend presents the response in an understandable format so users can make more informed decisions.

## 🏗️ System Architecture

```text
                  USER
                   |
                   v
          React + Vite Frontend
                   |
                   v
              POST /analyze
                   |
                   v
           FastAPI Backend
                   |
             +-----+-----+
             |           |
             v           v
        Rule Engine   Gemini AI
             |           |
             +-----+-----+
                   |
                   v
          Analysis and Risk Score
                   |
                   v
        Findings + Explanation
                   |
                   v
           Results Dashboard
```

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React |
| Build Tool | Vite |
| Styling | CSS and Tailwind CSS tooling |
| Backend | Python, FastAPI |
| API Server | Uvicorn |
| Data Validation | Pydantic |
| AI Integration | Google Gemini API |
| Rule-Based Detection | Python |
| HTTP Requests | Fetch API / HTTPX |
| Environment Configuration | python-dotenv |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Version Control | Git and GitHub |

## 🤖 AI and Detection Sources

PhishGuard uses multiple analysis layers:

**1. Rule-Based Detection**

Python-based detection rules examine submitted content for suspicious patterns. These checks provide a structured first layer of analysis.

**2. Google Gemini API**

The backend includes a Gemini integration for AI-assisted analysis when the required API credentials and configuration are available.

**3. User-Submitted Content**

The system analyzes the message or URL supplied by the user. Its conclusions depend on the submitted content, the implemented detection rules, and the availability of the configured AI service.

### Data Sources and Limitations

The current implementation uses rule-based analysis and a configured AI API. We do not claim that the deployed version has a continuously updated phishing-domain database, live threat-intelligence feeds, or a verified external malware-scanning integration unless these are independently implemented and tested.

AI-generated results may be incorrect. A low risk score does not prove that a message or link is safe.

## 🔗 Project Links

| Resource | Link |
|---|---|
| Live Website | https://phishguard-akay10.vercel.app/ |
| Analysis Page | https://phishguard-akay10.vercel.app/analyze |
| Backend Service | https://phishguard-api-b4hf.onrender.com/ |
| Health Check | https://phishguard-api-b4hf.onrender.com/health |
| API Documentation | https://phishguard-api-b4hf.onrender.com/docs |
| GitHub Repository | https://github.com/spidyyakay1022/Phishguard |

The backend health endpoint can be used to check whether the service is responding. On Render's free tier, the first request after inactivity may take longer because the service can spin down.

## 🚀 Running the Project Locally

### Prerequisites

- Python 3.11 or a compatible Python version
- Node.js and npm
- Git
- A Google Gemini API key if AI-assisted analysis is required

### 1. Clone the Repository

```bash
git clone https://github.com/spidyyakay1022/Phishguard.git
cd Phishguard
```

### 2. Set Up the Backend

```bash
cd backend/AIModel
python -m venv .venv
```

Activate the virtual environment.

**Windows:**
```powershell
.venv\Scripts\Activate.ps1
```

**Linux / macOS:**
```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file using `.env.example` as a reference. Add your own Gemini API key if required by your configuration:

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Do not commit your real `.env` file or expose API keys publicly.

Start the backend:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend should be available at:

- API: http://127.0.0.1:8000
- Health Check: http://127.0.0.1:8000/health
- API Docs: http://127.0.0.1:8000/docs

### 3. Set Up the Frontend

Open a second terminal from the project root:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal.

For local frontend-to-backend communication, configure the appropriate API base URL and CORS settings for your development environment. For production, use the deployed backend URL or the API configuration supported by your hosting setup.

### 4. Production Build

```bash
npm run build
```

Vite generates the production frontend build in the `dist` directory.

## 🔌 API Reference

### Health Check

```http
GET /health
```

Used to check whether the backend is responding.

### Analyze Content

```http
POST /analyze
Content-Type: application/json
```

Example request:

```json
{
  "text": "Your account will be suspended. Click here to verify your details.",
  "type": "message"
}
```

The API accepts submitted text and an optional analysis type. The deployed implementation may return fields including:

- `risk_score`
- `verdict`
- `explanation`
- `indicators`
- `url_analysis`
- `safe_steps`

The exact response fields depend on the backend implementation and the result of the analysis.

## 🔐 Security and Privacy Considerations

- Never submit passwords, OTPs, authentication tokens, or other private credentials.
- Keep API keys in environment variables and never commit them to GitHub.
- Configure CORS to allow only the intended frontend origins.
- Treat analysis results as advisory rather than definitive.
- Verify financial, account-security, and identity-related requests directly with the relevant organization.
- Avoid opening suspicious links while investigating them.

## 🔮 Future Scope

Potential improvements for future versions include:

- Integration with reputable threat-intelligence and URL reputation services.
- Improved URL parsing and domain-risk checks.
- More robust phishing detection evaluation using labelled datasets.
- Better support for screenshot and QR-code analysis, subject to complete implementation and testing.
- Multilingual analysis and accessibility improvements.
- Performance improvements and monitoring for the hosted API.
- Automated test coverage and documented precision, recall, and false-positive rates.

These are proposed improvements, not claims that every feature is already implemented.

## 👥 Team Members

Developed collaboratively by:

1. **Aksshay Trepathi**
2. **Prakhar Sharma**
3. **Aanya Sharma**
4. **Janya Nagar**

## 🏆 Hackathon Project

PhishGuard AI was developed as a collaborative cybersecurity project focused on making phishing detection more accessible and understandable.

The project brings together frontend development, backend API engineering, rule-based detection, and AI-assisted analysis to demonstrate how intelligent tools can support everyday cybersecurity awareness.

## 📄 License

No license is specified here. Add a `LICENSE` file if you intend to publish the project under a particular open-source license.

---

**PhishGuard AI — Think Before You Click. Stay Alert. Stay Secure.**
