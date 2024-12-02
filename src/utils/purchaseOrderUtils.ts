export const generatePurchaseOrderNumber = (prefix = 'PO') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

export const calculatePurchaseOrderTotals = (items: any[]) => {
  const subtotal = items.reduce((total, item) => {
    return total + (item.quantity || 0) * (item.unit_price || 0);
  }, 0);

  const taxAmount = subtotal * 0.1; // 10% tax rate
  const totalAmount = subtotal + taxAmount;

  return {
    subtotal,
    tax_amount: taxAmount,
    total_amount: totalAmount,
  };
};

export const initializePurchaseOrderForm = (purchaseOrder?: any) => ({
  po_date: purchaseOrder?.po_date || new Date().toISOString().split('T')[0],
  delivery_date: purchaseOrder?.delivery_date || '',
  payment_terms: purchaseOrder?.payment_terms || '',
  delivery_location: purchaseOrder?.delivery_location || '',
  subtotal: purchaseOrder?.subtotal || 0,
  tax_amount: purchaseOrder?.tax_amount || 0,
  total_amount: purchaseOrder?.total_amount || 0,
  subject: purchaseOrder?.subject || '',
  message: purchaseOrder?.message || '',
  notes: purchaseOrder?.notes || '',
  internal_memo: purchaseOrder?.internal_memo || '',
  status: purchaseOrder?.status || 'DRAFT',
  version: purchaseOrder?.version || 1,
  is_active: purchaseOrder?.is_active ?? true,
  is_deleted: purchaseOrder?.is_deleted ?? false,
  case_id: purchaseOrder?.case_id || '',
  quote_id: purchaseOrder?.quote_id || '',
  supplier_id: purchaseOrder?.supplier_id || '',
});

export const initializePurchaseOrderItem = (order: number) => ({
  item_order: order,
  item_code: '',
  item_name: '',
  specifications: '',
  quantity: 1,
  unit: '',
  unit_price: 0,
  amount: 0,
  notes: '',
  internal_memo: '',
  is_active: true,
  is_deleted: false,
});

export const convertQuoteItemToPurchaseOrderItem = (quoteItem: any, index: number) => ({
  ...initializePurchaseOrderItem(index + 1),
  quote_item_id: quoteItem.id,
  item_name: quoteItem.item_name,
  quantity: quoteItem.quantity,
  unit: quoteItem.unit,
  unit_price: quoteItem.purchase_unit_price,
  amount: quoteItem.quantity * quoteItem.purchase_unit_price,
});