import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [country, setCountry] = useState(null)
  const [droppedItems, setDroppedItems] = useState([])

  const fetchRandomCountry = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all')
      if (!response.ok) throw new Error('Failed to fetch countries')

      const data = await response.json()
      return data[Math.floor(Math.random() * data.length)]
    } catch (error) {
      console.error(error)
      return null
    }
  }

  const getNewCountry = async () => {
    const newCountry = await fetchRandomCountry()
    setCountry(newCountry)
    setDroppedItems([])
  }

  useEffect(() => {
    getNewCountry()
  }, [])

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', item)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedItem = e.dataTransfer.getData('text/plain')
    
    if (!droppedItems.includes(droppedItem)) {

      const value = {
        capital: country.capital?.[0] ?? 'N/A',
        region: country.region ?? 'N/A',
        language: Object.values(country.languages).join(', ') ?? 'N/A',
        currency: Object.values(country.currencies).map(c => c.name).join(', ') ?? 'N/A'
      }[droppedItem]
  
      setDroppedItems((prev) => [...prev, value])

      // setDroppedItems((prev) => [...prev, droppedItem])
    }
  }

  return (
    <>
      <h1>Discover a New Country!</h1>
      {country ? (
        <div>
          <h2>{country.name.common}</h2>
          <img className='flag' src={country.flags.png} alt={country.name.common} width={200} />
          <br />

          <div className='draggable-buttons'>
            {!droppedItems.includes('capital') && (
              <button draggable onDragStart={(e) => handleDragStart(e, 'capital')} className='drag-button'>
                Capital: {country.capital?.[0]}
              </button>
            )}
            {!droppedItems.includes('region') && (
              <button draggable onDragStart={(e) => handleDragStart(e, 'region')} className='drag-button'>
                Region: {country.region}
              </button>
            )}
            {!droppedItems.includes('language') && (
              <button draggable onDragStart={(e) => handleDragStart(e, 'language')} className='drag-button'>
                Language: {Object.values(country.languages).join(', ')}
              </button>
            )}
            {!droppedItems.includes('currency') && (
              <button draggable onDragStart={(e) => handleDragStart(e, 'currency')} className='drag-button'>
                Currency: {Object.values(country.currencies).map((currency) => currency.name).join(', ')}
              </button>
            )}
          </div>

          <div className='drop-zone' onDragOver={handleDragOver} onDrop={handleDrop}>
          {droppedItems.length > 0 ? (
            droppedItems.map((item, index) => <p key={index}>✅ Dropped: {item}</p>)
          ) : (
            <p>Drop Here</p>
          )}
        </div>

          <br />
          <button onClick={getNewCountry}>Discover Another</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  )
}

export default App