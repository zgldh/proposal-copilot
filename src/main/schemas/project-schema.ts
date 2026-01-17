export const PROJECT_SCHEMA = {
  type: 'object',
  required: ['meta', 'context'],
  properties: {
    meta: {
      type: 'object',
      required: ['name', 'create_time', 'version'],
      properties: {
        name: { type: 'string', minLength: 1 },
        create_time: { type: 'string', format: 'date-time' },
        version: { type: 'string' },
        last_modified: { type: 'string', format: 'date-time' },
        schema_version: { type: 'string' }
      }
    },
    context: { type: 'string' },
    chat_history: {
      type: 'array',
      items: {
        type: 'object',
        required: ['role', 'content'],
        properties: {
          role: { enum: ['user', 'assistant', 'system'] },
          content: { type: ['string', 'array', 'object'] },
          timestamp: { type: 'number' },
          guidance: { type: 'object' }
        }
      }
    },
    structure_tree: {
      type: 'array',
      items: { $ref: '#/definitions/treeNode' }
    }
  },
  definitions: {
    treeNode: {
      type: 'object',
      required: ['id', 'type', 'name', 'quantity'],
      properties: {
        id: { type: 'string' },
        type: { enum: ['subsystem', 'device', 'feature'] },
        name: { type: 'string', minLength: 1 },
        quantity: { type: 'number', minimum: 1 },
        specs: { type: 'object' },
        children: {
          type: 'array',
          items: { $ref: '#/definitions/treeNode' }
        }
      }
    }
  }
}
