export interface Resident {
  id: string;          
  house_id: string | null; 
  full_name: string;   
  id_card: string;
  phone: string;
  gender: string;      
  status: string;    
}

export interface Invoice {
  id: string;
  invoice_number: string;
  house_id: string;   
  total_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  period_month: number;
  period_year: number;
  due_date: string;
}