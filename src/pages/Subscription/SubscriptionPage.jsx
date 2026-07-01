import { useState } from 'react';
import { Check, ShieldCheck, Sparkles, Phone, CreditCard, QrCode, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { backendApi } from '../../api/backendApi';
import Modal from '../../components/Modal/Modal';
import './SubscriptionPage.css';

const PLANS = [
  {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    scans: 10,
    features: ['10 Automated Scans', 'Basic Vulnerability Detection', 'Standard PDF Reports', '1 User Seat'],
    trial: null,
    badge: 'Starter Pack'
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    price: 19,
    scans: 30,
    features: ['30 Automated Scans', 'Advanced ML Risk Profiling', 'Priority Queued Scans', 'Email Notifications', '7-Day Free Trial'],
    trial: '7-Day Trial',
    badge: 'Popular for Devs'
  },
  {
    id: 'developer',
    name: 'Developer Plan',
    price: 49,
    scans: 100,
    features: ['100 Automated Scans', 'Full Crypto Analysis', 'API Scanning Access', '14-Day Free Trial', 'Dedicated Integrations'],
    trial: '14-Day Trial',
    badge: 'Best Value',
    popular: true
  },
  {
    id: 'team',
    name: 'Team Plan',
    price: 149,
    scans: 500,
    features: ['500 Automated Scans', 'Team Collaboration Dashboard', 'Vulnerability Trend Analytics', '14-Day Free Trial', 'Priority Support'],
    trial: '14-Day Trial',
    badge: 'Security Teams'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 499,
    scans: 99999,
    features: ['Unlimited Scans', 'Custom ML Rules Training', 'Dedicated Technical Account Manager', '30-Day Free Trial', 'SLA Response Guarantee'],
    trial: '30-Day Trial',
    badge: 'Enterprise Grade'
  }
];

export default function SubscriptionPage() {
  const { user, updateUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutMethod, setCheckoutMethod] = useState('mpesa'); // mpesa, card, paypass
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly, annual

  // Form Fields
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(user?.name || '');

  // Simulation Status
  const [paymentStep, setPaymentStep] = useState('idle'); // idle, processing, pin_sent, verified, success, error
  const [paymentTimer, setPaymentTimer] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const currentTier = (user?.subscription_tier || 'free').toLowerCase();

  const handleOpenCheckout = (plan) => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
    setPaymentStep('idle');
    setErrorMessage('');
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setPaymentStep('idle');
  };

  // Simulate Payment Process
  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setPaymentStep('processing');

    if (checkoutMethod === 'mpesa') {
      if (!phoneNumber.match(/^\+?[0-9]{10,13}$/)) {
        setErrorMessage('Please enter a valid phone number');
        setPaymentStep('idle');
        return;
      }
      
      // Simulate STK Push Handshake
      setTimeout(() => {
        setPaymentStep('pin_sent');
        setPaymentTimer(15);
        
        // Count down timer simulation
        const interval = setInterval(() => {
          setPaymentTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              completeBackendSubscription();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 1500);

    } else if (checkoutMethod === 'card') {
      if (cardNumber.length < 16 || cardExpiry.length < 5 || cardCvv.length < 3) {
        setErrorMessage('Please complete all card fields');
        setPaymentStep('idle');
        return;
      }
      
      // Simulate secure bank authentication
      setTimeout(() => {
        setPaymentStep('verified');
        setTimeout(() => {
          completeBackendSubscription();
        }, 1200);
      }, 2000);

    } else if (checkoutMethod === 'paypass') {
      // Simulate PayPass QR scan
      setTimeout(() => {
        setPaymentStep('verified');
        setTimeout(() => {
          completeBackendSubscription();
        }, 1200);
      }, 2500);
    }
  };

  const completeBackendSubscription = async () => {
    try {
      const response = await backendApi.subscribe(selectedPlan.id, checkoutMethod, phoneNumber);
      
      // Update local context
      updateUser({
        subscription_tier: selectedPlan.id,
        subscription_status: 'active',
        scan_limit: response.scan_limit,
        mpesa_number: phoneNumber,
        payment_method: checkoutMethod
      });
      
      setPaymentStep('success');
      setTimeout(() => {
        handleCloseCheckout();
      }, 2000);
    } catch (err) {
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
      setPaymentStep('idle');
    }
  };

  return (
    <div className="subscription-page">
      <div className="sub-header animate-fade-up">
        <h2 className="page-title">Subscription Billing & Upgrades</h2>
        <p className="page-desc">
          Scale your cryptographic auditing limits dynamically. Current plan: <span className="active-tier-tag">{currentTier.toUpperCase()}</span>
        </p>

        <div className="billing-toggle-container">
          <span className={billingCycle === 'monthly' ? 'active-toggle' : ''}>Monthly</span>
          <button 
            className={`billing-toggle-btn ${billingCycle === 'annual' ? 'annual-active' : ''}`}
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
            aria-label="Toggle billing cycle"
          >
            <span className="billing-toggle-dot" />
          </button>
          <span className={billingCycle === 'annual' ? 'active-toggle' : ''}>
            Annually <span className="save-badge">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="plans-grid">
        {PLANS.map((plan, i) => {
          const isActive = currentTier === plan.id;
          const calculatedPrice = billingCycle === 'annual' 
            ? Math.round(plan.price * 0.8) 
            : plan.price;

          return (
            <div 
              key={plan.id} 
              className={`plan-card animate-fade-up stagger-${i + 1} ${plan.popular ? 'popular' : ''} ${isActive ? 'active' : ''}`}
            >
              {plan.popular && <div className="popular-badge"><Sparkles size={12} /> RECOMMENDED</div>}
              
              <div className="plan-header">
                <span className="plan-badge">{plan.badge}</span>
                <h3 className="plan-title">{plan.name}</h3>
                <div className="plan-price">
                  <span className="price-currency">$</span>
                  <span className="price-value">{calculatedPrice}</span>
                  <span className="price-duration">/mo</span>
                </div>
                {billingCycle === 'annual' && plan.price > 0 && (
                  <div className="annual-billed-detail">Billed ${calculatedPrice * 12}/year</div>
                )}
              </div>

              <div className="plan-limit-info">
                <strong>{plan.scans === 99999 ? 'Unlimited' : plan.scans}</strong> scans included
              </div>

              <ul className="plan-features-list">
                {plan.features.map((feat, idx) => (
                  <li key={idx}>
                    <Check size={14} className="feature-check" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="plan-footer">
                {isActive ? (
                  <button className="btn btn-secondary plan-btn" disabled>
                    Current Active Plan
                  </button>
                ) : (
                  <button 
                    className={`btn plan-btn ${plan.popular ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => handleOpenCheckout(plan)}
                  >
                    {plan.trial ? `Start ${plan.trial}` : 'Subscribe Now'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      <Modal open={isCheckoutOpen} onClose={handleCloseCheckout} title={`Upgrade to ${selectedPlan?.name}`}>
        <div className="checkout-container">
          {paymentStep === 'idle' && (
            <form onSubmit={handleProcessPayment}>
              <div className="checkout-summary-bar">
                <span>Total Due:</span>
                <strong>${billingCycle === 'annual' ? Math.round(selectedPlan?.price * 0.8) : selectedPlan?.price}</strong>
              </div>

              {errorMessage && (
                <div className="checkout-error">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="checkout-methods-tabs">
                <button
                  type="button"
                  className={`checkout-tab-btn ${checkoutMethod === 'mpesa' ? 'active' : ''}`}
                  onClick={() => setCheckoutMethod('mpesa')}
                >
                  <Phone size={16} />
                  <span>MPesa</span>
                </button>
                <button
                  type="button"
                  className={`checkout-tab-btn ${checkoutMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setCheckoutMethod('card')}
                >
                  <CreditCard size={16} />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  className={`checkout-tab-btn ${checkoutMethod === 'paypass' ? 'active' : ''}`}
                  onClick={() => setCheckoutMethod('paypass')}
                >
                  <QrCode size={16} />
                  <span>PayPass</span>
                </button>
              </div>

              {/* MPesa Form */}
              {checkoutMethod === 'mpesa' && (
                <div className="payment-form-section animate-fade-in">
                  <div className="form-group">
                    <label className="form-label">Safaricom Mobile Number</label>
                    <div className="form-input-wrapper">
                      <Phone size={16} className="form-input-icon" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 0712345678"
                        className="form-input has-icon"
                      />
                    </div>
                    <small className="form-help-text">An STK PIN prompt will be sent to this phone number.</small>
                  </div>
                </div>
              )}

              {/* Credit Card Form */}
              {checkoutMethod === 'card' && (
                <div className="payment-form-section animate-fade-in">
                  <div className="form-group">
                    <label className="form-label">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Jane Doe"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input
                      type="text"
                      required
                      maxLength="16"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="4000 1234 5678 9010"
                      className="form-input"
                    />
                  </div>
                  <div className="form-row-custom">
                    <div className="form-group half-width">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="text"
                        required
                        maxLength="5"
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.length === 2 && !val.includes('/')) val += '/';
                          setCardExpiry(val);
                        }}
                        placeholder="MM/YY"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group half-width">
                      <label className="form-label">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength="3"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PayPass QR Code */}
              {checkoutMethod === 'paypass' && (
                <div className="payment-form-section paypass-section animate-fade-in">
                  <div className="qr-container">
                    <QrCode size={180} className="qr-code-display" />
                    <div className="qr-scan-lens" />
                  </div>
                  <p className="paypass-instructions">Scan QR with your PayPass Wallet App to authorize.</p>
                </div>
              )}

              <button type="submit" className="btn btn-primary checkout-pay-btn mt-4">
                Proceed to Checkout
              </button>
            </form>
          )}

          {/* Processing and Status Simulations */}
          {paymentStep === 'processing' && (
            <div className="payment-sim-status animate-fade-in">
              <Loader size={36} className="spin status-loader" />
              <h3>Connecting securely...</h3>
              <p>Establishing authorization gateway with payment processor.</p>
            </div>
          )}

          {paymentStep === 'pin_sent' && (
            <div className="payment-sim-status animate-fade-in">
              <div className="phone-ping-animation">
                <Phone size={36} />
                <div className="ping-ring" />
              </div>
              <h3>STK Prompt Sent</h3>
              <p>Check your handset for the MPesa PIN request.</p>
              <div className="stk-timer">Awaiting Response ({paymentTimer}s)</div>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm mt-4"
                onClick={() => setPaymentStep('idle')}
              >
                Cancel Simulation
              </button>
            </div>
          )}

          {paymentStep === 'verified' && (
            <div className="payment-sim-status animate-fade-in">
              <ShieldCheck size={40} className="verified-shield-icon" />
              <h3>Authorization Approved</h3>
              <p>Updating your subscription license on servers.</p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="payment-sim-status checkout-success-screen animate-fade-in">
              <div className="success-pulse-check">
                <Check size={48} />
              </div>
              <h3>Transaction Complete!</h3>
              <p>Your subscription is active. Enjoy expanded scan quotas.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
