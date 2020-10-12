import { Express } from 'express';

import { routesList } from 'web/routes';
import { routeHandler } from 'starter/core/routes/routes-handler';

const allRoutes = (app: Express) => {
  // app.get(routes.about.path, routeHandler);
  // app.get(routes.home.path, routeHandler);
  // app.get(routes.default.path, routeHandler);

  routesList.forEach(data => app.get(data.path, routeHandler));
  // routesList.forEach(data => app.get(data.path, routeHandler(data)));
};

export default allRoutes;
