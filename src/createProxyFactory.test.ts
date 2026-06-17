/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import createProxyFactory from './createProxyFactory';
import type { MustelProxy } from './types';

type TestType = Record<string, Record<string, never>>;

describe('createProxyFactory', () => {
  const fabric = vi.fn((key: string) => key);

  beforeEach(() => {
    fabric.mockClear();
  });

  it('should invoke fabric function with accumulated key when proxy is called', () => {
    const factory = createProxyFactory<TestType>(fabric);
    const proxy = factory('common.button');

    proxy();

    expect(fabric).toHaveBeenCalledWith('common.button');
  });

  it('should build nested paths via property access', () => {
    const factory = createProxyFactory<TestType>(fabric);
    const proxy = factory('common');
    const nestedProxy = proxy.button;

    nestedProxy();

    expect(fabric).toHaveBeenCalledWith('common.button');
  });

  it('should convert Symbol.toPrimitive to key string', () => {
    const factory = createProxyFactory<TestType>(fabric);
    const proxy = factory('common.button');

    const result = String(proxy);

    expect(result).toBe('common.button');
  });

  it('should throw error for iteration symbols', () => {
    const factory = createProxyFactory<TestType>(fabric);
    const proxy = factory('common');
    const proxyWithIterator = proxy as unknown as MustelProxy<TestType> & {
      [Symbol.iterator]: unknown;
    };

    expect(() => proxyWithIterator[Symbol.iterator]).toThrow(
      'Symbol properties are not supported in dot-notation navigation'
    );
  });

  it('should convert custom symbols to string format', () => {
    const factory = createProxyFactory<TestType>(fabric);
    const proxy = factory('root');
    const customSymbol = Symbol('custom');
    const ProxyType = proxy as unknown as MustelProxy<TestType> & {
      [customSymbol]: MustelProxy<TestType>;
    };

    const symbolProxy = ProxyType[customSymbol];
    symbolProxy();

    expect(fabric).toHaveBeenCalledWith('root.Symbol(custom)');
  });

  describe('Array Access - Nested and Multi-dimensional', () => {
    it.each([
      {
        name: 'array in middle of nested path',
        factory: createProxyFactory<Record<string, { item: string }[]>>(fabric),
        path: 'data',
        access: (proxy: any) => proxy.list[0].item,
        expected: 'data.list.0.item',
      },
      {
        name: 'nested arrays (2D)',
        factory: createProxyFactory<{ value: number }[][]>(fabric),
        path: 'grid',
        access: (proxy: any) => proxy[0][1].value,
        expected: 'grid.0.1.value',
      },
    ])('should support $name', ({ factory, path, access, expected }) => {
      const proxy = factory(path);

      access(proxy).toString();

      expect(fabric).toHaveBeenCalledWith(expected);
    });
  });
});
