import Image from "next/image";
import Link from "next/link";

import logoImg from "@/assets/images/logo.svg";
import landingImg from "@/assets/images/landing.svg";

import studyIcon from "@/assets/images/icons/study.svg";
import giveClassesIcon from "@/assets/images/icons/give-classes.svg";
import purpleHeartIcon from "@/assets/images/icons/purple-heart.svg";

const TOTAL_CONNECTIONS = 0;

export default function Landing() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-primary text-text-in-primary">
      <div
        className="
          mx-auto w-[90vw] max-w-[700px]
          lg1100:max-w-[1100px] lg1100:grid lg1100:grid-cols-[2fr_1fr_1fr] lg1100:grid-rows-[350px_1fr]
          landing-grid
        "
      >
        <div className="landing-logo mb-3 text-center lg1100:mb-0 lg1100:self-center lg1100:text-left">
          <Image src={logoImg} alt="Proffy" className="inline-block h-full" />
          <h2 className="mt-2 text-[24px] leading-[46px] font-medium lg1100:text-left lg1100:text-[36px]">
            Sua plataforma de estudos online.
          </h2>
        </div>

        <Image
          src={landingImg}
          alt="Plataforma de estudos"
          className="landing-hero h-auto w-full lg1100:justify-self-end"
        />

        <div className="landing-buttons my-8 flex justify-center lg1100:justify-self-start">
          <Link
            href="/study"
            className="mr-4 flex h-[104px] w-[300px] items-center justify-center rounded-lg bg-primary-lighter font-archivo text-[20px] font-bold text-button-text no-underline transition-colors hover:bg-primary-light lg1100:text-[24px]"
          >
            <Image src={studyIcon} alt="Estudar" className="mr-6 w-10" />
            Estudar
          </Link>

          <Link
            href="/give-classes"
            className="flex h-[104px] w-[300px] items-center justify-center rounded-lg bg-secondary font-archivo text-[20px] font-bold text-button-text no-underline transition-colors hover:bg-secondary-dark lg1100:text-[24px]"
          >
            <Image src={giveClassesIcon} alt="Dar aulas" className="mr-6 w-10" />
            Dar aulas
          </Link>
        </div>

        <span className="landing-total flex items-center justify-center text-sm lg1100:justify-self-end">
          total de {TOTAL_CONNECTIONS} conexões já realizadas
          <Image src={purpleHeartIcon} alt="coração roxo" className="ml-2" />
        </span>
      </div>
    </div>
  );
}
