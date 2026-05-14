import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format for structured logging
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  let metaStr = '';
  if (Object.keys(meta).length > 0) {
    metaStr = `\n${JSON.stringify(meta, null, 2)}`;
  }
  return `${timestamp} [${level}]: ${message}${metaStr}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  defaultMeta: { service: 'synapse-ace-agent' },
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/agent-error.log',
    level: 'error',
    format: combine(timestamp(), logFormat),
  }));

  logger.add(new winston.transports.File({
    filename: 'logs/agent-combined.log',
    format: combine(timestamp(), logFormat),
  }));
}

// Structured logging helpers
export const logWorkflowStart = (workflowId: string, description: string) => {
  logger.info(`[${workflowId}] Starting workflow: ${description}`, {
    workflowId,
    type: 'workflow_start',
  });
};

export const logWorkflowComplete = (workflowId: string, cost: bigint, durationMs: number) => {
  logger.info(`[${workflowId}] Workflow completed`, {
    workflowId,
    type: 'workflow_complete',
    cost: cost.toString(),
    durationMs,
  });
};

export const logTaskStart = (workflowId: string, taskId: string, description: string) => {
  logger.debug(`[${workflowId}] Task [${taskId}]: ${description}`, {
    workflowId,
    taskId,
    type: 'task_start',
  });
};

export const logTaskComplete = (
  workflowId: string,
  taskId: string,
  cost?: bigint,
  txHash?: string
) => {
  logger.info(`[${workflowId}] Task [${taskId}] completed`, {
    workflowId,
    taskId,
    type: 'task_complete',
    cost: cost?.toString(),
    txHash,
  });
};

export const logPayment = (
  workflowId: string,
  method: string,
  service: string,
  amount: bigint,
  txHash?: string
) => {
  logger.info(`[${workflowId}] Payment: ${service} via ${method}`, {
    workflowId,
    type: 'payment',
    service,
    method,
    amount: amount.toString(),
    txHash,
  });
};

export const logDiscovery = (workflowId: string, agentCount: number, toolCount: number) => {
  logger.info(`[${workflowId}] Tool discovery complete`, {
    workflowId,
    type: 'discovery',
    agentsFound: agentCount,
    toolsFound: toolCount,
  });
};

export const logSentinel = (workflowId: string, isValid: boolean, score: number) => {
  logger.info(`[${workflowId}] Synapse Sentinel validation`, {
    workflowId,
    type: 'sentinel',
    isValid,
    score,
  });
};

export default logger;
