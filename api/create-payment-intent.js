const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { amount } = req.body;

    // バリデーション
    if (!amount || amount < 100) {
      res.status(400).json({ error: '金額は100円以上で入力してください' });
      return;
    }

    // PaymentIntent作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'jpy',
      metadata: {
        order_id: `order_${Date.now()}`,
      },
    });

    res.status(200).json({
      client_secret: paymentIntent.client_secret,
      amount: amount,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: '決済処理でエラーが発生しました',
      details: error.message 
    });
  }
};
