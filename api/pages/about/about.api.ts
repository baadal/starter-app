import { AboutPageData } from 'model/pagedata.model';

export const getPageData = (): AboutPageData => ({
  title: 'About',
  description: 'React starter kit for building high-performance Web Apps.',
  seo: {
    title: 'About Starter.js',
    description: 'React starter kit for building high-performance Web Apps',
  },
});
