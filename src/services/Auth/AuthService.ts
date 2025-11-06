import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environment/environment.dev';
import api from '../api';


interface JwtPayload {
  [key: string]: any;
  exp?: number;
}

export class AuthService {
  private tokenKey = 'jwt';
  private roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(this.tokenKey, token);
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(this.tokenKey);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null && this.isTokenValid(token);
  }

 private isTokenValid(token: string): boolean {
  try {
    const decoded: JwtPayload = jwtDecode(token);
    if (!decoded.exp) return false;

    // ✅ Validación real del token según su tiempo de expiración
    return Date.now() < decoded.exp * 1000;
  } catch {
    return false;
  }
}



async getUserId(): Promise<number | null> {
  const token = await this.getToken();
  if (!token) return null;

  try {
    const decoded: JwtPayload = jwtDecode(token);
    if (__DEV__) console.log("🔍 Token decodificado:", decoded);

    const userId =
      decoded["sub"] ||
      decoded["nameid"] ||
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

    return userId ? Number(userId) : null;
  } catch (error) {
    console.warn("Error decoding token:", error);
    return null;
  }
}



  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([this.tokenKey, 'jwt_expires', 'jwt_refresh']);
  }

async setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await AsyncStorage.multiSet([
    ["jwt", accessToken],
    ["jwt_refresh", refreshToken],
  ]);
}



async refreshTokens(): Promise<boolean> {
  const refreshToken = await AsyncStorage.getItem("jwt_refresh");
  if (!refreshToken) return false;

  try {
    const res = await api.post("/auth/refresh", { refreshToken });
    const { accessToken, refreshToken: newRefresh } = res.data;

    if (accessToken && newRefresh) {
      await AsyncStorage.setItem("jwt", accessToken);
      await AsyncStorage.setItem("jwt_refresh", newRefresh);
      console.log("♻️ Tokens refrescados correctamente");
      return true;
    }

    return false;
  } catch (error) {
    console.warn("⚠️ Error refrescando token:", error);
    await this.logout();
    return false;
  }
}

}

export const authService = new AuthService();
