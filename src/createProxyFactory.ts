import type { MustelProxy } from './types';

/**
 * Unique symbol used to store the accumulated path key on proxy instances.
 *
 * This symbol is attached to the proxy function to track the object path
 * as the user navigates via dot notation (e.g., "common.button.save").
 *
 * @internal
 */
const KEY_SYMBOL: unique symbol = Symbol('localeKey');

/**
 * User-provided function that receives the accumulated key and optional parameters.
 *
 * This function is called when the proxy is invoked as a function or when the
 * path is resolved. Common use cases include translation functions, data fetching,
 * or any function that transforms the key into a value.
 *
 * @param key - The accumulated path string (e.g., "common.button.save")
 * @param args - Optional additional arguments passed during function call
 * @returns The result of the transformation (commonly string for translation keys)
 *
 * @example
 * ```typescript
 * // Translation function
 * const translate = (key: string, params?: any) => {
 *   const messages = {
 *     'common.button.save': 'Save',
 *     'common.button.cancel': 'Cancel'
 *   };
 *   return messages[key] || key;
 * };
 *
 * const fabricFunction: FabricFunction = translate;
 * ```
 */
export type FabricFunction = (key: string, ...args: unknown[]) => unknown;

/**
 * Internal MustelProxy type with the key symbol attached.
 *
 * Extends MustelProxy with the KEY_SYMBOL property to store the accumulated path.
 * This type is used internally and not exposed in the public API.
 *
 * @template T - The type definition the proxy should conform to
 *
 * @internal
 */
type InternalMustelProxy<T> = MustelProxy<T> & {
  [KEY_SYMBOL]: string;
};

/**
 * Creates a proxy factory function that generates type-safe proxies for dot-notation navigation.
 *
 * This is the core factory function that builds the proxy instances. Each call to the returned
 * factory function creates a new proxy at the specified key level.
 *
 * **Symbol Handling:**
 * - Well-known iteration symbols (Symbol.iterator, Symbol.asyncIterator) throw errors
 * - Custom symbols are converted to string format: "Symbol(description)"
 * - Built-in methods (toString, valueOf, Symbol.toPrimitive) are handled for primitive conversion
 *
 * @template T - The type definition the proxy should conform to
 * @param fabric - The FabricFunction to call when the proxy is invoked
 * @returns A factory function that accepts an optional key and returns a MustelProxy instance
 *
 * @example
 * ```typescript
 * interface Locale {
 *   common: { save: string };
 * }
 *
 * const translate = (key: string) => key;
 * const factory = createProxyFactory<Locale>(translate);
 *
 * const rootProxy = factory(); // Creates proxy at root (empty key)
 * const nestedProxy = factory('common'); // Creates proxy at 'common'
 * ```
 */
export default function createProxyFactory<T>(
  fabric: FabricFunction
): (key?: string) => InternalMustelProxy<T> {
  /**
   * Creates a proxy instance for the given key.
   *
   * @param key - The path key for this proxy (defaults to empty string for root)
   * @returns A MustelProxy instance that supports both function calls and property access
   *
   * @internal
   */
  return function factory(key = ''): InternalMustelProxy<T> {
    const fn = function fn(this: unknown, ...args: unknown[]): unknown {
      const internFn = fn as InternalMustelProxy<T>;
      const key = internFn[KEY_SYMBOL];

      return fabric(key, ...args);
    } as InternalMustelProxy<T>;

    fn[KEY_SYMBOL] = key;

    const proxy = new Proxy(fn, {
      get(target: typeof fn, prop: string | symbol) {
        // Handle primitive conversion
        if (
          prop === Symbol.toPrimitive ||
          prop === 'toString' ||
          prop === 'valueOf'
        ) {
          return () => fn();
        }

        // Handle well-known symbols - throw error for iteration symbols
        if (typeof prop === 'symbol') {
          if (prop === Symbol.iterator || prop === Symbol.asyncIterator) {
            throw new Error(
              'Symbol properties are not supported in dot-notation navigation'
            );
          }
        }

        const curKey = target[KEY_SYMBOL];
        let nextKey = typeof prop === 'symbol' ? String(prop) : prop;

        if (curKey) {
          nextKey = curKey + '.' + nextKey;
        }

        return factory(nextKey);
      },

      apply(target, thisArg, args) {
        return Reflect.apply(target, thisArg, args);
      },
    });

    return proxy;
  };
}
