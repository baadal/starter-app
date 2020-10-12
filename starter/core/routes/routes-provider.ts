import { matchPath } from 'react-router-dom';

import { routesList } from 'web/routes';
import { Route, RouteData } from '../model/route.model';

export const getRoute = (routeData: RouteData): Route => ({
  name: routeData.name || '',
  path: routeData.path,
  exact: true,
  component: routeData.component,
});

export const findRouteData = (pathname: string) => {
  const routeData = routesList.find(data => {
    const match = matchPath(pathname, data.path);
    return !!match?.isExact;
  });
  return routeData;
};

export const findRoute = (pathname: string) => {
  const routeData = findRouteData(pathname);
  if (routeData) {
    return getRoute(routeData);
  }
  return null;
};

export const routesProvider = () => {
  return routesList.map(data => getRoute(data));
};
