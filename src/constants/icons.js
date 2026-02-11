// 订单状态图标配置
export const orderStatusConfig = {
  pending: {
    name: 'clock',
    label: '待发货',
    desc: '等待商家发货'
  },
  shipped: {
    name: 'truck',
    label: '已发货',
    desc: '商家已发货，等待收货'
  },
  completed: {
    name: 'check',
    label: '已完成',
    desc: '订单已完成'
  },
  refunded: {
    name: 'refund',
    label: '已退货',
    desc: '已退货退款'
  }
}

// 图标颜色配置
export const iconColors = {
  pending: '#FF9000',
  shipped: '#34C759',
  completed: '#8E8E93',
  refunded: '#FF3B30'
}
