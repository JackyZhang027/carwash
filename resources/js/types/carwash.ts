export type VehicleType = 'car' | 'motorcycle';
export type PaymentMethod = 'cash' | 'qris';
export type Status = 'draft' | 'published';

export type Service = {
    id: number;
    vehicle_type: VehicleType;
    name: string;
    price: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

export type Transaction = {
    id: number;
    date: string;
    service_id: number | null;
    vehicle_type: VehicleType;
    vehicle_brand: string | null;
    service_name: string;
    plate_no: string | null;
    price: number;
    adj_price: number;
    final_price: number;
    payment_method: PaymentMethod;
    status: Status;
    note: string | null;
    created_at: string;
    updated_at: string;
};

export type Expense = {
    id: number;
    date: string;
    type: string;
    amount: number;
    note: string | null;
    status: Status;
    created_at: string;
    updated_at: string;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
};

export type PLSummary = {
    total_income: number;
    total_expense: number;
    net_profit: number;
};

export type AppSettings = {
    app_name: string;
    app_description: string;
    logo_url: string | null;
};
