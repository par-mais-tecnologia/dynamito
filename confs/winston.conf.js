import winston from 'winston';

// Log level7
winston.level = 'debug';
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  timestamp: true,
  colorize: true
});
