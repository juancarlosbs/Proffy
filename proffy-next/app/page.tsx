import Image from "next/image";
import Link from "next/link";

const TOTAL_CONNECTIONS = 2549;

export default function Home() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-primary text-text-in-primary">
      <div className="container mx-auto w-[90vw] max-w-[700px] py-8 lg1100:max-w-[1100px] lg1100:grid lg1100:grid-cols-[2fr_1fr_1fr] lg1100:grid-rows-[350px_1fr] lg1100:[grid-template-areas:'logo_hero_hero'_'buttons_buttons_total']">
        <div className="mb-5 text-center lg1100:[grid-area:logo] lg1100:mb-0 lg1100:self-center lg1100:text-left">
          <Image src="/images/logo.svg" alt="Proffy" width={150} height={64} className="mx-auto lg1100:mx-0 lg1100:h-full lg1100:w-auto" />
          <h2 className="mt-2 text-xl font-medium leading-[1.9] lg1100:text-left lg1100:text-4xl">
            Sua plataforma de estudos online.
          </h2>
        </div>

        <Image
          src="/images/landing.svg"
          alt="Plataforma de estudos"
          width={600}
          height={400}
          className="w-full lg1100:[grid-area:hero] lg1100:justify-self-end"
        />

        <div className="my-8 flex justify-center gap-4 lg1100:[grid-area:buttons] lg1100:justify-start">
          <Link
            href="/study"
            className="flex h-[104px] w-[300px] items-center justify-center rounded-lg bg-primary-lighter font-archivo text-lg font-bold text-button-text no-underline hover:bg-primary-light lg1100:text-2xl"
          >
            <Image src="/images/study.svg" alt="estudar" width={40} height={40} className="mr-6 w-10" />
            Estudar
          </Link>

          <Link
            href="/give-classes"
            className="flex h-[104px] w-[300px] items-center justify-center rounded-lg bg-secundary font-archivo text-lg font-bold text-button-text no-underline hover:bg-secundary-dark lg1100:text-2xl"
          >
            <Image src="/images/give-classes.svg" alt="Dar aulas" width={40} height={40} className="mr-6 w-10" />
            Dar aulas
          </Link>
        </div>

        <span className="flex items-center justify-center text-sm lg1100:[grid-area:total] lg1100:justify-self-end">
          total de {TOTAL_CONNECTIONS} conexões já realizadas{" "}
          <Image src="/images/purple-heart.svg" alt="coração roxo" width={16} height={16} className="ml-2" />
        </span>
      </div>
    </div>
  );
}
