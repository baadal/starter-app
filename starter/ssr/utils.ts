import semver from 'semver';
import * as lite from 'caniuse-lite';

import { StringIndexable } from 'starter/core/model/common.model';
import { LinkElem, StyleElem, ScriptElem, DomElem, UserAgentInfo } from 'starter/core/model/ssr.model';
import logger from 'starter/utils/logger';

export const getTagsFromElems = (elems: DomElem[]) => {
  const tags: string[] = [];

  elems.forEach(el => {
    let child = '';
    const tag: string[] = [];
    Object.entries(el.props).forEach(([key, value]) => {
      if (key === 'dangerouslySetInnerHTML') {
        child = value.__html;
      } else if (value === true) {
        tag.push(key);
      } else {
        tag.push(`${key}="${value}"`);
      }
    });
    if (['link'].includes(el.type)) {
      tags.push(`<${el.type} ${tag.join(' ')}>`);
    } else {
      tags.push(`<${el.type} ${tag.join(' ')}>${child}</${el.type}>`);
    }
  });

  return tags.join('\n');
};

export const filterLinkElems = (linkElems: LinkElem[], styleElems: StyleElem[]) => {
  const linkElemsMap = new Map<string, LinkElem>();
  const linkElemsFilter: LinkElem[] = [];
  const styleSheets = styleElems.map(el => el.props.href as string);

  linkElems.forEach(linkElem => {
    if (
      !linkElemsMap.has(linkElem.props.href) ||
      (linkElemsMap.get(linkElem.props.href)?.props.rel === 'prefetch' && linkElem.props.rel === 'preload')
    ) {
      linkElemsMap.set(linkElem.props.href, linkElem);
    }
  });

  linkElemsMap.forEach((value, key) => {
    if (styleSheets.includes(key) && value.props.rel === 'preload') {
      // prefetch (rather than preload) since the stylesheet (critical css) is now embedded inline
      linkElemsFilter.push({
        type: value.type,
        props: { ...value.props, rel: 'prefetch' },
      });
    } else {
      linkElemsFilter.push(value);
    }
  });

  return linkElemsFilter;
};

export const inflateLinkElems = (linkElems: LinkElem[], assetList: string[]) => {
  const unusedScripts: string[] = [];
  const unusedStyles: string[] = [];

  assetList.forEach(asset => {
    if (!linkElems.find(linkElem => linkElem.props.href === asset)) {
      if (/\.js$/.test(asset)) {
        unusedScripts.push(asset);
      } else if (/\.css$/.test(asset)) {
        unusedStyles.push(asset);
      } else {
        console.warn('[WARN] Unhandled unused asset:', asset);
      }
    }
  });

  const unusedScriptsLinks: ScriptElem[] = unusedScripts.map(path => ({
    type: 'link',
    props: {
      rel: 'prefetch',
      as: 'script',
      href: path,
    },
  }));

  const unusedStylesLinks: StyleElem[] = unusedStyles.map(path => ({
    type: 'link',
    props: {
      rel: 'prefetch',
      as: 'style',
      href: path,
    },
  }));

  const linkElemsInflated: LinkElem[] = [...linkElems, ...unusedScriptsLinks, ...unusedStylesLinks];

  return linkElemsInflated;
};

export const corsScripts = (elems: ScriptElem[]) => {
  const newElems: ScriptElem[] = [];
  elems.forEach(el => {
    if (/^https?:/.test(el.props.src) && /\.js$/.test(el.props.src)) {
      newElems.push({
        type: el.type,
        props: { ...el.props, crossorigin: 'anonymous' },
      });
    } else {
      newElems.push(el);
    }
  });
  return newElems;
};

export const corsLinks = (elems: LinkElem[]) => {
  const newElems: LinkElem[] = [];
  elems.forEach(el => {
    if (/^https?:/.test(el.props.href) && /\.js$/.test(el.props.href)) {
      newElems.push({
        type: el.type,
        props: { ...el.props, crossorigin: 'anonymous' },
      });
    } else {
      newElems.push(el);
    }
  });
  return newElems;
};

const getBrowserSemVer = (browserVersion: string) => {
  if (!browserVersion) return '';

  // :: browserVersion formats [ua-parser-js]
  // Chrome: 79.0.3945.88
  // Edge: 87.0.664.41
  // Firefox: 84.0
  // Safari: 14.0.1

  const vMajorMinor = browserVersion.split(' ')[0].split('.').splice(0, 2);
  const vstatus = vMajorMinor.map(p => !Number.isNaN(parseInt(p, 10))).reduce((a, b) => a && b);
  if (!vstatus) return '';

  let semVer;
  if (vMajorMinor.length === 1) {
    semVer = `${vMajorMinor[0]}.0.0`;
  } else {
    semVer = `${vMajorMinor[0]}.${vMajorMinor[1]}.0`;
  }

  return semVer;
};

export const checkESModulesSupport = (userAgentInfo: UserAgentInfo | null) => {
  const browserVersion = userAgentInfo?.browser?.version || '';
  const browserLabel = userAgentInfo?.browser?.label || '';
  const browserSemVer = getBrowserSemVer(browserVersion);

  if (!browserLabel || !browserSemVer) {
    logger.error(`[checkESModulesSupport] Missing argument: browserLabel(${browserLabel}), browserSemVer(${browserSemVer})`);
    return false;
  }

  const feature = lite.features['es6-module'];
  const { stats } = lite.feature(feature);

  const browserStatsReadOnly = stats[`${browserLabel}`];
  if (!browserStatsReadOnly) {
    logger.error(`[checkESModulesSupport] Invalid browserLabel: ${browserLabel}`);
    return false;
  }

  // TODO: Use build-time Cache/Map
  const browserStats: StringIndexable<string> = JSON.parse(JSON.stringify(browserStatsReadOnly));

  // ES modules support: Custom-added rules/stats
  // Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#browser_support
  if (browserLabel === 'and_chr') {
    if (!browserStats['61']) browserStats['61'] = 'y';
  } else if (browserLabel === 'and_ff') {
    if (!browserStats['60']) browserStats['60'] = 'y';
  }

  let support = '';

  const version = semver.parse(browserSemVer);
  if (version) {
    let shortVersion = `${version?.major}.${version?.minor}`;
    if (browserStats[`${shortVersion}`]) {
      support = browserStats[`${shortVersion}`];
    } else if (version?.minor === 0) {
      shortVersion = `${version?.major}`;
      if (browserStats[`${shortVersion}`]) {
        support = browserStats[`${shortVersion}`];
      }
    }
  }

  if (!support) {
    const versionList: StringIndexable<string> = {};
    Object.entries(browserStats).forEach(([key, value]) => {
      if (value && value[0] === 'y') {
        versionList[`${key.split('-')[0]}`] = value;
      }
    });
    Object.entries(versionList).every(([key, value]) => {
      const semVer = getBrowserSemVer(key);
      if (semVer && semver.lte(semVer, browserSemVer) && value[0] === 'y') {
        support = 'y';
        return false;
      }
      return true;
    });
  }

  return !!(support && support[0] === 'y');
};
