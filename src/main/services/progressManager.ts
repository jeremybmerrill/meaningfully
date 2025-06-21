/**
 * A simple manager to track progress of various operations
 */
export class ProgressManager {
  private static instance: ProgressManager;
  private progressMap: Map<string, { progress: number; total: number }> = new Map();
  private currentOperation: string | null = null;

  private constructor() {}

  public static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager();
    }
    return ProgressManager.instance;
  }

  public startOperation(operationId: string, total: number = 100): void {
    this.progressMap.set(operationId, { progress: 0, total });
    this.currentOperation = operationId;
  }

  public updateProgress(operationId: string, progress: number): void {
    const currentProgress = this.progressMap.get(operationId);
    if (currentProgress) {
      this.progressMap.set(operationId, { 
        progress, 
        total: currentProgress.total 
      });
    }
  }

  public completeOperation(operationId: string): void {
    const currentProgress = this.progressMap.get(operationId);
    if (currentProgress) {
      this.progressMap.set(operationId, { 
        progress: currentProgress.total, 
        total: currentProgress.total 
      });
    }
    
    if (this.currentOperation === operationId) {
      this.currentOperation = null;
    }
  }

  public getCurrentProgress(): { progress: number; total: number } {
    if (this.currentOperation) {
      return this.progressMap.get(this.currentOperation) || { progress: 0, total: 100 };
    }
    return { progress: 0, total: 100 };
  }

  public clearOperation(operationId: string): void {
    this.progressMap.delete(operationId);
    if (this.currentOperation === operationId) {
      this.currentOperation = null;
    }
  }
}