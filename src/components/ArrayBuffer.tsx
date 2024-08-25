export const arrayBufferToBase64 = (buffer: Iterable<number>) => {
    return btoa(
        new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte), ''
        )
    )
}

export const arrayBufferToBlob = (arrayBuffer: BlobPart, mimeType: string) => {
    return new Blob([arrayBuffer], { type: mimeType })
}

export const convertBufferImage = async (file: File | undefined): Promise<File | undefined> => {
    if (!file) return
    
    let targetWidth: number
    let targetHeight: number

    const img = new Image()
    img.src = URL.createObjectURL(file)
    return new Promise((resolve) => {
        img.onload = () => {
            if (img.width > img.height) {
                targetWidth = 1024
                targetHeight = 576
            } else if (img.width < img.height) {
                targetWidth = 576
                targetHeight = 1024
            } else {
                targetWidth = 768
                targetHeight = 768
            }

            const canvas = document.createElement('canvas')
            canvas.width = targetWidth
            canvas.height = targetHeight

            const ctx = canvas.getContext('2d')
            if (!ctx) return resolve(undefined)
                
            const imgRatio = img.width / img.height
            const targetRatio = targetWidth / targetHeight

            let drawWidth, drawHeight, xOffset, yOffset

            if (imgRatio > targetRatio) {
                drawHeight = targetHeight
                drawWidth = targetHeight * imgRatio
                xOffset = (targetWidth - drawWidth) / 2
                yOffset = 0
            } else {
                drawWidth = targetWidth
                drawHeight = targetWidth / imgRatio
                xOffset = 0
                yOffset = (targetHeight - drawHeight) / 2
            }

            ctx.drawImage(img, xOffset, yOffset, drawWidth, drawHeight)

            // 이미지 그리기
            ctx.drawImage(img, xOffset, yOffset, drawWidth, drawHeight)
            
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const resizedFile = new File(
                            [blob],
                            `${file.name.split('.')[0]}.png`,
                            { type: 'image/png' }
                        );
                        resolve(resizedFile)
                    } else {
                        resolve(undefined)
                    }
                },
                'image/png'
            )
        }
        img.onerror = () => resolve(undefined)
    })
}
