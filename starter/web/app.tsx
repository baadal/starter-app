import React from 'react';
import { Route, Switch, withRouter, matchPath } from 'react-router-dom';
import { UnregisterCallback } from 'history'; // eslint-disable-line import/no-extraneous-dependencies

import { Loader } from 'starter/ui';
import { routesProvider } from 'starter/core/routes/routes-provider';
import { AppPropsRoot } from 'starter/core/model/common.model';
import logger from 'starter/utils/logger';
import * as web from 'web/routes';

const webExports = Object.keys(web);
const webExportsAllowed = ['routesList', 'initClient'];
webExports.forEach(exp => {
  if (!webExportsAllowed.includes(exp)) {
    logger.warn(`[WARN] Unexpected export \`${exp}\` from web/routes.ts`);
  }
});

const cleanupInitialDataTags = (seoData: any) => {
  const description = seoData?.description || '';
  const meta = seoData?.meta || {};

  if (description) {
    const metaNode = document.querySelector('meta[name="description"]');
    metaNode?.parentNode?.removeChild(metaNode);
  }
  Object.keys(meta).forEach(key => {
    const metaNode = document.querySelector(`meta[name="${key}"]`);
    metaNode?.parentNode?.removeChild(metaNode);
  });

  const node = document.getElementById('__STARTER_DATA__');
  node?.parentNode?.removeChild(node);
};

const matchedRoute = (pathname: string) => {
  const matches: string[] = [];
  web.routesList.forEach(data => {
    const match = matchPath(pathname, data.path);
    if (match?.isExact) matches.push(match.path);
  });
  return matches[0];
};

class App extends React.Component<AppProps, AppState> {
  private unregisterCallback: UnregisterCallback | null = null;

  componentDidMount() {
    this.unregisterCallback = this.props.history.listen(location => {
      if (location.pathname !== this.props.location.pathname) {
        cleanupInitialDataTags(this.props.pageData?.seo);
        const routeCurr = matchedRoute(this.props.location.pathname);
        const routeNext = matchedRoute(location.pathname);
        // Do not reset initialData if curr & next urls match the same (parameterized) route
        if (routeCurr !== routeNext) {
          this.props.resetInitialData();
        }
      }
    });

    // initClient method exported from web side
    (web as any).initClient?.();
  }

  componentDidUpdate(prevProps: AppProps) {
    if (this.props.pageData && this.props.pageData !== prevProps.pageData) {
      const { title, description, meta } = this.props.pageData.seo || {};
      if (title) {
        document.title = title;
      } else {
        logger.warn('SEO: page title missing!');
      }
      const headNode = document.querySelector('head');
      if (description) {
        const elem = document.createElement('meta');
        elem?.setAttribute('name', 'description');
        elem?.setAttribute('content', description);
        headNode?.appendChild(elem);
      } else {
        logger.warn('SEO: meta description missing!');
      }
      Object.entries<string>(meta || {}).forEach(([key, value]) => {
        const elem = document.createElement('meta');
        elem?.setAttribute('name', key);
        elem?.setAttribute('content', value);
        headNode?.appendChild(elem);
      });
    }
  }

  componentWillUnmount() {
    if (this.unregisterCallback) this.unregisterCallback();
  }

  render() {
    const { pageData, authInfo } = this.props;
    if (pageData === undefined) return <Loader />;

    const routes = routesProvider();

    return (
      <>
        <Switch>
          {routes.map(route => (
            <Route
              path={route.path}
              exact={route.exact}
              render={(props: any) => <route.component {...props} pageData={pageData} authInfo={authInfo} />}
              key={route.path}
            />
          ))}
        </Switch>
      </>
    );
  }
}

export interface AppProps extends AppPropsRoot {}

export interface AppState {}

export default withRouter(App);
