"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

interface Props {
    driverLocation: [number, number] | null
    pickupCoords?: [number, number]
    dropoffCoords?: [number, number]
}

const LiveMap = ({ driverLocation, pickupCoords, dropoffCoords }: Props) => {
    const mapRef = useRef<L.Map | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const driverMarkerRef = useRef<L.Marker | null>(null)

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return

        const map = L.map(containerRef.current).setView(
            [10.5276, 76.2144],
            13
        )
        mapRef.current = map

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "© OpenStreetMap contributors",
            }
        ).addTo(map)

        if (pickupCoords) {
            L.marker(pickupCoords)
                .addTo(map)
                .bindPopup("Pickup location")
        }

        if (dropoffCoords) {
            const greenIcon = new L.Icon({
                iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            })
            L.marker(dropoffCoords, { icon: greenIcon })
                .addTo(map)
                .bindPopup("Dropoff location")
        }

        return () => {
            map.remove()
            mapRef.current = null
        }
    }, [])

    useEffect(() => {
        if (!mapRef.current || !driverLocation) return

        if (driverMarkerRef.current) {
            driverMarkerRef.current.setLatLng(driverLocation)
        } else {
            const driverIcon = new L.Icon({
                iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            })
            driverMarkerRef.current = L.marker(driverLocation, {
                icon: driverIcon,
            })
                .addTo(mapRef.current)
                .bindPopup("Driver is here")
                .openPopup()
        }

        mapRef.current.setView(driverLocation, 15)
    }, [driverLocation])

    return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
}

export default LiveMap