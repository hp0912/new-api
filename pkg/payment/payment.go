package payment

import (
	"github.com/gin-gonic/gin"

	"github.com/QuantumNous/new-api/pkg/payment/gateway/alipay"
	"github.com/QuantumNous/new-api/pkg/payment/types"
)

type PaymentProcessor interface {
	Name() string
	Pay(config *types.PayConfig) (*types.PayRequest, error)
	HandleCallback(c *gin.Context) (*types.PayNotify, error)
}

var Gateways = make(map[string]PaymentProcessor)

func init() {
	Gateways["alipay"] = &alipay.Alipay{}
	// Gateways["wxpay"] = &wxpay.WeChatPay{}
}
