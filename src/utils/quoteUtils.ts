export const generateQuoteNumber = (prefix = 'QT') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

export const calculateTotals = (items: any[]) => {
  let subtotal = 0;
  let purchaseCost = 0;

  items.forEach(item => {
    if (item.item_type === 'NORMAL') {
      const amount = (item.quantity || 0) * (item.unit_price || 0);
      subtotal += amount;
      purchaseCost += (item.quantity || 0) * (item.purchase_unit_price || 0);
    } else if (item.item_type === 'DISCOUNT') {
      subtotal -= item.amount;
    }
  });

  const taxAmount = subtotal * 0.1; // 10% tax rate
  const totalAmount = subtotal + taxAmount;
  const profitAmount = totalAmount - purchaseCost;
  const profitRate = totalAmount ? (profitAmount / totalAmount) * 100 : 0;

  return {
    subtotal,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    purchase_cost: purchaseCost,
    profit_amount: profitAmount,
    profit_rate: profitRate,
  };
};