import crypto from 'crypto';

const DTONE_BASE_URL = process.env.DTONE_BASE_URL || 'https://preprod-dvs-api.dtone.com/v1/';
const DTONE_API_KEY = process.env.DTONE_API_KEY || '';
const DTONE_API_SECRET = process.env.DTONE_API_SECRET || '';

interface DTOneProduct {
  id: number;
  name: string;
  operator: {
    id: number;
    name: string;
    country: {
      iso_code: string;
      name: string;
    };
  };
  type: string;
  denomination: number;
  currency: string;
}

interface DTOneTransaction {
  id: number;
  status: string;
  external_id: string;
  product_id: number;
  credit_party_identifier: {
    mobile_number: string;
  };
  retail_price?: number;
  wholesale_price?: number;
  delivered_amount?: number;
  delivered_amount_currency?: string;
  creation_date: string;
  completion_date?: string;
}

function generateSignature(method: string, endpoint: string, body: string = ''): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const message = `${method.toUpperCase()}${endpoint}${timestamp}${DTONE_API_KEY}${body}`;
  const signature = crypto
    .createHmac('sha256', DTONE_API_SECRET)
    .update(message)
    .digest('hex');
  return `${timestamp}:${signature}`;
}

async function dtoneRequest<T>(
  method: string,
  endpoint: string,
  body?: object
): Promise<T> {
  const url = `${DTONE_BASE_URL}${endpoint}`;
  const bodyString = body ? JSON.stringify(body) : '';
  const signature = generateSignature(method, endpoint, bodyString);

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Sign ${DTONE_API_KEY}:${signature}`,
    },
    body: bodyString || undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`DT One API Error: ${error.message || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const DTOneService = {
  // Products
  async getProducts(): Promise<DTOneProduct[]> {
    return dtoneRequest('GET', 'products');
  },

  async getProduct(productId: number): Promise<DTOneProduct> {
    return dtoneRequest('GET', `products/${productId}`);
  },

  async getProductsByCountry(countryIso: string): Promise<DTOneProduct[]> {
    return dtoneRequest('GET', `products?country_iso_code=${countryIso}`);
  },

  async getProductsByOperator(operatorId: number): Promise<DTOneProduct[]> {
    return dtoneRequest('GET', `products?operator_id=${operatorId}`);
  },

  // Lookups (for checking recipient info)
  async lookupMobileNumber(mobileNumber: string, productId: number): Promise<any> {
    return dtoneRequest('POST', 'lookups/mobile-number', {
      mobile_number: mobileNumber,
      product_id: productId,
    });
  },

  // Transactions
  async createTransaction(
    productId: number,
    mobileNumber: string,
    externalId: string,
    callbackUrl?: string
  ): Promise<DTOneTransaction> {
    const body: any = {
      product_id: productId,
      external_id: externalId,
      credit_party_identifier: {
        mobile_number: mobileNumber,
      },
    };

    if (callbackUrl) {
      body.callback_url = callbackUrl;
    }

    return dtoneRequest('POST', 'transactions', body);
  },

  async getTransaction(transactionId: number): Promise<DTOneTransaction> {
    return dtoneRequest('GET', `transactions/${transactionId}`);
  },

  async confirmTransaction(transactionId: number): Promise<DTOneTransaction> {
    return dtoneRequest('POST', `transactions/${transactionId}/confirm`);
  },

  async cancelTransaction(transactionId: number): Promise<DTOneTransaction> {
    return dtoneRequest('POST', `transactions/${transactionId}/cancel`);
  },

  // Operators
  async getOperators(): Promise<any[]> {
    return dtoneRequest('GET', 'operators');
  },

  async getOperatorsByCountry(countryIso: string): Promise<any[]> {
    return dtoneRequest('GET', `operators?country_iso_code=${countryIso}`);
  },

  // Countries
  async getCountries(): Promise<any[]> {
    return dtoneRequest('GET', 'countries');
  },

  // Promotions
  async getPromotions(): Promise<any[]> {
    return dtoneRequest('GET', 'promotions');
  },

  async getPromotionsByCountry(countryIso: string): Promise<any[]> {
    return dtoneRequest('GET', `promotions?country_iso_code=${countryIso}`);
  },

  // Balances
  async getBalances(): Promise<any> {
    return dtoneRequest('GET', 'balances');
  },
};

export type { DTOneProduct, DTOneTransaction };
