import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import backIcon from "@/assets/images/icons/back.svg";
import logoImg from "@/assets/images/logo.svg";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col bg-primary lg1100:h-[340px]">
      <div className="mx-auto flex w-[90%] items-center justify-between py-6 text-text-in-primary lg1100:max-w-[1100px]">
        <Link href="/" className="h-8 transition-opacity hover:opacity-60">
          <Image src={backIcon} alt="Voltar" />
        </Link>
        <Image src={logoImg} alt="Proffy" className="h-6 w-auto" />
      </div>

      <div className="relative mx-auto my-8 w-[90%] lg1100:my-0 lg1100:flex lg1100:max-w-[740px] lg1100:flex-1 lg1100:flex-col lg1100:items-start lg1100:justify-center lg1100:pb-12">
        <strong className="font-archivo text-[36px] leading-[42px] font-bold text-title-in-primary lg1100:max-w-[350px]">
          {title}
        </strong>
        {description && (
          <p className="mt-6 max-w-[30rem] text-base leading-[2.6rem] text-text-in-primary">
            {description}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}
