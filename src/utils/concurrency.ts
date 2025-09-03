/**
 * Concurrency limiter to control the number of concurrent operations
 */
export class ConcurrencyLimiter {
  private maxConcurrent: number;
  private running = 0;
  private queue: Array<() => void> = [];
  
  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }
  
  /**
   * Schedule a task to run, respecting the concurrency limit
   */
  async schedule<T>(task: () => Promise<T>): Promise<T> {
    // If we're at the limit, wait for a slot to open up
    if (this.running >= this.maxConcurrent) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
    
    this.running++;
    try {
      return await task();
    } finally {
      this.running--;
      // If there are tasks waiting, let the next one run
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) next();
      }
    }
  }
  
  /**
   * Get the current number of running tasks
   */
  getRunningCount(): number {
    return this.running;
  }
  
  /**
   * Get the current number of queued tasks
   */
  getQueuedCount(): number {
    return this.queue.length;
  }
}

// Create a default limiter for prefetching operations
export const prefetchLimiter = new ConcurrencyLimiter(5); // Limit to 5 concurrent requests