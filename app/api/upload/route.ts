import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'image' or 'product-file'
    const productId = formData.get('productId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const folder = type === 'image' ? 'product-images' : 'product-files'
    const filename = `${folder}/${productId}/${Date.now()}-${file.name}`

    // Use private access for product files, public for images
    const blob = await put(filename, file, {
      access: 'private',
    })

    return NextResponse.json({ 
      pathname: blob.pathname,
      url: blob.url,
      filename: file.name,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
