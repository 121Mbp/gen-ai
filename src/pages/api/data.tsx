import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

type Data = {
  id: string
  model: string
  prompt: string
  negative_prompt: string
  revised_prompt: string
  aspect_ratio: string
  output_format: string
  size: string
  quality: string
  style: string
  style_preset: string
  texture_resolution: string
  foreground_ratio: string
  cfg_scale: string
  motion_bucket_id: string
}

type ResponseData = {
  data: Data[]
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const filePath = path.join(process.cwd(), 'db.json')
    console.log('File path:', filePath)  // 파일 경로 출력
    
    // 파일이 없을 경우 빈 파일 생성
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({ data: [] }, null, 2))
    }

    const jsonData = fs.readFileSync(filePath, 'utf8')
    const data: ResponseData = JSON.parse(jsonData)

    if (req.method === 'GET') {
      data.data.reverse()
      res.status(200).json(data)
    } else if (req.method === 'POST') {
      const newData: Data = req.body

      if (!newData.id || !newData.model) {
        return res.status(400).json({ message: 'Invalid data' })
      }
      
      data.data.push(newData) // 데이터 추가

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

      res.status(201).json(newData)
    } else if (req.method === 'DELETE') {
      const { id } = req.body

      if (!id) {
        return res.status(400).json({ message: 'ID is required' })
      }

      const index = data.data.findIndex(item => item.id === id)
      
      if (index === -1) {
        return res.status(404).json({ message: 'Data not found' })
      }

      data.data.splice(index, 1) // 데이터 삭제
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

      res.status(200).json({ message: 'Data deleted successfully' })
    } else {
      res.status(405).json({ message: 'Method Not Allowed' })
    }
  } catch (error) {
    console.error('Error handling request:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}