"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AdminUserListItem } from "app-types/admin";
import { Avatar, AvatarFallback, AvatarImage } from "ui/avatar";
import { getUserAvatar } from "lib/user/utils";
import { Card, CardContent, CardHeader, CardTitle } from "ui/card";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface UserMapProps {
  users: AdminUserListItem[];
}

export function UserMap({ users }: UserMapProps) {
  const [mounted, setMounted] = useState(false);
  const [geojsonData, setGeojsonData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch Tamil Nadu GeoJSON
    fetch("/maps/tamilnadu.geojson")
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error("Failed to load GeoJSON:", err));
  }, []);

  if (!mounted)
    return (
      <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg" />
    );

  const usersWithLocation = users.filter((u) => u.location);

  return (
    <Card className="overflow-hidden border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-semibold">User Locations</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[600px] w-full rounded-lg border overflow-hidden z-0">
          <MapContainer
            center={[11.1271, 78.6569]} // Centered on Tamil Nadu
            zoom={7}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geojsonData && (
              <GeoJSON
                data={geojsonData}
                style={{
                  color: "#1a1a1a", // Darker border
                  weight: 4,
                  opacity: 1,
                  fillColor: "#000",
                  fillOpacity: 0.05,
                }}
              />
            )}
            {usersWithLocation.map((user) => (
              <Marker
                key={user.id}
                position={[user.location!.lat, user.location!.lon]}
              >
                <Popup>
                  <div className="flex flex-col items-center gap-2 min-w-[150px]">
                    <Avatar className="size-10">
                      <AvatarImage src={getUserAvatar(user)} />
                      <AvatarFallback>
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <div className="font-bold">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                      <div className="text-xs mt-1">
                        {user.location?.city}, {user.location?.country}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        IP: {user.ipAddress}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
