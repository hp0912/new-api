import React, { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal, Typography } from '@douyinfe/semi-ui';
import { QrCode, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API, showError } from '../../../helpers';

const { Text } = Typography;

const Alipay = (props) => {
  const { t } = useTranslation();
  
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const res = await API.get(
          `/api/user/pay/status?trade_no=${props.tradeNo}`,
        );
        if (res.data.success) {
          props.onCancel();
          clearInterval(intervalId);
        }
      } catch (error) {
        if (error instanceof Error) {
          showError(error.message);
        }
      }
    };

    const intervalId = setInterval(checkPaymentStatus, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Modal
      title={
        <div className='flex items-center'>
          <QrCode className='mr-2' size={18} />
          {t('使用支付宝扫码付款')}
        </div>
      }
      visible={props.open}
      onCancel={props.onCancel}
      maskClosable={false}
      style={{ width: '420px' }}
      centered
      footer={null}
    >
      <div className='flex flex-col items-center py-4'>
        {/* 二维码容器 */}
        <div className='relative bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl shadow-lg'>
          {/* 装饰性边框 */}
          <div className='absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg'></div>
          <div className='absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg'></div>
          <div className='absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg'></div>
          <div className='absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg'></div>
          
          {/* 二维码 */}
          <div className='bg-white p-4 rounded-xl shadow-sm'>
            <QRCodeSVG 
              value={props.QRCodeURL} 
              size={256}
              level='H'
              bgColor='#ffffff'
              fgColor='#1890ff'
              imageSettings={{
                src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0iIzE4OTBmZiIvPjxwYXRoIGQ9Ik0yNCAxMkMxNy4zNzI2IDEyIDEyIDE3LjM3MjYgMTIgMjRDMTIgMzAuNjI3NCAxNy4zNzI2IDM2IDI0IDM2QzMwLjYyNzQgMzYgMzYgMzAuNjI3NCAzNiAyNEMzNiAxNy4zNzI2IDMwLjYyNzQgMTIgMjQgMTJaTTI2LjQgMjguOEgyMS42VjI3LjJIMjYuNFYyOC44Wk0yOC4zMiAyMi44OEwyNi45NiAyNC4yNEMyNi40IDI0LjggMjYgMjUuMjggMjYgMjYuNEgyMlYyNS44QzIyIDI0LjkyIDIyLjMyIDI0LjA4IDIyLjg4IDIzLjUyTDI0LjcyIDIxLjY4QzI1LjA0IDIxLjM2IDI1LjIgMjAuOTIgMjUuMiAyMC40OEMyNS4yIDE5LjUyIDI0LjQ4IDE4LjggMjMuNTIgMTguOEMyMi41NiAxOC44IDIxLjg0IDE5LjUyIDIxLjg0IDIwLjQ4SDE4QzE4IDIxLjk2IDE5LjM2IDIzLjE2IDIxLjQ0IDIzLjI4QzIyLjA4IDIzLjM2IDIyLjggMjMuNjQgMjMuNDQgMjQuMjhMMjQuNzIgMjUuNTJDMjQuODggMjUuNjggMjUuMiAyNS42OCAyNS4zNiAyNS41MkwyOC4zMiAyMi41NkMzMC4wOCAyMC44IDMwLjA4IDE3LjkyIDI4LjMyIDE2LjE2QzI2LjU2IDE0LjQgMjMuNjggMTQuNCAyMS45MiAxNi4xNkMxOS41NiAxOC41MiAxOS41NiAyMi4yNCAyMS45MiAyNC42SDIxLjk2IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
                height: 48,
                width: 48,
                excavate: true,
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(Alipay);
