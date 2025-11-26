import api from "./api";

export interface DoctorReviewCreateDto {
  doctorId: number;
  userId: number;
  rating: number;
  citationId?: number | null;
  comment?: string | null;
}

export const DoctorReviewService = {
  async getAll(doctorId: number) {

    const url = `/doctor/${doctorId}/doctorReview`;

    console.log("🚀 GET DoctorReview URL:", api.defaults.baseURL + url);

    const res = await api.get(url);
    return res.data;
  },

  async create(payload: any) {
    console.log("🚀 POST DoctorReview URL:", api.defaults.baseURL + "/DoctorReview");
    const res = await api.post("/DoctorReview", payload);
    return res.data;
  },
};
