/** @author Harry Vasanth (harryvasanth.com) */

export const mapStyles = `
  .user-location-icon {
    background: none !important;
    border: none !important;
  }

  .custom-leaflet-icon {
    background: none !important;
    border: none !important;
  }
  
  .custom-marker-cluster {
    background: none !important;
    border: none !important;
  }
  
  .leaflet-popup {
    transform: scale(0.85);
    transform-origin: bottom center;
  }

  .leaflet-popup-content-wrapper {
    border-radius: 2rem !important;
    padding: 0 !important;
    overflow: hidden !important;
    background: var(--card-bg) !important;
    backdrop-filter: blur(20px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
    border: 1.5px solid var(--card-border) !important;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  }
  .leaflet-popup-content {
    margin: 0 !important;
    width: auto !important;
  }
  
  .leaflet-popup-close-button {
    top: 12px !important;
    right: 12px !important;
    padding: 0 !important;
    width: 24px !important;
    height: 24px !important;
    background: rgba(0, 0, 0, 0.05) !important;
    border-radius: 50% !important;
    color: #001e40 !important;
    text-shadow: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.2s ease !important;
    z-index: 1000 !important;
  }
  .leaflet-popup-close-button:hover {
    background: #b6171e !important;
    color: white !important;
  }
  .dark .leaflet-popup-close-button {
    color: white !important;
    background: rgba(255, 255, 255, 0.1) !important;
  }
  .dark .leaflet-popup-close-button:hover {
    background: #b6171e !important;
  }

  .leaflet-container {
    font-family: inherit;
    border-radius: 2rem;
  }
  .leaflet-control-zoom {
    border: none !important;
    margin: 24px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    z-index: 1000 !important;
  }
  .leaflet-control-zoom-in, .leaflet-control-zoom-out {
    background: rgba(255, 255, 255, 0.9) !important;
    backdrop-filter: blur(12px) !important;
    color: #001e40 !important;
    border: 1px solid rgba(0, 30, 64, 0.1) !important;
    border-radius: 16px !important;
    width: 44px !important;
    height: 44px !important;
    line-height: 44px !important;
    font-size: 20px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1) !important;
  }
  .leaflet-control-zoom-in:hover, .leaflet-control-zoom-out:hover {
    background: white !important;
    transform: scale(1.1);
    border-color: #b6171e !important;
    color: #b6171e !important;
  }
  .dark .leaflet-control-zoom-in, .dark .leaflet-control-zoom-out {
    background: rgba(0, 30, 64, 0.9) !important;
    color: white !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
  }
  .dark .leaflet-control-zoom-in:hover, .dark .leaflet-control-zoom-out:hover {
    background: #001e40 !important;
    border-color: #b6171e !important;
  }
  .dark .leaflet-tile {
    filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
  }
  .leaflet-top, .leaflet-bottom {
    z-index: 1000 !important;
  }
`
