"use client";

import { lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '../../components/intro/Navbar';
import Hero from '../../components/intro/Hero';

// Dynamic import with no SSR for Hyperspeed (performance boost)
const Hyperspeed = dynamic(() => import('../../components/intro/Hyperspeed'), {
  ssr: false,
  loading: () => null
});

// Preload critical components
if (typeof window !== 'undefined') {
  import('../../components/intro/CreateCollaborateSection');
}

// Lazy load heavy components
const CreateCollaborateSection = lazy(() => import('../../components/intro/CreateCollaborateSection'));
const FeatureGrid = lazy(() => import('../../components/intro/FeatureGrid'));
const VideoCarousel = lazy(() => import('../../components/intro/VideoCarousel'));
const UseCasesSection = lazy(() => import('../../components/intro/UseCasesSection'));
const CTASection = lazy(() => import('../../components/intro/CTASection'));
const Footer = lazy(() => import('../../components/intro/Footer'));

// Lightweight skeleton loader
function SectionLoader() {
  return <div className="h-20" />;
}

export default function IntroPage() {
  const router = useRouter();

  return (
    <div className="relative bg-black min-h-screen">
      {/* Hyperspeed Background */}
      <div className="fixed inset-0 z-0">
        <Hyperspeed
          effectOptions={{
            distortion: 'turbulentDistortion',
            length: 400,
            roadWidth: 10,
            islandWidth: 2,
            lanesPerRoad: 4,
            fov: 90,
            fovSpeedUp: 150,
            speedUp: 2,
            carLightsFade: 0.4,
            totalSideLightSticks: 20,
            lightPairsPerRoadWay: 40,
            shoulderLinesWidthPercentage: 0.05,
            brokenLinesWidthPercentage: 0.1,
            brokenLinesLengthPercentage: 0.5,
            lightStickWidth: [0.12, 0.5],
            lightStickHeight: [1.3, 1.7],
            movingAwaySpeed: [60, 80],
            movingCloserSpeed: [-120, -160],
            carLightsLength: [400 * 0.03, 400 * 0.2],
            carLightsRadius: [0.05, 0.14],
            carWidthPercentage: [0.3, 0.5],
            carShiftX: [-0.8, 0.8],
            carFloorSeparation: [0, 5],
            colors: {
              roadColor: 0x000000,
              islandColor: 0x000000,
              background: 0x000000,
              shoulderLines: 0x1a1a1a,
              brokenLines: 0x1a1a1a,
              leftCars: [0x6366f1, 0x8b5cf6, 0xa855f7],
              rightCars: [0x06b6d4, 0x0ea5e9, 0x3b82f6],
              sticks: 0x06b6d4
            }
          }}
        />
      </div>

      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/60 z-[1]" />

      {/* Content */}
      <div className="relative z-10">
        <Navbar router={router} />
        <Hero router={router} />
        
        <Suspense fallback={<SectionLoader />}>
          <CreateCollaborateSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <FeatureGrid />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <VideoCarousel />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <UseCasesSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <CTASection router={router} />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Footer router={router} />
        </Suspense>
      </div>
    </div>
  );
}