import { HomePageData } from 'model/pagedata.model';

export const getPageData = (): HomePageData => ({
  title: 'React Starter Kit',
  description: 'Start Building!',
  message: 'Build something awesome!',
  seo: {
    title: 'Starter.js',
    description: 'A modern way of building Web Apps',
    meta: {
      keywords: 'Starter.js, React starter kit',
    },
  },
});
