let cachedBase: string | null = null;

const normalize = (base: string) => base.replace(/\/+$/, '');

const withApiSuffix = (base: string) => {
  const trimmed = normalize(base);
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

async function isHealthy(base: string): Promise<boolean> {
  try {
    const res = await fetch(`${normalize(base)}/health`, { method: 'GET' });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return data?.status === 'ok' && data?.app === 'lostlink';
  } catch {
    return false;
  }
}

export async function resolveApiBase(): Promise<string> {
  const env = import.meta.env.VITE_API_URL as string | undefined;
  if (env && env.trim()) {
    const raw = normalize(env);
    // Accept both forms: http://host:port/api OR http://host:port
    if (await isHealthy(raw)) return raw;
    const apiForm = withApiSuffix(raw);
    if (await isHealthy(apiForm)) return apiForm;
    return raw;
  }

  if (cachedBase) return cachedBase;

  const stored = window.localStorage.getItem('lostlink-api-base');
  if (stored) {
    const raw = normalize(stored);
    if (await isHealthy(raw)) {
      cachedBase = raw;
      return cachedBase;
    }
    const apiForm = withApiSuffix(raw);
    if (await isHealthy(apiForm)) {
      cachedBase = apiForm;
      window.localStorage.setItem('lostlink-api-base', cachedBase);
      return cachedBase;
    }
  }

  // Try common ports (backend may auto-fallback during dev)
  // Backend default is 5000; keep older 4003-based range as fallback.
  const ranges: Array<[number, number]> = [
    [5000, 5025],
    [4003, 4025],
  ];

  for (const [start, end] of ranges) {
    for (let port = start; port <= end; port++) {
      const candidate = `http://localhost:${port}/api`;
      if (await isHealthy(candidate)) {
        cachedBase = normalize(candidate);
        window.localStorage.setItem('lostlink-api-base', cachedBase);
        return cachedBase;
      }
    }
  }

  // Last resort default
  cachedBase = 'http://localhost:5000/api';
  return cachedBase;
}
