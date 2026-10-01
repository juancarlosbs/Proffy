"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import PageHeader from "@/components/PageHeader";

import warningIcon from "@/assets/images/icons/warning.svg";

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

interface ScheduleItem {
  week_day: string;
  from: string;
  to: string;
}

const labelClasses = "text-sm text-text-complement";
const inputClasses =
  "mt-2 h-14 w-full rounded-lg border border-line-in-white bg-input-background px-4 font-archivo text-base outline-none";
const fieldWrapperClasses = "flex flex-col";

export default function GiveClasses() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");

  const [subject, setSubject] = useState("");
  const [cost, setCost] = useState("");

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { week_day: "0", from: "", to: "" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function addNewScheduleItem() {
    setScheduleItems([...scheduleItems, { week_day: "0", from: "", to: "" }]);
  }

  function setScheduleItemValue(
    position: number,
    field: keyof ScheduleItem,
    value: string,
  ) {
    setScheduleItems(
      scheduleItems.map((scheduleItem, index) =>
        index === position
          ? { ...scheduleItem, [field]: value }
          : scheduleItem,
      ),
    );
  }

  async function handleCreateClass(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          avatar,
          whatsapp,
          bio,
          subject,
          cost: Number(cost),
          schedule: scheduleItems.map((item) => ({
            ...item,
            week_day: Number(item.week_day),
          })),
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      router.push("/");
    } catch {
      setError("Erro no cadastro, verifique os dados informados.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-screen">
      <PageHeader
        title="Que incrível que você quer dar aulas"
        description="O primeiro passo é preencher esse formulário de inscrição"
      />

      <main className="mx-auto my-8 w-[90%] lg1100:max-w-[740px]">
        <form
          onSubmit={handleCreateClass}
          className="overflow-hidden rounded-lg border border-line-in-white bg-box-base"
        >
          <fieldset className="border-0 p-8">
            <legend className="w-full border-b border-line-in-white pb-4 font-archivo text-2xl text-text-title">
              Seus dados
            </legend>

            <div className="mt-6 grid grid-cols-1 gap-6 lg1100:grid-cols-[2fr_1fr]">
              <div className={fieldWrapperClasses}>
                <label htmlFor="name" className={labelClasses}>
                  Nome completo
                </label>
                <input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className={fieldWrapperClasses}>
                <label htmlFor="avatar" className={labelClasses}>
                  Avatar
                </label>
                <input
                  id="avatar"
                  type="url"
                  required
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg1100:grid-cols-[1fr_2fr]">
              <div className={fieldWrapperClasses}>
                <label htmlFor="whatsapp" className={labelClasses}>
                  WhatsApp
                </label>
                <input
                  id="whatsapp"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className={fieldWrapperClasses}>
                <label htmlFor="bio" className={labelClasses}>
                  Biografia
                </label>
                <textarea
                  id="bio"
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={`${inputClasses} h-24 resize-none py-3`}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="border-0 p-8">
            <legend className="w-full border-b border-line-in-white pb-4 font-archivo text-2xl text-text-title">
              Sobre a aula
            </legend>

            <div className="mt-6 grid grid-cols-1 gap-6 lg1100:grid-cols-2">
              <div className={fieldWrapperClasses}>
                <label htmlFor="subject" className={labelClasses}>
                  Matéria
                </label>
                <select
                  id="subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={inputClasses}
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
                <label htmlFor="cost" className={labelClasses}>
                  Custo da sua hora por aula
                </label>
                <input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="border-0 p-8">
            <legend className="flex w-full items-center justify-between border-b border-line-in-white pb-4 font-archivo text-2xl text-text-title">
              Horários disponíveis
              <button
                type="button"
                onClick={addNewScheduleItem}
                className="rounded-lg bg-primary-lighter px-4 py-2 text-sm font-bold text-button-text transition-colors hover:bg-primary-light"
              >
                + Novo horário
              </button>
            </legend>

            {scheduleItems.map((scheduleItem, index) => (
              <div
                key={index}
                className="mt-6 grid grid-cols-1 gap-6 lg1100:grid-cols-3"
              >
                <div className={fieldWrapperClasses}>
                  <label className={labelClasses}>Dia da semana</label>
                  <select
                    value={scheduleItem.week_day}
                    onChange={(e) =>
                      setScheduleItemValue(index, "week_day", e.target.value)
                    }
                    className={inputClasses}
                  >
                    {WEEK_DAYS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={fieldWrapperClasses}>
                  <label className={labelClasses}>Das</label>
                  <input
                    type="time"
                    required
                    value={scheduleItem.from}
                    onChange={(e) =>
                      setScheduleItemValue(index, "from", e.target.value)
                    }
                    className={inputClasses}
                  />
                </div>

                <div className={fieldWrapperClasses}>
                  <label className={labelClasses}>Até</label>
                  <input
                    type="time"
                    required
                    value={scheduleItem.to}
                    onChange={(e) =>
                      setScheduleItemValue(index, "to", e.target.value)
                    }
                    className={inputClasses}
                  />
                </div>
              </div>
            ))}
          </fieldset>

          <footer className="flex flex-col items-center justify-between gap-6 border-t border-line-in-white bg-box-footer p-8 lg1100:flex-row">
            <p className="flex items-start gap-4 text-sm text-text-complement lg1100:max-w-[350px]">
              <Image src={warningIcon} alt="Aviso importante" />
              <span>
                Importante!
                <br />
                Preencha todos os dados
              </span>
            </p>

            <div className="flex flex-col items-end gap-2">
              {error && <span className="text-sm text-red-600">{error}</span>}
              <button
                type="submit"
                disabled={submitting}
                className="h-14 w-full rounded-lg bg-secondary px-8 font-archivo text-base font-bold text-button-text transition-colors hover:bg-secondary-dark disabled:opacity-60 lg1100:w-auto"
              >
                {submitting ? "Salvando..." : "Salvar cadastro"}
              </button>
            </div>
          </footer>
        </form>
      </main>
    </div>
  );
}
