# PhishGuard AI

**An AI-assisted phishing detection and cybersecurity awareness platform.**

## 1. Problem Statement

Phishing messages often use urgency, fake KYC requests, suspicious links, and impersonation to trick people into sharing sensitive information. Many users struggle to identify these warning signs.

PhishGuard AI aims to help users assess suspicious messages and understand why they may be unsafe.

## 2. Our Solution

PhishGuard AI analyses message content, identifies common phishing indicators, assigns a risk score, and provides understandable warnings and safety recommendations.

## 3. Key Features

- **Risk Scoring:** Provides a risk score from 0 to 100.
- **Phishing Indicators:** Identifies warning signs such as urgency, fake KYC requests, and impersonation.
- **Suspicious URL Checks:** Flags URL warning signs, including insecure HTTP connections and risky domain patterns.
- **Plain-Language Explanations:** Explains why a message may be suspicious.
- **Safety Recommendations:** Suggests precautions users can take.
- **Web Interface:** Provides an interface for submitting content for analysis.

*Note: AI-assisted analysis depends on successful AI service availability. Rule-based checks may be used when AI analysis is unavailable.*

## 4. Technology Stack

- Frontend: React, Vite
- Backend: Python, FastAPI
- API Communication: HTTP and JSON
- Deployment: Vercel (frontend), Render (backend)
- Version Control: Git and GitHub

## 5. Project Links

- **Live Prototype:** https://phishguard-akay10.vercel.app/
- **Backend API:** https://phishguard-api-b4hf.onrender.com
- **API Documentation:** https://phishguard-api-b4hf.onrender.com/docs

## 6. Local Setup Instructions

### Backend

1. Install Python 3.
2. Open a terminal in the `backend/AIModel` directory.
3. Install the dependencies:

   `pip install -r requirements.txt`

4. Configure any required environment variables using the provided example file.
5. Start the server:

   `uvicorn main:app --reload`

6. Open `http://127.0.0.1:8000/docs` to inspect the API.

### Frontend

1. Install Node.js and npm.
2. Open a terminal in the repository root.
3. Install dependencies:

   `npm install`

4. Configure the backend API URL according to the frontend configuration.
5. Start the development server:

   `npm run dev`

Use the local frontend URL printed in the terminal to open the application.

## 7. Environment Variables

Store secrets in environment variables rather than committing them to GitHub.

- `GEMINI_API_KEY` — AI service key, if required by the backend.
- `GEMINI_MODEL` — AI model configuration, if required.
- Frontend API URL — configure according to the frontend's API client.

Use placeholder values in example files. Never commit real API keys, passwords, or tokens.

## 8. Target Users

- Students and general internet users
- People who receive suspicious messages or links
- Users seeking basic phishing awareness and safety guidance

## 9. Future Roadmap

- Improve AI analysis reliability and error handling.
- Expand URL and sender reputation checks.
- Improve multilingual phishing detection.
- Add more comprehensive testing and security checks.
- Improve accessibility and mobile usability.

## 10. Disclaimer

PhishGuard AI is an assistance tool, not a guarantee that a message or URL is safe. Users should independently verify unexpected requests through official channels.

## 11. Team
Team name : Tech NOVA
Team members : Aksshay Trepathi, Prakhar Sharma,Aanya Sharma, Janya Nagar
