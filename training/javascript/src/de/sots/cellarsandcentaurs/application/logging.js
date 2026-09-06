import winston from "winston";

export const LOG_LEVEL = "info";

winston.configure({ level: LOG_LEVEL });
