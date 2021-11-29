import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { countryListAlpha2 } from '../helpers/countries'
const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

const usersSchema = {
    type: 'object',
    properties: {
        id: { type: 'number', minimum: 1 },
        firstName: { type: 'string', minLength: 1, maxLength: 45 },
        lastName: { type: 'string', minLength: 1, maxLength: 45 },
        country: { type: 'string', enum: Object.keys(countryListAlpha2) },
        email: { type: 'string', format: 'email' },
        dob: { type: 'string', format: 'date-time' },
        mfa: { type: ['string', 'null'], enum: ['TOTP', 'SMS', null] },
        referredBy: { type: ['string', 'null'], format: 'email' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    },
    additionalProperties: false
}
const transactionSchema = {
    type: 'object',
    properties: {
        id: { type: 'number', minimum: 1 },
        userId: { type: 'integer', minimum: 1 },
        amount: { type: 'number' },
        type: { type: 'string', enum: ['send', 'receive'] },
        createdAt: { type: 'string', format: 'date-time' }
    },
    additionalProperties: false
}

const schema = {
    type: 'object',
    properties: {
        $operation: { type: 'string', enum: ['create', 'update', 'delete'] },
        transactions: { type: 'array', items: transactionSchema, minItems: 1 },
        users: { type: 'array', items: usersSchema, minItems: 1 }
    },
    additionalProperties: false,
    required: ['$operation'],
    if: {
        properties: { $operation: { const: 'create' } },
        required: ['$operation']
    },
    then: {
        properties: {
            users: {
                items: {
                    required: [
                        'firstName',
                        'lastName',
                        'country',
                        'email',
                        'dob',
                        'createdAt',
                        'updatedAt'
                    ]
                }
            },
            transactions: { items: { required: ['userId', 'amount', 'type', 'createdAt'] } }
        }
    },
    else: {
        properties: {
            users: { items: { oneOf: [{ required: ['id'] }, { required: ['email'] }] } },
            transactions: { items: { required: ['id'] } }
        }
    }
}

const compiled = ajv.compile(schema)
export const validate = (data): any[] => {
    const valid = compiled(data)
    if (!valid) {
        const errors = compiled.errors
        return errors
    }
    return []
}
