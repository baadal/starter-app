import { NotFoundPageData } from 'model/pagedata.model';

export const getPageData = (): NotFoundPageData => ({
  title: 'Page Not Found (404)',
  description: 'This page does not exist.',
  message: 'Return to Homepage',
  seo: {
    title: 'Page Not Found',
    description: 'This page does not exist',
  },
});
