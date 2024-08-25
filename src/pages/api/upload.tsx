// pages/api/upload.tsx
import type { NextApiRequest, NextApiResponse } from 'next'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const uploadDir = path.join(process.cwd(), 'public', 'uploads')

fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, uploadDir)
    },
    filename: function (_req, file, cb) {
        const extension = path.extname(file.originalname)
        const filename = `${uuidv4()}${extension}`
        cb(null, filename)
    },
})

const upload = multer({ storage })

type NextApiRequestWithFile = NextApiRequest & {
    file: Express.Multer.File
}

export const config = {
    api: {
        bodyParser: false, // Multer로부터 직접 formData를 처리하기 위해 필요
    },
}

const handler = async (req: NextApiRequestWithFile, res: NextApiResponse) => {
    if (req.method === 'POST') {
        try {
            await new Promise<void>((resolve, reject) => {
                upload.single('image')(req as any, res as any, (err: any) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })

            const { filename } = req.file
            res.status(200).json({ success: true, filename })
        } catch (error) {
            console.error('Error uploading image:', error)
            res.status(500).json({ success: false, message: 'Image upload failed' })
        }
    } else {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}

export default handler
