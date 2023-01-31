const cached = new WeakMap();

export function isEqual(a: unknown, b: unknown): boolean {
  if (a === null || b === null) {
    return a === b;
  }

  if (typeof a !== 'object' || typeof b !== 'object') {
    return a === b;
  }

  const dataTypeA = detectDataType(a);
  const dataTypeB = detectDataType(b);
  if (dataTypeA !== dataTypeB) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  const symbolsA = Object.getOwnPropertySymbols(a);
  const symbolsB = Object.getOwnPropertySymbols(b);
  if (symbolsA.length !== symbolsB.length) return false;

  if (cached.get(a)?.has(b)) return true;
  if (cached.get(b)?.has(a)) return true;

  cache(a, b, cached);

  const propertyNamesA = [...keysA, ...symbolsA];

  for (const propertyNameA of propertyNamesA) {
    if (!b.hasOwnProperty(propertyNameA)) return false;

    const propertyValueA = a[propertyNameA];
    const propertyValueB = b[propertyNameA];

    if (!isEqual(propertyValueA, propertyValueB)) {
      return false;
    }
  }

  return true;
}

function detectDataType(data) {
  if (Array.isArray(data)) return 'array';
  return 'object';
}

function cache(a, b, cached) {
  let setForA = cached.get(a);
  if (!setForA) {
    cached.set(a, (setForA = new Set()));
  }
  setForA.add(b);

  let setForB = cached.get(b);
  if (!setForB) {
    cached.set(b, (setForB = new Set()));
  }
  setForB.add(a);
}
