import { axiosClient } from "./axiosClient"

export async function get<T>(url: string, params?: object): Promise<T> {
  const response = await axiosClient.get<T>(url, { params })
  return response.data
}

export async function post<T, D = unknown>(url: string, data: D): Promise<T> {
  const response = await axiosClient.post<T>(url, data)
  return response.data
}

export async function put<T, D = unknown>(url: string, data: D): Promise<T> {
  const response = await axiosClient.put<T>(url, data)
  return response.data
}

// "delete" é palavra reservada em JS/TS, por isso a função chama-se `del`
export async function del<T>(url: string): Promise<T> {
  const response = await axiosClient.delete<T>(url)
  return response.data
}