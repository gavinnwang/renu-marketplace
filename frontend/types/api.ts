export type ApiResponse<T> = {
  "status": "success" | "fail",
  "data": T,
}