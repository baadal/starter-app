import { BroadcastChannel, OnMessageHandler, createLeaderElection, LeaderElector } from 'broadcast-channel';
import short from 'short-uuid';

// Ref: https://github.com/pubkey/broadcast-channel
// Ref: https://blog.bitsrc.io/4-ways-to-communicate-across-browser-tabs-in-realtime-e4f5f6cbedca
// Ref: https://dev.to/dcodeyt/send-data-between-tabs-with-javascript-2oa

const AUTH_SESSION_CHANNEL = 'auth-session';

let authChannel: BroadcastChannel<AuthEvent> | null = null;
const channelSingleton: ChannelInfo = { id: '', elector: null };

const getAuthChannelInstance = () => {
  const isServer = typeof window === typeof undefined;
  if (isServer) return null;

  if (authChannel === null) {
    authChannel = new BroadcastChannel<AuthEvent>(AUTH_SESSION_CHANNEL, { webWorkerSupport: false });
    channelSingleton.id = short.uuid();
    channelSingleton.elector = createLeaderElection(authChannel);
  }
  return authChannel;
};

export const sendMessage = (message: AuthEvent) => {
  const channel = getAuthChannelInstance();
  channel?.postMessage({ ...message, source: channelSingleton.id });
};

export const addAuthChannelHandler = (handler: OnMessageHandler<AuthEvent>) => {
  const channel = getAuthChannelInstance();
  channel?.addEventListener('message', handler);
};

export const removeAuthChannelHandler = (handler: OnMessageHandler<AuthEvent>) => {
  const channel = getAuthChannelInstance();
  channel?.removeEventListener('message', handler);
};

// Initialize channel on load
getAuthChannelInstance();

export const channelInfo = channelSingleton;

export type AuthEvent = {
  event: 'login' | 'logout' | 'token_refresh';
  data?: any;
  source?: string;
};

export type ChannelInfo = {
  id: string;
  elector: LeaderElector | null;
};
