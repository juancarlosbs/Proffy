"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import PageHeader from "@/components/PageHeader";
import warningIcon from "@/assets/images/icons/warning.svg";
import Image from "next/image";

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

const fieldWrapperClasses = "relative mt-3.5";
const labelClasses = "text-sm text-text-in-primary";
const controlClasses =
  "mt-2 h-14 w-full rounded-lg border border-line-in-white bg-input-background px-4 font-archivo text-base outline-none";

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

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function addNewScheduleItem() {
    setScheduleItems([
      ...scheduleItems,
      { week_day: "0", from: "", to: "" },
    ]);
  }

  function setScheduleItemValue(
    position: number,
    field: keyof ScheduleItem,
    value: string,
  ) {
    const newArray = scheduleItems.map((scheduleItem, index) => {
      if (index === position) {
        return { ...scheduleItem, [field]: value };
      }

      return scheduleItem;
    });

    setScheduleItems(newArray);
  }

  async function handleCreateClass(e: FormEvent) {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

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
          schedule: scheduleItems,
        }),
      });

      if (res.status === 201) {
        setSuccessMessage("Cadastro realizado com sucesso!");
        router.push("/");
        return;
      }

      setErrorMessage("Erro no cadastro. Verifique os dados e tente novamente.");
    } catch {
      setErrorMessage("Erro no cadastro. Verifique os dados e tente novamente.");
    }
  }

  return (
    <div className="h-screen w-screen">
      <PageHeader
        title="Que incrível que você quer dar aulas"
        description="O primeiro passo é preencher esse formulário de inscrição"
      />

      <main className="mx-auto my-8 w-[90%] lg1100:max-w-[740px] lg1100:py-8">
        {successMessage && (
          <p className="mb-6 rounded-lg bg-secondary/20 p-4 text-center text-base text-primary">
            {successMessage}
          </p>
        )}
        {errorMessage && (
          <p className="mb-6 rounded-lg bg-box-footer p-4 text-center text-base text-primary">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleCreateClass}>
          <fieldset className="rounded-lg border border-line-in-white p-8">
            <legend className="font-archivo text-2xl font-bold text-text-title">
              Seus dados
            </legend>

            <div className={fieldWrapperClasses}>
              <label htmlFor="name" className={labelClasses}>
                Nome completo
              </label>
              <input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={controlClasses}
              />
            </div>

            <div className={fieldWrapperClasses}>
              <label htmlFor="avatar" className={labelClasses}>
                Avatar
              </label>
              <input
                id="avatar"
                name="avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className={controlClasses}
              />
            </div>

            <div className={fieldWrapperClasses}>
              <label htmlFor="whatsapp" className={labelClasses}>
                WhatsApp
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className={controlClasses}
              />
            </div>

            <div className={fieldWrapperClasses}>
              <label htmlFor="bio" className={labelClasses}>
                Biografia
              </label>
              <textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={`${controlClasses} h-32 resize-none pt-4`}
              />
            </div>
          </fieldset>

          <fieldset className="mt-8 rounded-lg border border-line-in-white p-8">
            <legend className="font-archivo text-2xl font-bold text-text-title">
              Sobre a aula
            </legend>

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
              <label htmlFor="cost" className={labelClasses}>
                Custo da sua hora por aula
              </label>
              <input
                id="cost"
                name="cost"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className={controlClasses}
              />
            </div>
          </fieldset>

          <fieldset className="mt-8 rounded-lg border border-line-in-white p-8">
            <legend className="flex w-full items-center justify-between font-archivo text-2xl font-bold text-text-title">
              Horários disponíveis
              <button
                type="button"
                onClick={addNewScheduleItem}
                className="rounded-lg border-2 border-secondary px-4 py-2 font-archivo text-sm font-bold text-secondary transition-colors hover:bg-secondary hover:text-button-text"
              >
                + Novo horário
              </button>
            </legend>

            {scheduleItems.map((scheduleItem, index) => (
              <div
                key={index}
                className="mt-6 grid grid-cols-1 gap-4 lg1100:grid-cols-3"
              >
                <div className={fieldWrapperClasses}>
                  <label className={labelClasses}>Dia da semana</label>
                  <select
                    value={scheduleItem.week_day}
                    onChange={(e) =>
                      setScheduleItemValue(index, "week_day", e.target.value)
                    }
                    className={controlClasses}
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
                    value={scheduleItem.from}
                    onChange={(e) =>
                      setScheduleItemValue(index, "from", e.target.value)
                    }
                    className={controlClasses}
                  />
                </div>

                <div className={fieldWrapperClasses}>
                  <label className={labelClasses}>até</label>
                  <input
                    type="time"
                    value={scheduleItem.to}
                    onChange={(e) =>
                      setScheduleItemValue(index, "to", e.target.value)
                    }
                    className={controlClasses}
                  />
                </div>
              </div>
            ))}
          </fieldset>

          <footer className="mt-8 flex items-center justify-between rounded-lg bg-box-footer p-8">
            <p className="flex items-center text-sm leading-6">
              <Image src={warningIcon} alt="Aviso importante" className="mr-4" />
              Importante! <br />
              Preencha todos os dados
            </p>
            <button
              type="submit"
              className="h-14 w-[200px] rounded-lg bg-secondary font-archivo text-base font-bold text-button-text transition-colors hover:bg-secondary-dark"
            >
              Salvar cadastro
            </button>
          </footer>
        </form>
      </main>
    </div>
  );
}
