export const isLocalhost = () => {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

export const currentOrigin = () => {
  return window.location.origin;
};
