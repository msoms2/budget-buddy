# Cryptocurrency Support in Budget Buddy

## Overview

Budget Buddy now fully supports cryptocurrency transactions, including Bitcoin (BTC) and other cryptocurrencies with large exchange rates. This document explains how cryptocurrency support works and provides guidelines for using cryptocurrencies in the application.

## Key Features

1. **Support for any currency pair**: The application can now handle conversions between any two currencies, including cryptocurrencies.
2. **High-value exchange rates**: The system correctly handles cryptocurrencies like Bitcoin that have very high exchange rates (e.g., 1 BTC = £37,000).
3. **Precision scaling**: For exchange rates that exceed database limitations, the system automatically applies scaling to maintain accuracy.
4. **Round-trip conversion**: Converting back and forth between currencies maintains high precision.

## Using Cryptocurrencies

### Creating Cryptocurrency Transactions

You can create expenses or earnings in any cryptocurrency supported by the system:

1. Select your cryptocurrency from the currency dropdown when creating a transaction
2. Enter the amount in the cryptocurrency (e.g., 0.01 BTC)
3. Save the transaction

The system will automatically handle the conversion to your base currency for reporting purposes.

### Viewing Cryptocurrency Transactions

Transactions made in cryptocurrencies will display:
- The converted amount in your base currency
- The original cryptocurrency amount and symbol
- An indicator that currency conversion was applied

### Converting Transactions Between Currencies

You can change the currency of an existing transaction:

1. Edit the transaction
2. Select a new currency from the dropdown
3. The system will automatically convert the amount using current exchange rates

### Adding New Cryptocurrencies

Administrators can add new cryptocurrencies to the system:

1. Go to the currency management section
2. Add a new currency with the appropriate code (e.g., ETH, XRP)
3. Set the exchange rate against the base currency

## Technical Implementation

The cryptocurrency support is implemented through several enhancements:

1. **Database changes**: Increased column precision in the database to handle large exchange rates
2. **Exchange rate scaling**: For rates exceeding database limits, automatic scaling is applied
3. **Currency model improvements**: Enhanced currency conversion logic for direct rate handling
4. **Transaction controllers**: Updated to handle special cases for cryptocurrencies

## Troubleshooting

If you encounter issues with cryptocurrency transactions:

1. **Incorrect conversions**: Verify the exchange rate is set correctly for the cryptocurrency
2. **Display issues**: Ensure your browser supports displaying small decimal values
3. **Zero values**: If a conversion results in very small values (e.g., 0.00000001), the system may round to zero in some displays

For further assistance, contact the system administrator.
