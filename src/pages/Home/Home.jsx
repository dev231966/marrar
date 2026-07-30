import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Hero from './sections/Hero';
import ProblemSection from './sections/ProblemSection';
import HowItWorks from './sections/HowItWorks';
import Explanation from './sections/Explanation';
import ExerciseShowcase from './sections/ExerciseShowcase';
import ScorePreview from './sections/ScorePreview';
import Subjects from './sections/Subjects';
import ErrorNotebook from './sections/ErrorNotebook';
import Evolution from './sections/Evolution';
import Plans from './sections/Plans';
import FAQ from './sections/FAQ';
import CTABanner from './sections/CTABanner';
import './Home.css';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <Explanation />
        <ExerciseShowcase />
        <ScorePreview />
        <Subjects />
        <ErrorNotebook />
        <Evolution />
        <Plans />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
