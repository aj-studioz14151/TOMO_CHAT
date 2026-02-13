import { AdminUserListItem } from "app-types/admin";

interface GeocodeResponse {
  status: string;
  lat: number;
  lon: number;
  city: string;
  country: string;
  query: string;
}

const geoCache = new Map<string, AdminUserListItem["location"]>();

export async function geocodeIp(
  ip: string,
): Promise<AdminUserListItem["location"]> {
  if (!ip || ip === "::1" || ip === "127.0.0.1") return null;

  if (geoCache.has(ip)) {
    return geoCache.get(ip)!;
  }

  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,lat,lon,city,country,query`,
    );
    const data: GeocodeResponse = await response.json();

    if (data.status === "success") {
      const location = {
        lat: data.lat,
        lon: data.lon,
        city: data.city,
        country: data.country,
      };
      geoCache.set(ip, location);
      return location;
    }
  } catch (error) {
    console.error(`Geocoding failed for IP: ${ip}`, error);
  }

  return null;
}

export async function enrichUsersWithLocation(
  users: AdminUserListItem[],
): Promise<AdminUserListItem[]> {
  const enrichedUsers = await Promise.all(
    users.map(async (user) => {
      if (user.ipAddress) {
        const location = await geocodeIp(user.ipAddress);
        return { ...user, location };
      }
      return user;
    }),
  );
  return enrichedUsers;
}
