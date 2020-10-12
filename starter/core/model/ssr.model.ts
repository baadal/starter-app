import { StringIndexable } from './common.model';

export interface DomElem {
  type: string;
  props: StringIndexable<any>;
}

export type StyleElem = DomElem;
export type LinkElem = DomElem;
export type ScriptElem = DomElem;

export interface BrowserInfo {
  name?: string;
  version?: string;
  major?: string;
  label?: string;
}

export interface UserAgentInfo {
  browser?: BrowserInfo;
  osName?: string;
  isMobile?: boolean;
}

export interface UserAgentData extends UserAgentInfo {
  esmSupported?: boolean;
}
