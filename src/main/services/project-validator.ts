import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { PROJECT_SCHEMA } from '../schemas/project-schema'

export class ProjectValidator {
  private ajv: Ajv
  private validateFn: any

  constructor() {
    this.ajv = new Ajv({ allErrors: true })
    addFormats(this.ajv)
    this.validateFn = this.ajv.compile(PROJECT_SCHEMA)
  }

  validate(data: unknown): { valid: boolean; errors?: string[] } {
    const valid = this.validateFn(data)
    if (!valid) {
      return {
        valid: false,
        errors: this.validateFn.errors?.map((e: any) => `${e.instancePath} ${e.message}`)
      }
    }
    return { valid: true }
  }
}
