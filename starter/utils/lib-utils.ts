import { StringIndexable } from 'starter/core/model/common.model';

export const parseQueryString = (input: string) => {
  const ret: StringIndexable<string> = {};

  if (typeof input !== typeof '') {
    return ret;
  }

  input = input.trim().replace(/^[?#&]/, '');

  if (!input) {
    return ret;
  }

  input.split('&').forEach(param => {
    const separatorIndex = param.indexOf('=');
    const key = param.slice(0, separatorIndex);
    const value = param.slice(separatorIndex + 1);
    ret[key] = value || '';
  });

  return ret;
};
