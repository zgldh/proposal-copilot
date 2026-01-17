import { describe, it, expect } from 'vitest'
import { WordGenerator } from './word-generator'
import type { Project } from './project-service'

describe('WordGenerator', () => {
  it('should generate a buffer from project data', async () => {
    const generator = new WordGenerator()
    const mockProject: Project = {
      meta: {
        name: 'Test Project',
        create_time: '',
        version: '1.0.0',
        last_modified: '',
        schema_version: '1.0.0'
      },
      context: 'Test Context',
      structure_tree: [
        {
          id: '1',
          type: 'subsystem',
          name: 'Root System',
          quantity: 1,
          specs: { Power: '100W' },
          children: [
            {
              id: '2',
              type: 'device',
              name: 'Child Device',
              quantity: 2,
              specs: {},
              children: []
            }
          ]
        }
      ]
    }

    const buffer = await generator.generate(mockProject)
    expect(buffer).toBeDefined()
    expect(buffer.length).toBeGreaterThan(0)
  })
})
