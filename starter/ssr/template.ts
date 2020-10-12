import serialize from 'serialize-javascript';

import { checkProd } from 'starter/utils/env';
import { getPublicPath, getAssetsData, getFontList } from 'starter/ssr/server-utils';
import { getTagsFromElems } from 'starter/ssr/utils';
import { ScriptElem, LinkElem, StyleElem } from 'starter/core/model/ssr.model';
import { InitialData, StarterInfo } from 'starter/core/model/response.model';

export const template = (
  content: string,
  scriptElems: ScriptElem[],
  styleElems: StyleElem[],
  linkElems: LinkElem[],
  initialData: InitialData | null,
  starterInfo: StarterInfo
) => {
  const isProd = checkProd();
  const publicPath = getPublicPath();

  const initialDataInfo = `<script id="__STARTER_INFO__" type="application/json">${serialize(starterInfo)}</script>`;
  const initialDataJson = initialData
    ? `<script id="__STARTER_DATA__" type="application/json">${serialize(initialData)}</script>`
    : '';
  const reloadScript = !isProd ? `<script src="/reload/reload.js"></script>` : '';

  const defaultTitle = 'My Web App';
  const title = initialData?.pageData?.seo?.title || defaultTitle;
  const description = initialData?.pageData?.seo?.description || '';

  let metaTags = '';
  if (description) {
    metaTags += `<meta name="description" content="${description}">`;
  }
  const meta = initialData?.pageData?.seo?.meta || {};
  Object.entries(meta).forEach(([key, value]) => {
    metaTags += `\n<meta name="${key}" content="${value}">`;
  });

  const topScriptBody = getAssetsData('scriptTop.js');
  const bottomScriptBody = getAssetsData('scriptBottom.js');
  const scriptTop = topScriptBody ? `<script>${topScriptBody}</script>` : '';
  const scriptBottom = bottomScriptBody ? `<script>${bottomScriptBody}</script>` : '';

  let criticalCss = '';
  let linkTags = '';
  let fontLinks = '';
  let disableReactDevTools = '';

  const scriptTags = getTagsFromElems(scriptElems);

  if (isProd) {
    criticalCss = `<style>${styleElems.map(el => getAssetsData(el.props.href)).join(' ')}</style>`;
    linkTags = getTagsFromElems(linkElems);

    // Ref: https://medium.com/reloading/preload-prefetch-and-priorities-in-chrome-776165961bbf
    fontLinks = getFontList()
      .map(f => `<link rel="preload" as="font" href="${publicPath}${f}" crossorigin="anonymous">`)
      .join('\n');

    disableReactDevTools = `<script>
    if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function() {};
    }
    </script>`;
  }

  const page = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${metaTags}
    <link rel="shortcut icon" type="image/x-icon" href="${publicPath}favicon.ico" />
    ${scriptTop}
    ${linkTags}
    ${fontLinks}
    ${disableReactDevTools}
    <title>${title}</title>
  </head>
  <body>
    <div id="root">${content}</div>
    ${criticalCss}
    ${initialDataInfo}
    ${initialDataJson}
    ${scriptTags}
    ${scriptBottom}
    ${reloadScript}
  </body>
</html>`;

  return page;
};
