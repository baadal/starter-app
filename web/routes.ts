import { loadable } from 'starter/utils/loadable';
import { RouteData } from 'starter/core/model/route.model';
import NotFound from 'pages/not-found/not-found.page';

export const routesList: RouteData[] = [
  {
    path: '/about',
    component: loadable(() => import(/* webpackChunkName: "about" */ 'pages/about/about.page')),
  },
  {
    path: '/',
    component: loadable(() => import(/* webpackChunkName: "home" */ 'pages/home/home.page')),
  },
  {
    name: 'not-found',
    path: '/*',
    component: NotFound,
  },
];
