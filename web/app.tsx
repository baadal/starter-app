import React from 'react';
import { Global } from '@emotion/react';

import { AppPropsRoot } from 'starter/core/model/common.model';
import App from 'starter/web/app';
import Layout from 'components/layout';

const globalStyles: any = {
  body: {},
};

const MyApp: React.FC<AppPropsRoot> = props => (
  <>
    <Global styles={globalStyles} />
    <Layout {...props}>
      <App {...props} />
    </Layout>
  </>
);

export default MyApp;
