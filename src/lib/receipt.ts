import { prisma } from './prisma';
import crypto from 'crypto';

interface ReceiptData {
  transactionId: string;
  receiptNumber: string;
  items: Array<{
    productName: string;
    sku: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: number;
  retailerMargin: number;
  paymentMethod: string;
  timestamp: string;
  retailer: {
    name: string;
    outlet: string;
    address: string;
  };
  staff: {
    name: string;
  };
  terminal: {
    deviceId: string;
  };
}

export class ReceiptService {
  /**
   * Generate receipt number
   */
  static generateReceiptNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `RCP-${timestamp}-${random}`;
  }

  /**
   * Create receipt for transaction
   */
  static async createReceipt(
    transactionId: string,
    receiptData: ReceiptData
  ) {
    const receiptNumber = this.generateReceiptNumber();

    return prisma.receipt.create({
      data: {
        transactionId,
        receiptNumber,
        receiptData: receiptData as any,
      },
    });
  }

  /**
   * Get receipt by transaction ID
   */
  static async getReceiptByTransaction(transactionId: string) {
    return prisma.receipt.findUnique({
      where: { transactionId },
    });
  }

  /**
   * Mark receipt as printed
   */
  static async markPrinted(
    receiptId: string,
    printedBy: string
  ) {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new Error('Receipt not found');
    }

    return prisma.receipt.update({
      where: { id: receiptId },
      data: {
        printedAt: new Date(),
        printedBy,
        printCount: receipt.printCount + 1,
      },
    });
  }

  /**
   * Generate thermal printer formatted text
   */
  static generateThermalPrintText(receiptData: ReceiptData): string {
    const lines = [
      '================================',
      '     CASTLE TERMINAL RECEIPT    ',
      '================================',
      '',
      `Receipt #: ${receiptData.receiptNumber}`,
      `Date: ${new Date(receiptData.timestamp).toLocaleString('en-GB')}`,
      '',
      '--------------------------------',
      'ITEMS:',
      '--------------------------------',
    ];

    receiptData.items.forEach((item) => {
      lines.push(`${item.productName}`);
      lines.push(`  ${item.quantity} x £${item.price.toFixed(2)} = £${item.total.toFixed(2)}`);
    });

    lines.push('--------------------------------');
    lines.push(`TOTAL: £${receiptData.totalAmount.toFixed(2)}`);
    lines.push(`MARGIN: £${receiptData.retailerMargin.toFixed(2)}`);
    lines.push('--------------------------------');
    lines.push('');
    lines.push(`Retailer: ${receiptData.retailer.name}`);
    lines.push(`Outlet: ${receiptData.retailer.outlet}`);
    lines.push(`Staff: ${receiptData.staff.name}`);
    lines.push(`Terminal: ${receiptData.terminal.deviceId}`);
    lines.push('');
    lines.push('================================');
    lines.push('  Thank you for your business!  ');
    lines.push('================================');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate voucher print text (for PIN-based products)
   */
  static generateVoucherPrintText(data: {
    productName: string;
    pin: string;
    serialNumber?: string | null;
    amount: number;
    expiryDate?: string;
  }): string {
    const lines = [
      '================================',
      '        VOUCHER DETAILS         ',
      '================================',
      '',
      `Product: ${data.productName}`,
      `Amount: £${data.amount.toFixed(2)}`,
      '',
      '--------------------------------',
      'YOUR PIN:',
      '--------------------------------',
      '',
      `  ${data.pin}`,
      '',
    ];

    if (data.serialNumber) {
      lines.push(`Serial: ${data.serialNumber}`);
    }

    if (data.expiryDate) {
      lines.push(`Expires: ${new Date(data.expiryDate).toLocaleDateString('en-GB')}`);
    }

    lines.push('');
    lines.push('--------------------------------');
    lines.push('Instructions:');
    lines.push('1. Dial the access number');
    lines.push('2. Enter your PIN when prompted');
    lines.push('3. Follow the voice instructions');
    lines.push('--------------------------------');
    lines.push('');
    lines.push('================================');
    lines.push(' Keep this voucher confidential ');
    lines.push('================================');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate HTML receipt for email/digital delivery
   */
  static generateHtmlReceipt(receiptData: ReceiptData): string {
    const itemsHtml = receiptData.items
      .map(
        (item) => `
        <tr>
          <td>${item.productName}</td>
          <td>${item.quantity}</td>
          <td>£${item.price.toFixed(2)}</td>
          <td>£${item.total.toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
          .items { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items th, .items td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Castle Terminal</h1>
          <p>Receipt #${receiptData.receiptNumber}</p>
          <p>${new Date(receiptData.timestamp).toLocaleString('en-GB')}</p>
        </div>
        
        <table class="items">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="total">
          <p>Total: £${receiptData.totalAmount.toFixed(2)}</p>
          <p>Margin: £${receiptData.retailerMargin.toFixed(2)}</p>
        </div>
        
        <div class="footer">
          <p><strong>Retailer:</strong> ${receiptData.retailer.name}</p>
          <p><strong>Outlet:</strong> ${receiptData.retailer.outlet}</p>
          <p><strong>Staff:</strong> ${receiptData.staff.name}</p>
          <p><strong>Terminal:</strong> ${receiptData.terminal.deviceId}</p>
        </div>
      </body>
      </html>
    `;
  }
}
