import { Response } from 'express';

export const sendServerError = (
  res: Response,
  code: string,
  publicMessage: string,
  error: unknown
) => {
  console.error(`[${code}]`, error);
  return res.status(500).json({ code, error: publicMessage });
};
