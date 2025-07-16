// Script to backfill missing Transaction documents for sold products
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
require('dotenv').config({ path: '../config.env' });

async function backfillTransactions() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const soldProducts = await Product.find({ isSold: true });
  let createdCount = 0;

  for (const product of soldProducts) {
    const exists = await Transaction.findOne({
      product: product._id,
      seller: product.seller,
      buyer: product.soldTo,
      status: 'completed'
    });
    if (!exists && product.soldTo) {
      await Transaction.create({
        product: product._id,
        seller: product.seller,
        buyer: product.soldTo,
        price: product.price,
        status: 'completed',
        paymentMethod: 'cash',
        transactionDate: product.soldAt || new Date()
      });
      createdCount++;
      console.log(`Created transaction for product ${product._id}`);
    }
  }

  console.log(`Backfill complete. Created ${createdCount} transactions.`);
  await mongoose.disconnect();
}

backfillTransactions().catch(err => {
  console.error('Error during backfill:', err);
  mongoose.disconnect();
}); 