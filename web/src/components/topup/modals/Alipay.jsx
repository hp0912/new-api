import React, { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '@douyinfe/semi-ui';
import { QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API, showError } from '../../../helpers';

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
      size='small'
      centered
      footer={null}
    >
      <div className='bg-white p-4 rounded-lg shadow-sm'>
        <QRCodeSVG value={props.QRCodeURL} size={180} />
      </div>
    </Modal>
  );
};

export default React.memo(Alipay);
