package alipay

import (
	"context"
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/smartwalle/alipay/v3"

	"github.com/QuantumNous/new-api/pkg/payment/types"
)

type Alipay struct{}

type AlipayConfig struct {
	AppID      string  `json:"app_id"`
	PrivateKey string  `json:"private_key"`
	PublicKey  string  `json:"public_key"`
	PayType    PayType `json:"pay_type"`
}

var client *alipay.Client

const isProduction bool = true

func (a *Alipay) Name() string {
	return "支付宝"
}

func (a *Alipay) InitClient(config *AlipayConfig) error {
	var err error
	client, err = alipay.New(config.AppID, config.PrivateKey, isProduction)
	if err != nil {
		return err
	}
	return client.LoadAliPayPublicKey(config.PublicKey)
}

func (a *Alipay) Pay(config *types.PayConfig) (*types.PayRequest, error) {
	alipayConfig, err := getAlipayConfig()
	if err != nil {
		return nil, err
	}

	if client == nil {
		err := a.InitClient(alipayConfig)
		if err != nil {
			return nil, err
		}
	}

	switch alipayConfig.PayType {
	case PagePay:
		return a.handlePagePay(config)
	case WapPay:
		return a.handleWapPay(config)
	default:
		return a.handleTradePreCreate(config)
	}
}

func (a *Alipay) HandleCallback(c *gin.Context) (*types.PayNotify, error) {
	// 获取通知参数
	params := c.Request.URL.Query()
	if err := c.Request.ParseForm(); err != nil {
		c.Writer.Write([]byte("failure"))
		return nil, fmt.Errorf("Alipay params failed: %v", err)
	}
	for k, v := range c.Request.PostForm {
		params[k] = v
	}
	// 验证通知签名
	if err := client.VerifySign(context.Background(), params); err != nil {
		c.Writer.Write([]byte("failure"))
		return nil, fmt.Errorf("Alipay Signature verification failed: %v", err)
	}
	//解析通知内容
	var noti, err = client.DecodeNotification(context.Background(), params)
	if err != nil {
		c.Writer.Write([]byte("failure"))
		return nil, fmt.Errorf("Alipay Error decoding notification: %v", err)
	}

	if noti.TradeStatus == alipay.TradeStatusSuccess {
		payNotify := &types.PayNotify{
			TradeNo:   noti.OutTradeNo,
			GatewayNo: noti.TradeNo,
		}
		alipay.ACKNotification(c.Writer)
		return payNotify, nil
	}
	c.Writer.Write([]byte("failure"))
	return nil, fmt.Errorf("trade status not success")
}

func getAlipayConfig() (*AlipayConfig, error) {
	appID := os.Getenv("ALIPAY_APP_ID")
	if appID == "" {
		return nil, fmt.Errorf("ALIPAY_APP_ID is not set")
	}
	privateKey := os.Getenv("ALIPAY_PRIVATE_KEY")
	if privateKey == "" {
		return nil, fmt.Errorf("ALIPAY_PRIVATE_KEY is not set")
	}
	publicKey := os.Getenv("ALIPAY_PUBLIC_KEY")
	if publicKey == "" {
		return nil, fmt.Errorf("ALIPAY_PUBLIC_KEY is not set")
	}

	return &AlipayConfig{
		AppID:      appID,
		PrivateKey: privateKey,
		PublicKey:  publicKey,
		PayType:    FacePay,
	}, nil
}
