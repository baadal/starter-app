import { Request } from 'express';

export const isLocalhost = (req: Request) => {
  return req.hostname === 'localhost' || req.hostname === '127.0.0.1';
};

export const currentOrigin = (req: Request) => {
  const hostFwd = req.get('X-Forwarded-Host');
  const protoFwd = req.get('X-Forwarded-Proto');
  if (hostFwd && protoFwd) {
    return `${protoFwd}://${hostFwd}`;
  }
  return `${req.protocol}://${req.get('Host')}`;
};
