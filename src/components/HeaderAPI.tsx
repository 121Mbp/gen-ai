export const openAIHeaders = () => ({
    headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPEN_AI_KEY}`,
        'Content-Type': 'application/json',
    }
})

export const stabilityHeaders = () => ({
    headers: {
        Authorization: `${process.env.NEXT_PUBLIC_STABILITY_AI_KEY}`,
        'Content-Type': 'multipart/form-data',
        Accept: 'image/*'
    },
    responseType: 'arraybuffer'
})

export const stability3DHeaders = () => ({
    headers: {
        Authorization: `${process.env.NEXT_PUBLIC_STABILITY_AI_KEY}`,
        'Content-Type': 'multipart/form-data',
    },
    responseType: 'arraybuffer'
})

export const PostStabilityVideoHeaders = () => ({
    headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STABILITY_AI_KEY}`,
        'Content-Type': 'multipart/form-data',
    },
})

export const GetStabilityVideoHeaders = () => ({
    headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STABILITY_AI_KEY}`,
        'Content-Type': 'multipart/form-data',
        Accept: 'video/*'
    },
    responseType: 'arraybuffer'
})