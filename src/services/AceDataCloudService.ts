import { AceDataCloud, type OpenAIChatMessage } from '@acedatacloud/sdk';
import { createX402PaymentHandler, type NetworkType } from '@acedatacloud/x402-client';
import type { AcedataChatCompletionParams, AcedataImageParams, AcedataSearchParams, AcedataTaskHandle } from '../types';
import { ConfigManager } from '../utils/config';
import { logger, logPayment } from '../utils/logger';

export class AceDataCloudService {
  private client: AceDataCloud | null = null;
  private initializing: Promise<void> | null = null;

  constructor(private config: ConfigManager) {}

  async initialize(): Promise<void> {
    if (this.client) return;

    // Create singleton promise to avoid race conditions
    if (!this.initializing) {
      this.initializing = this.doInitialize();
    }
    await this.initializing;
  }

  private async doInitialize(): Promise<void> {
    try {
      // Simulation mode: skip actual client initialization
      if (this.config.isSimulation()) {
        logger.info('AceDataCloud service initialized (SIMULATION MODE)');
        return;
      }

      const apiToken = this.config.getAcedataApiToken();
      const x402Network = this.config.getAcedataX402Network() as NetworkType;
      const facilitatorUrl = this.config.getFacilitatorUrl();

      logger.info('Initializing AceDataCloud client', {
        network: x402Network,
        facilitatorUrl,
      });

      // Create x402 payment handler
      const paymentHandler = createX402PaymentHandler({
        network: x402Network,
        facilitator: facilitatorUrl,
        // In production, you'd use actual wallet signers
        // For this demo, we use a dummy signer that logs
        signer: this.createDummySigner(),
      });

      // Create AceDataCloud client
      this.client = new AceDataCloud({
        apiToken,
        paymentHandler,
        timeout: 300000, // 5 minutes
        maxRetries: 3,
      });

      logger.info('AceDataCloud service initialized');
    } catch (error) {
      logger.error('Failed to initialize AceDataCloud service', { error });
      throw error;
    }
  }

  private createDummySigner() {
    // In a real implementation, this would be a solana/ethereum wallet signer
    // For demo purposes, create a mock that returns empty headers
    // IMPORTANT: Replace with actual wallet implementation for mainnet
    return {
      getPaymentHeaders: async (paymentRequirements: unknown) => {
        logger.debug('x402 payment header generation requested', { paymentRequirements });
        // This is where the actual x402 signing happens
        // For the bounty, integrate with actual Solana wallet
        return {
          headers: {
            'X-Payment': 'mock-x402-payment-header',
          },
        };
      },
    };
  }

  getClient(): AceDataCloud {
    if (!this.client) {
      throw new Error('AceDataCloud service not initialized. Call initialize() first.');
    }
    return this.client;
  }

  /**
   * Generate chat completion using OpenAI/Claude/Gemini
   */
  async generateChatCompletion(params: AcedataChatCompletionParams): Promise<string> {
    await this.initialize();

    // Simulation mode: return mock response
    if (this.config.isSimulation()) {
      logger.info('SIMULATION: Chat completion (mock)', { model: params.model });
      return `[SIMULATED] This is a mock response from ${params.model}. In real mode, this would be generated AI content based on your request.`;
    }

    const client = this.getClient();

    logger.info('Generating chat completion', {
      model: params.model,
      messageCount: params.messages.length,
    });

    try {
      const response = await client.openai.chat.completions.create(params);
      const content = response.choices[0]?.message?.content || '';

      logPayment(
        'chat',
        'x402_solana',
        `openai:${params.model}`,
        BigInt(0), // Cost will be determined from response headers
        undefined
      );

      return content;
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      logger.error('Chat completion failed', {
        error: err.message || 'Unknown error',
        model: params.model,
      });
      throw new Error(`Chat completion failed: ${err.message || 'Unknown error'}`);
    }
  }

  /**
   * Generate image using Flux/Midjourney
   */
  async generateImage(params: AcedataImageParams): Promise<string> {
    await this.initialize();

    // Simulation mode: return mock URL
    if (this.config.isSimulation()) {
      logger.info('SIMULATION: Image generation (mock)', {
        provider: params.provider,
        prompt: params.prompt.substring(0, 50),
      });
      return 'https://simulated-image.example.com/generated.png';
    }

    const client = this.getClient();
    const provider = params.provider || 'nano-banana';

    logger.info('Generating image', { provider, prompt: params.prompt.substring(0, 50) });

    try {
      const task = await client.images.generate({
        prompt: params.prompt,
        width: params.width,
        height: params.height,
      });

      // Poll for completion (image generation is async)
      const result = await task.wait();

      logger.info('Image generated', {
        provider,
        imageUrl: result.image_url?.substring(0, 50) + '...',
      });

      return result.image_url || '';
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      logger.error('Image generation failed', {
        error: err.message || 'Unknown error',
        provider,
      });
      throw new Error(`Image generation failed: ${err.message || 'Unknown error'}`);
    }
  }

  /**
   * Perform web search using Google SERP
   */
  async performSearch(params: AcedataSearchParams): Promise<Array<{ title: string; link: string; snippet: string }>> {
    await this.initialize();

    // Simulation mode: return mock search results
    if (this.config.isSimulation()) {
      logger.info('SIMULATION: Web search (mock)', { query: params.query });
      return [
        {
          title: `Simulated Result 1 for "${params.query}"`,
          link: 'https://example.com/result1',
          snippet: 'This is a mock search result...',
        },
        {
          title: `Simulated Result 2 for "${params.query}"`,
          link: 'https://example.com/result2',
          snippet: 'Another mock result...',
        },
        {
          title: `Simulated Result 3 for "${params.query}"`,
          link: 'https://example.com/result3',
          snippet: 'Third mock result...',
        },
      ];
    }

    const client = this.getClient();

    logger.info('Performing web search', { query: params.query });

    try {
      const results = await client.search.google({
        query: params.query,
        num: params.numResults || 5,
      });

      logger.info('Search completed', { resultCount: results.length });

      return results.map(r => ({
        title: r.title || '',
        link: r.link || '',
        snippet: r.snippet || '',
      }));
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      logger.error('Search failed', {
        error: err.message || 'Unknown error',
        query: params.query,
      });
      throw new Error(`Search failed: ${err.message || 'Unknown error'}`);
    }
  }

  /**
   * Generate music using Suno
   */
  async generateMusic(prompt: string, durationSeconds = 30): Promise<string> {
    await this.initialize();
    const client = this.getClient();

    logger.info('Generating music', { prompt: prompt.substring(0, 50), duration: durationSeconds });

    try {
      const task = await client.audio.generate({
        prompt,
        durationSeconds,
      });

      const result = await task.wait();
      return result.audio_url || '';
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      logger.error('Music generation failed', { error: err.message });
      throw new Error(`Music generation failed: ${err.message || 'Unknown error'}`);
    }
  }

  /**
   * Generate video using Luma/Sora
   */
  async generateVideo(prompt: string, provider: 'luma' | 'sora' = 'luma'): Promise<string> {
    await this.initialize();
    const client = this.getClient();

    logger.info('Generating video', { provider, prompt: prompt.substring(0, 50) });

    try {
      const task = await client.video.generate({
        prompt,
        provider,
      });

      const result = await task.wait();
      return result.video_url || '';
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      logger.error('Video generation failed', { error: err.message });
      throw new Error(`Video generation failed: ${err.message || 'Unknown error'}`);
    }
  }

  /**
   * Execute multiple service calls in parallel
   */
  async executeBatch<T>(
    calls: Array<() => Promise<T>>
  ): Promise<Array<{ success: boolean; result?: T; error?: string }>> {
    logger.info(`Executing batch of ${calls.length} service calls`);

    const results = await Promise.allSettled(
      calls.map(call => call())
    );

    return results.map((result, idx) => {
      if (result.status === 'fulfilled') {
        return { success: true, result: result.value };
      } else {
        const reason = result.reason as Error;
        logger.warn(`Batch call ${idx} failed: ${reason.message}`);
        return { success: false, error: reason.message };
      }
    });
  }

  /**
   * Check service health
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.initialize();
      // Simple ping - list available models
      this.client?.openai?.models?.list();
      return true;
    } catch {
      return false;
    }
  }
}
