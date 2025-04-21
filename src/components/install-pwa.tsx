import { DownloadIcon } from 'lucide-react'
import { Button } from './ui/button'
import { usePwaInstall } from '@/hooks/use-pwa-install'

export function InstallPWA() {
  const { isInstallable, install } = usePwaInstall()

  if (!isInstallable) return null

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      onClick={install}
    >
      <DownloadIcon className="h-4 w-4" />
      Install App
    </Button>
  )
}
