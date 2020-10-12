import { Location } from 'history'; // eslint-disable-line import/no-extraneous-dependencies
import { matchPath } from 'react-router-dom';

import { parseQueryString } from 'starter/utils/lib-utils';
import { findRouteData } from 'starter/core/routes/routes-provider';
import { GenericRequest } from 'starter/core/model/common.model';

export const getGenericReqFromLocation = (location: Location): GenericRequest | null => {
  const routeData = findRouteData(location.pathname);
  if (!routeData) return null;

  const { pathname } = location;
  const url = pathname + location.search;
  const query = parseQueryString(location.search);
  const route = { path: routeData.path };

  const match = matchPath(pathname, routeData.path) || { params: {} };
  const params = { ...match.params };

  return { url, path: pathname, route, query, params };
};
