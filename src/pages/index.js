import Map from '@components/Map';
import Head from 'next/head'
import styles from '@styles/Home.module.scss';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation'

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // Add event listener
    window.addEventListener("resize", handleResize);
     
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

export default function Home() {
  const size = useWindowSize();
  const searchParams = useSearchParams()
  const DEFAULT_CENTER = [Number(searchParams.get(`lat`)) || 13.744325,Number(searchParams.get(`lng`)) || 100.533507]
  const zoom = 13
  const r_km = Number(searchParams.get(`r`)) || 4
  const [markers, setMarkers] = useState([])
  useEffect(() => {
    const url = `https://elaborate-alpaca-cd5c16.netlify.app/new/GenScript/pattaya/data.json`
    axios.get(url)
    .then(res => res.data)
    .then(data => {
      console.log(data)
      setMarkers(data)
    })
    .catch(err => {
      axios.get(`http://localhost:3000/api/portal`)
      .then(res => res.data)
      .then(data => {
        console.log(data)
        setMarkers(data)
      })
    })
  },[])

  return (
    <>
          <Head>
            <title>{r_km} กิโลmaze</title>
          </Head>
          <Map className={styles.homeMap} 
          width={size.width || 1200} 
          height={size.height || 800} 
          center={DEFAULT_CENTER} zoom={zoom}>
            {({ TileLayer, Marker, Popup, Circle }) => (
              <>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />

                <Circle 
                  center={DEFAULT_CENTER} 
                  stroke={false} 
                  fillColor="red" 
                  radius={r_km*1000} 
                />
                {/* https://leafletjs.com/reference-1.3.4.html#path-weight */}

                {markers.map((marker,index) => {
                  console.log([marker.lat, marker.lng])
                  if (!marker.image) return 
                  return <Marker key={index} position={[marker.lat, marker.lng]} 
                  icon={new L.icon({
                    iconUrl: marker.image
                    , iconSize: [42,42],
                  })}>
                    <Popup>
                      {marker.name} <hr />
                      {marker.address} <hr />
                      {marker.lat},{marker.lng} <br />
                    </Popup>
                </Marker>
                }) }
              </>
            )}
          </Map>
    </>
  )
}
