import { describe, it, expect, vi } from 'vitest';
import mustelProxy from '.';
import MapCache from './cache';

interface Locale {
  user: {
    name: string;
    email: string;
  };
  settings: {
    theme: string;
    language: string;
  };
}

const translate = (key: string) => key;

describe('mustelProxy integration - advanced features', () => {
  it('should support destructuring of nested properties', () => {
    const locale = mustelProxy<Locale>(translate);

    const { user } = locale;
    const userName = user.name.toString();
    const userEmail = user.email.toString();

    expect(userName).toBe('user.name');
    expect(userEmail).toBe('user.email');
  });

  it('should support valueOf conversion to string', () => {
    const locale = mustelProxy<Locale>(translate);
    const userProxy = locale.user;

    const result = userProxy.valueOf();

    expect(result).toBe('user');
  });

  it('should support dot-notation navigation with valueOf', () => {
    const locale = mustelProxy<Locale>(translate);
    const settings = locale.settings;

    const result = settings.theme.valueOf();

    expect(result).toBe('settings.theme');
  });

  it('should support caching with destructuring and valueOf', () => {
    const cache = new MapCache<Locale>();
    const getSpy = vi.spyOn(cache, 'get');
    const setSpy = vi.spyOn(cache, 'set');
    const locale = mustelProxy<Locale>(translate, { cache });

    const { user } = locale;
    const userName = user.name.toString();

    expect(getSpy).toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalledWith('', expect.any(Function));
    expect(userName).toBe('user.name');
  });

  it('should support deep navigation with valueOf', () => {
    const locale = mustelProxy<Locale>(translate);

    const userProxy = locale.user;
    const nameProxy = userProxy.name;
    const result = nameProxy.valueOf();

    expect(result).toBe('user.name');
  });

  it('should support toPrimitive conversion to string', () => {
    const locale = mustelProxy<Locale>(translate);
    const userProxy = locale.user;

    const result = String(userProxy);

    expect(result).toBe('user');
  });

  it('should support dot-notation navigation with toPrimitive', () => {
    const locale = mustelProxy<Locale>(translate);
    const settings = locale.settings;

    const result = String(settings.theme);

    expect(result).toBe('settings.theme');
  });

  it('should support template string interpolation with proxies', () => {
    const locale = mustelProxy<Locale>(translate);

    const userName = `Current user: ${locale.user.name}`;
    const userSettings = `Theme: ${locale.settings.theme}`;

    expect(userName).toBe('Current user: user.name');
    expect(userSettings).toBe('Theme: settings.theme');
  });

  it('should support template interpolation with destructured proxies', () => {
    const locale = mustelProxy<Locale>(translate);
    const { user, settings } = locale;

    const message = `User: ${user.name}, Theme: ${settings.theme}`;

    expect(message).toBe('User: user.name, Theme: settings.theme');
  });

  it('should support template interpolation with cached proxies', () => {
    const cache = new MapCache<Locale>();
    const getSpy = vi.spyOn(cache, 'get');
    const locale = mustelProxy<Locale>(translate, { cache });

    const { user } = locale;
    const greeting = `Hello ${user.name}!`;

    expect(getSpy).toHaveBeenCalledWith('');
    expect(greeting).toBe('Hello user.name!');
  });

  it('should combine toPrimitive and template interpolation', () => {
    const locale = mustelProxy<Locale>(translate);

    const userPath = String(locale.user);
    const namePath = String(locale.user.name);

    const message = `${userPath}/${namePath}`;

    expect(message).toBe('user/user.name');
  });

  it('should retrieve cached objects on repeated access', () => {
    const cache = new MapCache<Locale>();
    const getSpy = vi.spyOn(cache, 'get');
    const setSpy = vi.spyOn(cache, 'set');

    const locale1 = mustelProxy<Locale>(translate, { cache });
    const locale2 = mustelProxy<Locale>(translate, { cache });

    expect(getSpy).toHaveBeenCalledTimes(2);
    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(locale1).toBe(locale2);
  });

  it('should call cache.get and set with correct parameters', () => {
    const cache = new MapCache<Locale>();
    const getSpy = vi.spyOn(cache, 'get');
    const setSpy = vi.spyOn(cache, 'set');

    const locale = mustelProxy<Locale>(translate, { cache });

    expect(getSpy).toHaveBeenCalledWith('');
    expect(setSpy).toHaveBeenCalledWith('', expect.anything());
    expect(locale.user.name.toString()).toBe('user.name');
  });

  it('should return cached instance without creating new ones', () => {
    const cache = new MapCache<Locale>();
    const getSpy = vi.spyOn(cache, 'get');
    const setSpy = vi.spyOn(cache, 'set');

    const locale1 = mustelProxy<Locale>(translate, { cache });

    const locale2 = mustelProxy<Locale>(translate, { cache });

    expect(getSpy).toHaveBeenCalledTimes(2);
    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(locale1).toBe(locale2);
  });
});
