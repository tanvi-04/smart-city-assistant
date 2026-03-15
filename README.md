# 🏙️ SmartCity Assistant

**A Tech-Noir AI Assistant for navigating Chicago.**

A Next.js-powered generative AI chatbot providing real-time transit data, commute forecasting, and rideshare estimations through an intuitive interface.

## Overview
SmartCity Assistant is a robust web application tailored for urban commuters in Chicago. By acting as a sophisticated conversational agent, it removes the friction of jumping between different transit apps. It leverages Google's Gemini Flash model to interpret natural language queries, fetch live data from the Chicago Transit Authority (CTA), and present actionable, pointwise advice. The system behaves like a knowledgeable concierge, answering questions, tracking buses, and predicting the best time to leave.

## Why This Project Matters
Modern urban navigation often requires juggling multiple apps for train times, bus tracking, and rideshare pricing. This project consolidates those needs into a single AI-driven interface, ensuring users get the right information exactly when they need it. It showcases:

- **Conversational Context**: Interpreting vague user queries and prompting for specifics (like Stop IDs).
- **Tool-Augmented Generation (Agentic AI)**: Giving the LLM the ability to securely call real-world APIs to fetch live data rather than hallucinating.
- **Micro-Interactions & UI**: Utilizing Framer Motion and modern CSS to craft a "Tech-Noir" aesthetic that feels responsive and alive.
- **Client-Server Separation**: Secure backend execution of API requests while maintaining a snappy client-side chat interface.

## System Architecture
The following text illustrates the flow of a user request through the application:
1. **User Input**: User asks a question (e.g., "When is the next Red line train?") in the React frontend.
2. **API Route**: The Next.js API route receives the message history.
3. **Intent Parsing**: Gemini AI analyzes the prompt and decides which tool to call.
4. **Tool Execution**: The Next.js backend executes `getTrainArrivals(map_id)`.
5. **Data Synthesis**: The fetched live CTA data is sent back to Gemini.
6. **Response Rendering**: Gemini synthesizes a natural language response, streamed back to the user interface and rendered beautifully with Markdown.

## Features
- **Advanced AI Chatbot**: Powered by Google Generative AI (Gemini Flash), acting as a high-intelligence AI agent with a distinct tech-noir persona.
- **Real-time CTA Integration**: 
  - Live **Bus Arrivals** & Predictions mapping to specific routes.
  - Live **Train Arrivals** filtered by color lines.
  - Active **Service Alerts** & Delay tracking.
- **Smart Commute Forecasts**: Analyzes transit patterns and real-time delays to suggest an optimal, mathematically sound departure window.
- **Simulated Rideshare Fares**: Provides approximate Uber/rideshare fare estimates instantly between major Chicago landmarks.
- **Stunning Tech-Noir UI**: Built with Tailwind CSS v4 and Framer Motion for glassmorphism, glowing focus states, and seamless modal transitions.
- **User Profiles**: Tracks arbitrary "gamified" elements like trips taken, CO2 saved, and "Eco-Warrior Elite" achievements.
- **Data Management**: One-click resetting of conversation history and system statuses via a custom settings modal.

## Tech Stack
- **Framework**: Next.js 14/15, React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **AI Integration**: `@google/generative-ai` SDK
- **Markdown Parsing**: `react-markdown` & `remark-gfm`

## How to Run

Clone the Repository:
```bash
git clone https://github.com/yourusername/smart-city-assistant.git
cd smart-city-assistant
```

Install Dependencies:
```bash
npm install
```

Set Environment Variables:
Create a `.env.local` file and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the Development Server:
```bash
npm run dev
```

Interact via Browser: Open [http://localhost:3000](http://localhost:3000) and type your request.

## Example Commands
```text
# Retrieve bus arrivals
> "When is the next bus arriving at stop 1459?"

# Check commute forecast
> "What's the best time to leave for the Red Line at station 41420?"

# Estimate rideshare costs
> "How much is an Uber from Navy Pier to O'Hare?"

# Check system health
> "Are there any service alerts on the Blue Line?"
```

## Demo: Sample Run
```text
User: "I need to catch a bus at stop 1234."
Assistant iterating tools: [getBusArrivals]
Assistant rendering: 
"Here are the upcoming arrivals for Stop 1234:
- Route 66 Westbound: 4 minutes
- Route 66 Westbound: 15 minutes
The system shows no active delays. You have exactly 4 minutes. Proceed."
```

## Scenarios Tested & Edge Cases Handled
- **Missing Information**: If a user asks for a bus without a Stop ID, the AI gracefully requests the specific ID.
- **API Rate Limiting (429 Error)**: Custom error boundaries elegantly inform the user to slow down if the Gemini free limit is reached.
- **Invalid API Key (404 Error)**: Immediate detection of missing or invalid keys, displaying clear instructions to the user on how to resolve it.
- **System Outages**: If the CTA API fails or times out, the tool catches the error and the Agent responds safely instead of crashing the app.

## Project Structure
```text
smart-city-assistant/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main chat interface and UI components
│   │   ├── layout.tsx        # App root layout
│   │   └── globals.css       # Tailwind entry and custom CSS vars
│   ├── lib/
│   │   ├── agent.ts          # Core Gemini agent orchestration
│   │   ├── cta-api.ts        # CTA API fetchers
│   │   ├── transit-utils.ts  # Forecasting algorithms
│   │   └── rideshare-utils.ts# Simulated Uber pricing
├── public/                   # Static assets
├── .env.local                # Environment setup (not tracked)
├── package.json              # Project dependencies
└── README.md                 # Detailed documentation
```

## Future Improvements
- **Live Location Tracking**: Integrate the browser Geolocation API to auto-fetch the closest Stop IDs.
- **Multi-City Support**: Abstraction of the transit API layer to support NYC's MTA or London's TfL.
- **Persistent Storage**: Save user profiles, achievements, and chat history to a database like PostgreSQL or MongoDB instead of just component state.
- **Voice Input**: Add speech-to-text integration for hands-free navigation.

## Known Limitations
- **Simulated Rideshares**: The Uber pricing is simulated for demonstration purposes and does not reflect live Uber API data.
- **Stateless Chat**: Chat history is erased upon page refresh since it relies entirely on React state.
- **Hard-coded Personas**: The tech-noir persona is hard-coded into the system prompt and cannot currently be toggled in settings.
