import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { countryListAlpha2 } from '../helpers/countries'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

const user = {
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
        updatedAt: { type: 'string', format: 'date-time' },
        transactions: { $ref: '#/$defs/transactions' }
    },
    additionalProperties: false
}
const userArray = { type: 'array', items: user, minItems: 1 }

const transaction = {
    type: 'object',
    properties: {
        id: { type: 'number', minimum: 1 },
        userId: { type: 'integer', minimum: 1 },
        amount: { type: 'number' },
        type: { type: 'string', enum: ['send', 'receive'] },
        createdAt: { type: 'string', format: 'date-time' },
        users: { $ref: '#/$defs/users' }
    },
    additionalProperties: false
}

const transactionArray = { type: 'array', items: transaction, minItems: 1 }

const createUserFields = [
    'firstName',
    'lastName',
    'country',
    'email',
    'dob',
    'createdAt',
    'updatedAt'
]

const createTransactionFields = ['userId', 'amount', 'type', 'createdAt']

const schema = {
    $defs: {
        users: userArray,
        transactions: transactionArray
    },
    type: 'object',
    properties: {
        $operation: { type: 'string', enum: ['create', 'update', 'delete'] },
        transactions: transactionArray,
        users: userArray
    },
    additionalProperties: false,
    required: ['$operation'],
    if: {
        properties: { $operation: { const: 'create' } },
        required: ['$operation']
    },
    then: {
        properties: {
            transactions: {
                type: 'array',
                items: { ...transaction, required: createTransactionFields },
                minItems: 1
            },
            users: { type: 'array', items: { ...user, required: createUserFields }, minItems: 1 }
        }
    },
    else: {
        properties: {
            transactions: {
                type: 'array',
                items: { ...transaction, oneOf: [{ required: ['id'] }, { required: ['userId'] }] },
                minItems: 1
            },

            users: {
                type: 'array',
                items: { ...user, oneOf: [{ required: ['id'] }, { required: ['email'] }] },
                minItems: 1
            }
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
