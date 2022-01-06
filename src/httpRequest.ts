import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelToken,
} from "axios";
import * as qs from "qs";
import * as zlib from "zlib";
const baseConfig: AxiosRequestConfig = {
  baseURL: "", // <--- Add your base url
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  paramsSerializer: (param) => qs.stringify(param, { indices: false }),
};

let axiosInstance: AxiosInstance;

function getAxiosInstance(): AxiosInstance {
  if (!axiosInstance) {
    axiosInstance = axios.create(baseConfig);
    // Response interceptor
    axiosInstance.interceptors.response.use(
      (async (response: AxiosResponse): Promise<SwaggerResponse<any>> => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        /**
         * Example on response manipulation
         *
         * @example
         *   const swaggerResponse: SwaggerResponse = {
         *     ...response,
         *   };
         *   return swaggerResponse;
         */
        return response;
      }) as any,
      (error: AxiosError) => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        if (error.response) {
          return Promise.reject(
            new RequestError(
              error.response.data,
              error.response.status,
              error.response
            )
          );
        }

        if (error.isAxiosError) {
          return Promise.reject(new RequestError("noInternetConnection"));
        }
        return Promise.reject(error);
      }
    );
  }

  return axiosInstance;
}

class RequestError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public response?: AxiosResponse
  ) {
    super(message);
  }

  isApiException = true;
}

export type Security = any[] | undefined;

export interface SwaggerResponse<R> extends AxiosResponse<R> {}

export { getAxiosInstance, RequestError };

/**
 * Cancellation handled here, you can cancel request by call promise.cancel()
 *
 * @example
 *   const promise = getUsers();
 *   setTimeout(() => promise.cancel(), 30000);
 *   const { data } = await promise;
 *
 * @param getPromise
 * @returns
 */
function cancellation<T>(
  getPromise: (cancelToken: CancelToken) => Promise<T>
): Promise<T> {
  const source = axios.CancelToken.source();
  const promise = getPromise(source.token);
  //@ts-ignore
  promise.cancel = () => {
    source.cancel("request canceled");
  };

  return promise;
}

export const Http = {
  getRequest(
    url: string,
    queryParams?: any | undefined,
    //@ts-ignore
    _requestBody?: undefined,
    configOverride?: AxiosRequestConfig
  ): Promise<SwaggerResponse<any>> {
    return cancellation((cancelToken) =>
      getAxiosInstance().get(url, {
        cancelToken,
        params: queryParams,
        ...configOverride,
      })
    );
  },
  postRequest(
    url: string,
    queryParams?: any | undefined,
    requestBody?: any | undefined,
    configOverride?: AxiosRequestConfig
  ): Promise<SwaggerResponse<any>> {
    return cancellation((cancelToken) =>
      getAxiosInstance().post(url, requestBody, {
        cancelToken,
        params: queryParams,
        ...configOverride,
      })
    );
  },
  putRequest(
    url: string,
    queryParams?: any | undefined,
    requestBody?: any | undefined,
    configOverride?: AxiosRequestConfig
  ): Promise<SwaggerResponse<any>> {
    return cancellation((cancelToken) =>
      getAxiosInstance().put(url, requestBody, {
        cancelToken,
        params: queryParams,
        ...configOverride,
      })
    );
  },
  deleteRequest(
    url: string,
    queryParams?: any | undefined,
    requestBody?: any | undefined,
    configOverride?: AxiosRequestConfig
  ): Promise<SwaggerResponse<any>> {
    return cancellation((cancelToken) =>
      getAxiosInstance().delete(url, {
        data: requestBody,
        cancelToken,
        params: queryParams,
        ...configOverride,
      })
    );
  },
};

export async function gzip(data: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zlib.gzip(data, (err, val) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(val);
    });
  });
}
