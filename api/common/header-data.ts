import { Request } from 'express';

import { getPageName } from 'starter/api/utils';
import { HeaderData } from 'model/pagedata.model';

export const getHeaderData = (req: Request): HeaderData => {
  const resp = {
    showHeader: true,
  };

  if (getPageName(req) === 'not-found') {
    resp.showHeader = false;
  }

  return resp;
};
