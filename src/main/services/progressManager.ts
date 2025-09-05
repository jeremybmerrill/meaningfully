/**
 * A simple manager to track progress of various operations
 */

const FUDGE_FACTOR = 1.2; // seat of my pants guess

export class ProgressManager {
  private static instance: ProgressManager;
  private progressMap: Map<string, { progress: number; total: number; startTime: number; lastUpdateTime: number }> = new Map();
  private currentOperation: string | null = null;


  private constructor() {}

  public static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager();
    }
    return ProgressManager.instance;
  }

  public startOperation(operationId: string, total: number = 100): void {
    const now = Date.now();
    this.progressMap.set(operationId, { progress: 0, total, startTime: now, lastUpdateTime: now });
    this.currentOperation = operationId;
  }

  public updateProgress(operationId: string, progress: number): void {
    const currentProgress = this.progressMap.get(operationId);
    if (currentProgress) {
      this.progressMap.set(operationId, { 
        progress, 
        total: currentProgress.total,
        startTime: currentProgress.startTime,
        lastUpdateTime: Date.now()
      });
    }
  }

  public completeOperation(operationId: string): void {
    const currentProgress = this.progressMap.get(operationId);
    if (currentProgress) {
      this.progressMap.set(operationId, { 
        progress: currentProgress.total, 
        total: currentProgress.total,
        startTime: currentProgress.startTime,
        lastUpdateTime: Date.now()
      });
    }
    
    if (this.currentOperation === operationId) {
      this.currentOperation = null;
    }
  }

  public getCurrentProgress(): { progress: number; total: number; elapsedTimeMs: number; estimatedTimeRemainingMs: number | null } {
    if (this.currentOperation) {
      const operationData = this.progressMap.get(this.currentOperation);
      if (operationData) {
        const now = Date.now();
        const elapsedTimeMs = now - operationData.startTime;
        let estimatedTimeRemainingMs: number | null = null;
        
        // Only estimate if we have meaningful progress (at least 5% complete and some time elapsed)
        if (operationData.progress > 0.05 * operationData.total && elapsedTimeMs > 1000) {
          const progressPercentage = operationData.progress / operationData.total;
          const estimatedTotalTime = (elapsedTimeMs / progressPercentage) * FUDGE_FACTOR;
          estimatedTimeRemainingMs = Math.max(0, estimatedTotalTime - elapsedTimeMs);
        }
        
        return {
          progress: operationData.progress,
          total: operationData.total,
          elapsedTimeMs,
          estimatedTimeRemainingMs
        };
      }
    }
    return { progress: 0, total: 100, elapsedTimeMs: 0, estimatedTimeRemainingMs: null };
  }

  public clearOperation(operationId: string): void {
    this.progressMap.delete(operationId);
    if (this.currentOperation === operationId) {
      this.currentOperation = null;
    }
  }
}