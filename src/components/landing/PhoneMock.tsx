import Image from 'next/image';

/** A capture of the current Flutter dashboard, populated with fictional demo values. */
export function PhoneMock() {
  return (
    <figure className="relative mx-auto w-full max-w-[20rem]">
      <div className="rounded-[2.2rem] border border-white/15 bg-gradient-to-b from-graphite-2 to-ink p-2.5 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]">
        <div className="overflow-hidden rounded-[1.7rem] bg-[#0b1424]">
          <Image
            src="/images/dashboard-dark-demo.png"
            alt="RiskSense AI patient dashboard in dark mode showing fictional heart disease and diabetes risk estimates, drug enquiries, and health statistics"
            width={1080}
            height={2160}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-paper/55">
        Current mobile dashboard · illustrative demo data
      </figcaption>
    </figure>
  );
}
