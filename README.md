# Mustel Proxy

Minimal TypeScript library for type-safe proxy with dot-notation navigation.

## Features

- **Type-safe dot notation navigation** - Full TypeScript type inference for nested paths
- **Optional caching** - Built-in Map cache or custom cache implementations
- **Destructuring support** - Extract properties with full type safety
- **Primitive conversion** - Call `toString()` or `valueOf()` to get path string
- **Flexible** - Works with translation functions, data fetching, memoization, and more

## Installation

```bash
npm install mustel-proxy
```

## Usage

### Basic Example (Translation)

```typescript
import mustelProxy from 'mustel-proxy';
import MapCache from 'mustel-proxy/cache';

interface Locale {
  common: {
    title(p: { num: number; date: string }): string;
    button: {
      save: string;
      cancel: string;
    };
  };
}

const translate = (key: string, params?: any) => key;

// Default behavior (no cache - creates new instance each call)
const locale = mustelProxy<Locale>(translate);
locale.common.title({ num: 1, date: '2024-01-01' }); // 'common.title'
locale.common.button.save; // 'common.button.save'

// With caching (MapCache reuses instances)
const cache = new MapCache<Locale>(translate);
const cachedLocale = mustelProxy<Locale>(translate, { cache });
cachedLocale.common.button.save; // 'common.button.save' (cached)
```

### Destructuring

Extract individual properties with full type safety:

```typescript
import mustelProxy from 'mustel-proxy';

interface Messages {
  notifications: {
    email: {
      sent: string;
      failed: string;
    };
    push: {
      enabled: string;
      disabled: string;
    };
  };
}

const t = (key: string) => key;
const locale = mustelProxy<Messages>(t);

// Destructure nested properties
const { email, push: pushNotifications } = locale.notifications;

email.sent(); // 'notifications.email.sent'
pushNotifications.enabled(); // 'notifications.push.enabled'

// Type is inferred correctly
const emailSent: string = email.sent; // ✓ Valid
```

### Primitive Conversion

Convert to string using `toString()` or `valueOf()`:

```typescript
import mustelProxy from 'mustel-proxy';

interface Config {
  api: {
    baseUrl: string;
    timeout: number;
  };
}

const t = (key: string) => key;
const config = mustelProxy<Config>(t);

// Convert any proxy path to string
const path: string = config.api.baseUrl.toString(); // 'api.baseUrl'
const altPath: string = config.api.baseUrl.valueOf(); // 'api.baseUrl'

// Useful for template literals or logging
console.log(`Config path: ${config.api.timeout}`); // 'Config path: api.timeout'
```

### React Example

Use with React for type-safe translation keys:

```typescript
import mustelProxy from 'mustel-proxy';
import MapCache from 'mustel-proxy/cache';
import { useEffect, useState } from 'react';

interface Translations {
  auth: {
    login: {
      title: string;
      emailLabel: string;
      passwordLabel: string;
      submitButton: string;
    };
  };
}

const translate = (key: string) => {
  const messages: Record<string, string> = {
    'auth.login.title': 'Welcome back',
    'auth.login.emailLabel': 'Email address',
    'auth.login.passwordLabel': 'Password',
    'auth.login.submitButton': 'Sign in'
  };
  return messages[key] || key;
};

// Create cached locale instance
const cache = new MapCache<Translations>(translate);
const locale = mustelProxy<Translations>(translate, { cache });

function LoginForm() {
  return (
    <div>
      <h1>{locale.auth.login.title}</h1>
      <label>{locale.auth.login.emailLabel}</label>
      <input type="email" />
      <label>{locale.auth.login.passwordLabel}</label>
      <input type="password" />
      <button>{locale.auth.login.submitButton}</button>
    </div>
  );
}
```

### Custom Cache (LRU)

Use a custom cache implementation like LRU Cache:

```typescript
import mustelProxy from 'mustel-proxy';
import LRU from 'lru-cache';

interface Config {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
}

const t = (key: string) => key;

// Create LRU cache with custom options
const LRUCache = new LRU<string, any>({
  max: 500, // Maximum number of items
  ttl: 1000 * 60 * 5, // 5 minutes TTL
});

// Adapter for MustelCache interface
const lruAdapter = {
  get(key: string) {
    return LRUCache.get(key);
  },
  set(key: string, value: any) {
    LRUCache.set(key, value);
  },
};

const config = mustelProxy<Config>(t, { cache: lruAdapter });
```

### Memoization

Wrap your function with fast-memoize for performance:

```typescript
import mustelProxy from 'mustel-proxy';
import memoize from 'fast-memoize';

interface Messages {
  products: {
    list: {
      title: string;
      description: string;
    };
  };
}

// Memoize expensive translation function
const fetchTranslation = memoize((key: string, locale: string) => {
  // Expensive operation (e.g., API call, JSON parsing)
  const messages = {
    en: {
      'products.list.title': 'Products',
      'products.list.description': 'Browse our catalog',
    },
    ru: {
      'products.list.title': 'Товары',
      'products.list.description': 'Просмотр каталога',
    },
  };
  return messages[locale]?.[key] || key;
});

const getLocale = (locale: string) => {
  const t = (key: string) => fetchTranslation(key, locale);
  return mustelProxy<Messages>(t);
};

const en = getLocale('en');
const ru = getLocale('ru');

en.products.list.title(); // 'Products' (cached)
ru.products.list.title(); // 'Товары' (cached)
```

### Non-i18n Example (Configuration)

Not just for i18n - use for any nested key-based configuration:

```typescript
import mustelProxy from 'mustel-proxy';

interface FeatureFlags {
  ui: {
    darkMode: boolean;
    compactDesign: boolean;
  };
  auth: {
    ssoEnabled: boolean;
    mfaRequired: boolean;
  };
  performance: {
    lazyLoadRoutes: boolean;
    prefetchData: boolean;
  };
}

const getFeatureFlag = (key: string) => {
  const flags: Record<string, boolean> = {
    'ui.darkMode': true,
    'ui.compactDesign': false,
    'auth.ssoEnabled': true,
    'auth.mfaRequired': false,
    'performance.lazyLoadRoutes': true,
    'performance.prefetchData': true,
  };
  return flags[key] || false;
};

const flags = mustelProxy<FeatureFlags>(getFeatureFlag);

// Type-safe feature flag access
if (flags.ui.darkMode()) {
  enableDarkMode();
}

if (flags.auth.ssoEnabled() && flags.auth.mfaRequired()) {
  setupSSOWithMFA();
}

// Check default export
app.use(
  flags.performance.lazyLoadRoutes() ? lazyLoadPlugin : regularLoadPlugin
);
```

### Data Fetching Example

Use for API endpoint configuration:

```typescript
import mustelProxy from 'mustel-proxy';

interface ApiEndpoints {
  users: {
    list: string;
    byId: string;
    create: string;
  };
  posts: {
    list: string;
    byId: string;
    comments: string;
  };
}

const getEndpoint = (key: string) => {
  const baseURL = 'https://api.example.com';
  return `${baseURL}/${key.replace(/\./g, '/')}`;
};

const api = mustelProxy<ApiEndpoints>(getEndpoint);

// Generate type-safe API URLs
api.users.list(); // 'https://api.example.com/users/list'
api.posts.comments(); // 'https://api.example.com/posts/comments'

// Use in your API calls
fetch(api.users.byId()) // Fallback to string
  .then((res) => res.json());
```

## API

### `mustelProxy<T>(t: FabricFunction, options?: { cache?: MustelCache<T> }): MustelProxy<T>`

Creates a type-safe proxy for dot-notation navigation with optional cache injection.

**Parameters:**

- `t: FabricFunction` - Function that receives a key and optional parameters
- `options?: { cache?: MustelCache<T> }` - Optional configuration object for cache injection

**Returns:** `MustelProxy<T>` - A proxy that supports both property access and function calls

**Type Parameters:**

- `T` - The type definition for type safety

**Behavior:**

- Default (no cache): Creates a new proxy instance on each property access
- With cache: Reuses cached instances for repeated access to the same keys

### `MustelProxy<T>`

Proxy interface for type-safe navigation with dot notation:

```typescript
type MustelProxy<T> = ((...args: unknown[]) => string) & {
  [K in keyof T]: ProxyValue<T[K]>;
};
```

**Features:**

- Call as function to get value with accumulated path
- Access nested properties via dot notation
- Full TypeScript type inference
- Destructuring support for direct property extraction
- Primitive conversion via `toString()` and `valueOf()`

### `FabricFunction`

Function type for handling the accumulated path:

```typescript
type FabricFunction = (key: string, ...args: unknown[]) => unknown;
```

- Receives the full accumulated path (e.g., `"common.button.save"`)
- Optional additional arguments passed during function call
- Returns processed value (commonly string for translations)

### `MustelCache<T>`

Interface for cache implementations:

```typescript
interface MustelCache<T> {
  get(key: string): MustelProxy<T> | undefined;
  set(key: string, value: MustelProxy<T>): void;
}
```

**Methods:**

- `get(key)`: Retrieve cached proxy instance
- `set(key, value)`: Store proxy instance in cache

### `MapCache<T>`

Built-in cache implementation using Map for string keys:

```typescript
import mustelProxy from 'mustel-proxy';
import MapCache from 'mustel-proxy/cache';

const translate = (key: string) => key;

// Create cache instance
const cache = new MapCache<Locale>(translate);

// Use cache with proxy
const locale = mustelProxy<Locale>(translate, { cache });
locale.common.button.save; // Reuses cached instance
```

**Features:**

- Simple string-keyed caching
- Each FabricFunction has isolated cache

## Testing

```bash
npm test
```

## Building

```bash
npm run build
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Apache License 2.0
