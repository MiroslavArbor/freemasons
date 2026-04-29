const BANNER_SRC = `${process.env.PUBLIC_URL || ''}/images/freemasons.png`;

export default function HomePage() {
  return (
    <section className="relative left-1/2 -ml-[50vw] flex w-screen max-w-none flex-1 flex-col">
      <div className="relative flex min-h-[calc(100dvh-5.5rem)] flex-1 flex-col bg-black sm:min-h-[calc(100svh-5.5rem)]">
        <img
          src={BANNER_SRC}
          alt="Freemasons guild banner"
          className="absolute inset-0 z-0 h-full w-full object-contain object-center"
          width={1920}
          height={1080}
          decoding="sync"
          fetchPriority="high"
        />
        {/* Light vignette so text stays readable without hiding the whole image */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/85 via-black/25 to-transparent"
          aria-hidden
        />
        <div className="relative z-10 flex flex-1 flex-col items-center justify-start px-6 pb-10 pt-6 text-center sm:px-12 sm:pb-12 sm:pt-10">
          <h1 className="max-w-5xl text-balance text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)] sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight lg:text-6xl lg:leading-[1.08] xl:text-7xl xl:leading-[1.05]">
            Welcome to Freemason, one of Lucky Defense&apos;s top guilds!
          </h1>
          <p className="mt-4 max-w-3xl text-balance text-lg font-semibold leading-snug text-white/95 drop-shadow-[0_2px_20px_rgba(0,0,0,0.85)] sm:text-xl md:text-2xl">
            Join our active and competitive team and help us reach our goals!
          </p>
        </div>
      </div>
    </section>
  );
}
