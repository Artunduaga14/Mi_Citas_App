import api from '../api';

export const twoFactorService = {
  async verify(userId: number, code: string) {
    const payload = { userId, code };

    const response = await api.post("/auth/verify-2fa", payload);
    return response.data; // { accessToken, refreshToken, expiresAtUtc }
  }}