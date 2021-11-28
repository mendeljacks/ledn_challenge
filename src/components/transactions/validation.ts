import joi from 'joi'

export const transactionObj = {
    userId: joi.number().positive().integer().required(),
    amount: joi.number().required(),
    type: joi.string().valid('send', 'receive').required(),
    createdAt: joi.date().iso().required()
}

export const transactionSchema = joi.array().items(joi.object().keys(transactionObj)).min(1)