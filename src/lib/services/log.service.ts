interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, unknown>;
}

export class LogService {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  /**
   * Log an informational message
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    this.log("info", message, metadata);
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log("warn", message, metadata);
  }

  /**
   * Log an error message
   */
  error(message: string, metadata?: Record<string, unknown>): void {
    this.log("error", message, metadata);
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }

  private log(level: LogEntry["level"], message: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
    };

    this.logs.push(entry);

    // Keep logs at a reasonable size
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In production, you might want to send logs to a service like Sentry or DataDog
    if (level === "error") {
      console.error(message, metadata);
    } else if (level === "warn") {
      console.warn(message, metadata);
    } else {
      console.log(message, metadata);
    }
  }
}

export const logService = new LogService();
