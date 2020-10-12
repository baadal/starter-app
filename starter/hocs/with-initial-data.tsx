import React from 'react';
import { withRouter } from 'react-router-dom';
import { Subscription } from 'rxjs';
import { Location } from 'history'; // eslint-disable-line import/no-extraneous-dependencies
import deepEqual from 'deep-equal';

import { authSessionHandler } from 'starter/utils/auth-info';
import { addAuthChannelHandler, removeAuthChannelHandler } from 'starter/utils/auth-channel';
import { extractInitialData } from 'starter/core/services/common.service';
import { getInitialData } from 'starter/core/services/pages.service';
import { getGenericReqFromLocation } from 'starter/utils/ssr-utils';
import { PropsRoot } from 'starter/core/model/common.model';
import withAuthInfo from './with-auth-info';

function withInitialData<T = any>(Component: React.ComponentType<any>): React.ComponentType<any> {
  class WithInitialData extends React.Component<WithInitialDataProps, WithInitialDataState> {
    private isSsr = true;
    private initialDataSubscription: Subscription;

    constructor(props: WithInitialDataProps) {
      super(props);

      addAuthChannelHandler(authSessionHandler);

      const initialData = extractInitialData(this.props);
      if (!initialData) {
        this.isSsr = false;
      } else {
        const { pageData, headerData, footerData } = initialData;
        this.state = { pageData, headerData, footerData };
      }
    }

    componentDidMount() {
      if (this.isSsr) {
        this.isSsr = false;
      } else {
        // Is this branch ever executed?
        this.loadPageData(this.props.location);
      }
    }

    componentDidUpdate(prevProps: WithInitialDataProps, _prevState: WithInitialDataState) {
      const cond1 = prevProps.location.pathname !== this.props.location.pathname;
      const cond2 = (prevProps.authInfo && !this.props.authInfo) || (!prevProps.authInfo && this.props.authInfo);

      // Don't use cond3 as (prevProps.authInfo !== this.props.authInfo) since for the first setAuthInfo() call in
      // with-auth-info.tsx:extractAuthInfo() might set the same authInfo again as a different object

      if (cond1 || cond2 || !deepEqual(prevProps.authInfo, this.props.authInfo)) {
        this.loadPageData(this.props.location);
      }
    }

    componentWillUnmount() {
      removeAuthChannelHandler(authSessionHandler);
    }

    loadPageData(location: Location) {
      const req = getGenericReqFromLocation(location);

      this.initialDataSubscription?.unsubscribe();
      this.initialDataSubscription = getInitialData<T>(req).subscribe(initialData => {
        if (initialData) {
          const { pageData, headerData, footerData } = initialData;
          this.setState({ pageData, headerData, footerData });
        }
      });
    }

    resetInitialData() {
      this.setState({ pageData: undefined });
    }

    render() {
      return (
        <Component
          {...this.props}
          pageData={this.state?.pageData}
          headerData={this.state?.headerData}
          footerData={this.state?.footerData}
          resetInitialData={this.resetInitialData.bind(this)} // eslint-disable-line react/jsx-no-bind
        />
      );
    }
  }

  interface WithInitialDataProps extends PropsRoot {}

  interface WithInitialDataState {
    pageData?: T | null;
    headerData?: any;
    footerData?: any;
  }

  return withAuthInfo(withRouter(WithInitialData));
}

export default withInitialData;
