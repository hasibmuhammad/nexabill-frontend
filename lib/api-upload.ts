import { api } from "./api";

export interface UploadResponse {
  src: string;
  alt: string;
}

export const uploadApi = {
  uploadImage: async (file: File, organizationName: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("organization_name", organizationName);
    formData.append("file", file);

    const response = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // The backend uses a global ApiResponseInterceptor that wraps the result in a 'data' property.
    // Axios also puts the response body in a 'data' property.
    return response.data.data;
  },
};
