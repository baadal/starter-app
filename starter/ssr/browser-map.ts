import { StringIndexable } from 'starter/core/model/common.model';

const browserMap: StringIndexable<MapItem> = {
  'Android WebView': {
    caniuse: 'android',
    uaparse: 'Android Browser',
  },
  'Baidu Browser': {
    caniuse: 'baidu',
    uaparse: 'Baidu',
  },
  'Chrome for Android': {
    caniuse: ['and_chr', 'ChromeAndroid'],
    uaparse: ['Chrome Headless', 'Chrome WebView', 'Chrome', 'Chromium'],
    cond: { android: true },
  },
  'Google Chrome': {
    caniuse: 'chrome',
    uaparse: ['Chrome Headless', 'Chrome WebView', 'Chrome', 'Chromium'],
    cond: { android: false },
  },
  'Firefox for Android': {
    caniuse: ['and_ff', 'FirefoxAndroid'],
    uaparse: 'Firefox',
    cond: { android: true },
  },
  'Mozilla Firefox': {
    caniuse: ['firefox', 'ff'],
    uaparse: 'Firefox',
    cond: { android: false },
  },
  'Microsoft Edge': {
    caniuse: 'edge',
    uaparse: 'Edge',
  },
  'Internet Explorer': {
    caniuse: ['ie', 'Explorer'],
    uaparse: 'IE',
  },
  'Internet Explorer Mobile': {
    caniuse: ['ie_mob', 'ExplorerMobile'],
    uaparse: 'IEMobile',
  },
  'Desktop Safari': {
    caniuse: 'safari',
    uaparse: 'Safari',
  },
  'iOS Safari': {
    caniuse: ['ios_saf', 'iOS'],
    uaparse: 'Mobile Safari',
  },
  Opera: {
    caniuse: 'opera',
    uaparse: 'Opera',
  },
  'Opera Mini': {
    caniuse: ['op_mini', 'OperaMini'],
    uaparse: 'Opera Mini',
  },
  'Opera Mobile': {
    caniuse: ['op_mob', 'OperaMobile'],
    uaparse: 'Opera Mobi',
  },
  'QQ Browser for Android': {
    caniuse: ['and_qq', 'QQAndroid'],
    uaparse: ['QQ', 'QQBrowser'],
    cond: { android: true },
  },
  'UC Browser for Android': {
    caniuse: ['and_uc', 'UCAndroid'],
    uaparse: 'UCBrowser',
    cond: { android: true },
  },
  'Samsung Internet': {
    caniuse: 'samsung',
    uaparse: 'Samsung Browser',
  },
};

export default browserMap;

export interface MapItem {
  caniuse: string | string[];
  uaparse: string | string[];
  cond?: {
    android: boolean;
  };
}
