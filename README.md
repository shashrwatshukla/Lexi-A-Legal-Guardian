
# Lexi - A Legal Guardian


![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)![Google AI](https://img.shields.io/badge/Google_AI-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)



![Lexi Demo](https://user-images.githubusercontent.com/74038190/238353480-219bcc70-f5dc-466b-9a60-29653d8e8433.gif)

## 🚀 Transform Complex Legal Documents into Clear, Actionable Insights


## 📖 About Lexi

Lexi is an AI-powered platform that demystifies complex legal documents using Google's Gemini AI. It transforms impenetrable legal jargon into clear, understandable language, empowering users to make informed decisions about contracts, agreements, and terms of service.

> **"Legal documents shouldn't require a law degree to understand."**

## 🎯 Explore Lexi Live!

[![Try Lexi Now](https://img.shields.io/badge/Explore_Lexi_Live-8B5CF6?style=for-the-badge&logo=vercel&logoColor=white)](https://asklexi.vercel.app)

**Experience the power of AI-driven legal analysis firsthand!**

[![Website Preview](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif)](https://asklexi.vercel.app)


## ✨ Key Features

| | Feature | Description |
| :---: | :--- | :--- |
| 🤖 | **AI-Powered Analysis** | Advanced NLP to break down complex legal clauses |
| 📊 | **Visual Risk Assessment** | Interactive meters and charts showing contract risks |
| 🔍 | **Clause-by-Clause Breakdown** | Detailed explanations of each contract section |
| 💬 | **Interactive Chatbot** | Ask questions about your document in plain language |
| 🛡️ | **Privacy-First** | Documents are processed securely and never stored |


## 🚀 Quick Start

### Prerequisites

- Node.js 16.8+ 
- npm or yarn
- Google Gemini API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/shashrwatshukla/Lexi-A-Legal-Guardian.git

# Navigate to project directory
cd Lexi-A-Legal-Guardian

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Add your API keys to .env.local
# Get API key from: https://makersuite.google.com/app/apikey

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view Lexi in your browser.

## 📁 Project Structure

```
lexi-legal-guardian/
├── public/                 # Static assets
│   ├── media/
│   │   └── encryption-bg.webm
│   └── favicon.ico
├── src/
│   ├── app/               # Next.js app router
│   │   ├── api/           # API routes
│   │   │   └── document-process/
│   │   │       ┗ route.js
│   │   ├── auth/          # Authentication
│   │   ├── globals.css    # Global styles
│   │   ├── layout.jsx     # Root layout
│   │   └── page.jsx       # Home page
│   ├── components/        # React components
│   │   ├── chatbot/       # Chatbot components
│   │   ├── features/      # Feature components
│   │   │   ├── ActionItems.jsx
│   │   │   ├── ClauseSeverityCards.jsx
│   │   │   ├── ComparativeCharts.jsx
│   │   │   ├── DocumentHeatmap.jsx
│   │   │   ├── FinalVerdictBar.jsx
│   │   │   ├── ObligationsTimeline.jsx
│   │   │   ├── PositiveClausesCarousel.jsx
│   │   │   ├── RiskMeter.jsx
│   │   │   └── RiskRadarChart.jsx
│   │   ├── ui/            # UI components
│   │   ├── AnalysisResults.jsx
│   │   ├── StarsCanvas.jsx
│   │   └── UploadForm.jsx
│   └── lib/               # Utility libraries
│       ├── documentContext.js
│       ├── documentParser.js
│       ├── firebase.js
│       ├── legalAnalyzer.js
│       ├── legalPatterns.js
│       └── utils.js
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
└── package.json           # Dependencies and scripts
```

## 🎯 How It Works

![Lexi Workflow](https://user-images.githubusercontent.com/74038190/212750147-854a394f-fee9-4080-9770-78a4b7ece53f.gif)

1. **Upload** your legal document (PDF, DOCX, or text)
2. **AI Analysis** processes the document using Google Gemini
3. **Visual Breakdown** shows risks, obligations, and key clauses
4. **Interactive Chat** lets you ask questions about specific sections
5. **Export** your analysis for future reference

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Chatbot API Key
NEXT_PUBLIC_GEMINI_CHATBOT_API_KEY=your_chatbot_api_key_here
```

### Getting API Keys

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

## 🛡️ Security & Privacy

![Security](https://user-images.githubusercontent.com/74038190/212748842-9fcbad5b-6173-4175-8a61-521f3dbb7514.gif)


- **End-to-End Encryption**: All documents are encrypted during processing
- **Secure API Calls**: All requests are made through secure channels
- **Privacy Compliance**: Designed with GDPR and privacy regulations in mind

## 📊 Supported Document Types

- ✅ Rental Agreements
- ✅ Loan Contracts  
- ✅ Terms of Service
- ✅ Privacy Policies
- ✅ Employment Contracts
- ✅ Service Agreements
- ✅ NDAs and Confidentiality Agreements

## 🤝 Contributing
![Contributing](https://user-images.githubusercontent.com/74038190/216649426-0c2ee152-84d8-4707-85c4-27a378d2f78a.gif)


We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🆘 Support

- 📧 **Email**: shashrwatshukla@gmail.com

- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/lexi/issues)


## 🙏 Acknowledgments

- **Google Gemini AI** for powerful natural language processing
- **Next.js** for the robust React framework
- **Tailwind CSS** for beautiful, responsive styling
- **The open-source community** for invaluable tools and libraries

---



### **Legal documents don't have to be scary anymore!**

[![Try Lexi Now](https://img.shields.io/badge/Try_Lexi_Now-FREE-8B5CF6?style=for-the-badge&logo=google-chrome&logoColor=white)](https://asklexi.vercel.app)
[![Star on GitHub](https://img.shields.io/badge/⭐_Star_on_GitHub-000000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shashrwatshukla/Lexi-A-Legal-Guardian/stargazers)
[![Fork Repository](https://img.shields.io/badge/Fork_Repository-00AA00?style=for-the-badge&logo=git&logoColor=white)](https://github.com/shashrwatshukla/Lexi-A-Legal-Guardian/fork)
