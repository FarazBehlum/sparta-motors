import type { Field, Where } from 'payload'

// PostgreSQL enums do not support ILIKE. Match select labels and values in
// memory, then let the database filter using the corresponding enum values.
export function normalizeTruckSearch(where: Where, fields: Field[]): Where {
  const selects = new Map<string, { label: string; value: string }[]>()
  function collect(items: Field[], prefix = '') {
    for (const field of items) {
      const path = 'name' in field ? `${prefix}${field.name}` : prefix
      if (field.type === 'select') {
        selects.set(path, field.options.map((option) => typeof option === 'string'
          ? { label: option, value: option }
          : { label: typeof option.label === 'string' ? option.label : option.value, value: option.value }))
      }
      if ('fields' in field) collect(field.fields, 'name' in field ? `${path}.` : prefix)
      if (field.type === 'tabs') {
        for (const tab of field.tabs) collect(tab.fields, 'name' in tab ? `${prefix}${tab.name}.` : prefix)
      }
    }
  }
  collect(fields)
  function visit(query: Where): Where {
    return Object.fromEntries(Object.entries(query).map(([key, condition]) => {
      if ((key === 'and' || key === 'or') && Array.isArray(condition)) return [key, condition.map(visit)]
      const options = selects.get(key)
      if (options && condition && typeof condition === 'object' && 'like' in condition && typeof condition.like === 'string') {
        const words = condition.like.toLowerCase().split(/\s+/).filter(Boolean)
        const matches = options.filter(({ label, value }) => words.every((word) =>
          `${label} ${value}`.toLowerCase().includes(word))).map(({ value }) => value)
        const { like: _like, ...rest } = condition
        return [key, { ...rest, in: matches }]
      }
      return [key, condition]
    })) as Where
  }
  return visit(where)
}
