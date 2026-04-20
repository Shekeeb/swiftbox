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

const pickupIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: "pickup-marker",
})

const dropoffIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
})

interface Props {
    pickupCoords: [number, number] | null
    dropoffCoords: [number, number] | null
    onMapClick: (lat: number, lng: number) => void
    selectingFor: "pickup" | "dropoff"
}

const BookingMap = ({ pickupCoords, dropoffCoords, onMapClick, selectingFor, }: Props) => {
    const mapRef = useRef<L.Map | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const pickupMarkerRef = useRef<L.Marker | null>(null)
    const dropoffMarkerRef = useRef<L.Marker | null>(null)

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return

        const map = L.map(containerRef.current).setView(
            [10.5276, 76.2144],
            12
        )
        mapRef.current = map

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "© OpenStreetMap contributors",
            }
        ).addTo(map)

        map.on("click", (e: L.LeafletMouseEvent) => {
            onMapClick(e.latlng.lat, e.latlng.lng)
        })

        return () => {
            map.remove()
            mapRef.current = null
        }
    }, [])

    useEffect(() => {
        if (!mapRef.current) return
        mapRef.current.off("click")
        mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
            onMapClick(e.latlng.lat, e.latlng.lng)
        })
    }, [onMapClick])

    useEffect(() => {
        if (!mapRef.current) return
        if (pickupCoords) {
            if (pickupMarkerRef.current) {
                pickupMarkerRef.current.setLatLng(pickupCoords)
            } else {
                pickupMarkerRef.current = L.marker(pickupCoords, {
                    icon: pickupIcon,
                })
                    .addTo(mapRef.current)
                    .bindPopup("Pickup")
            }
        }
    }, [pickupCoords])

    useEffect(() => {
        if (!mapRef.current) return
        if (dropoffCoords) {
            if (dropoffMarkerRef.current) {
                dropoffMarkerRef.current.setLatLng(dropoffCoords)
            } else {
                dropoffMarkerRef.current = L.marker(dropoffCoords, {
                    icon: dropoffIcon,
                })
                    .addTo(mapRef.current)
                    .bindPopup("Dropoff")
            }
        }
    }, [dropoffCoords])

    return (
        <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    )
}

export default BookingMap