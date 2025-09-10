export interface SignatureData {
    nome: string;
    telefone?: string;
    email: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }
  
  export interface GenerateSignatureResponse {
    imageUrl: string;
    fileName: string;
  }