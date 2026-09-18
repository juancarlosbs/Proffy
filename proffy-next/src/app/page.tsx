import Image from "next/image";
import Link from "next/link";

import logoImg from "@/assets/images/logo.svg";
import landingImg from "@/assets/images/landing.svg";

import studyIcon from "@/assets/images/icons/study.svg";
import giveClassesIcon from "@/assets/images/icons/give-classes.svg";
import purpleHeartIcon from "@/assets/images/icons/purple-heart.svg";

// TODO: substituir pelo total real assim que a API de conexões estiver disponível.
const TOTAL_CONNECTIONS = 0;

export default function Landing() {
  return (
    <div className="flex w-screen h-screen items-center justify-center bg-primary text-text-in-primary">
      <div
        className="
          container mx-auto w-[90vw] max-w-[700px]
          lg:max-w-[1100px] lg:grid lg:grid-cols-[2fr_1fr_1fr] lg:grid-rows-[350px_1fr]
          landing-grid
        "
      >
        <div className="landing-logo mb-[1.2rem] text-center lg:mb-0 lg:self-center lg:text-left">
          <Image src={logoImg} alt="Proffy" className="inline-block h-full" />
          <h2 className="mt-2 text-[2.4rem] leading-[4.6rem] font-medium lg:text-left lg:text-[3.6rem]">
            Sua plataforma de estudos online.
          </h2>
        </div>

        <Image
          src={landingImg}
          alt="Plataforma de estudos"
          className="landing-hero w-full lg:justify-self-end"
        />

        <div className="landing-buttons my-[3.2rem] flex justify-center lg:justify-self-start">
          <Link
            href="/study"
            className="mr-[1.6rem] flex h-[10.4rem] w-[30rem] items-center justify-center rounded-lg bg-primary-lighter font-archivo text-[2rem] font-bold text-button-text no-underline transition-colors hover:bg-primary-light lg:text-[2.4rem]"
          >
            <Image src={studyIcon} alt="Estudar" className="mr-[2.4rem] w-[4rem]" />
            Estudar
          </Link>

          <Link
            href="/give-classes"
            className="flex h-[10.4rem] w-[30rem] items-center justify-center rounded-lg bg-secondary font-archivo text-[2rem] font-bold text-button-text no-underline transition-colors hover:bg-secondary-dark lg:text-[2.4rem]"
          >
            <Image src={giveClassesIcon} alt="Dar aulas" className="mr-[2.4rem] w-[4rem]" />
            Dar aulas
          </Link>
        </div>

        <span className="landing-total flex items-center justify-center text-[1.4rem] lg:justify-self-end">
          total de {TOTAL_CONNECTIONS} conexões já realizadas
          <Image src={purpleHeartIcon} alt="coração roxo" className="ml-[0.8rem]" />
        </span>
      </div>
    </div>
  );
}
