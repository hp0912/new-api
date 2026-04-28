import React, { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal, Typography } from '@douyinfe/semi-ui';
import { Smartphone } from 'lucide-react';
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
          clearInterval(intervalId);
          props.onOK();
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
          <Smartphone className='mr-2' size={18} />
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
      <div className='flex flex-col items-center mb-6'>
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
                src: 'https://one-api-houhoukang.oss-cn-beijing.aliyuncs.com/alipay.svg',
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
