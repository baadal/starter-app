import { firstValueFrom } from 'rxjs';

import HttpClient from './http-client';

class Response<T = any> {
  resp: T | null;

  constructor(res: T | null) {
    this.resp = res;
  }

  json() {
    return Promise.resolve(this.resp);
  }
}

const fetch = async <T = any>(url: string, options: any = {}, params: any = {}) => {
  const resp: any = await firstValueFrom(HttpClient.get<T>(url, options, { raw: true, ...params }));
  const response = new Response<T>(resp);
  return response;
};

export default fetch;
