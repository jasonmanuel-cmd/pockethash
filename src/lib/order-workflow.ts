export const FULFILLMENT_TYPES = ['delivery', 'pickup', 'in_store'] as const;
export type FulfillmentType = (typeof FULFILLMENT_TYPES)[number];

export const ORDER_STATUSES = ['new', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const FULFILLMENT_LABELS: Record<FulfillmentType, string> = {
  delivery: 'Delivery',
  pickup: 'Pickup',
  in_store: 'In-Store',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'New',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
};

export function getWorkflowSequence(fulfillmentType: FulfillmentType): OrderStatus[] {
  switch (fulfillmentType) {
    case 'delivery':
      return ['new', 'confirmed', 'preparing', 'out_for_delivery', 'completed'];
    case 'pickup':
      return ['new', 'confirmed', 'preparing', 'ready', 'completed'];
    case 'in_store':
      return ['completed'];
  }
}

export function getInitialOrderStatus(fulfillmentType: FulfillmentType): OrderStatus {
  return fulfillmentType === 'in_store' ? 'completed' : 'new';
}

export function getNextWorkflowStatus(currentStatus: OrderStatus, fulfillmentType: FulfillmentType): OrderStatus {
  const sequence = getWorkflowSequence(fulfillmentType);
  const currentIndex = sequence.indexOf(currentStatus);

  if (currentIndex === -1 || currentIndex === sequence.length - 1) {
    return sequence[sequence.length - 1];
  }

  return sequence[currentIndex + 1];
}

export function isOpenWorkflowStatus(status: OrderStatus) {
  return status !== 'completed';
}
