import * as Sentry from '@sentry/react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {getRandomString} from 'bridge/CovidShield';

const UUID_KEY = 'UUID_KEY';

const cachedUUID = AsyncStorage.getItem(UUID_KEY)
  .then(uuid => uuid || getRandomString(8))
  .then(uuid => {
    AsyncStorage.setItem(UUID_KEY, uuid);
    return uuid;
  })
  .catch(() => null);

let currentUUID = '';

export const setLogUUID = (uuid: string) => {
  currentUUID = uuid;
  AsyncStorage.setItem(UUID_KEY, uuid);
};

export const getLogUUID = async () => {
  return currentUUID || (await cachedUUID) || 'unset';
};

export const captureMessage = async (message: string, params: {[key in string]: any} = {}) => {
  const uuid = await getLogUUID();
  const scope = new Sentry.Scope();
  scope.setExtras(params);
  Sentry.captureMessage(`[${uuid}] ${message}`, scope);
};

export const captureException = async (error: any, params: {[key in string]: any} = {}) => {
  const uuid = await getLogUUID();
  const scope = new Sentry.Scope();
  scope.setExtras({
    ...params,
    error: {
      message: error && error.message,
      error,
    },
  });
  Sentry.captureMessage(`[${uuid}] Error`, scope);
};
