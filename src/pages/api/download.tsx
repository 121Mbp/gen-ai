import { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const uploadsDirectory = path.join(process.cwd(), 'public', 'uploads')

    try {
        const filenames = await fs.readdir(uploadsDirectory)

        // Filter only image files (optional)
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif']
        const images = filenames.filter(filename =>
            imageExtensions.includes(path.extname(filename).toLowerCase())
        )

        res.status(200).json(images)
    } catch (error) {
        console.error('Error reading uploads directory:', error)
        res.status(500).json({ error: 'Failed to read uploads directory' })
    }
}
