import { nanoid } from 'nanoid'

export const cast = body => {
    const entity = Object.keys(body).filter(el => el !== '$operation')[0]
    let mutation = body

    // Casting is used because mysql doesn't like the milliseconds in a timestamp
    // We also add unique id for batching purposes (mysqsl doesn't do returning * like postgres)
    body[entity] = body[entity].map(el => ({
        ...el,
        ...(el.dob && { dob: new Date(el.dob) }),
        ...(el.createdAt && { createdAt: new Date(el.createdAt) }),
        ...(el.updatedAt && { updatedAt: new Date(el.updatedAt) }),
        resourceId: nanoid()
    }))

    return mutation
}
