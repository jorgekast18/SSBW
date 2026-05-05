import './App.css'
import { Perritos } from './components/Perritos'

function App() {

  return (
    <>
      <section id="center" className="flex flex-col items-center p-8">
        <h1 className="text-3xl font-bold underline mb-4">Práctica de React</h1>
        <Perritos />
      </section>
    </>
  )
}

export default App
