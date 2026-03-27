'use client'

import { useState } from 'react'
import { Download, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DownloadButtonProps {
  pathname: string
  productName: string
}

export function DownloadButton({ pathname, productName }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    
    try {
      const response = await fetch(`/api/file?pathname=${encodeURIComponent(pathname)}`)
      
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const filename = pathname.split('/').pop() || `${productName}.zip`
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 3000)
    } catch (error) {
      console.error('Download error:', error)
    }
    
    setDownloading(false)
  }

  return (
    <Button 
      onClick={handleDownload}
      disabled={downloading}
      className="w-full"
      size="lg"
    >
      {downloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Downloading...
        </>
      ) : downloaded ? (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Downloaded!
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download {productName}
        </>
      )}
    </Button>
  )
}
