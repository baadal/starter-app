import { Request, Response } from 'express';

import { getInitialData } from 'starter/core/services/pages.service';
import { sendResponse } from 'starter/ssr/send-response';

export const routeHandler = (req: Request, res: Response) => {
  const instanceAvailZone = process.env.INSTANCE_AVAIL_ZONE;
  const instanceRegion = process.env.INSTANCE_REGION;
  const instanceRegionName = process.env.INSTANCE_REGION_NAME;

  if (instanceAvailZone) res.setHeader('x-baadal-avail-zone', instanceAvailZone);
  if (instanceRegion) res.setHeader('x-baadal-region', instanceRegion);
  if (instanceRegionName) res.setHeader('x-baadal-region-name', instanceRegionName);

  const initialData$ = getInitialData(req, res);
  sendResponse(req, res, initialData$);
};
