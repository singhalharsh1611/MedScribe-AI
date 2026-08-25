import { Request, Response } from 'express';
import { SUPPORTED_LANGUAGES } from '../languages';

export const getLanguages = (req: Request, res: Response) => {
  res.json(SUPPORTED_LANGUAGES);
};
