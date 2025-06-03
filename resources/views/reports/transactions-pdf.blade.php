<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transakciju pārskats</title>
    <style>
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        
        .header h1 {
            font-size: 24px;
            margin: 0 0 10px 0;
            color: #2c3e50;
        }
        
        .period-info {
            font-size: 14px;
            color: #666;
            margin: 10px 0;
        }
        
        .filters-section {
            background-color: #f8f9fa;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            border: 1px solid #dee2e6;
        }
        
        .filters-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #495057;
        }
        
        .filter-item {
            margin: 5px 0;
        }
        
        .transactions-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 11px;
        }
        
        .transactions-table th {
            background-color: #343a40;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #dee2e6;
        }
        
        .transactions-table td {
            padding: 10px 8px;
            border: 1px solid #dee2e6;
            vertical-align: top;
        }
        
        .transactions-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .transactions-table tbody tr:hover {
            background-color: #e9ecef;
        }
        
        .amount {
            text-align: right;
            font-weight: bold;
        }
        
        .amount.income {
            color: #28a745;
        }
        
        .amount.expense {
            color: #dc3545;
        }
        
        .type-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .type-badge.income {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .type-badge.expense {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .summary-section {
            margin: 30px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 5px;
            border: 1px solid #dee2e6;
        }
        
        .summary-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #495057;
            text-align: center;
        }
        
        .summary-grid {
            display: table;
            width: 100%;
        }
        
        .summary-row {
            display: table-row;
        }
        
        .summary-label, .summary-value {
            display: table-cell;
            padding: 8px 15px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .summary-label {
            font-weight: bold;
            color: #495057;
            width: 60%;
        }
        
        .summary-value {
            text-align: right;
            font-weight: bold;
            width: 40%;
        }
        
        .summary-value.positive {
            color: #28a745;
        }
        
        .summary-value.negative {
            color: #dc3545;
        }
        
        .summary-value.neutral {
            color: #6c757d;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            font-size: 10px;
            color: #6c757d;
        }
        
        .no-data {
            text-align: center;
            padding: 40px;
            color: #6c757d;
            font-style: italic;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 15px;
            }
            
            .transactions-table {
                font-size: 10px;
            }
            
            .transactions-table th,
            .transactions-table td {
                padding: 6px 4px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Transakciju pārskats</h1>
        <div class="period-info">
            <strong>Periods:</strong> No {{ $start_date }} līdz {{ $end_date }}
        </div>
        <div class="period-info">
            <strong>Ģenerēšanas datums:</strong> {{ $generation_date }}
        </div>
    </div>

    @if($filters['has_category_filter'])
    <div class="filters-section">
        <div class="filters-title">Atlases kritēriji:</div>
        
        @if($filters['transaction_type'] !== 'all')
        <div class="filter-item">
            <strong>Transakciju tips:</strong> 
            @if($filters['transaction_type'] === 'income')
                Ienākumi
            @elseif($filters['transaction_type'] === 'expense')
                Izdevumi
            @endif
        </div>
        @endif
        
        @if(!empty($filters['categories']) || !empty($filters['income_categories']))
        <div class="filter-item">
            <strong>Kategorijas:</strong> Atlasītas specifiskas kategorijas
        </div>
        @endif
    </div>
    @endif

    @if($transactions->count() > 0)
    <table class="transactions-table">
        <thead>
            <tr>
                <th style="width: 12%;">Datums</th>
                <th style="width: 35%;">Apraksts/Nosaukums</th>
                <th style="width: 20%;">Kategorija</th>
                <th style="width: 15%;">Summa (EUR)</th>
                <th style="width: 18%;">Transakcijas tips</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $transaction)
            <tr>
                <td>{{ $transaction['date'] }}</td>
                <td>{{ $transaction['description'] }}</td>
                <td>{{ $transaction['category'] }}</td>
                <td class="amount {{ strtolower($transaction['type_key']) }}">
                    @if($transaction['type_key'] === 'expense')
                        -€{{ number_format($transaction['amount'], 2, ',', ' ') }}
                    @else
                        €{{ number_format($transaction['amount'], 2, ',', ' ') }}
                    @endif
                </td>
                <td>
                    <span class="type-badge {{ strtolower($transaction['type_key']) }}">
                        @if($transaction['type'] === 'Income')
                            Ienākumi
                        @else
                            Izdevumi
                        @endif
                    </span>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <div class="no-data">
        Atlasītajā periodā nav atrasta neviena transakcija, kas atbilstu norādītajiem kritērijiem.
    </div>
    @endif

    <div class="summary-section">
        <div class="summary-title">Kopsavilkums</div>
        <div class="summary-grid">
            <div class="summary-row">
                <div class="summary-label">Kopējie ienākumi:</div>
                <div class="summary-value positive">€{{ number_format($summary['total_income'], 2, ',', ' ') }}</div>
            </div>
            <div class="summary-row">
                <div class="summary-label">Kopējie izdevumi:</div>
                <div class="summary-value negative">€{{ number_format($summary['total_expenses'], 2, ',', ' ') }}</div>
            </div>
            <div class="summary-row">
                <div class="summary-label">Bilance:</div>
                <div class="summary-value {{ $summary['balance'] >= 0 ? 'positive' : 'negative' }}">
                    @if($summary['balance'] >= 0)
                        €{{ number_format($summary['balance'], 2, ',', ' ') }}
                    @else
                        -€{{ number_format(abs($summary['balance']), 2, ',', ' ') }}
                    @endif
                </div>
            </div>
            <div class="summary-row">
                <div class="summary-label">Kopējais transakciju skaits:</div>
                <div class="summary-value neutral">{{ $summary['transaction_count'] }}</div>
            </div>
            <div class="summary-row">
                <div class="summary-label">Ienākumu transakcijas:</div>
                <div class="summary-value neutral">{{ $summary['income_count'] }}</div>
            </div>
            <div class="summary-row">
                <div class="summary-label">Izdevumu transakcijas:</div>
                <div class="summary-value neutral">{{ $summary['expense_count'] }}</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Šis pārskats ir ģenerēts automātiski no Budget Buddy sistēmas.</p>
        <p>Pārskats ietver transakciju datus par periodu no {{ $start_date }} līdz {{ $end_date }}.</p>
    </div>
</body>
</html>