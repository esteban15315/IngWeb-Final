// Devuelve un objeto nuevo solo con las claves permitidas.
// Evita la "asignación masiva": si el cliente envía { tenantId: 'otro' },
// ese campo se descarta porque no está en la lista blanca.
export function pick(source = {}, allowedKeys = []) {
  const result = {};
  for (const key of allowedKeys) {
    if (source[key] !== undefined) result[key] = source[key];
  }
  return result;
}
