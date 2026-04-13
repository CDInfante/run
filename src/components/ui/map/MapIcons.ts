// run-cdinfante/src/components/ui/map/MapIcons.ts
/** @author Harry Vasanth (harryvasanth.com) */
import L from 'leaflet'

export const ICONS_SVG = {
  fountain: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>`,
  toilet: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12h13a1 1 0 0 1 1 1 5 5 0 0 1-5 5h-.598a.5.5 0 0 0-.424.765l1.544 2.47a.5.5 0 0 1-.424.765H5.402a.5.5 0 0 1-.424-.765L7 18" /><path d="M8 18a5 5 0 0 1-5-5V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8" /></svg>`,
  trail: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z" /></svg>`,
  port: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="replace-pulse"><path d="M12 6v16" /><path d="m19 13 2-1a9 9 0 0 1-18 0l2 1" /><path d="M9 11h6" /><circle cx="12" cy="4" r="2" /></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="replace-pulse"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>`,
  marine: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6 0 1.2-.2 1.8-.6.5-.3 1.2-.3 1.8 0 .6.4 1.2.6 1.8.6.6 0 1.2-.2 1.8-.6.5-.3 1.2-.3 1.8 0 .6.4 1.2.6 1.8.6"/><path d="M2 12c.6 0 1.2-.2 1.8-.6.5-.3 1.2-.3 1.8 0 .6.4 1.2.6 1.8.6.6 0 1.2-.2 1.8-.6.5-.3 1.2-.3 1.8 0 .6.4 1.2.6 1.8.6"/><path d="M2 18c.6 0 1.2-.2 1.8-.6.5-.3 1.2-.3 1.8 0 .6.4 1.2.6 1.8.6.6 0 1.2-.2 1.8-.6.5-.3 1.2-.3 1.8 0 .6.4 1.2.6 1.8.6"/></svg>`,
}

export const getClusterIcon = (colorClass: string) => {
  return (cluster: { getChildCount: () => number }) => {
    const count = cluster.getChildCount()
    const html = `<div class="flex items-center justify-center w-11 h-11 ${colorClass} text-white rounded-[1rem] shadow-xl border border-white/30 font-bold text-sm backdrop-blur-md transition-transform hover:scale-110">${count}</div>`

    return L.divIcon({
      html: html,
      className: 'custom-marker-cluster',
      iconSize: L.point(44, 44, true),
    })
  }
}

export const createCustomIcon = (
  type: 'fountain' | 'toilet' | 'warning' | 'trail' | 'port' | 'marine',
  level?: string,
) => {
  let color = '#3b82f6' // Blue for fountains
  let svgString = ICONS_SVG.warning
  let shouldPulse = false

  if (type === 'fountain') {
    svgString = ICONS_SVG.fountain
  } else if (type === 'toilet') {
    color = '#8b5cf6' // Violet
    svgString = ICONS_SVG.toilet
  } else if (type === 'marine') {
    color = '#06b6d4' // Cyan
    svgString = ICONS_SVG.marine
  } else if (type === 'trail') {
    svgString = ICONS_SVG.trail
    if (level === 'Aberto')
      color = '#10b981' // Emerald
    else if (level === 'Encerrado')
      color = '#ef4444' // Red
    else color = '#f97316' // Orange
  } else if (type === 'port') {
    svgString = ICONS_SVG.port
    if (level === 'busy') {
      color = '#b6171e'
      shouldPulse = true
    } else {
      color = '#10b981'
      shouldPulse = false
    }
  } else if (type === 'warning') {
    switch (level) {
      case 'yellow':
        color = '#eab308'
        shouldPulse = true
        break
      case 'orange':
        color = '#f97316'
        shouldPulse = true
        break
      case 'red':
        color = '#dc2626'
        shouldPulse = true
        break
      default:
        color = '#22c55e'
        svgString = ICONS_SVG.check
        shouldPulse = false
    }
  }

  if (shouldPulse) {
    svgString = svgString.replace('replace-pulse', 'animate-pulse')
  } else {
    svgString = svgString.replace('class="replace-pulse"', '')
  }

  const isWarning = type === 'warning' || type === 'port'
  const size = isWarning ? 40 : 32

  const html = `<div style="display:flex; align-items:center; justify-content:center; width:${size}px; height:${size}px; color:white; background-color:${color}; border-radius:40% 40% 40% 0; transform:rotate(-45deg); border:2px solid white; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); opacity:${isWarning ? 1 : 0.8};">
    <div style="transform:rotate(45deg); display:flex;">
      ${svgString}
    </div>
  </div>`

  return L.divIcon({
    html: html,
    className: 'custom-leaflet-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

export const userLocationIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center w-8 h-8">
    <div class="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-40"></div>
    <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-xl"></div>
  </div>`,
  className: 'user-location-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})
