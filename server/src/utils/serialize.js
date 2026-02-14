/**
 * Recursively adds _id alias for id on all objects in a structure.
 * This ensures frontend compatibility with MongoDB-style _id fields.
 */
export function addIdAlias(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(addIdAlias);
  if (typeof obj === 'object') {
    if ('id' in obj) obj._id = obj.id;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = addIdAlias(obj[key]);
      }
    }
  }
  return obj;
}

/**
 * Convert a Sequelize model instance (with includes) to a plain object with _id aliases.
 */
export function toPlainWithIds(instance) {
  if (!instance) return instance;
  const json = instance.get({ plain: true });
  return addIdAlias(json);
}
