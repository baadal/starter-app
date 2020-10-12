import { Request } from 'express';

import { getPageName } from 'starter/api/utils';
import { FooterData } from 'model/pagedata.model';

export const getFooterData = (req: Request): FooterData => {
  const resp = {
    showFooter: true,
  };

  if (getPageName(req) === 'not-found') {
    resp.showFooter = false;
  }

  return resp;
};
