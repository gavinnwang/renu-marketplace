export type ApiResponse<T> = SuccessResponse<T> | FailResponse;

type SuccessResponse<T> = {
  data: T;
  status: "success";
};

type FailResponse = {
  data: string;
  status: "fail";
};