// src/utils/razorpay.js

/**
 * Loads the Razorpay checkout.js script dynamically if not already available.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Launches the Razorpay checkout dialog with test mode credentials.
 * 
 * @param {Object} options
 * @param {number} options.amountINR - Amount in INR (e.g. 100)
 * @param {Object} options.user - User info { name, email }
 * @param {Function} options.onSuccess - Callback receiving { paymentId, orderId, signature }
 * @param {Function} options.onError - Callback receiving error object or message
 * @param {Function} options.onDismiss - Callback when user closes without paying
 */
export async function openRazorpayCheckout({
  amountINR = 100,
  user = {},
  onSuccess,
  onError,
  onDismiss
}) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    if (onError) {
      onError(new Error('Razorpay SDK failed to load. Please check your internet connection.'));
    }
    return;
  }

  const key = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TVT3DJZ4GvK9jh';

  const options = {
    key: key,
    amount: Math.round(amountINR * 100), // In paise (₹100 = 10000 paise)
    currency: 'INR',
    name: 'AI GYM TRAINER',
    description: 'Lifetime Athlete Pass - AI Biomechanics & 3D Digital Twin',
    image: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png',
    handler: function (response) {
      if (onSuccess) {
        onSuccess({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature
        });
      }
    },
    prefill: {
      name: user?.name || 'Athlete',
      email: user?.email || 'athlete@aigym.local',
      contact: '9999999999'
    },
    notes: {
      plan: 'Lifetime Athlete Pass',
      environment: 'Razorpay Test Mode'
    },
    theme: {
      color: '#0284c7' // Tailwind Sky-600
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) {
          onDismiss();
        }
      }
    }
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      if (onError) {
        onError(response.error || new Error('Payment transaction failed.'));
      }
    });
    rzp.open();
  } catch (err) {
    if (onError) {
      onError(err);
    }
  }
}
