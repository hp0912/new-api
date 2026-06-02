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
import { ScanLine } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { checkPayStatus } from '../../api'
import { formatCurrency } from '../../lib/format'

interface AlipayQRDialogProps {
  open: boolean
  qrCodeUrl: string
  tradeNo: string
  /** Amount the user needs to pay, in the configured currency. */
  payAmount?: number
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

// Alipay brand blue.
const ALIPAY_BLUE = '#1677FF'

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
      } catch {
        // Polling errors (including the "order not paid" business response)
        // are expected while waiting for the user to pay — stay silent.
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
      <DialogContent className='max-sm:w-[calc(100vw-1.5rem)] sm:max-w-[380px]'>
        <DialogHeader className='items-center text-center'>
          <span
            className='flex h-12 w-12 items-center justify-center rounded-full'
            style={{ backgroundColor: `${ALIPAY_BLUE}1a`, color: ALIPAY_BLUE }}
          >
            <ScanLine className='h-6 w-6' />
          </span>
          <DialogTitle className='mt-1'>
            {t('Scan with Alipay to pay')}
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col items-center gap-4'>
          {typeof props.payAmount === 'number' && props.payAmount > 0 ? (
            <div className='flex items-baseline gap-1.5'>
              <span className='text-muted-foreground text-sm'>
                {t('Amount Due')}
              </span>
              <span
                className='text-2xl font-bold tabular-nums'
                style={{ color: ALIPAY_BLUE }}
              >
                ¥{formatCurrency(props.payAmount)}
              </span>
            </div>
          ) : null}

          <div className='relative rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5'>
            {props.qrCodeUrl ? (
              <QRCodeSVG
                value={props.qrCodeUrl}
                size={200}
                level='H'
                bgColor='#ffffff'
                fgColor={ALIPAY_BLUE}
              />
            ) : null}
          </div>

          <div className='text-muted-foreground flex items-center gap-2 text-sm'>
            <span className='relative flex h-2 w-2'>
              <span
                className='absolute inline-flex h-full w-full animate-ping rounded-full opacity-75'
                style={{ backgroundColor: ALIPAY_BLUE }}
              />
              <span
                className='relative inline-flex h-2 w-2 rounded-full'
                style={{ backgroundColor: ALIPAY_BLUE }}
              />
            </span>
            {t('Waiting for payment, please scan with Alipay...')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
