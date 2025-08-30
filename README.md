# VC-Ready Specs Service

A microservice for analyzing pitch decks with AI to provide investment readiness assessments.

## Features

- PDF pitch deck analysis using OpenAI
- Customizable investor profiles with boosts, caps, and red flags
- Secure API with key authentication
- Callback support for asynchronous processing

## API Endpoints

### POST /v1/analyses

Submits a pitch deck for analysis.

**Request:**

```json
{
  "analysis_id": "uuid",
  "file_url": "https://example.com/pitch-deck.pdf",
  "audience_profile": "seed_vc",
  "sector": "fintech",
  "region": "north_america",
  "model_version": "gpt-4",
  "callback_url": "https://your-app.com/webhook",
  "callback_secret": "your_secret_here"
}
```

**Response:**

```json
{
  "message": "Analysis request accepted",
  "analysis_id": "uuid"
}
```

### GET /v1/analyses/:id

Retrieves the results of a previously submitted analysis.

**Response:**

```json
{
  "analysis_id": "uuid",
  "status": "completed",
  "created_at": "2023-11-20T12:34:56Z",
  "summary": "...",
  "company_name": "...",
  "scores": { ... },
  "analysis": { ... },
  "red_flags": [ ... ],
  "strengths": [ ... ],
  "investment_recommendation": "Consider",
  "next_steps": [ ... ],
  "profile_applied": "seed_vc"
}
```

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```
OPENAI_API_KEY=your_openai_api_key_here
API_KEY_BUBBLE=your_bubble_api_key_here
CALLBACK_SECRET=your_callback_secret_here
PORT=8080
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run start
```

## Configuration

### Investor Profiles

Customize investor profiles in `config/profiles.yaml` to adjust analysis results based on investor type.

### Prompts

The system prompt and user template for OpenAI can be customized in the `prompts` directory.

## Security

- All API endpoints require the `X-Api-Key` header for authentication
- Callbacks include a secret for verification

## Error Handling

The service includes error handling for:
- Invalid requests
- PDF download failures
- OpenAI API errors
- Callback failures

## License

Proprietary - All rights reserved