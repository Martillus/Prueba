import useReveal from './hooks/useReveal'
import Navbar from './components/Navbar'
import CarHero from './components/CarHero'
import Services from './components/Services'
import Batteries from './components/Batteries'
import Gallery from './components/Gallery'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  useReveal()

  return (
    <div className="min-h-screen bg-cloud-50">
      <Navbar />
      <main>
        <CarHero />
        <Services />
        <Batteries />
        <Gallery />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
