/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { checkPayStatus } from '../../api'

interface AlipayQRDialogProps {
  open: boolean
  qrCodeUrl: string
  tradeNo: string
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AlipayQRDialog(props: AlipayQRDialogProps) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!props.open || !props.tradeNo) {
      return
    }

    let cancelled = false

    const poll = async () => {
      try {
        const res = await checkPayStatus(props.tradeNo)
        if (cancelled) {
          return
        }
        if (res.success) {
          window.clearInterval(intervalId)
          toast.success(t('Payment successful'))
          props.onSuccess()
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        }
      }
    }

    const intervalId = window.setInterval(poll, 3000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [props.open, props.tradeNo, props.onSuccess, t])

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className='max-sm:w-[calc(100vw-1.5rem)] sm:max-w-[400px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Smartphone className='h-5 w-5' />
            {t('Scan with Alipay to pay')}
          </DialogTitle>
          <DialogDescription>
            {t('Open the Alipay app and scan the QR code to complete payment.')}
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col items-center py-4'>
          <div className='rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5'>
            {props.qrCodeUrl ? (
              <QRCodeSVG
                value={props.qrCodeUrl}
                size={240}
                level='H'
                bgColor='#ffffff'
                fgColor='#1677FF'
              />
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
