export interface ApiResponse<T> {
    data: T;
    status: "success" | "failure";
  }