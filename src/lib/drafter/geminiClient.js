// lib/drafter/geminiClient.js
import { GoogleAuth } from 'google-auth-library';
import path from 'path';

class GeminiClientManager {
  constructor() {
    this.lastCallTime = null;
    this.stats = {
      total: 0,
      paidCalls: 0,
      errors: 0,
      lastError: null,
      totalTokens: 0,
      estimatedCostUSD: 0,
      configured: {
        vertexAI: false
      }
    };

    this.initializeVertexAI();
  }

  initializeVertexAI() {
    if (!process.env.GOOGLE_CLOUD_PROJECT) {
      throw new Error('❌ GOOGLE_CLOUD_PROJECT not set in .env.local');
    }

    try {
      const credentialsPath = path.join(process.cwd(), 'google-cloud-credentials.json');
      
      this.auth = new GoogleAuth({
        keyFilename: credentialsPath,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
      
      this.projectId = process.env.GOOGLE_CLOUD_PROJECT;
      this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
      this.stats.configured.vertexAI = true;
      
      console.log('✅ Vertex AI configured (PAID - Google Cloud)');
      console.log(`   Project: ${this.projectId}`);
      console.log(`   Location: ${this.location}`);
      console.log(`   Model: gemini-2.0-flash (Production)`);
    } catch (error) {
      console.error('❌ Vertex AI init failed:', error.message);
      throw new Error('Vertex AI configuration failed');
    }
  }

  async generateContent(prompt, options = {}) {
    if (!this.stats.configured.vertexAI) {
      throw new Error('Vertex AI not configured');
    }

    // OPTIMIZED RATE LIMITING for gemini-2.0-flash (60 RPM quota)
    // 1 second delay = 60 requests/min (safe, uses full quota)
    if (this.lastCallTime) {
      const timeSinceLastCall = Date.now() - this.lastCallTime;
      const minDelay = 1000; // 1 second (was 5 seconds!)
      
      if (timeSinceLastCall < minDelay) {
        const waitTime = minDelay - timeSinceLastCall;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    this.lastCallTime = Date.now();

    this.stats.total++;
    const model = options.model || 'gemini-2.0-flash';

    try {
      console.log(`🚀 Using Vertex AI: ${model}`);
      const result = await this.callVertexAI(prompt, model, options);
      this.stats.paidCalls++;
      
      // Track costs
      this.updateCostEstimate(result.tokensUsed);
      
      return result;
    } catch (error) {
      console.error('❌ Vertex AI error:', error.message);
      this.stats.errors++;
      this.stats.lastError = error.message;
      
      // Better error messages
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        throw new Error('Rate limit reached. Please wait a moment and try again.');
      } else if (error.message?.includes('403')) {
        throw new Error('Authentication failed. Check your Google Cloud credentials.');
      } else if (error.message?.includes('404')) {
        throw new Error(`Model ${model} not found. Make sure it's enabled in your project.`);
      }
      
      throw error;
    }
  }

  async callVertexAI(prompt, model, options) {
    const client = await this.auth.getClient();
    const accessToken = await client.getAccessToken();

    const endpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${model}:generateContent`;

    let contents;
    if (Array.isArray(prompt)) {
      // Handle multipart content (images, PDFs, etc.)
      contents = [{
        role: 'user',
        parts: prompt.map(part => {
          if (typeof part === 'string') {
            return { text: part };
          } else if (part.inlineData) {
            return { inline_data: part.inlineData };
          }
          return part;
        })
      }];
    } else {
      // Simple text prompt
      contents = [{
        role: 'user',
        parts: [{ text: prompt }]
      }];
    }

    const requestBody = {
      contents,
      generationConfig: options.generationConfig || {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 8192,
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || response.statusText;
      throw new Error(`Vertex AI error (${response.status}): ${errorMsg}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No response from Vertex AI');
    }

    const text = data.candidates[0].content.parts[0].text;
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;
    this.stats.totalTokens += tokensUsed;

    return {
      text,
      source: 'Vertex AI (Google Cloud)',
      isPaid: true,
      tokensUsed,
      model
    };
  }

  updateCostEstimate(tokens) {
    // Gemini 2.0 Flash pricing (approximate)
    // Input: $0.075 per 1M tokens
    // Output: $0.30 per 1M tokens
    // Average: ~$0.15 per 1M tokens
    const costPerToken = 0.15 / 1000000;
    this.stats.estimatedCostUSD += tokens * costPerToken;
  }

  getStats() {
    const creditsUsed = this.stats.estimatedCostUSD;
    const creditsRemaining = 500 - creditsUsed;
    const estimatedDocumentsRemaining = Math.floor(creditsRemaining / 0.01); // ~$0.01 per doc

    return {
      ...this.stats,
      creditsUsed: creditsUsed.toFixed(4),
      creditsRemaining: creditsRemaining.toFixed(2),
      estimatedDocumentsRemaining,
      averageTokensPerCall: this.stats.total > 0 ? Math.round(this.stats.totalTokens / this.stats.total) : 0
    };
  }
}

let geminiClientInstance = null;

export function getGeminiClient() {
  if (!geminiClientInstance) {
    geminiClientInstance = new GeminiClientManager();
  }
  return geminiClientInstance;
}

export { GeminiClientManager };