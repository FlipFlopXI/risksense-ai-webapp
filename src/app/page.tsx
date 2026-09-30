import { Intro } from '@/components/landing/Intro';
import { Nav } from '@/components/landing/Nav';
import { Hero } from '@/components/landing/Hero';
import { Marquee } from '@/components/landing/Marquee';
import { Stats } from '@/components/landing/Stats';
import { Problem } from '@/components/landing/Problem';
import { Journey } from '@/components/landing/Journey';
import { Analysis } from '@/components/landing/Analysis';
import { Insurance } from '@/components/landing/Insurance';
import { Trust } from '@/components/landing/Trust';
import { Door } from '@/components/landing/Door';
import { Faq } from '@/components/landing/Faq';
import { Footer } from '@/components/landing/Footer';
import { CompleteRegistration } from '@/components/landing/CompleteRegistration';
import { DrugAssistant } from '@/components/landing/DrugAssistant';

export default function HomePage() {
  return (
    <>
      <Intro />
      <Nav />
      <main id="main">
        <Hero />
        <CompleteRegistration />
        <Marquee />
        <Stats />
        <Problem />
        <Journey />
        <Analysis />
        <DrugAssistant />
        <Insurance />
        <Trust />
        <Door />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
