"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import PageHeader from "@/components/PageHeader";
import TeacherItem, { Teacher } from "@/components/TeacherItem";

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

const fieldWrapperClasses = "relative mt-3.5 lg1100:mt-0";
const labelClasses = "text-sm text-text-in-primary";
const controlClasses =
  "mt-2 h-14 w-full rounded-lg border border-line-in-white bg-input-background px-4 font-archivo text-base outline-none";

export default function Study() {
  const [subject, setSubject] = useState("");
  const [weekDay, setWeekDay] = useState("");
  const [time, setTime] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);

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
    <div className="h-screen w-screen">
      <PageHeader title="Estes são os proffys disponíveis">
        <form
          onSubmit={searchTeachers}
          className="mt-8 flex flex-col space-y-3.5 lg1100:absolute lg1100:inset-x-0 lg1100:-bottom-7 lg1100:mt-0 lg1100:grid lg1100:grid-cols-4 lg1100:gap-4 lg1100:space-y-0"
        >
          <div className={fieldWrapperClasses}>
            <label htmlFor="subject" className={labelClasses}>
              Matéria
            </label>
            <select
              id="subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={controlClasses}
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

          <div className={fieldWrapperClasses}>
            <label htmlFor="week_day" className={labelClasses}>
              Dia da semana
            </label>
            <select
              id="week_day"
              name="week_day"
              value={weekDay}
              onChange={(e) => setWeekDay(e.target.value)}
              className={controlClasses}
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

          <div className={fieldWrapperClasses}>
            <label htmlFor="time" className={labelClasses}>
              Hora
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={controlClasses}
            />
          </div>

          <button
            type="submit"
            className="mt-8 h-14 w-full rounded-lg bg-secondary font-archivo text-base font-bold text-button-text transition-colors hover:bg-secondary-dark lg1100:mt-0 lg1100:self-end"
          >
            Buscar
          </button>
        </form>
      </PageHeader>

      <main className="mx-auto my-8 w-[90%] lg1100:max-w-[740px] lg1100:py-8">
        <div className="flex justify-end">
          <Link
            href="/favorites"
            className="text-sm font-bold text-primary no-underline hover:text-primary-dark"
          >
            Ver meus favoritos
          </Link>
        </div>

        {teachers.map((teacher) => (
          <TeacherItem key={teacher.id} teacher={teacher} />
        ))}
      </main>
    </div>
  );
}
