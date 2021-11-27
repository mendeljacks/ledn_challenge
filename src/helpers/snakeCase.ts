export const snakeCase = (str: string): string => {
    return str
        .replace(/([a-z\d])([A-Z])/g, '$1_$2')
        .replace(/[-\s]+/g, '_')
        .toLowerCase()
}

export const snakeKeys = (obj: any): any => {
    const newObj: any = {}
    for (const key in obj) {
        newObj[snakeCase(key)] = obj[key]
    }
    return newObj
}
