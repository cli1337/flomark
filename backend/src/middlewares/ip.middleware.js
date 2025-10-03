export const getClientIP = (req, res, next) => {
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const cfConnectingIP = req.headers['cf-connecting-ip'];
  
  let clientIP = null;
  
  if (forwarded) {
    clientIP = forwarded.split(',')[0].trim();
  } else if (realIP) {
    clientIP = realIP;
  } else if (cfConnectingIP) {
    clientIP = cfConnectingIP;
  } else {
    clientIP = req.connection?.remoteAddress || 
               req.socket?.remoteAddress || 
               req.ip;
  }
  
  if (clientIP && clientIP.startsWith('::ffff:')) {
    clientIP = clientIP.substring(7);
  }
  
  req.clientIP = clientIP;
  
  next();
};
