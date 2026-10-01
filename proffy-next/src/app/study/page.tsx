"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import backIcon from "@/assets/images/icons/back.svg";
import logoImg from "@/assets/images/logo.svg";
import whatsappIcon from "@/assets/images/icons/whatsapp.svg";

const SUBJECTS = [
  "Artes",
  "Biologia",
  "Ciências",
  "Educação Fisica",
  "Fisica",
  "Geografia",
  "História",
  "Matemática",
  "Português",
  "Quimica",
];

const WEEK_DAYS = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda-feira" },
  { value: "2", label: "Terça-feira" },
  { value: "3", label: "Quarta-feira" },
  { value: "4", label: "Quinta-feira" },
  { value: "5", label: "Sexta-feira" },
  { value: "6", label: "Sabado" },
];

interface Teacher {
  id: number;
  name: string;
  avatar: string;
  bio: string;
  subject: string;
  cost: number;
  whatsapp: string;
}

function TeacherCard({ teacher }: { teacher: Teacher }) {
  function createNewConnection() {
    fetch("/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: teacher.id }),
    });
  }

  return (
    <article className="mt-6 overflow-hidden rounded-lg border border-line-in-white bg-box-base">
      <header className="flex items-center p-8">
        <Image
          src={teacher.avatar}
          alt={teacher.name}
          width={80}
          height={80}
          unoptimized
          className="h-20 w-20 rounded-full object-cover"
        />
        <div className="ml-6">
          <strong className="block font-archivo text-2xl font-bold text-text-title">
            {teacher.name}
          </strong>
          <span className="mt-1 block text-base">{teacher.subject}</span>
        </div>
      </header>

      <p className="px-8 text-base leading-7">{teacher.bio}</p>

      <footer className="mt-8 flex items-center justify-between border-t border-line-in-white bg-box-footer p-8">
        <p className="text-base">
          Preço/hora
          <strong className="ml-2 text-primary">R$ {teacher.cost}</strong>
        </p>
        <a
          target="_blank"
          rel="noreferrer"
          onClick={createNewConnection}
          href={`https://wa.me/${teacher.whatsapp}`}
          className="flex h-14 w-[245px] items-center justify-center rounded-lg bg-secondary font-archivo text-base font-bold text-button-text no-underline transition-colors hover:bg-secondary-dark"
        >
          <Image src={whatsappIcon} alt="Whatsapp" className="mr-4 w-6" />
          Entrar em contato
        </a>
      </footer>
    </article>
  );
}

export default function Study() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subject, setSubject] = useState("");
  const [weekDay, setWeekDay] = useState("");
  const [time, setTime] = useState("");

  async function searchTeachers(e: FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams({
      subject,
      week_day: weekDay,
      time,
    });

    const res = await fetch(`/classes?${params.toString()}`);
    const data = await res.json();
    setTeachers(data);
  }

  return (
    <div className="min-h-screen w-full">
      <header className="bg-primary pb-12">
        <div className="mx-auto flex w-[90%] max-w-[1100px] items-center justify-between py-6 text-text-in-primary">
          <Link href="/" className="h-8 transition-opacity hover:opacity-60">
            <Image src={backIcon} alt="Voltar" className="h-6 w-auto" />
          </Link>
          <Image src={logoImg} alt="Proffy" className="h-6 w-auto" />
        </div>

        <div className="relative mx-auto w-[90%] max-w-[740px] py-8">
          <strong className="block font-archivo text-[36px] leading-[42px] font-bold text-title-in-primary">
            Estes são os proffys disponíveis
          </strong>

          <form
            onSubmit={searchTeachers}
            className="mt-12 grid gap-4 lg1100:absolute lg1100:-bottom-7 lg1100:left-1/2 lg1100:w-[1100px] lg1100:-translate-x-1/2 lg1100:grid-cols-4"
          >
            <div>
              <label className="text-sm text-text-in-primary">Matéria</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-2 h-14 w-full rounded-lg border border-line-in-white bg-input-background px-4 font-archivo text-base text-text-base outline-none"
              >
                <option value="" disabled hidden>
                  Selecione uma opção
                </option>
                {SUBJECTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-text-in-primary">Dia da semana</label>
              <select
                value={weekDay}
                onChange={(e) => setWeekDay(e.target.value)}
                className="mt-2 h-14 w-full rounded-lg border border-line-in-white bg-input-background px-4 font-archivo text-base text-text-base outline-none"
              >
                <option value="" disabled hidden>
                  Selecione uma opção
                </option>
                {WEEK_DAYS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-text-in-primary">Hora</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-2 h-14 w-full rounded-lg border border-line-in-white bg-input-background px-4 font-archivo text-base text-text-base outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 flex h-14 items-center justify-center rounded-lg bg-secondary font-archivo text-base font-bold text-button-text transition-colors hover:bg-secondary-dark lg1100:mt-0"
            >
              Buscar
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-[90%] max-w-[740px] py-12">
        {teachers.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </main>
    </div>
  );
}
