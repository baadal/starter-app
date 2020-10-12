import { GenericRequest } from 'starter/core/model/common.model';

export const getPageName = (req: GenericRequest): string | null => {
  return `${req.query?.page}` || null;
};
