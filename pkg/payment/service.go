package payment

import (
	"errors"
	"fmt"
	"net/url"

	"github.com/gin-gonic/gin"

	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/pkg/payment/types"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting/system_setting"
)

type PaymentService struct {
	Payment *model.TopUp
	gateway PaymentProcessor
}

type PayMoney struct {
	Amount   float64
	Currency types.CurrencyType
}

func NewPaymentService(paymentType, tradeNo string) (*PaymentService, error) {
	payment := model.GetTopUpByTradeNo(tradeNo)
	if payment == nil {
		return nil, errors.New("payment not found")
	}

	gateway, ok := Gateways[paymentType]
	if !ok {
		return nil, errors.New("payment gateway not found")
	}

	return &PaymentService{
		Payment: payment,
		gateway: gateway,
	}, nil
}

func (s *PaymentService) Pay(tradeNo string, amount float64, userID int) (*types.PayRequest, error) {
	notifyURL, err := s.getNotifyURL()
	if err != nil {
		return nil, err
	}
	returnURL, err := s.getReturnURL()
	if err != nil {
		return nil, err
	}
	config := &types.PayConfig{
		Money:     amount,
		TradeNo:   tradeNo,
		NotifyURL: notifyURL,
		ReturnURL: returnURL,
		Currency:  types.CurrencyTypeCNY,
		UserID:    userID,
	}
	payRequest, err := s.gateway.Pay(config)
	if err != nil {
		return nil, err
	}

	return payRequest, nil
}

func (s *PaymentService) HandleCallback(c *gin.Context) (*types.PayNotify, error) {
	payNotify, err := s.gateway.HandleCallback(c)
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("%s payment callback error: %v", s.gateway.Name(), err))
	}
	return payNotify, err
}

func (s *PaymentService) getNotifyURL() (string, error) {
	notifyDomain := service.GetCallbackAddress()
	if notifyDomain == "" {
		notifyDomain = system_setting.ServerAddress
	}
	return url.JoinPath(notifyDomain, fmt.Sprintf("/api/payment/notify/%s", s.Payment.TradeNo))
}

func (s *PaymentService) getReturnURL() (string, error) {
	return url.JoinPath(system_setting.ServerAddress, "/console/log")
}
