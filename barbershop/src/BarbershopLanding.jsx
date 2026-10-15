/**
 * Onix Barbershop — лендинг премиального барбершопа.
 *
 * Один React-компонент: React 18, Tailwind CSS, Framer Motion 11,
 * GSAP 3 + ScrollTrigger (скролл-сцены), Three.js (3D-инструменты) и Lucide React (иконки).
 * Шрифты подключаются из Google Fonts внутри <GlobalStyles />.
 */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  motionValue,
  useAnimationFrame,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  Crown,
  Droplets,
  Flame,
  Gem,
  Layers,
  MapPin,
  Menu,
  Pause,
  PenTool,
  Phone,
  Play,
  Plus,
  ScanFace,
  Scissors,
  Send,
  Wind,
  X,
} from "lucide-react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ───────────────────────────── Данные ───────────────────────────── */

const ADDRESS = "Гомель, ул. Румянцевская, 21";
const PHONE = "+375 (29) 000-24-24";
const TELEGRAM = "@onix_barber";

const SERVICES = [
  {
    id: "signature",
    icon: Scissors,
    cat: "Стрижка",
    title: "Стрижка «Onix»",
    price: 55,
    time: 60,
    tool: "Ножницы и машинка",
    badge: "Фирменная",
    desc: "Консультация, мытьё, работа ножницами и машинкой, укладка премиальной косметикой.",
    includes: ["Консультация по форме головы", "Мытьё и массаж кожи головы", "Стрижка и укладка", "Горячее полотенце на финише"],
  },
  {
    id: "shave",
    icon: Crown,
    cat: "Бритьё",
    title: "Королевское бритьё",
    price: 45,
    time: 45,
    tool: "Опасная бритва",
    desc: "Три горячих полотенца, бритьё опасной бритвой в два прохода, холодный компресс.",
    includes: ["Распаривание кожи", "Пена ручного взбивания", "Два прохода бритвой", "Холодный компресс и бальзам"],
  },
  {
    id: "fade",
    icon: Layers,
    cat: "Стрижка",
    title: "Скин-фейд",
    price: 50,
    time: 60,
    tool: "Насадки 0,5–3 мм",
    desc: "Растушёвка от кожи без видимых ступеней. Контур и финиш опасной бритвой.",
    includes: ["Переход от 0 мм", "Проработка затылка и макушки", "Контур опасной бритвой", "Укладка"],
  },
  {
    id: "beard",
    icon: PenTool,
    cat: "Борода",
    title: "Борода и контур",
    price: 30,
    time: 40,
    tool: "Триммер и бритва",
    desc: "Форма под овал лица, чёткий контур опасной бритвой, масло и бальзам для кожи.",
    includes: ["Подбор формы", "Моделирование триммером", "Контур опасной бритвой", "Масло и бальзам"],
  },
  {
    id: "grey",
    icon: Droplets,
    cat: "Уход",
    title: "Камуфляж седины",
    price: 30,
    time: 30,
    tool: "Тонирование",
    desc: "Тонирование, которое скрывает до 70 % седины и выглядит естественно при любом свете.",
    includes: ["Подбор оттенка", "Выдержка 10 минут", "Мытьё и кондиционер", "Держится до 6 недель"],
  },
  {
    id: "ritual",
    icon: Gem,
    cat: "Комплекс",
    title: "Полный ритуал",
    price: 110,
    time: 120,
    tool: "Стрижка + бритьё",
    desc: "Стрижка «Onix», королевское бритьё и уход за кожей лица за один визит.",
    includes: ["Стрижка «Onix»", "Королевское бритьё", "Маска и пилинг", "Напиток из бара"],
  },
];

const RITUAL = [
  {
    n: "01",
    icon: ScanFace,
    title: "Консультация",
    prop: "ручное зеркало",
    min: 5,
    text: "Мастер смотрит на форму головы, рост волос и то, как вы обычно укладываетесь. Результат обсуждаем до первого щелчка ножниц.",
  },
  {
    n: "02",
    icon: Droplets,
    title: "Мытьё и массаж",
    prop: "флакон шампуня",
    min: 10,
    text: "Шампунь под тип кожи головы и массаж. Чистые волосы ложатся по своему естественному направлению.",
  },
  {
    n: "03",
    icon: Scissors,
    title: "Стрижка",
    prop: "машинка для стрижки",
    min: 35,
    text: "Ножницы, машинка, бритва по контуру. Работаем столько, сколько требует форма.",
  },
  {
    n: "04",
    icon: Flame,
    title: "Горячее полотенце",
    prop: "свёрнутое горячее полотенце",
    min: 5,
    text: "Полотенце при 60 °C раскрывает поры и снимает раздражение после бритвы.",
  },
  {
    n: "05",
    icon: Wind,
    title: "Укладка",
    prop: "баночка глины для укладки",
    min: 5,
    text: "Подбираем средство и показываем, как повторить укладку дома за две минуты.",
  },
];

const MASTERS = [
  {
    id: "volkov",
    name: "Артём Волков",
    role: "Основатель · арт-директор",
    years: 14,
    tool: "Ножницы",
    mark: "АВ",
    seed: 3,
    photo: null,
    quote: "Ножницы прощают меньше, чем машинка. Поэтому я с ними и работаю.",
  },
  {
    id: "severin",
    name: "Марк Северин",
    role: "Мастер фейдов",
    years: 9,
    tool: "Машинка, 0,5–3 мм",
    mark: "МС",
    seed: 11,
    photo: null,
    quote: "Переход хорош, когда ступень не видна даже при дневном свете.",
  },
  {
    id: "aliev",
    name: "Тимур Алиев",
    role: "Мастер бритья",
    years: 11,
    tool: "Опасная бритва",
    mark: "ТА",
    seed: 23,
    photo: null,
    quote: "Бритьё начинается с горячего полотенца. Бритва идёт последней.",
  },
  {
    id: "orlov",
    name: "Лев Орлов",
    role: "Стилист бороды",
    years: 7,
    tool: "Триммер и гребень",
    mark: "ЛО",
    seed: 37,
    photo: null,
    quote: "Борода меняет пропорции лица сильнее, чем стрижка.",
  },
];

const TIMES = Array.from({ length: 12 }, (_, i) => `${10 + i}:00`);
const NAV = [
  { id: "craft", label: "Ремесло" },
  { id: "works", label: "Работы" },
  { id: "ritual", label: "Ритуал" },
  { id: "masters", label: "Мастера" },
  { id: "booking", label: "Контакты" },
];

/* ──────────────────────────── Утилиты ──────────────────────────── */

const fmtPrice = (n) => `${n.toLocaleString("ru-RU")} BYN`;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const mulberry32 = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
/** Маска белорусского номера: +375 (29) 123-45-67. */
const formatPhone = (raw) => {
  let d = raw.replace(/\D/g, "");
  if (!d) return "";
  if ("375".startsWith(d)) return `+${d}`;
  if (d.startsWith("80") && d.length >= 11) d = `375${d.slice(2)}`;
  else if (!d.startsWith("375")) d = `375${d}`;
  const p = d.slice(3, 12);
  let out = "+375";
  if (p.length) out += ` (${p.slice(0, 2)}`;
  if (p.length > 2) out += `) ${p.slice(2, 5)}`;
  if (p.length > 5) out += `-${p.slice(5, 7)}`;
  if (p.length > 7) out += `-${p.slice(7, 9)}`;
  return out;
};
const isBusy = (dayIdx, slotIdx, masterKey) => {
  if (dayIdx === 0 && 10 + slotIdx <= new Date().getHours()) return true;
  return (dayIdx * 5 + slotIdx * 7 + masterKey * 3) % 6 === 0 || (dayIdx * 3 + slotIdx + masterKey) % 7 === 0;
};
const buildDays = () => {
  const now = new Date();
  const wd = new Intl.DateTimeFormat("ru-RU", { weekday: "short" });
  const mon = new Intl.DateTimeFormat("ru-RU", { month: "short" });
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    return {
      key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      label: i === 0 ? "Сегодня" : i === 1 ? "Завтра" : wd.format(d),
      day: d.getDate(),
      month: mon.format(d).replace(".", ""),
      long: new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(d),
    };
  });
};

const springSoft = { type: "spring", stiffness: 70, damping: 17, mass: 0.9 };
const springSnappy = { type: "spring", stiffness: 380, damping: 28 };
const EASE_CUT = [0.76, 0, 0.24, 1];

function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return fine;
}

/* ──────────────────────── Глобальные стили ─────────────────────── */

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Manrope:wght@400;500;600;700&display=swap";

const GRAIN =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";

const GLOBAL_CSS = `
@import url('${FONTS_URL}');
/* Мягкая салонная гамма: шалфейный туман, бумага, эвкалипт, тёплый песок, графит. */
:root { color-scheme: light; --stone: #EEF1EC; --paper: #FAFBF8; --ink: #26332D; --onyx: #4F7A68; --onyx-hi: #6E9A86; --leather: #B07A55; }
html, body { background: var(--stone); color: var(--ink); }
body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
.f-body { font-family: 'Manrope', 'Segoe UI', system-ui, -apple-system, sans-serif; }
.f-display { font-family: 'Lora', Georgia, 'Times New Roman', serif; font-variant-numeric: lining-nums; }
.f-label { font-family: 'Manrope', 'Segoe UI', system-ui, sans-serif; font-weight: 600; }
.accent-text { background: linear-gradient(180deg, #6E9A86 0%, #4F7A68 45%, #26332D 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.grain { position: fixed; inset: -100%; width: 300%; height: 300%; z-index: 90; pointer-events: none; opacity: 0.05; mix-blend-mode: multiply; background-image: url("${GRAIN}"); animation: gr-grain 0.9s steps(5) infinite; }
@keyframes gr-grain { 0% { transform: translate(0, 0) } 20% { transform: translate(-4%, 3%) } 40% { transform: translate(3%, -5%) } 60% { transform: translate(-6%, -2%) } 80% { transform: translate(5%, 4%) } 100% { transform: translate(0, 0) } }
::selection { background: var(--onyx); color: var(--paper); }
:focus-visible { outline: 2px solid var(--onyx); outline-offset: 4px; }
html.gr-cursor, html.gr-cursor * { cursor: none !important; }
html.gr-cursor input, html.gr-cursor textarea { cursor: text !important; }
input::placeholder { color: rgba(38, 51, 45, 0.38); }
@media (prefers-reduced-motion: reduce) { .grain { animation: none; } }
`;

function GlobalStyles() {
  return <style>{GLOBAL_CSS}</style>;
}

/* ─────────────────────── Базовые примитивы ─────────────────────── */

/** Побуквенное появление заголовка: пружина + поворот по X. */
function SplitLetters({ text, play = true, trigger, delay = 0, stagger = 0.035, letterClassName = "" }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const go = trigger === "view" ? seen : play;
  let index = 0;
  return (
    <span ref={ref} aria-hidden="true">
      {text.split(" ").map((word, wi, arr) => (
        <React.Fragment key={wi}>
          <span
            className="-mx-[0.05em] -mb-[0.16em] -mt-[0.08em] inline-block overflow-hidden whitespace-nowrap px-[0.05em] pb-[0.16em] pt-[0.08em] align-bottom"
            style={{ perspective: 700 }}
          >
            {[...word].map((ch) => {
              const i = index++;
              return (
                <motion.span
                  key={i}
                  className={`inline-block ${letterClassName}`}
                  style={{ transformOrigin: "50% 100%" }}
                  initial={{ y: "118%", rotateX: -75, rotate: 7 }}
                  animate={go ? { y: "0%", rotateX: 0, rotate: 0 } : undefined}
                  transition={{ type: "spring", stiffness: 130, damping: 15, mass: 0.7, delay: delay + i * stagger }}
                >
                  {ch}
                </motion.span>
              );
            })}
          </span>
          {wi < arr.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </span>
  );
}

/** Появление блока при скролле на пружинной физике. */
function Reveal({ children, delay = 0, y = 70, className = "", as = "div" }) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y, rotateX: -14, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ ...springSoft, delay }}
      style={{ transformPerspective: 1000, transformOrigin: "50% 0%" }}
    >
      {children}
    </M>
  );
}

function Magnetic({ children, strength = 0.35, className = "" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

function PrimaryButton({ children, onClick, type = "button", className = "" }) {
  return (
    <Magnetic>
      <motion.button
        type={type}
        onClick={onClick}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileTap={{ scale: 0.96 }}
        className={`f-label relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#4F7A68] px-7 py-4 text-[13px] font-medium uppercase tracking-[0.14em] text-[#FAFBF8] shadow-[0_0_0_rgba(79,122,104,0)] ${className}`}
        variants={{ rest: { boxShadow: "0 10px 30px -18px rgba(79,122,104,0.6)" }, hover: { boxShadow: "0 22px 50px -18px rgba(79,122,104,0.7)" } }}
      >
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 bg-[#26332D]"
          variants={{ rest: { y: "101%" }, hover: { y: "0%" } }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        />
        <span className="relative">{children}</span>
        <motion.span className="relative" variants={{ rest: { rotate: 0 }, hover: { rotate: 45 } }} transition={springSnappy}>
          <ArrowUpRight size={16} strokeWidth={1.6} />
        </motion.span>
      </motion.button>
    </Magnetic>
  );
}

function GhostButton({ children, onClick }) {
  return (
    <Magnetic strength={0.25}>
      <motion.button
        type="button"
        onClick={onClick}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileTap={{ scale: 0.96 }}
        variants={{ rest: { borderColor: "rgba(38,51,45,0.28)", color: "#26332D" }, hover: { borderColor: "rgba(79,122,104,1)", color: "#4F7A68" } }}
        className="f-label relative inline-flex items-center gap-3 rounded-full border px-7 py-4 text-[13px] uppercase tracking-[0.14em]"
      >
        {children}
        <motion.span variants={{ rest: { y: 0 }, hover: { y: 3 } }} transition={springSnappy}>
          <ArrowDown size={15} strokeWidth={1.6} />
        </motion.span>
      </motion.button>
    </Magnetic>
  );
}

function CountUp({ to, decimals = 0, play }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!play) return undefined;
    const controls = animate(0, to, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: setValue });
    return () => controls.stop();
  }, [play, to]);
  return value.toLocaleString("ru-RU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function Container({ children, className = "" }) {
  return <div className={`mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-12 ${className}`}>{children}</div>;
}

function SectionHead({ eyebrow, title, italic, aside }) {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        <Reveal y={30}>
          <p className="f-label text-[12px] uppercase tracking-[0.14em] text-[#4F7A68]">
            <span className="mr-2.5 inline-block h-1.5 w-1.5 rounded-full bg-[#4F7A68] align-middle" aria-hidden="true" />
            {eyebrow}
          </p>
        </Reveal>
        <h2 aria-label={`${title} ${italic}`} className="f-display mt-5 text-[clamp(2.8rem,9vw,6.2rem)] font-medium leading-[0.98] tracking-[-0.01em]">
          <SplitLetters text={title} trigger="view" />{" "}
          <span className="italic text-[#4F7A68]">
            <SplitLetters text={italic} trigger="view" delay={0.18} />
          </span>
        </h2>
      </div>
      {aside ? (
        <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.15} y={40}>
          <p className="max-w-md text-[15px] leading-relaxed text-[#26332D]/70">{aside}</p>
        </Reveal>
      ) : null}
    </div>
  );
}

/* ───────────────────────── Мягкий портрет-заглушка ───────────────────── */

const PORTRAIT_TONES = [
  ["#DCE6DF", "#E7D6C5", "#B9CFC2"],
  ["#E7D6C5", "#DCE6DF", "#D3BFA9"],
  ["#D9E4E5", "#EADFD3", "#AEC6C0"],
  ["#EADFD3", "#D6E3D9", "#C5B19B"],
];

/** Пастельный фон в арке вместо фото: пятна мягкого света, как в студии. Фото мастера подставляется через поле photo. */
function SoftPortrait({ seed = 0 }) {
  const [base, light, shade] = PORTRAIT_TONES[seed % PORTRAIT_TONES.length];
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(60% 45% at 30% 22%, ${light} 0%, transparent 72%), radial-gradient(75% 55% at 78% 88%, ${shade} 0%, transparent 70%), ${base}`,
      }}
    >
      <div className="absolute inset-[7%] rounded-b-[22px] rounded-t-[999px] border border-white/70" />
    </div>
  );
}

/* ───────────────────────────── Лоадер ───────────────────────────── */

function LoaderFace({ count, cut }) {
  return (
    <div className="relative h-full w-full">
      <div className="f-label absolute left-4 right-4 top-6 flex justify-between text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55 sm:left-10 sm:right-10 sm:top-8">
        <span>Onix Barbershop · Гомель</span>
        <span>Est. 2014</span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="f-display flex text-[clamp(5rem,22vw,16rem)] font-medium leading-[0.92] tracking-[0.04em]" aria-hidden="true">
          {[..."ONIX"].map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.04em]">
              <motion.span
                className="accent-text inline-block"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ type: "spring", stiffness: 90, damping: 15, delay: 0.15 + i * 0.09 }}
              >
                {ch}
              </motion.span>
            </span>
          ))}
        </div>
      </div>
      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.1em" }}
        animate={{ opacity: 1, letterSpacing: "0.55em" }}
        transition={{ duration: 1.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="f-label absolute inset-x-0 top-[calc(50%+clamp(3.4rem,15vw,11rem))] text-center text-[11px] uppercase text-[#4F7A68]"
      >
        Искусство острой линии
      </motion.p>
      <motion.span
        aria-hidden="true"
        className="absolute inset-x-0 top-1/2 h-px origin-left bg-gradient-to-r from-transparent via-[#6E9A86] to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: cut ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.83, 0, 0.17, 1] }}
      />
      <div className="absolute bottom-6 left-4 right-4 flex items-end justify-between gap-6 sm:bottom-8 sm:left-10 sm:right-10">
        <span className="f-display text-6xl font-medium leading-none tabular-nums text-[#26332D]/90 sm:text-8xl">{String(count).padStart(3, "0")}</span>
        <div className="w-32 sm:w-52">
          <div className="f-label mb-2 text-right text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55">Готовим кресло</div>
          <div className="h-px bg-[#26332D]/15">
            <div className="h-px bg-[#4F7A68]" style={{ width: `${count}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Кинематографичный вход: буквы, счётчик, «разрез» бритвой — и экран расходится. */
function Loader({ onDone }) {
  const [count, setCount] = useState(0);
  const [cut, setCut] = useState(false);
  useEffect(() => {
    const controls = animate(0, 100, { duration: 2.1, ease: [0.65, 0, 0.35, 1], onUpdate: (v) => setCount(Math.round(v)) });
    const t1 = setTimeout(() => setCut(true), 2150);
    const t2 = setTimeout(onDone, 2700);
    return () => {
      controls.stop();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);
  const half = { duration: 1.15, ease: EASE_CUT };
  return (
    <div className="fixed inset-0 z-[200]" role="status" aria-label="Загрузка сайта">
      <motion.div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-[#EEF1EC]" exit={{ y: "-100%" }} transition={half}>
        <div className="absolute inset-x-0 top-0 h-[200%]">
          <LoaderFace count={count} cut={cut} />
        </div>
      </motion.div>
      <motion.div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-[#EEF1EC]" exit={{ y: "100%" }} transition={half}>
        <div className="absolute inset-x-0 bottom-0 h-[200%]">
          <LoaderFace count={count} cut={cut} />
        </div>
      </motion.div>
    </div>
  );
}

/* ───────────────────────────── Курсор ───────────────────────────── */

function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState("default");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dotX = useSpring(x, { stiffness: 1400, damping: 70, mass: 0.2 });
  const dotY = useSpring(y, { stiffness: 1400, damping: 70, mass: 0.2 });
  const ringX = useSpring(x, { stiffness: 170, damping: 19, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 170, damping: 19, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;
    setEnabled(true);
    const root = document.documentElement;
    root.classList.add("gr-cursor");
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e) => {
      const el = e.target instanceof Element ? e.target.closest("a, button, input, textarea, [data-cursor]") : null;
      if (!el) setMode("default");
      else if (el.matches("input, textarea")) setMode("text");
      else setMode("link");
    };
    const leave = () => {
      x.set(-100);
      y.set(-100);
    };
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    root.addEventListener("pointerleave", leave);
    return () => {
      root.classList.remove("gr-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      root.removeEventListener("pointerleave", leave);
    };
  }, [x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[300] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-[#4F7A68]"
        style={{ x: dotX, y: dotY }}
        animate={{ scale: mode === "link" ? 0 : 1 }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[300] -ml-5 -mt-5 h-10 w-10 rounded-full border border-[#4F7A68]/60"
        style={{ x: ringX, y: ringY }}
        animate={{
          scale: mode === "link" ? 1.7 : mode === "text" ? 0.35 : 1,
          backgroundColor: mode === "link" ? "rgba(79,122,104,0.14)" : "rgba(79,122,104,0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      />
    </>
  );
}

/* ───────────────────────────── Навигация ─────────────────────────── */

function Nav({ ready, onNav }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(v > prev && v > 240);
    setScrolled(v > 30);
  });

  const go = (id) => {
    setOpen(false);
    onNav(id);
  };

  return (
    <>
      <motion.header
        className="fixed inset-x-0 z-50"
        style={{ top: "env(safe-area-inset-top, 0px)" }}
        initial={{ y: -120 }}
        animate={{ y: !ready || (hidden && !open) ? -120 : 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <Container className="pt-3">
          <motion.nav
            aria-label="Основная навигация"
            className="flex items-center justify-between gap-4 rounded-full border px-5 py-2.5 sm:px-7"
            animate={{
              backgroundColor: scrolled || open ? "rgba(250,251,248,0.8)" : "rgba(250,251,248,0)",
              borderColor: scrolled || open ? "rgba(38,51,45,0.1)" : "rgba(38,51,45,0)",
            }}
            style={{
              backdropFilter: scrolled || open ? "blur(18px) saturate(140%)" : "none",
              WebkitBackdropFilter: scrolled || open ? "blur(18px) saturate(140%)" : "none",
            }}
          >
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                go("top");
              }}
              className="flex items-baseline gap-3"
              aria-label="Onix Barbershop — наверх"
            >
              <span className="f-display text-2xl font-semibold tracking-[0.16em] text-[#26332D]">ONIX</span>
              <span className="f-label text-[10px] uppercase tracking-[0.14em] text-[#4F7A68]">
                Barbershop<span className="hidden sm:inline"> · Gomel</span>
              </span>
            </a>
            <ul className="hidden items-center gap-9 lg:flex">
              {NAV.map((item) => (
                <li key={item.id}>
                  <motion.a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(item.id);
                    }}
                    initial="rest"
                    animate="rest"
                    whileHover="hover"
                    className="f-label relative block py-1 text-[12px] uppercase tracking-[0.14em] text-[#26332D]/80"
                    variants={{ rest: { color: "rgba(38,51,45,0.75)" }, hover: { color: "#26332D" } }}
                  >
                    {item.label}
                    <motion.span
                      aria-hidden="true"
                      className="absolute -bottom-0.5 left-0 h-px w-full origin-left bg-[#4F7A68]"
                      variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                      transition={springSnappy}
                    />
                  </motion.a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <Magnetic strength={0.2}>
                  <motion.button
                    type="button"
                    onClick={() => go("booking")}
                    whileHover={{ backgroundColor: "#4F7A68", color: "#FAFBF8" }}
                    whileTap={{ scale: 0.95 }}
                    className="f-label rounded-full border border-[#4F7A68] px-5 py-2.5 text-[12px] uppercase tracking-[0.14em] text-[#4F7A68]"
                  >
                    Записаться
                  </motion.button>
                </Magnetic>
              </div>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-label={open ? "Закрыть меню" : "Открыть меню"}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#26332D]/20 text-[#26332D] lg:hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={open ? "x" : "m"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={springSnappy}
                  >
                    {open ? <X size={18} /> : <Menu size={18} />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </motion.nav>
        </Container>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="menu"
            className="fixed inset-0 z-40 flex flex-col justify-end bg-[#EEF1EC] px-4 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] pt-28 sm:px-8 lg:hidden"
            initial={{ clipPath: "circle(0% at 92% 6%)" }}
            animate={{ clipPath: "circle(150% at 92% 6%)" }}
            exit={{ clipPath: "circle(0% at 92% 6%)" }}
            transition={{ duration: 0.8, ease: EASE_CUT }}
          >
            <ul className="flex flex-col gap-2">
              {NAV.map((item, i) => (
                <li key={item.id} className="overflow-hidden">
                  <motion.button
                    type="button"
                    onClick={() => go(item.id)}
                    className="f-display flex w-full items-baseline justify-between border-b border-[#26332D]/15 py-3 text-left text-[clamp(2.6rem,11vw,4rem)] font-medium leading-tight"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ type: "spring", stiffness: 110, damping: 16, delay: 0.25 + i * 0.07 }}
                  >
                    {item.label}
                    <ArrowUpRight className="text-[#4F7A68]" size={28} strokeWidth={1.2} />
                  </motion.button>
                </li>
              ))}
            </ul>
            <motion.div
              className="f-label mt-10 flex flex-wrap justify-between gap-3 text-[12px] uppercase tracking-[0.14em] text-[#26332D]/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span>{ADDRESS}</span>
              <span className="text-[#4F7A68]">{PHONE}</span>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/* ─────────────── Первый экран: инструменты мастера в 3D ─────────────── */

const SHOWCASE = [
  { key: "scissors", n: "01", name: "Ножницы", spec: "6″ · сталь 440C" },
  { key: "comb", n: "02", name: "Гребень", spec: "22 см · ацетат" },
  { key: "dryer", n: "03", name: "Фен", spec: "2200 Вт · 2 скорости" },
];
const SHOW_HOLD = 3.6; // секунд на один инструмент

/** Цвет из макета (sRGB) → линейное пространство, в котором считает освещение Three.js r128. */
const srgb = (hex) => new THREE.Color(hex).convertSRGBToLinear();

function canvasTexture(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.encoding = THREE.sRGBEncoding;
  tex.anisotropy = 4;
  return tex;
}

/** Студийное окружение для отражений: светлые стены и три софтбокса. */
function studioEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  // стены студии с вертикальным градиентом: светлый верх, тёмный низ — металл получает живой перелив
  const room = new THREE.SphereGeometry(10, 48, 24);
  const top = new THREE.Color(0xc4cbc7);
  const mid = new THREE.Color(0x737b77);
  const low = new THREE.Color(0x1c2120);
  const colors = [];
  const pos = room.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const t = pos.getY(i) / 10;
    const c = t > 0 ? mid.clone().lerp(top, t) : mid.clone().lerp(low, Math.min(1, -t * 1.6));
    colors.push(c.r, c.g, c.b);
  }
  room.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  env.add(new THREE.Mesh(room, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ color: 0x222826 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -5.9;
  env.add(floor);
  const softbox = (w, h, pos, k) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  softbox(5, 3, [0, 5.5, 1], 5);
  softbox(3, 5, [-5.5, 1, 2], 2.6);
  softbox(3, 5, [5.5, 0.5, -1], 2);
  softbox(6, 1, [0, 0, -5.5], 1.4);
  softbox(5, 3.5, [0.5, -0.5, 5.6], 0.05); // тёмный флаг за камерой: металл получает контраст, как в предметной съёмке
  softbox(0.8, 5, [3.2, 0.5, 4.4], 3.2); // узкий стриплайт — блик вдоль лезвий
  const tex = pmrem.fromScene(env, 0.03).texture;
  pmrem.dispose();
  return tex;
}

const deg = (d) => (d * Math.PI) / 180;

/** Профессиональные ножницы: плоская сталь с фасками, смещённые кольца с силиконовыми вставками, упор для пальца, винт с камнем. */
function buildScissors() {
  const steel = new THREE.MeshStandardMaterial({ color: srgb(0xd9dedb), metalness: 1, roughness: 0.15 });
  const mirror = new THREE.MeshStandardMaterial({ color: srgb(0xf8faf9), metalness: 1, roughness: 0.05 });
  const satin = new THREE.MeshStandardMaterial({ color: srgb(0xb4bbb7), metalness: 1, roughness: 0.36 });
  const silicone = new THREE.MeshStandardMaterial({ color: srgb(0x34403a), roughness: 0.75 });
  const jewel = new THREE.MeshPhysicalMaterial({ color: srgb(0x4f7a68), roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04 });
  const ex = { depth: 0.032, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.005, bevelSegments: 3, curveSegments: 48 };
  const face = ex.depth / 2 + ex.bevelThickness;

  // контур половинки: лезвие вправо от оси, хвостовик и кольцо — влево-вниз
  const halfShape = ({ c, ro, hole, tang }) => {
    const at = (a) => [c[0] + ro * Math.cos(deg(a)), c[1] + ro * Math.sin(deg(a))];
    const s = new THREE.Shape();
    s.moveTo(1.9, 0.003);
    s.quadraticCurveTo(1.25, 0.075, 0.5, 0.088);
    s.quadraticCurveTo(0.12, 0.092, -0.06, 0.078);
    s.quadraticCurveTo(-0.14, 0.07, -0.2, 0.04);
    const p = at(70);
    s.quadraticCurveTo(-0.55, -0.06, p[0], p[1]);
    if (tang) {
      s.absarc(c[0], c[1], ro, deg(70), deg(235), false);
      s.quadraticCurveTo(c[0] - 0.22, c[1] - 0.36, c[0] - 0.36, c[1] - 0.42);
      s.quadraticCurveTo(c[0] - 0.41, c[1] - 0.44, c[0] - 0.37, c[1] - 0.37);
      const t2 = at(265);
      s.quadraticCurveTo(c[0] - 0.13, c[1] - 0.3, t2[0], t2[1]);
      s.absarc(c[0], c[1], ro, deg(265), deg(370), false);
    } else {
      s.absarc(c[0], c[1], ro, deg(70), deg(370), false);
    }
    s.quadraticCurveTo(-0.4, -0.2, 0.0, -0.046);
    s.lineTo(0.45, -0.022);
    s.quadraticCurveTo(1.2, -0.006, 1.9, 0.003);
    const h = new THREE.Path();
    h.absellipse(c[0], c[1], hole[0], hole[1], 0, Math.PI * 2, true);
    s.holes.push(h);
    return s;
  };
  // полированная заточка вдоль режущей стороны и тонкий блик по обуху
  const edgeShape = new THREE.Shape();
  edgeShape.moveTo(0.36, -0.019);
  edgeShape.quadraticCurveTo(1.2, -0.005, 1.88, 0.003);
  edgeShape.quadraticCurveTo(1.2, 0.016, 0.36, 0.004);
  edgeShape.lineTo(0.36, -0.019);
  const spineShape = new THREE.Shape();
  spineShape.moveTo(0.18, 0.08);
  spineShape.quadraticCurveTo(0.6, 0.083, 1.0, 0.07);
  spineShape.quadraticCurveTo(1.5, 0.048, 1.87, 0.004);
  spineShape.quadraticCurveTo(1.5, 0.04, 1.0, 0.06);
  spineShape.quadraticCurveTo(0.6, 0.072, 0.18, 0.07);
  spineShape.lineTo(0.18, 0.08);

  const half = (sign, z, ring) => {
    const g = new THREE.Group();
    const geo = new THREE.ExtrudeGeometry(halfShape(ring), ex);
    geo.translate(0, 0, -ex.depth / 2);
    const body = new THREE.Mesh(geo, steel);
    const edge = new THREE.Mesh(new THREE.ShapeGeometry(edgeShape, 32), mirror);
    edge.position.z = face + 0.0006;
    const ridge = new THREE.Mesh(new THREE.ShapeGeometry(spineShape, 32), mirror);
    ridge.position.z = face + 0.0006;
    const avg = (ring.hole[0] + ring.hole[1]) / 2;
    const insert = new THREE.Mesh(new THREE.TorusGeometry(avg - 0.012, 0.024, 16, 64), silicone);
    insert.scale.set(ring.hole[0] / avg, ring.hole[1] / avg, 1);
    insert.position.set(ring.c[0], ring.c[1], 0);
    const inner = new THREE.Group();
    inner.add(body, edge, ridge, insert);
    inner.scale.y = sign;
    g.add(inner);
    g.position.z = z;
    return g;
  };
  const a = half(1, 0.022, { c: [-0.98, -0.35], ro: 0.21, hole: [0.15, 0.13], tang: true });
  const b = half(-1, -0.022, { c: [-0.9, -0.29], ro: 0.185, hole: [0.128, 0.112], tang: false });

  // винт регулировки натяжения: шайба, рифлёная головка и камень
  const pivot = new THREE.Group();
  const cyl = (r, h, mat, z) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 40), mat);
    m.rotation.x = Math.PI / 2;
    m.position.z = z;
    pivot.add(m);
  };
  cyl(0.095, 0.012, satin, 0.052);
  cyl(0.072, 0.03, steel, 0.072);
  const knurl = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.008, 8, 48), satin);
  knurl.position.z = 0.072;
  pivot.add(knurl);
  const stone = new THREE.Mesh(new THREE.SphereGeometry(0.04, 24, 16), jewel);
  stone.position.z = 0.088;
  stone.scale.z = 0.6;
  pivot.add(stone);
  cyl(0.07, 0.03, satin, -0.062);

  const inner = new THREE.Group();
  inner.add(b, a, pivot);
  inner.position.x = -0.26;
  const tilt = new THREE.Group();
  tilt.add(inner);
  tilt.rotation.z = 0.5;
  tilt.scale.setScalar(0.9);
  const snip = (d) => {
    const r = deg(d / 2);
    a.rotation.z = r;
    b.rotation.z = -r;
  };
  snip(10);
  return { object: tilt, tiltX: 0.28, snip };
}

/** Гребень для стрижки: черепаховый ацетат, утолщённая спинка, крайние зубья-ограничители, частые и редкие зубья с сужением. */
function buildComb() {
  // черепаховая расцветка: янтарная основа, тёмные пятна разной плотности, светлые прожилки и мелкое зерно
  const tortoise = canvasTexture(1024, 512, (ctx, w, h) => {
    const base = ctx.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, "#9A6234");
    base.addColorStop(0.5, "#B0773F");
    base.addColorStop(1, "#8C5730");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    const rand = mulberry32(91);
    const blot = (count, rMin, rMax, rgb, alpha, stretch) => {
      for (let i = 0; i < count; i += 1) {
        const x = rand() * w;
        const y = rand() * h;
        const r = rMin + rand() * (rMax - rMin);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${rgb},${alpha})`);
        g.addColorStop(0.6, `rgba(${rgb},${alpha * 0.55})`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, y, r * stretch, r, (rand() - 0.5) * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    blot(60, 30, 90, "70,34,14", 0.55, 2.2);
    blot(140, 8, 30, "48,22,8", 0.7, 1.8);
    blot(60, 10, 40, "222,164,96", 0.45, 2.6);
    for (let i = 0; i < 4000; i += 1) {
      ctx.fillStyle = `rgba(40,18,6,${(rand() * 0.12).toFixed(3)})`;
      ctx.fillRect(rand() * w, rand() * h, 2, 2);
    }
  });
  tortoise.wrapS = THREE.RepeatWrapping;
  tortoise.wrapT = THREE.RepeatWrapping;
  tortoise.repeat.set(0.38, 1.0);
  const acetate = new THREE.MeshPhysicalMaterial({ map: tortoise, roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06 });

  const W = 2.6;
  const top = 0.2;
  const base = -0.05;
  const tipY = -0.46;
  const s = new THREE.Shape();
  s.moveTo(-W / 2, base);
  s.lineTo(-W / 2, top - 0.08);
  s.quadraticCurveTo(-W / 2, top, -W / 2 + 0.08, top);
  s.lineTo(W / 2 - 0.08, top);
  s.quadraticCurveTo(W / 2, top, W / 2, top - 0.08);
  s.lineTo(W / 2, tipY + 0.05);
  s.quadraticCurveTo(W / 2, tipY, W / 2 - 0.03, tipY);
  s.lineTo(W / 2 - 0.06, tipY + 0.02);
  let x = W / 2 - 0.06;
  // справа частые зубья, слева редкие; каждый зуб сужается к скруглённому кончику
  while (x > -W / 2 + 0.2) {
    const fine = x > 0;
    const gap = fine ? 0.03 : 0.058;
    const tw = fine ? 0.03 : 0.046;
    const taper = tw * 0.25;
    s.lineTo(x, base);
    s.quadraticCurveTo(x - gap / 2, base + 0.03, x - gap, base);
    s.lineTo(x - gap - taper, tipY + 0.028);
    s.quadraticCurveTo(x - gap - tw / 2, tipY - 0.012, x - gap - tw + taper, tipY + 0.028);
    x -= gap + tw;
  }
  s.lineTo(x, base);
  s.lineTo(-W / 2 + 0.06, base);
  s.lineTo(-W / 2 + 0.06, tipY + 0.02);
  s.quadraticCurveTo(-W / 2, tipY, -W / 2, tipY + 0.05);
  const teeth = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005, bevelSegments: 2, curveSegments: 6 });
  teeth.translate(0, 0.13, -0.015);

  // спинка толще зубьев и мягко скруглена
  const back = new THREE.Shape();
  back.moveTo(-W / 2 + 0.004, base - 0.01);
  back.lineTo(-W / 2 + 0.004, top - 0.08);
  back.quadraticCurveTo(-W / 2 + 0.004, top - 0.004, -W / 2 + 0.08, top - 0.004);
  back.lineTo(W / 2 - 0.08, top - 0.004);
  back.quadraticCurveTo(W / 2 - 0.004, top - 0.004, W / 2 - 0.004, top - 0.08);
  back.lineTo(W / 2 - 0.004, base - 0.01);
  back.lineTo(-W / 2 + 0.004, base - 0.01);
  const backGeo = new THREE.ExtrudeGeometry(back, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.01,
    bevelSegments: 5,
    curveSegments: 12,
  });
  backGeo.translate(0, 0.13, -0.025);

  const tilt = new THREE.Group();
  tilt.add(new THREE.Mesh(teeth, acetate), new THREE.Mesh(backGeo, acetate));
  tilt.rotation.z = -0.12;
  return { object: tilt, tiltX: 0.38 };
}

/** Фен в духе Dyson Supersonic: полый цилиндр-кольцо с мотором в ручке, сетка фильтра, медные акценты. */
function buildDryer() {
  const shell = new THREE.MeshPhysicalMaterial({ color: srgb(0x6f9583), roughness: 0.36, metalness: 0.12, clearcoat: 0.7, clearcoatRoughness: 0.22 });
  const copper = new THREE.MeshStandardMaterial({ color: srgb(0xc58052), metalness: 1, roughness: 0.26 });
  const nickel = new THREE.MeshStandardMaterial({ color: srgb(0xc3c8c5), metalness: 0.9, roughness: 0.3 });
  const tunnel = new THREE.MeshStandardMaterial({ color: srgb(0x9aa39e), metalness: 0.8, roughness: 0.34, side: THREE.BackSide });
  const dark = new THREE.MeshStandardMaterial({ color: srgb(0x2b3430), roughness: 0.55 });
  const white = new THREE.MeshStandardMaterial({ color: srgb(0xf3f3ef), roughness: 0.35 });

  // головка: толстостенная труба, в которую видно насквозь
  const R = 1;
  const rIn = 0.6;
  const L = 2.2;
  const head = new THREE.Group();
  head.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R, L - 0.08, 128, 1, true), shell));
  head.add(new THREE.Mesh(new THREE.CylinderGeometry(rIn, rIn, L, 96, 1, true), tunnel));
  const ringFace = (y, mat, flip) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(rIn + 0.02, R - 0.04, 128), mat);
    m.rotation.x = flip ? Math.PI / 2 : -Math.PI / 2;
    m.position.y = y;
    head.add(m);
  };
  ringFace(L / 2, copper, false);
  ringFace(-L / 2, shell, true);
  [L / 2 - 0.04, -L / 2 + 0.04].forEach((y, i) => {
    const lip = new THREE.Mesh(new THREE.TorusGeometry(R - 0.04, 0.04, 16, 128), i === 0 ? copper : shell);
    lip.rotation.x = Math.PI / 2;
    lip.position.y = y;
    head.add(lip);
    const innerLip = new THREE.Mesh(new THREE.TorusGeometry(rIn + 0.02, 0.02, 12, 96), nickel);
    innerLip.rotation.x = Math.PI / 2;
    innerLip.position.y = y + (i === 0 ? 0.04 : -0.04);
    head.add(innerLip);
  });
  // щель, из которой выходит воздух
  const slot = new THREE.Mesh(new THREE.TorusGeometry(rIn + 0.09, 0.012, 8, 128), dark);
  slot.rotation.x = Math.PI / 2;
  slot.position.y = L / 2 + 0.002;
  head.add(slot);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.004, R + 0.004, 0.05, 128, 1, true), copper);
  band.position.y = -L / 2 + 0.32;
  head.add(band);
  head.rotation.z = -Math.PI / 2;

  // ручка: корпус мотора, кнопки, сетка фильтра, торец со шнуром
  const rh = 0.5;
  const yTop = -0.55;
  const yCage = -2.3;
  const yBottom = -3.95;
  const handle = new THREE.Group();
  const seg = (r, y0, y1, mat, open = false) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, y0 - y1, 96, 1, open), mat);
    m.position.y = (y0 + y1) / 2;
    handle.add(m);
    return m;
  };
  seg(rh, yTop, yCage, shell);
  const mesh = canvasTexture(256, 128, (ctx, w, h) => {
    ctx.fillStyle = "#c9cfcc";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#26302c";
    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 16; col += 1) {
        ctx.beginPath();
        ctx.arc(8 + col * 16 + (row % 2) * 8, 8 + row * 16, 4.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  mesh.wrapS = THREE.RepeatWrapping;
  mesh.wrapT = THREE.RepeatWrapping;
  mesh.repeat.set(5, 3);
  seg(rh + 0.006, yCage, yBottom, new THREE.MeshStandardMaterial({ map: mesh, metalness: 0.75, roughness: 0.38 }), true);
  seg(rh - 0.03, yCage, yBottom, dark);
  seg(rh + 0.014, yCage + 0.03, yCage - 0.03, copper, true);
  seg(rh + 0.014, yBottom + 0.03, yBottom - 0.03, copper, true);
  const cap = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        [rh, 0],
        [rh, -0.12],
        [rh - 0.05, -0.21],
        [0.2, -0.25],
        [0.0, -0.25],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      96,
    ),
    shell,
  );
  cap.position.y = yBottom;
  handle.add(cap);
  // кнопки нагрева и скорости и ползунок питания — на стороне, обращённой к руке
  const pill = (w, h, y, mat, side = -1) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, w), mat);
    m.position.set(side * (rh + 0.012), y, 0);
    handle.add(m);
  };
  pill(0.16, 0.34, -0.95, white);
  const roundBtn = (y) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 32), white);
    m.rotation.z = Math.PI / 2;
    m.position.set(-(rh + 0.008), y, 0);
    handle.add(m);
  };
  roundBtn(-1.38);
  roundBtn(-1.62);
  [-1.86, -1.93, -2.0].forEach((y, i) => {
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 10), new THREE.MeshBasicMaterial({ color: srgb(i === 0 ? 0x5fd39a : 0xf3f3ef) }));
    led.position.set(-(rh + 0.006), y, 0);
    handle.add(led);
  });
  pill(0.12, 0.42, -1.2, copper, 1); // кнопка холодного обдува спереди
  const relief = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.3, 24), dark);
  relief.position.y = yBottom - 0.36;
  handle.add(relief);
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(
        [
          [0, yBottom - 0.48, 0],
          [0.04, yBottom - 0.8, 0.08],
          [-0.22, yBottom - 1.05, 0.22],
          [-0.6, yBottom - 1.1, 0.16],
        ].map((p) => new THREE.Vector3(...p)),
      ),
      48,
      0.045,
      12,
      false,
    ),
    dark,
  );
  handle.add(cable);

  const body = new THREE.Group();
  body.add(head, handle);
  body.scale.setScalar(0.47);
  body.position.y = 0.72;
  return { object: body, tiltX: 0.1 };
}

/** Правая половина героя: ножницы → гребень → фен, каждый крутится в 3D. */
function ToolsShowcase({ ready, progress }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const api = useRef(null);
  const reduced = useReducedMotion();
  const visible = useInView(wrapRef, { amount: 0 });
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [webgl, setWebgl] = useState(true);

  // сцена создаётся один раз
  useEffect(() => {
    const canvas = canvasRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setWebgl(false);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const scene = new THREE.Scene();
    scene.environment = studioEnvironment(renderer);
    const camera = new THREE.PerspectiveCamera(30, 0.8, 0.1, 50);
    camera.position.set(0, 0.25, 7.2);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfd6cf, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xdfeee6, 0.55);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    const shadowTex = canvasTexture(256, 256, (ctx, w) => {
      const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      g.addColorStop(0, "rgba(38,51,45,0.42)");
      g.addColorStop(1, "rgba(38,51,45,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, w);
    });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.55;
    scene.add(shadow);

    const tools = [buildScissors(), buildComb(), buildDryer()].map((t) => {
      const spin = new THREE.Group();
      spin.rotation.order = "YXZ";
      spin.add(t.object);
      spin.scale.setScalar(0.001);
      spin.visible = false;
      scene.add(spin);
      return { ...t, spin, extra: { v: 0 }, pos: { y: -0.6 } };
    });

    // компилируем шейдеры заранее, пока идёт заставка, чтобы смена инструментов не дёргалась
    tools.forEach((tool) => (tool.spin.visible = true));
    renderer.compile(scene, camera);
    tools.forEach((tool) => (tool.spin.visible = false));

    const state = { current: -1, drag: 0, vel: 0, tiltX: 0, tiltY: 0, targetX: 0, targetY: 0, dragging: false, lastX: 0, timer: null, running: false };
    let raf = 0;
    const clock = new THREE.Clock();
    let t = 0;

    const resize = () => {
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    const show = (next, { auto = false } = {}) => {
      const prev = tools[state.current];
      if (state.current === next) return;
      if (prev) {
        gsap.to(prev.spin.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.55, ease: "power2.in", onComplete: () => (prev.spin.visible = false) });
        gsap.to(prev.pos, { y: 0.55, duration: 0.55, ease: "power2.in" });
        gsap.to(prev.extra, { v: prev.extra.v + Math.PI, duration: 0.55, ease: "power2.in" });
      }
      const nx = tools[next];
      gsap.killTweensOf([nx.spin.scale, nx.pos, nx.extra]);
      nx.spin.visible = true;
      nx.spin.scale.setScalar(0.001);
      nx.pos.y = -0.7;
      nx.extra.v = -Math.PI * 1.4;
      const delay = prev ? 0.42 : 0;
      gsap.to(nx.spin.scale, { x: 1, y: 1, z: 1, duration: 1.05, delay, ease: "back.out(1.5)" });
      gsap.to(nx.pos, { y: 0, duration: 1.05, delay, ease: "power3.out" });
      gsap.to(nx.extra, { v: 0, duration: 1.4, delay, ease: "power3.out" });
      state.current = next;
      setActive(next);
      setCycle((c) => c + 1);
      schedule();
      if (!auto) state.vel = 0;
    };
    const schedule = () => {
      state.timer?.kill();
      if (reduced) return;
      state.timer = gsap.delayedCall(SHOW_HOLD, () => show((state.current + 1) % tools.length, { auto: true }));
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!state.running) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!reduced) t += dt;
      state.vel *= 0.94;
      state.drag += state.vel;
      state.tiltX += (state.targetX - state.tiltX) * 0.06;
      state.tiltY += (state.targetY - state.tiltY) * 0.06;
      const p = progress.get();
      tools.forEach((tool, i) => {
        if (!tool.spin.visible) return;
        tool.spin.rotation.y = t * 0.9 + tool.extra.v + state.drag + state.tiltY + (reduced ? 0.6 : 0);
        tool.spin.rotation.x = tool.tiltX + state.tiltX;
        tool.spin.position.y = tool.pos.y + Math.sin(t * 1.3 + i) * 0.05 + p * 0.5;
        if (tool.snip) tool.snip(reduced ? 14 : 4 + Math.max(0, Math.sin(t * 5.5)) * 18);
      });
      const s = tools.reduce((m, tool) => Math.max(m, tool.spin.visible ? tool.spin.scale.x : 0), 0);
      shadow.scale.set(0.6 + s * 0.4, 1, 0.6 + s * 0.4);
      shadow.material.opacity = s * (1 - p * 0.6);
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    api.current = {
      start: () => {
        if (state.current === -1) show(0);
      },
      show: (i) => show(i),
      setRunning: (on) => {
        state.running = on;
        if (on) clock.getDelta();
        if (state.timer) on ? state.timer.resume() : state.timer.pause();
      },
      pointer: (px, py) => {
        state.targetX = py * 0.35;
        state.targetY = px * 0.6;
      },
      dragStart: (x) => {
        state.dragging = true;
        state.lastX = x;
        state.timer?.pause();
      },
      dragMove: (x) => {
        if (!state.dragging) return;
        state.vel += (x - state.lastX) * 0.0016;
        state.lastX = x;
      },
      dragEnd: () => {
        if (!state.dragging) return;
        state.dragging = false;
        schedule();
      },
    };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      state.timer?.kill();
      tools.forEach((tool) => gsap.killTweensOf([tool.spin.scale, tool.pos, tool.extra]));
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (o.material.map) o.material.map.dispose();
          o.material.dispose();
        }
      });
      scene.environment?.dispose();
      renderer.dispose();
      api.current = null;
    };
  }, [progress, reduced]);

  useEffect(() => {
    if (ready) api.current?.start();
  }, [ready]);

  useEffect(() => {
    api.current?.setRunning(visible);
  }, [visible]);

  const tool = SHOWCASE[active];

  return (
    <motion.div
      ref={wrapRef}
      onPointerMove={(e) => {
        const r = wrapRef.current.getBoundingClientRect();
        if (e.pointerType === "mouse") api.current?.pointer((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
        api.current?.dragMove(e.clientX);
      }}
      onPointerLeave={() => {
        api.current?.pointer(0, 0);
        api.current?.dragEnd();
      }}
      initial={{ opacity: 0 }}
      animate={ready ? { opacity: 1 } : undefined}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="relative mx-auto aspect-[4/5] w-full max-w-[560px] lg:ml-auto lg:mr-0"
    >
      <div
        className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
        data-cursor="drag"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId);
          api.current?.dragStart(e.clientX);
        }}
        onPointerUp={() => api.current?.dragEnd()}
        onPointerCancel={() => api.current?.dragEnd()}
      >
        <canvas ref={canvasRef} className="block h-full w-full" aria-label={`3D-модель: ${tool.name}`} role="img" />
      </div>
    </motion.div>
  );
}

/* ───────────────────────────── Герой ───────────────────────────── */

function Hero({ ready, onNav }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 40, damping: 18 });
  const smy = useSpring(my, { stiffness: 40, damping: 18 });
  const wordX = useTransform(smx, [-0.5, 0.5], [60, -60]);
  const glowX = useTransform(smx, [-0.5, 0.5], [-120, 120]);
  const glowY = useTransform(smy, [-0.5, 0.5], [-80, 80]);
  const show = (d) => ({
    initial: { opacity: 0, y: 40 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { type: "spring", stiffness: 70, damping: 16, delay: d },
  });

  return (
    <section
      id="top"
      ref={ref}
      onMouseMove={(e) => {
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
      className="relative isolate overflow-hidden pb-24 pt-28 sm:pt-36 lg:flex lg:min-h-[100svh] lg:items-center lg:pt-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [-webkit-mask-image:linear-gradient(to_bottom,#000_55%,transparent)] [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]"
      >
        <motion.div className="absolute inset-0" style={{ y: bgY }}>
          <motion.div
            className="absolute left-[34%] top-[-22%] h-[62vmax] w-[62vmax] rounded-full bg-[#DCE6DF] opacity-90 blur-[90px]"
            style={{ x: glowX, y: glowY }}
          />
          <motion.div
            className="absolute bottom-[-24%] left-[-14%] h-[46vmax] w-[46vmax] rounded-full bg-[#E7D6C5] opacity-70 blur-[100px]"
            style={{ x: wordX }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      <Container className="grid items-center gap-16 lg:grid-cols-12 lg:gap-8">
        <motion.div className="lg:col-span-7" style={{ y: copyY }}>
          <motion.div {...show(0.1)} className="f-label flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] uppercase tracking-[0.14em] text-[#26332D]/65">
            <span className="text-[#4F7A68]">
              <span className="mr-2.5 inline-block h-1.5 w-1.5 rounded-full bg-[#4F7A68] align-middle" aria-hidden="true" />
              Гомель · Румянцевская, 21
            </span>
            <span className="h-px w-10 bg-[#26332D]/25" />
            <span>с 2014 года</span>
          </motion.div>

          <h1
            aria-label="Искусство острой линии"
            className="f-display mt-7 text-[clamp(3.2rem,14vw,5rem)] font-medium leading-[0.98] tracking-[-0.01em] lg:text-[clamp(4rem,7.4vw,7.6rem)]"
          >
            <span className="block">
              <SplitLetters text="Искусство" play={ready} delay={0.25} />
            </span>
            <span className="block italic text-[#4F7A68]">
              <SplitLetters text="острой" play={ready} delay={0.5} />
            </span>
            <span className="block pl-[0.9em]">
              <SplitLetters text="линии" play={ready} delay={0.7} />
            </span>
          </h1>

          <motion.p {...show(0.95)} className="mt-9 max-w-[34rem] text-[16px] leading-relaxed text-[#26332D]/75 sm:text-[17px]">
            Барбершоп закрытого формата на шесть кресел. Каждый визит начинается с консультации и заканчивается горячим полотенцем. Работаем только по записи,
            поэтому мастер не торопится.
          </motion.p>

          <motion.div {...show(1.1)} className="mt-10 flex flex-wrap items-center gap-4">
            <PrimaryButton onClick={() => onNav("booking")}>Записаться</PrimaryButton>
            <GhostButton onClick={() => onNav("craft")}>Услуги и цены</GhostButton>
          </motion.div>

          <motion.dl {...show(1.25)} className="mt-14 grid max-w-xl grid-cols-3 gap-4 border-t border-[#26332D]/15 pt-6 sm:gap-6">
            {[
              ["Лет ремесла", 12, 0],
              ["Кресел", 6, 0],
              ["Оценка гостей", 4.98, 2],
            ].map(([label, value, dec]) => (
              <div key={label} className="min-w-0">
                <dt className="f-label text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55">{label}</dt>
                <dd className="f-display mt-1 text-4xl font-medium tabular-nums text-[#26332D] sm:text-5xl">
                  <CountUp to={value} decimals={dec} play={ready} />
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <div className="lg:col-span-5">
          <ToolsShowcase ready={ready} progress={scrollYProgress} />
        </div>
      </Container>

      <motion.button
        type="button"
        {...show(1.6)}
        onClick={() => onNav("craft")}
        className="f-label absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55 lg:flex"
      >
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <ArrowDown size={14} />
        </motion.span>
        Листайте
      </motion.button>
    </section>
  );
}

/* ─────────────── Манифест: 3D-столб барбершопа ─────────────── */

const POLE_R = 0.3;
const POLE_L = 2.24;

/** Спиральные полосы столба: шалфей, крем, медь, крем. Рисуются попиксельно со сглаживанием 2×2. */
function poleStripesTexture() {
  return canvasTexture(512, 1024, (ctx, w, h) => {
    const img = ctx.createImageData(w, h);
    const turns = 3;
    const rise = (turns * POLE_L) / (2 * Math.PI * POLE_R);
    const bands = [
      [0.3, [52, 88, 74]],
      [0.5, [244, 240, 231]],
      [0.6, [168, 98, 56]],
      [1, [244, 240, 231]],
    ];
    const colorAt = (u, v) => {
      const f = (((turns * u + rise * v) % 1) + 1) % 1;
      return bands.find(([end]) => f < end)[1];
    };
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        let r = 0;
        let g = 0;
        let b = 0;
        for (let sy = 0; sy < 2; sy += 1) {
          for (let sx = 0; sx < 2; sx += 1) {
            const c = colorAt((x + 0.25 + sx * 0.5) / w, 1 - (y + 0.25 + sy * 0.5) / h);
            r += c[0];
            g += c[1];
            b += c[2];
          }
        }
        const i = (y * w + x) * 4;
        img.data[i] = r / 4;
        img.data[i + 1] = g / 4;
        img.data[i + 2] = b / 4;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  });
}

/** Столб: стеклянная колба с вращающимися полосами, латунные основание и капитель, светящийся плафон и шпиль. */
function buildBarberPole() {
  const brass = new THREE.MeshStandardMaterial({ color: srgb(0xd6ac74), metalness: 1, roughness: 0.2 });
  const g = new THREE.Group();

  const stripes = new THREE.Mesh(
    new THREE.CylinderGeometry(POLE_R, POLE_R, POLE_L, 96, 1, true),
    new THREE.MeshPhysicalMaterial({ map: poleStripesTexture(), roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.2 }),
  );
  g.add(stripes);
  // стекло: прозрачное, но блики остаются (transmission в r128 гасит альфу везде, кроме отражений)
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(POLE_R + 0.035, POLE_R + 0.035, POLE_L + 0.02, 96, 1, true),
    new THREE.MeshPhysicalMaterial({
      color: srgb(0xffffff),
      roughness: 0.05,
      metalness: 0,
      transmission: 0.94,
      transparent: true,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      depthWrite: false,
    }),
  );
  glass.renderOrder = 2;
  g.add(glass);
  // отражение окна на стекле: стоит на месте, пока полосы бегут под ним, — так колба читается как стекло
  const streakTex = canvasTexture(8, 256, (ctx, w, h) => {
    const gr = ctx.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "rgba(255,255,255,0)");
    gr.addColorStop(0.15, "rgba(255,255,255,1)");
    gr.addColorStop(0.85, "rgba(255,255,255,1)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
  });
  [
    [-0.62, 0.16, 0.42],
    [-0.38, 0.05, 0.3],
    [0.75, 0.08, 0.16],
  ].forEach(([theta, width, opacity]) => {
    const streak = new THREE.Mesh(
      new THREE.CylinderGeometry(POLE_R + 0.037, POLE_R + 0.037, POLE_L - 0.06, 8, 1, true, theta - width / 2, width),
      new THREE.MeshBasicMaterial({ map: streakTex, transparent: true, opacity, depthWrite: false }),
    );
    streak.renderOrder = 3;
    g.add(streak);
  });

  g.add(
    new THREE.Mesh(
      lathe(
        [
          [0, -1.86],
          [0.025, -1.84],
          [0.05, -1.78],
          [0.075, -1.7],
          [0.11, -1.62],
          [0.16, -1.57],
          [0.24, -1.54],
          [0.3, -1.53],
          [0.33, -1.51],
          [0.34, -1.48],
          [0.31, -1.45],
          [0.31, -1.42],
          [0.4, -1.39],
          [0.44, -1.35],
          [0.45, -1.3],
          [0.45, -1.22],
          [0.43, -1.18],
          [0.39, -1.155],
          [0.39, -1.12],
          [0.36, -1.1],
          [0, -1.1],
        ],
        96,
      ),
      brass,
    ),
  );
  g.add(
    new THREE.Mesh(
      lathe(
        [
          [0, 1.1],
          [0.36, 1.1],
          [0.39, 1.12],
          [0.39, 1.155],
          [0.43, 1.18],
          [0.45, 1.22],
          [0.45, 1.3],
          [0.44, 1.35],
          [0.4, 1.39],
          [0.31, 1.42],
          [0.31, 1.45],
          [0.27, 1.47],
          [0.16, 1.49],
          [0, 1.495],
        ],
        96,
      ),
      brass,
    ),
  );
  [-1.1, 1.1].forEach((y) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(POLE_R + 0.05, 0.016, 12, 96), brass);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    g.add(ring);
  });
  // молочный плафон-лампа и латунный шпиль
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.29, 64, 32),
    new THREE.MeshPhysicalMaterial({
      color: srgb(0xe6d8bf),
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      emissive: srgb(0xffd9a0),
      emissiveIntensity: 0.16,
    }),
  );
  globe.position.y = 1.76;
  g.add(globe);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.024, 12, 64), brass);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 1.5;
  g.add(collar);
  g.add(
    new THREE.Mesh(
      lathe([
        [0, 2.02],
        [0.06, 2.03],
        [0.07, 2.06],
        [0.04, 2.1],
        [0.022, 2.15],
        [0.04, 2.19],
        [0.045, 2.22],
        [0.03, 2.25],
        [0, 2.26],
      ]),
      brass,
    ),
  );
  return { object: g, stripes, globe };
}

/** Вращающийся столб барбершопа: полосы бегут быстрее при прокрутке, плафон разгорается при наведении. */
function BarberPole({ className = "" }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const api = useRef(null);
  const reduced = useReducedMotion();
  const visible = useInView(wrapRef, { amount: 0 });
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      setWebgl(false);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    scene.environment = studioEnvironment(renderer);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c6, 0.45));
    const key = new THREE.DirectionalLight(0xfff6ea, 1.0);
    key.position.set(3, 5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xdfeee6, 0.6);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    const pole = buildBarberPole();
    scene.add(pole.object);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: softSpot(0.4), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.98;
    scene.add(shadow);

    const camera = new THREE.PerspectiveCamera(22, 0.45, 0.1, 60);
    const fit = (aspect) => {
      const half = Math.tan(deg(camera.fov / 2));
      const dist = Math.max(2.25 / half, 0.62 / (half * aspect));
      camera.aspect = aspect;
      camera.position.set(0, 0.2 + dist * Math.sin(deg(6)), dist * Math.cos(deg(6)));
      camera.lookAt(0, 0.2, 0);
      camera.updateProjectionMatrix();
    };
    const resize = () => {
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      fit(width / height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    renderer.compile(scene, camera);

    const state = { running: false, hover: 0, hoverTarget: 0, speed: reduced ? 0 : 0.6, lastY: window.scrollY };
    pole.stripes.rotation.y = 0.4;
    const clock = new THREE.Clock();
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!state.running) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const y = window.scrollY;
      const v = Math.abs(y - state.lastY) / Math.max(dt, 0.008);
      state.lastY = y;
      state.hover += (state.hoverTarget - state.hover) * 0.08;
      const target = reduced ? 0 : 0.6 + Math.min(v, 3000) * 0.0011 + state.hover * 0.9;
      state.speed += (target - state.speed) * 0.06;
      pole.stripes.rotation.y += state.speed * dt;
      pole.globe.material.emissiveIntensity = 0.16 + state.hover * 0.5;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    api.current = {
      setRunning: (on) => {
        state.running = on;
        if (on) {
          clock.getDelta();
          state.lastY = window.scrollY;
        }
      },
      hover: (on) => {
        state.hoverTarget = on ? 1 : 0;
      },
    };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          o.material.map?.dispose();
          o.material.dispose();
        }
      });
      scene.environment?.dispose();
      renderer.dispose();
      api.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    api.current?.setRunning(visible);
  }, [visible, webgl]);

  return (
    <div ref={wrapRef} className={className} onPointerEnter={() => api.current?.hover(true)} onPointerLeave={() => api.current?.hover(false)}>
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[6%] aspect-square w-[min(150%,260px)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,244,222,0.95)_0%,rgba(231,214,197,0.45)_38%,rgba(231,214,197,0)_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[80%] w-[min(120%,220px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(220,230,223,0.9),rgba(220,230,223,0))]"
      />
      {webgl ? (
        <canvas ref={canvasRef} role="img" aria-label="Вращающийся столб барбершопа" className="absolute inset-0 block h-full w-full" />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="h-[9%] w-[26%] rounded-full bg-[radial-gradient(circle_at_35%_35%,#FFFFFF,#F1E6D3_60%,#D8C3A5)]" />
          <span className="h-[5%] w-[30%] rounded-[6px] bg-[linear-gradient(90deg,#9c7a4c,#ead2a4,#9c7a4c)]" />
          <span className="h-[56%] w-[24%] bg-[repeating-linear-gradient(-50deg,#4F7A68_0_14px,#F6F2EA_14px_24px,#C58052_24px_29px,#F6F2EA_29px_38px)] shadow-[inset_-6px_0_12px_rgba(0,0,0,0.15),inset_6px_0_10px_rgba(255,255,255,0.4)]" />
          <span className="h-[7%] w-[30%] rounded-b-[10px] bg-[linear-gradient(90deg,#9c7a4c,#ead2a4,#9c7a4c)]" />
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────── Манифест (GSAP) ──────────────────── */

const MANIFESTO = [
  { t: "Шесть кресел.", em: true },
  { t: "Час на каждого гостя. Мастер изучает форму головы, рост волос и линию бороды до того, как возьмёт ножницы. Хорошая стрижка держит форму" },
  { t: "три недели.", em: true },
];

function Manifesto() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useIsoLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".mf-w",
        { opacity: 0.14, yPercent: 35, rotateX: -70, transformPerspective: 600, transformOrigin: "50% 100%" },
        {
          opacity: 1,
          yPercent: 0,
          rotateX: 0,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".mf-text", start: "top 80%", end: "bottom 55%", scrub: 1 },
        },
      );
      gsap.fromTo(
        ".mf-rule",
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top 85%", end: "bottom 45%", scrub: true } },
      );
      gsap.fromTo(
        ".mf-pole",
        { yPercent: 10 },
        { yPercent: -8, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.6 } },
      );
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={ref} aria-label="Манифест" className="relative py-24 sm:py-36">
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="flex items-center justify-between gap-8 lg:col-span-3 lg:flex-col lg:items-start lg:justify-start">
          <p className="f-label text-[12px] uppercase tracking-[0.14em] text-[#4F7A68]">
            <span className="mr-2.5 inline-block h-1.5 w-1.5 rounded-full bg-[#4F7A68] align-middle" aria-hidden="true" />
            Манифест
          </p>
          <BarberPole className="mf-pole relative h-48 w-20 shrink-0 sm:h-64 sm:w-28 lg:h-[460px] lg:w-full" />
        </div>
        <p className="mf-text f-display text-[clamp(1.9rem,4.2vw,3.9rem)] font-normal leading-[1.22] text-[#26332D] lg:col-span-9">
          {MANIFESTO.map((seg, si) =>
            seg.t.split(" ").map((w, wi) => (
              <React.Fragment key={`${si}-${wi}`}>
                <span className={`mf-w inline-block ${seg.em ? "italic text-[#4F7A68]" : ""}`}>{w}</span>{" "}
              </React.Fragment>
            )),
          )}
        </p>
      </Container>
      <Container className="mt-16">
        <div className="mf-rule h-px origin-left bg-gradient-to-r from-[#4F7A68] via-[#4F7A68]/40 to-transparent" />
      </Container>
    </section>
  );
}

/* ───────────────────────────── Услуги ───────────────────────────── */

function PriceTag({ price, rot, hover }) {
  const chars = [...fmtPrice(price)];
  return (
    <div className="relative -mt-1 flex shrink-0 flex-col items-center" aria-label={`Цена: ${fmtPrice(price)}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-[#4F7A68]" aria-hidden="true" />
      <motion.div style={{ rotate: rot, transformOrigin: "50% 0%" }} className="flex flex-col items-center">
        <span className="h-4 w-px bg-[#4F7A68]/60" aria-hidden="true" />
        <motion.div className="relative px-4 pb-2.5 pt-4 text-center" animate={{ color: hover ? "#FAFBF8" : "#26332D" }} transition={{ duration: 0.3 }}>
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl border border-[#4F7A68]/50 shadow-[0_12px_24px_-16px_rgba(38,51,45,0.5)]"
            animate={{ backgroundColor: hover ? "#4F7A68" : "rgba(250,251,248,0.9)" }}
            transition={{ duration: 0.3 }}
          />
          <span className="absolute left-1/2 top-[5px] -ml-[3px] h-1.5 w-1.5 rounded-full border border-current opacity-70" aria-hidden="true" />
          <span className="f-label relative block text-[9.5px] uppercase tracking-[0.14em] opacity-70">Цена</span>
          <span className="f-display relative block whitespace-nowrap text-[1.4rem] font-semibold leading-none" aria-hidden="true">
            {chars.map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block"
                animate={hover ? { y: [0, -5, 0] } : { y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.035, ease: "easeOut" }}
              >
                {ch === " " ? " " : ch}
              </motion.span>
            ))}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

function ServiceCard({ s, index, onSelect }) {
  const ref = useRef(null);
  const fine = useFinePointer();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 160, damping: 16 });
  const sry = useSpring(ry, { stiffness: 160, damping: 16 });
  const gx = useMotionValue(-500);
  const gy = useMotionValue(-500);
  const tag = useMotionValue(0);
  const tagRot = useSpring(tag, { stiffness: 150, damping: 5, mass: 0.6 });
  const lastX = useRef(null);
  const settle = useRef(null);
  const border = useMotionTemplate`radial-gradient(380px circle at ${gx}px ${gy}px, rgba(79,122,104,0.95), rgba(79,122,104,0.35) 30%, rgba(38,51,45,0.12) 62%)`;
  const sheen = useMotionTemplate`radial-gradient(520px circle at ${gx}px ${gy}px, rgba(79,122,104,0.10), transparent 42%)`;
  const Icon = s.icon;

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    gx.set(e.clientX - r.left);
    gy.set(e.clientY - r.top);
    if (fine) {
      rx.set(-((e.clientY - r.top) / r.height - 0.5) * 9);
      ry.set(((e.clientX - r.left) / r.width - 0.5) * 11);
    }
    if (lastX.current != null) tag.set(clamp((e.clientX - lastX.current) * 1.4, -20, 20));
    lastX.current = e.clientX;
    clearTimeout(settle.current);
    settle.current = setTimeout(() => tag.set(0), 70);
  };
  const onEnter = () => {
    setHover(true);
    tag.set(16);
    clearTimeout(settle.current);
    settle.current = setTimeout(() => tag.set(0), 90);
  };
  const onLeave = () => {
    setHover(false);
    rx.set(0);
    ry.set(0);
    gx.set(-500);
    gy.set(-500);
    tag.set(-10);
    lastX.current = null;
    clearTimeout(settle.current);
    settle.current = setTimeout(() => tag.set(0), 90);
  };
  useEffect(() => () => clearTimeout(settle.current), []);

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 90, rotateX: -18 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...springSoft, delay: (index % 3) * 0.09 }}
      style={{ transformPerspective: 1200 }}
    >
      <motion.article
        ref={ref}
        onPointerMove={onMove}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        style={{ rotateX: srx, rotateY: sry, transformPerspective: 1100 }}
        whileHover={{ y: -8, scale: 1.015 }}
        transition={springSnappy}
        className="relative rounded-[28px]"
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-6 rounded-full blur-2xl"
          style={{ background: "radial-gradient(closest-side, rgba(79,122,104,0.32), transparent)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: hover ? 0.7 : 0 }}
          transition={{ duration: 0.4 }}
        />
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[28px]" style={{ background: border }} />
        <div className="relative m-px flex flex-col gap-6 rounded-[27px] bg-[#FAFBF8]/90 p-6 backdrop-blur-xl sm:p-7">
          <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[27px]" style={{ background: sheen }} />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 pt-2">
              <motion.span
                className="grid h-11 w-11 place-items-center rounded-full bg-[#DCE6DF] text-[#4F7A68]"
                animate={{ rotate: hover ? 90 : 0, borderColor: hover ? "rgba(79,122,104,1)" : "rgba(79,122,104,0.4)" }}
                transition={springSnappy}
              >
                <motion.span animate={{ rotate: hover ? -90 : 0 }} transition={springSnappy} className="grid place-items-center">
                  <Icon size={18} strokeWidth={1.4} />
                </motion.span>
              </motion.span>
              <div className="f-label flex flex-col text-[11px] uppercase tracking-[0.14em]">
                <span className="text-[#26332D]/60">{s.cat}</span>
                {s.badge ? <span className="text-[#4F7A68]">{s.badge}</span> : null}
              </div>
            </div>
            <PriceTag price={s.price} rot={tagRot} hover={hover} />
          </div>

          <div className="relative">
            <h3 className="f-display text-[1.9rem] font-medium leading-[1.05] sm:text-[2.1rem]">{s.title}</h3>
            <p className="mt-3 min-h-[4.9em] text-[15px] leading-relaxed text-[#26332D]/70">{s.desc}</p>
          </div>

          <div className="f-label relative flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#26332D]/15 pt-4 text-[12px] uppercase tracking-[0.1em] text-[#26332D]/65">
            <span className="inline-flex items-center gap-2">
              <Clock size={13} strokeWidth={1.5} className="text-[#4F7A68]" />
              {s.time} мин
            </span>
            <span>{s.tool}</span>
          </div>

          <AnimatePresence initial={false} onExitComplete={() => ScrollTrigger.refresh()}>
            {open ? (
              <motion.div
                key="details"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 140, damping: 22 }}
                onAnimationComplete={() => ScrollTrigger.refresh()}
                className="relative -mt-2 overflow-hidden"
              >
                <ul className="grid gap-2.5 pt-2">
                  {s.includes.map((item, i) => (
                    <motion.li
                      key={item}
                      className="flex items-center gap-3 text-[14px] text-[#26332D]/80"
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springSnappy, delay: 0.05 + i * 0.05 }}
                    >
                      <Check size={14} className="shrink-0 text-[#4F7A68]" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="relative flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="f-label inline-flex items-center gap-2 py-1 text-[12px] uppercase tracking-[0.14em] text-[#26332D]/80"
            >
              <motion.span animate={{ rotate: open ? 45 : 0 }} transition={springSnappy} className="grid place-items-center">
                <Plus size={14} />
              </motion.span>
              {open ? "Свернуть" : "Что входит"}
            </button>
            <motion.button
              type="button"
              onClick={() => onSelect(s.id)}
              whileHover={{ x: 4, color: "#6E9A86" }}
              transition={springSnappy}
              className="f-label inline-flex items-center gap-2 py-1 text-[12px] uppercase tracking-[0.14em] text-[#4F7A68]"
            >
              Записаться
              <ArrowUpRight size={14} />
            </motion.button>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

function Services({ onSelect }) {
  return (
    <section id="craft" className="relative scroll-mt-20 py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute left-[-10%] top-[30%] h-[40vmax] w-[40vmax] rounded-full bg-[#4F7A68]/10 blur-[120px]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[5%] right-[-8%] h-[32vmax] w-[32vmax] rounded-full bg-[#4F7A68]/[0.07] blur-[110px]"
      />
      <Container>
        <SectionHead
          eyebrow="Услуги и цены"
          title="Наше"
          italic="ремесло"
          aside="Цена одинакова у всех мастеров. Время указано за весь визит, включая консультацию и укладку."
        />
        <div className="mt-14 grid items-start gap-5 sm:mt-20 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.id} s={s} index={i} onSelect={onSelect} />
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ───────────────────────────── Работы ───────────────────────────── */

// Фото гостей лежат рядом со страницей в папке clients/; pos — точка кадрирования в карточке
const WORKS = [
  {
    id: "w6",
    src: "clients/client-6.webp",
    pos: "50% 22%",
    title: "Зачёс с высоким фейдом",
    note: "Объёмный верх назад и в сторону, чистый переход на висках.",
    service: "fade",
  },
  {
    id: "w2",
    src: "clients/client-2.webp",
    pos: "42% 40%",
    title: "Скин-фейд и борода",
    note: "Переход от кожи на висках, контур бороды опасной бритвой.",
    service: "fade",
  },
  {
    id: "w8",
    src: "clients/client-8.webp",
    pos: "50% 35%",
    title: "Кудрявый верх и тейпер",
    note: "Сохранили кудри сверху, аккуратно убрали виски и затылок.",
    service: "signature",
  },
  {
    id: "w1",
    src: "clients/client-1.webp",
    pos: "50% 28%",
    title: "Кроп с прямой чёлкой",
    note: "Ножницы, плотная текстура и ровная линия чёлки.",
    service: "signature",
  },
  {
    id: "w7",
    src: "clients/client-7.webp",
    pos: "50% 30%",
    title: "Текстурный зачёс",
    note: "Подвижная текстура сверху и скин-фейд по бокам.",
    service: "fade",
  },
  { id: "w5", src: "clients/client-5.webp", pos: "58% 40%", title: "Маллет с фейдом", note: "Длина на затылке, фейд и оформление бороды.", service: "fade" },
  { id: "w4", src: "clients/client-4.webp", pos: "45% 35%", title: "Текстурный кроп", note: "Объём сверху и мягкий переход по вискам.", service: "signature" },
  {
    id: "w9",
    src: "clients/client-9.webp",
    pos: "63% 30%",
    title: "Классический помпадур",
    note: "Высокий объём надо лбом и гладкая укладка назад.",
    service: "signature",
  },
  {
    id: "w3",
    src: "clients/client-3.webp",
    pos: "68% 30%",
    title: "Текстурная стрижка",
    note: "Рваная чёлка и лёгкая небрежная укладка.",
    service: "signature",
  },
];
const AUTOPLAY_MS = 3200;
const SLIDE_SHAPE = "rounded-b-[26px] rounded-t-[999px]";

/** Карточка ленты: чем дальше от центра, тем она меньше и прозрачнее. */
function WorkSlide({ dist, slideRef, index, active, children, caption }) {
  // dist — расстояние от центра ленты в «карточках»: 0 — в центре, ±1 — соседняя
  const scale = useTransform(dist, (d) => 1 - Math.min(Math.abs(d), 2) * 0.1);
  const opacity = useTransform(dist, (d) => 1 - Math.min(Math.abs(d), 2) * 0.32);
  const y = useTransform(dist, (d) => Math.min(Math.abs(d), 2) * 20);
  return (
    <motion.li
      ref={slideRef}
      style={{ scale, opacity, y }}
      className="w-[68vw] max-w-[300px] shrink-0 snap-center sm:w-[300px] lg:w-[330px]"
      aria-current={active ? "true" : undefined}
      aria-label={`${index + 1} из ${WORKS.length + 1}`}
    >
      {children}
      {caption}
    </motion.li>
  );
}

function Lightbox({ index, onClose, onStep, onPick }) {
  const work = WORKS[index];
  const service = SERVICES.find((s) => s.id === work.service);
  const closeRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [onClose, onStep]);

  return (
    <motion.div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-[#26332D]/70 p-3 backdrop-blur-md sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={work.title}
    >
      <motion.div
        className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-[#FAFBF8] p-3 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.5)] sm:flex-row sm:gap-2 sm:p-4"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 40, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 30, scale: 0.97 }}
        transition={springSoft}
      >
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[24px] bg-[#E1E8E2]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={work.id}
              src={work.src}
              alt={`${work.title} — работа Onix Barbershop`}
              className="block max-h-[58vh] w-auto max-w-full object-contain sm:max-h-[82vh]"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            />
          </AnimatePresence>
        </div>
        <div className="flex shrink-0 flex-col justify-between gap-5 p-3 pt-5 sm:w-80 sm:p-6">
          <div>
            <p className="f-label text-[11px] uppercase tracking-[0.14em] text-[#4F7A68]">
              Работа {String(index + 1).padStart(2, "0")} / {String(WORKS.length).padStart(2, "0")}
            </p>
            <h3 className="f-display mt-2 text-[1.9rem] font-medium leading-tight text-[#26332D]">{work.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#26332D]/70">{work.note}</p>
            <p className="f-label mt-4 text-[12px] uppercase tracking-[0.1em] text-[#26332D]/60">
              {service.title} · {fmtPrice(service.price)} · {service.time} мин
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <PrimaryButton onClick={() => onPick(work.service)}>Хочу так же</PrimaryButton>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onStep(-1)}
                aria-label="Предыдущая работа"
                className="grid h-11 w-11 place-items-center rounded-full border border-[#26332D]/20 text-[#26332D]"
              >
                <ArrowLeft size={18} strokeWidth={1.6} />
              </button>
              <button
                type="button"
                onClick={() => onStep(1)}
                aria-label="Следующая работа"
                className="grid h-11 w-11 place-items-center rounded-full border border-[#26332D]/20 text-[#26332D]"
              >
                <ArrowRight size={18} strokeWidth={1.6} />
              </button>
            </div>
          </div>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-[#FAFBF8]/90 text-[#26332D] shadow-[0_8px_20px_-10px_rgba(38,51,45,0.6)] sm:right-6 sm:top-6"
        >
          <X size={18} />
        </button>
      </motion.div>
    </motion.div>
  );
}

function Works({ onPick }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const slides = useRef([]);
  const drag = useRef(null);
  const dragMoved = useRef(false);
  const releaseTimer = useRef(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const inView = useInView(sectionRef, { amount: 0.3 });
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false);
  const [open, setOpen] = useState(null);
  const count = WORKS.length + 1; // последняя карточка — приглашение записаться
  const dists = useMemo(() => Array.from({ length: count }, () => motionValue(2)), [count]);

  const goTo = useCallback(
    (i, smooth = true) => {
      const track = trackRef.current;
      const n = ((i % count) + count) % count;
      const el = slides.current[n];
      if (!track || !el) return;
      track.scrollTo({ left: el.offsetLeft - (track.clientWidth - el.offsetWidth) / 2, behavior: smooth && !reduced ? "smooth" : "auto" });
      setActive(n);
    },
    [count, reduced],
  );

  // стартуем с середины ленты, чтобы по обе стороны были фото
  useEffect(() => {
    const raf = requestAnimationFrame(() => goTo(2, false));
    return () => cancelAnimationFrame(raf);
  }, [goTo]);

  // активная карточка — ближайшая к центру ленты
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mid = track.scrollLeft + track.clientWidth / 2;
        const first = slides.current[0];
        const second = slides.current[1];
        const pitch = first && second ? second.offsetLeft - first.offsetLeft : 1;
        let best = 0;
        let bestD = Infinity;
        slides.current.forEach((el, i) => {
          if (!el) return;
          const d = el.offsetLeft + el.offsetWidth / 2 - mid;
          dists[i]?.set(d / pitch);
          if (Math.abs(d) < bestD) {
            bestD = Math.abs(d);
            best = i;
          }
        });
        setActive(best);
      });
    };
    onScroll();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [dists]);

  // лента листается сама, пока её не трогают
  const running = playing && !hold && inView && open == null && !reduced;
  useEffect(() => {
    if (!running) return undefined;
    const t = setTimeout(() => goTo(active + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [running, active, goTo]);

  const interact = () => {
    setHold(true);
    clearTimeout(releaseTimer.current);
    releaseTimer.current = setTimeout(() => setHold(false), 3500);
  };
  useEffect(() => () => clearTimeout(releaseTimer.current), []);

  // перетаскивание мышью
  const onPointerDown = (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const track = trackRef.current;
    drag.current = { x: e.clientX, left: track.scrollLeft };
    dragMoved.current = false;
    const move = (ev) => {
      const dx = ev.clientX - drag.current.x;
      if (Math.abs(dx) > 5) {
        dragMoved.current = true;
        track.style.scrollSnapType = "none";
        track.style.scrollBehavior = "auto";
      }
      if (dragMoved.current) track.scrollLeft = drag.current.left - dx;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      track.style.scrollSnapType = "";
      track.style.scrollBehavior = "";
      if (dragMoved.current) {
        const mid = track.scrollLeft + track.clientWidth / 2;
        const nearest = slides.current.reduce(
          (b, el, i) =>
            el && Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid) < Math.abs(slides.current[b].offsetLeft + slides.current[b].offsetWidth / 2 - mid) ? i : b,
          0,
        );
        goTo(nearest);
      }
      drag.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const openWork = (id, i) => {
    if (dragMoved.current) return;
    if (i !== active) goTo(i);
    else setOpen(id);
  };
  const openIndex = open == null ? -1 : WORKS.findIndex((w) => w.id === open);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d) => setOpen((id) => WORKS[(WORKS.findIndex((w) => w.id === id) + d + WORKS.length) % WORKS.length].id), []);
  const pick = (service) => {
    setOpen(null);
    onPick(service);
  };

  return (
    <section id="works" ref={sectionRef} className="relative scroll-mt-20 overflow-hidden py-24 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute left-[20%] top-[30%] h-[36vmax] w-[36vmax] rounded-full bg-[#E7D6C5]/50 blur-[120px]" />
      <Container>
        <SectionHead
          eyebrow="Портфолио"
          title="Наши"
          italic="работы"
          aside="Реальные гости Onix Barbershop после визита. Лента листается сама; потяните её или нажмите на фото, чтобы рассмотреть стрижку."
        />
      </Container>

      <div
        className="relative mt-12 sm:mt-16"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHold(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHold(false)}
      >
        <ul
          ref={trackRef}
          onPointerDown={onPointerDown}
          onTouchStart={interact}
          onWheel={interact}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              interact();
              goTo(active + 1);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              interact();
              goTo(active - 1);
            }
          }}
          tabIndex={0}
          aria-label="Лента работ: стрелки влево и вправо листают фото"
          className="relative flex cursor-grab snap-x snap-mandatory items-start gap-4 overflow-x-auto overscroll-x-contain px-[calc(50vw-34vw)] pb-6 pt-4 [-ms-overflow-style:none] [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)] [scrollbar-width:none] active:cursor-grabbing sm:gap-6 sm:px-[calc(50vw-150px)] lg:px-[calc(50vw-165px)] [&::-webkit-scrollbar]:hidden"
        >
          {WORKS.map((work, i) => {
            const service = SERVICES.find((s) => s.id === work.service);
            return (
              <WorkSlide
                key={work.id}
                dist={dists[i]}
                slideRef={(el) => (slides.current[i] = el)}
                index={i}
                active={active === i}
                caption={
                  <div className="mt-4 flex items-start justify-between gap-3 px-1">
                    <div className="min-w-0">
                      <span className="f-label block text-[11px] uppercase tracking-[0.14em] text-[#4F7A68]">Работа {String(i + 1).padStart(2, "0")}</span>
                      <span className="f-display mt-1 block text-[1.2rem] leading-tight text-[#26332D] sm:text-[1.35rem]">{work.title}</span>
                    </div>
                    <span className="f-label shrink-0 pt-5 text-[12px] tracking-[0.06em] text-[#26332D]/60">{fmtPrice(service.price)}</span>
                  </div>
                }
              >
                <motion.figure
                  initial="rest"
                  animate={!fine && active === i ? "hover" : "rest"}
                  whileHover="hover"
                  className={`relative aspect-[3/4] overflow-hidden bg-[#E1E8E2] shadow-[0_30px_60px_-36px_rgba(38,51,45,0.5)] ${SLIDE_SHAPE}`}
                >
                  <motion.img
                    src={work.src}
                    alt={`${work.title} — работа Onix Barbershop`}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="absolute inset-0 h-full w-full select-none object-cover"
                    style={{ objectPosition: work.pos }}
                    variants={{ rest: { scale: 1.02 }, hover: { scale: 1.08 } }}
                    transition={{ type: "spring", stiffness: 70, damping: 18 }}
                  />
                  <button
                    type="button"
                    onClick={() => openWork(work.id, i)}
                    className="absolute inset-0 z-10"
                    aria-label={active === i ? `Открыть фото: ${work.title}` : `Показать: ${work.title}`}
                    data-cursor="view"
                  />
                  <motion.div
                    className="absolute inset-x-0 bottom-0 z-20 flex justify-center p-4"
                    variants={{ rest: { opacity: 0, y: 14, pointerEvents: "none" }, hover: { opacity: 1, y: 0, pointerEvents: "auto" } }}
                    transition={{ type: "spring", stiffness: 200, damping: 22 }}
                  >
                    <button
                      type="button"
                      onClick={() => pick(work.service)}
                      className="f-label rounded-full bg-[#FAFBF8]/95 px-5 py-2.5 text-[12px] uppercase tracking-[0.1em] text-[#26332D] shadow-[0_10px_30px_-12px_rgba(38,51,45,0.6)] backdrop-blur"
                    >
                      Хочу так
                    </button>
                  </motion.div>
                </motion.figure>
              </WorkSlide>
            );
          })}
          <WorkSlide
            dist={dists[WORKS.length]}
            slideRef={(el) => (slides.current[WORKS.length] = el)}
            index={WORKS.length}
            active={active === WORKS.length}
            caption={
              <div className="mt-4 px-1">
                <span className="f-label block text-[11px] uppercase tracking-[0.14em] text-[#4F7A68]">Следующая</span>
                <span className="f-display mt-1 block text-[1.2rem] leading-tight text-[#26332D] sm:text-[1.35rem]">Ваша стрижка</span>
              </div>
            }
          >
            <div className={`relative flex aspect-[3/4] flex-col items-center justify-center gap-6 bg-[#E7D6C5] p-8 text-center ${SLIDE_SHAPE}`}>
              <p className="f-display text-[1.7rem] leading-snug text-[#26332D]">
                Следующая работа <span className="italic text-[#4F7A68]">может быть вашей</span>
              </p>
              <PrimaryButton onClick={() => pick(null)}>Записаться</PrimaryButton>
            </div>
          </WorkSlide>
        </ul>
      </div>

      <Container className="mt-4 flex items-center gap-5">
        <span className="f-label w-16 shrink-0 text-[13px] tabular-nums tracking-[0.08em] text-[#26332D]">
          {String(active + 1).padStart(2, "0")}
          <span className="text-[#26332D]/40"> / {String(count).padStart(2, "0")}</span>
        </span>
        <div className="relative h-px flex-1 overflow-hidden bg-[#26332D]/15">
          <motion.span
            key={`${active}-${running}`}
            className="absolute inset-0 origin-left bg-[#4F7A68]"
            initial={{ scaleX: running ? 0 : (active + 1) / count }}
            animate={{ scaleX: running ? 1 : (active + 1) / count }}
            transition={{ duration: running ? AUTOPLAY_MS / 1000 : 0.4, ease: running ? "linear" : "easeOut" }}
          />
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Остановить автолистание" : "Включить автолистание"}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#26332D]/20 text-[#26332D]"
          >
            {playing ? <Pause size={16} strokeWidth={1.8} /> : <Play size={16} strokeWidth={1.8} />}
          </button>
          <button
            type="button"
            onClick={() => {
              interact();
              goTo(active - 1);
            }}
            aria-label="Предыдущая работа"
            className="grid h-11 w-11 place-items-center rounded-full border border-[#26332D]/20 text-[#26332D]"
          >
            <ArrowLeft size={18} strokeWidth={1.6} />
          </button>
          <button
            type="button"
            onClick={() => {
              interact();
              goTo(active + 1);
            }}
            aria-label="Следующая работа"
            className="grid h-11 w-11 place-items-center rounded-full bg-[#4F7A68] text-[#FAFBF8]"
          >
            <ArrowRight size={18} strokeWidth={1.6} />
          </button>
        </div>
      </Container>

      <AnimatePresence>{openIndex >= 0 ? <Lightbox key="lightbox" index={openIndex} onClose={close} onStep={step} onPick={pick} /> : null}</AnimatePresence>
    </section>
  );
}

/* ─────────────── Ритуал: предметы этапов в 3D ─────────────── */

/** Тело вращения: точки профиля идут снизу вверх, тогда нормали смотрят наружу. */
const lathe = (pts, segments = 96) =>
  new THREE.LatheGeometry(
    pts.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );

/** Текстура с надписями: перерисовывается, когда догрузятся Lora и Manrope. */
function labelTexture(w, h, draw) {
  const tex = canvasTexture(w, h, draw);
  const redraw = () => {
    draw(tex.image.getContext("2d"), w, h);
    tex.needsUpdate = true;
  };
  if (typeof document !== "undefined" && document.fonts) {
    Promise.all([document.fonts.load('italic 500 80px "Lora"'), document.fonts.load('600 40px "Manrope"')]).then(redraw, () => {});
    document.fonts.ready.then(redraw, () => {});
  }
  return tex;
}

function softSpot(alpha) {
  return canvasTexture(256, 256, (ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, `rgba(38,51,45,${alpha})`);
    g.addColorStop(0.55, `rgba(38,51,45,${alpha * 0.35})`);
    g.addColorStop(1, "rgba(38,51,45,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
  });
}

/** Подиум из травертина: слоистые прожилки, поры и мягкая фаска по кромке. */
function buildPedestal() {
  const draw = (ctx, w, h) => {
    const rnd = mulberry32(21);
    ctx.fillStyle = "#E6DDCF";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i += 1) {
      ctx.fillStyle = rnd() < 0.6 ? `rgba(176,152,120,${0.12 + rnd() * 0.3})` : `rgba(255,252,246,${0.3 + rnd() * 0.4})`;
      ctx.fillRect(0, rnd() * h, w, 0.6 + rnd() * 3.2);
    }
    for (let i = 0; i < 900; i += 1) {
      ctx.fillStyle = `rgba(132,114,90,${0.1 + rnd() * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(rnd() * w, rnd() * h, 0.8 + rnd() * 4.2, 0.5 + rnd() * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  const sideTex = canvasTexture(1024, 256, draw);
  sideTex.wrapS = THREE.RepeatWrapping;
  sideTex.repeat.set(3, 1);
  const topTex = canvasTexture(512, 512, draw);
  const R = 0.9;
  const H = 0.26;
  const b = 0.035;
  const pts = [
    [R - b, -H],
    [R - b * 0.3, -H + b * 0.3],
    [R, -H + b],
  ];
  for (let k = 1; k < 10; k += 1) pts.push([R, -H + b + ((H - 2 * b) * k) / 10]);
  pts.push([R, -b], [R - b * 0.3, -b * 0.3], [R - b, 0]);
  const group = new THREE.Group();
  group.add(new THREE.Mesh(lathe(pts, 160), new THREE.MeshStandardMaterial({ map: sideTex, color: srgb(0xd6cdbf), roughness: 0.74 })));
  const top = new THREE.Mesh(new THREE.CircleGeometry(R - b, 160), new THREE.MeshStandardMaterial({ map: topTex, color: srgb(0xe2dacd), roughness: 0.66 }));
  top.rotation.x = -Math.PI / 2;
  group.add(top);
  const bottom = top.clone();
  bottom.rotation.x = Math.PI / 2;
  bottom.position.y = -H;
  group.add(bottom);
  return { object: group, height: H, radius: R };
}

/** Ручное зеркало для консультации: лакированная спинка, латунный кант, медальон и точёная ручка. */
function buildMirror() {
  const lacquer = new THREE.MeshPhysicalMaterial({ color: srgb(0x2f4a3f), roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 });
  const brass = new THREE.MeshStandardMaterial({ color: srgb(0xd6ac74), metalness: 1, roughness: 0.2 });
  const room = canvasTexture(256, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w * 0.35, h);
    g.addColorStop(0, "#F6F8F5");
    g.addColorStop(0.5, "#D9E2DC");
    g.addColorStop(1, "#A9B7AF");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-0.7);
    const streak = ctx.createLinearGradient(-w * 0.2, 0, w * 0.2, 0);
    streak.addColorStop(0, "rgba(255,255,255,0)");
    streak.addColorStop(0.5, "rgba(255,255,255,0.75)");
    streak.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = streak;
    ctx.fillRect(-w * 0.2 - 30, -h, w * 0.18, h * 2);
    ctx.fillRect(w * 0.02, -h, w * 0.08, h * 2);
    ctx.restore();
  });
  const glass = new THREE.MeshStandardMaterial({
    color: srgb(0x5c6561),
    metalness: 1,
    roughness: 0.04,
    emissive: 0xffffff,
    emissiveMap: room,
    emissiveIntensity: 0.78,
  });
  const R = 0.58;
  const head = new THREE.Group();
  const shell = new THREE.Mesh(
    lathe(
      [
        [0, -0.09],
        [0.3, -0.085],
        [0.5, -0.066],
        [R + 0.04, -0.034],
        [R + 0.062, 0.0],
        [R + 0.056, 0.026],
        [R + 0.02, 0.036],
        [R, 0.022],
        [0, 0.022],
      ],
      128,
    ),
    lacquer,
  );
  shell.rotation.x = Math.PI / 2;
  head.add(shell);
  const mirror = new THREE.Mesh(new THREE.CircleGeometry(R, 128), glass);
  mirror.position.z = 0.024;
  head.add(mirror);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(R + 0.012, 0.016, 16, 160), brass);
  bezel.position.z = 0.03;
  head.add(bezel);
  // медальон на спинке
  const medal = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 12, 64), brass);
  medal.position.z = -0.094;
  head.add(medal);
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 40), brass);
  dot.rotation.x = Math.PI / 2;
  dot.position.z = -0.094;
  head.add(dot);

  const handle = new THREE.Group();
  handle.add(
    new THREE.Mesh(
      lathe([
        [0, -1.5],
        [0.045, -1.5],
        [0.066, -1.485],
        [0.074, -1.44],
        [0.07, -1.25],
        [0.06, -1.0],
        [0.05, -0.82],
        [0.046, -0.74],
        [0.05, -0.7],
        [0, -0.68],
      ]),
      lacquer,
    ),
  );
  const ring = (y, r, h) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48), brass);
    m.position.y = y;
    handle.add(m);
  };
  ring(-0.68, 0.062, 0.07);
  ring(-1.44, 0.078, 0.03);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.05, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), brass);
  cap.position.y = -1.5;
  handle.add(cap);

  const inner = new THREE.Group();
  inner.add(head, handle);
  inner.position.y = 1.55;
  const body = new THREE.Group();
  body.add(inner);
  body.scale.setScalar(0.82);
  return { object: body, tiltX: -0.12 };
}

/** Флакон шампуня: янтарное стекло, бумажная этикетка, чёрный дозатор и капли воды. */
function buildBottle() {
  const amber = new THREE.MeshPhysicalMaterial({ color: srgb(0x5a2a0c), emissive: srgb(0x1c0b03), roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.02 });
  const ink = new THREE.MeshStandardMaterial({ color: srgb(0x232b28), roughness: 0.48 });
  const satin = new THREE.MeshStandardMaterial({ color: srgb(0xc3c8c5), metalness: 1, roughness: 0.28 });
  const label = labelTexture(1024, 600, (ctx, w, h) => {
    ctx.fillStyle = "#F4EFE5";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(160,140,110,0.08)";
    const rnd = mulberry32(5);
    for (let i = 0; i < 1600; i += 1) ctx.fillRect(rnd() * w, rnd() * h, 1.5, 1.5);
    ctx.fillStyle = "#26332D";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "600 34px Manrope, 'Segoe UI', sans-serif";
    ctx.letterSpacing = "10px";
    ctx.fillText("ONIX  BARBERSHOP", w / 2, 120);
    ctx.letterSpacing = "0px";
    ctx.fillRect(w / 2 - 60, 168, 120, 2);
    ctx.font = "italic 500 112px Lora, Georgia, serif";
    ctx.fillText("Шампунь", w / 2, 280);
    ctx.font = "500 34px Manrope, 'Segoe UI', sans-serif";
    ctx.fillStyle = "rgba(38,51,45,0.72)";
    ctx.fillText("для кожи головы · шалфей и кедр", w / 2, 390);
    ctx.font = "600 30px Manrope, 'Segoe UI', sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillStyle = "#4F7A68";
    ctx.fillText("500 МЛ", w / 2, 490);
  });

  const R = 0.36;
  const g = new THREE.Group();
  g.add(
    new THREE.Mesh(
      lathe(
        [
          [0, 0],
          [0.3, 0],
          [0.345, 0.012],
          [R, 0.05],
          [R, 0.3],
          [R, 0.6],
          [R, 0.86],
          [0.35, 0.93],
          [0.31, 0.99],
          [0.22, 1.04],
          [0.14, 1.07],
          [0.112, 1.09],
          [0.112, 1.15],
          [0, 1.15],
        ],
        128,
      ),
      amber,
    ),
  );
  const tag = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.003, R + 0.003, 0.5, 128, 1, true, -1.15, 2.3),
    new THREE.MeshStandardMaterial({ map: label, roughness: 0.82 }),
  );
  tag.position.y = 0.48;
  g.add(tag);
  // крышка-дозатор: рифлёный воротник, шток и носик
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.13, 64), ink);
  collar.position.y = 1.2;
  g.add(collar);
  [1.15, 1.25].forEach((y) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.008, 8, 64), ink);
    t.rotation.x = Math.PI / 2;
    t.position.y = y;
    g.add(t);
  });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.14, 24), satin);
  stem.position.y = 1.33;
  g.add(stem);
  const pump = new THREE.Mesh(
    lathe([
      [0, 1.38],
      [0.075, 1.38],
      [0.09, 1.395],
      [0.092, 1.43],
      [0.08, 1.46],
      [0, 1.47],
    ]),
    ink,
  );
  g.add(pump);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.26, 24), ink);
  nozzle.rotation.z = Math.PI / 2 + 0.06;
  nozzle.position.set(0.17, 1.425, 0);
  g.add(nozzle);
  // капли воды на стекле
  const drop = new THREE.MeshPhysicalMaterial({ color: srgb(0xffffff), roughness: 0.02, clearcoat: 1, transparent: true, opacity: 0.32 });
  const rnd = mulberry32(42);
  for (let i = 0; i < 11; i += 1) {
    const pivot = new THREE.Group();
    pivot.rotation.y = -1.6 + rnd() * 3.2;
    const r = 0.01 + rnd() * 0.016;
    const d = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), drop);
    d.position.set(0, 0.12 + rnd() * 0.72, R + 0.004);
    d.scale.set(1, 1.25, 0.45);
    pivot.add(d);
    g.add(pivot);
  }
  g.scale.setScalar(1.12);
  return { object: g, tiltX: 0.06 };
}

/**
 * Тело, сечение которого — скруглённый прямоугольник (суперэллипс) с полуосями a и b, меняющимися по высоте.
 * UV: u — по длине обвода (0 справа, 0.25 спереди), v — из колец.
 */
function loftGeometry(rings, { segments = 96, n = 2.6, capBottom = true, capTop = true } = {}) {
  const S = segments;
  const row = S + 1;
  const pos = [];
  const uv = [];
  const idx = [];
  rings.forEach(({ y, a, b, v }) => {
    const pts = [];
    for (let k = 0; k <= S; k += 1) {
      const t = (k / S) * Math.PI * 2;
      const c = Math.cos(t);
      const s = Math.sin(t);
      pts.push([a * Math.sign(c) * Math.abs(c) ** (2 / n), b * Math.sign(s) * Math.abs(s) ** (2 / n)]);
    }
    const len = [0];
    for (let k = 1; k <= S; k += 1) len.push(len[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    pts.forEach(([x, z], k) => {
      pos.push(x, y, z);
      uv.push(len[k] / len[S], v);
    });
  });
  for (let i = 0; i < rings.length - 1; i += 1) {
    for (let k = 0; k < S; k += 1) {
      const p = i * row + k;
      const q = p + row;
      idx.push(p, q, p + 1, q, q + 1, p + 1);
    }
  }
  const cap = (ring, up) => {
    const c = pos.length / 3;
    pos.push(0, rings[ring].y, 0);
    uv.push(0.5, up ? 1 : 0);
    for (let k = 0; k < S; k += 1) {
      const p = ring * row + k;
      if (up) idx.push(c, p + 1, p);
      else idx.push(c, p, p + 1);
    }
  };
  if (capBottom) cap(0, false);
  if (capTop) cap(rings.length - 1, true);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  // шов развёртки: у первой и последней точки кольца одна нормаль, иначе виден рубец
  const nrm = geo.attributes.normal;
  for (let i = 0; i < rings.length; i += 1) {
    const p = i * row;
    const q = p + S;
    const nx = nrm.getX(p) + nrm.getX(q);
    const ny = nrm.getY(p) + nrm.getY(q);
    const nz = nrm.getZ(p) + nrm.getZ(q);
    const l = Math.hypot(nx, ny, nz) || 1;
    nrm.setXYZ(p, nx / l, ny / l, nz / l);
    nrm.setXYZ(q, nx / l, ny / l, nz / l);
  }
  return geo;
}

/**
 * Профессиональная беспроводная машинка: эргономичный корпус со скруглённым прямоугольным сечением,
 * рифлёная вставка, широкий стальной нож на винтах и золотистый подвижный нож, чёрный блок ножей,
 * рычаг регулировки сбоку, ползунок питания и индикатор заряда.
 */
function buildClipper() {
  const H = 1.42;
  const ss = (x) => {
    const t = clamp(x, 0, 1);
    return t * t * (3 - 2 * t);
  };
  // корпус расширяется к ножевому блоку, на уровне ладони — лёгкая талия
  const dims = (y) => {
    const grow = ss((y - 0.45) / 0.95);
    const waist = Math.exp(-(((y - 0.5) / 0.2) ** 2));
    return [0.21 + 0.064 * grow - 0.008 * waist, 0.162 + 0.022 * grow - 0.005 * waist];
  };
  const rb = 0.05;
  const rt = 0.09;
  const ys = [];
  for (let k = 0; k <= 8; k += 1) ys.push(rb * (1 - Math.cos(((k / 8) * Math.PI) / 2)));
  for (let y = rb + 0.04; y < H - rt; y += 0.04) ys.push(y);
  for (let k = 0; k <= 10; k += 1) ys.push(H - rt + rt * Math.sin(((k / 10) * Math.PI) / 2));
  const bodyRings = ys.map((y) => {
    const [a, b] = dims(y);
    let inset = 0;
    if (y < rb) inset = rb - Math.sqrt(Math.max(0, rb * rb - (rb - y) ** 2));
    if (y > H - rt) inset = rt - Math.sqrt(Math.max(0, rt * rt - (y - (H - rt)) ** 2));
    return { y, a: a - inset, b: b - inset, v: y / H };
  });
  const band = (y0, y1, steps, off) =>
    Array.from({ length: steps + 1 }, (_, k) => {
      const y = y0 + ((y1 - y0) * k) / steps;
      const [a, b] = dims(y);
      return { y, a: a + off, b: b + off, v: k / steps };
    });
  const trim = (y0) =>
    [
      [-0.014, 0.002],
      [-0.011, 0.011],
      [0.011, 0.011],
      [0.014, 0.002],
    ].map(([dy, off], k) => {
      const [a, b] = dims(y0 + dy);
      return { y: y0 + dy, a: a + off, b: b + off, v: k / 3 };
    });

  // графитовый корпус: шлифовка, разъём половинок по бокам и логотип на лицевой стороне
  const bodyTex = labelTexture(2048, 1024, (ctx, w, h) => {
    ctx.fillStyle = "#2A3330";
    ctx.fillRect(0, 0, w, h);
    const rnd = mulberry32(17);
    for (let i = 0; i < 2600; i += 1) {
      ctx.fillStyle = `rgba(255,255,255,${0.01 + rnd() * 0.02})`;
      ctx.fillRect(rnd() * w, rnd() * h, 1, 6 + rnd() * 30);
    }
    ctx.fillStyle = "rgba(8,12,10,0.9)";
    [0, w / 2, w].forEach((x) => ctx.fillRect(x - 2, 0, 4, h));
    // u растёт справа налево, поэтому надпись зеркалим; по горизонтали развёртка плотнее — растягиваем
    ctx.save();
    ctx.translate(w * 0.25, h * (1 - 1.2 / H));
    ctx.scale(-2.2, 1);
    ctx.fillStyle = "#CDB48C";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "600 30px Manrope, 'Segoe UI', sans-serif";
    ctx.letterSpacing = "7px";
    ctx.fillText("ONIX", 0, 0);
    ctx.font = "600 12px Manrope, 'Segoe UI', sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillStyle = "rgba(205,180,140,0.7)";
    ctx.fillText("PRO · CORDLESS", 0, 30);
    ctx.restore();
  });
  // рифление: объёмные ромбики, освещённые сверху слева
  const knurl = canvasTexture(256, 256, (ctx, w, h) => {
    const s = 32;
    ctx.fillStyle = "#8a7150";
    ctx.fillRect(0, 0, w, h);
    for (let r = -2; r <= h / (s / 2) + 2; r += 1) {
      const y = (r * s) / 2;
      for (let x = -s; x <= w + s; x += s) {
        const cx = x + (Math.abs(r) % 2 ? s / 2 : 0);
        const g = ctx.createLinearGradient(cx - s / 2, y - s / 2, cx + s / 2, y + s / 2);
        g.addColorStop(0, "#f3e3c3");
        g.addColorStop(0.5, "#cdb48c");
        g.addColorStop(1, "#6f5838");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(cx, y - s / 2 + 2);
        ctx.lineTo(cx + s / 2 - 2, y);
        ctx.lineTo(cx, y + s / 2 - 2);
        ctx.lineTo(cx - s / 2 + 2, y);
        ctx.closePath();
        ctx.fill();
      }
    }
  });
  knurl.wrapS = THREE.RepeatWrapping;
  knurl.wrapT = THREE.RepeatWrapping;
  knurl.repeat.set(5, 2);

  const shell = new THREE.MeshPhysicalMaterial({ map: bodyTex, metalness: 0.3, roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.28 });
  const grip = new THREE.MeshStandardMaterial({ map: knurl, bumpMap: knurl, bumpScale: 0.004, metalness: 0.9, roughness: 0.36 });
  const champagne = new THREE.MeshStandardMaterial({ color: srgb(0xd8bf94), metalness: 1, roughness: 0.2 });
  const plastic = new THREE.MeshStandardMaterial({ color: srgb(0x1a1f1d), roughness: 0.55 });
  const steel = new THREE.MeshStandardMaterial({ color: srgb(0xc9cfcc), metalness: 1, roughness: 0.2 });
  const mirror = new THREE.MeshStandardMaterial({ color: srgb(0xf6f8f7), metalness: 1, roughness: 0.04 });
  const satin = new THREE.MeshStandardMaterial({ color: srgb(0x9aa29e), metalness: 1, roughness: 0.38 });
  const gold = new THREE.MeshStandardMaterial({ color: srgb(0xd9b26f), metalness: 1, roughness: 0.22 });
  const dark = new THREE.MeshStandardMaterial({ color: srgb(0x111513), roughness: 0.5 });

  const g = new THREE.Group();
  g.add(new THREE.Mesh(loftGeometry(bodyRings), shell));
  g.add(new THREE.Mesh(loftGeometry(band(0.14, 0.66, 26, 0.004), { capBottom: false, capTop: false }), grip));
  [0.07, 0.14, 0.66].forEach((y) => g.add(new THREE.Mesh(loftGeometry(trim(y), { capBottom: false, capTop: false }), champagne)));

  // ползунок питания и индикатор заряда на лицевой стороне
  const front = (y) => dims(y)[1];
  const pill = (w, h, depth) => {
    const s = new THREE.Shape();
    const r = w / 2;
    s.moveTo(-r, -h / 2 + r);
    s.absarc(0, -h / 2 + r, r, Math.PI, Math.PI * 2, false);
    s.lineTo(r, h / 2 - r);
    s.absarc(0, h / 2 - r, r, 0, Math.PI, false);
    s.lineTo(-r, -h / 2 + r);
    return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2, curveSegments: 16 });
  };
  const slot = new THREE.Mesh(pill(0.074, 0.17, 0.008), dark);
  slot.position.set(0, 0.97, front(0.97) - 0.004);
  const slider = new THREE.Mesh(pill(0.05, 0.078, 0.014), champagne);
  slider.position.set(0, 1.01, front(1.01) - 0.002);
  g.add(slot, slider);
  [-0.036, -0.012, 0.012, 0.036].forEach((x, i) => {
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 8), new THREE.MeshBasicMaterial({ color: srgb(i < 3 ? 0x8be3b9 : 0x3a4440) }));
    led.position.set(x, 0.79, front(0.79) + 0.001);
    led.scale.z = 0.5;
    g.add(led);
  });

  // чёрный блок ножей: профиль сбоку, вытянутый по ширине
  const bp = new THREE.Shape();
  bp.moveTo(-0.15, 1.3);
  bp.lineTo(0.15, 1.3);
  bp.lineTo(0.17, 1.33);
  bp.lineTo(0.12, 1.53);
  bp.quadraticCurveTo(0.05, 1.56, -0.03, 1.5);
  bp.quadraticCurveTo(-0.11, 1.44, -0.13, 1.36);
  bp.lineTo(-0.15, 1.3);
  const bracketGeo = new THREE.ExtrudeGeometry(bp, {
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.025,
    bevelSegments: 4,
    curveSegments: 16,
  });
  bracketGeo.translate(0, 0, -0.2);
  bracketGeo.rotateY(-Math.PI / 2);
  g.add(new THREE.Mesh(bracketGeo, plastic));

  // ножи: неподвижный стальной с частыми зубьями и подвижный золотистый за ним
  const blade = ({ base, top, h, teeth, toothH, flare }) => {
    const s = new THREE.Shape();
    const r = 0.035;
    s.moveTo(-base / 2 + r, 0);
    s.lineTo(base / 2 - r, 0);
    s.quadraticCurveTo(base / 2, 0, base / 2 + 0.005, r);
    s.quadraticCurveTo(top / 2, flare, top / 2, h - 0.03);
    s.lineTo(top / 2, h);
    const p = top / teeth;
    for (let k = teeth - 1; k >= 0; k -= 1) {
      const x0 = -top / 2 + k * p;
      s.lineTo(x0 + p * 0.88, h);
      s.lineTo(x0 + p * 0.7, h + toothH * 0.92);
      s.quadraticCurveTo(x0 + p * 0.5, h + toothH * 1.04, x0 + p * 0.3, h + toothH * 0.92);
      s.lineTo(x0 + p * 0.12, h);
    }
    s.lineTo(-top / 2, h - 0.03);
    s.quadraticCurveTo(-top / 2, flare, -base / 2 - 0.005, r);
    s.quadraticCurveTo(-base / 2, 0, -base / 2 + r, 0);
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.016,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.0015,
      bevelSegments: 1,
      curveSegments: 12,
    });
    geo.translate(0, 0, -0.008);
    return geo;
  };
  const bladeSet = new THREE.Group();
  const fixed = new THREE.Mesh(blade({ base: 0.42, top: 0.56, h: 0.2, teeth: 30, toothH: 0.066, flare: 0.1 }), steel);
  const moving = new THREE.Mesh(blade({ base: 0.36, top: 0.47, h: 0.19, teeth: 26, toothH: 0.052, flare: 0.1 }), gold);
  moving.position.set(0, 0.002, -0.016);
  // полированная фаска заточки вдоль основания зубьев
  const grind = new THREE.Mesh(new THREE.PlaneGeometry(0.556, 0.022), mirror);
  grind.position.set(0, 0.188, 0.0106);
  bladeSet.add(fixed, moving, grind);
  [
    [-0.13, 0.4],
    [0.13, 1.2],
  ].forEach(([x, turn]) => {
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.026, 0.01, 32), satin);
    head.rotation.x = Math.PI / 2;
    head.position.set(x, 0.075, 0.014);
    const cut = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.008, 0.006), dark);
    cut.position.set(x, 0.075, 0.018);
    cut.rotation.z = turn;
    bladeSet.add(head, cut);
  });
  bladeSet.position.set(0, 1.315, 0.21);
  bladeSet.rotation.x = -0.245;
  g.add(bladeSet);

  // рычаг регулировки ножа на левом боку
  const lever = new THREE.Group();
  // ось рычага выходит из блока ножей, сам рычаг идёт вдоль бока снаружи корпуса
  const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.075, 32), champagne);
  pivot.rotation.z = Math.PI / 2;
  pivot.position.x = 0.035;
  const arm = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -0.09, -0.035),
        new THREE.Vector3(0, -0.19, -0.065),
        new THREE.Vector3(0, -0.26, -0.068),
      ]),
      32,
      0.016,
      12,
      false,
    ),
    champagne,
  );
  arm.scale.x = 0.6;
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.032, 24, 16), champagne);
  knob.position.set(0, -0.27, -0.068);
  knob.scale.x = 0.7;
  lever.add(pivot, arm, knob);
  lever.position.set(-0.292, 1.43, 0.04);
  g.add(lever);

  const body = new THREE.Group();
  body.add(g);
  body.rotation.z = 0.06;
  body.scale.setScalar(1.15);
  return { object: body, tiltX: 0.06 };
}

/** Горячее полотенце: махровый рулон со спиралью на торцах, полосы по краям и пар. */
function buildTowel() {
  const terry = (stripes) =>
    canvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = "#F3F0E9";
      ctx.fillRect(0, 0, w, h);
      const rnd = mulberry32(stripes ? 8 : 9);
      for (let i = 0; i < 9000; i += 1) {
        const v = rnd();
        ctx.fillStyle = v < 0.5 ? `rgba(160,150,132,${0.12 + rnd() * 0.18})` : `rgba(255,255,255,${0.4 + rnd() * 0.5})`;
        ctx.beginPath();
        ctx.arc(rnd() * w, rnd() * h, 0.8 + rnd() * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (stripes) {
        // две тонкие шалфейные полосы у каждого края рулона
        ctx.fillStyle = "rgba(111,149,131,0.85)";
        [0.075, 0.115, 0.885, 0.925].forEach((y) => ctx.fillRect(0, y * h - 5, w, 10));
      }
    });
  const sideTex = terry(true);
  sideTex.wrapS = THREE.RepeatWrapping;
  const capTex = terry(false);
  capTex.wrapS = THREE.RepeatWrapping;
  capTex.wrapT = THREE.RepeatWrapping;
  capTex.repeat.set(2, 2);
  const L = 1.4;
  // UV боковых стенок у ExtrudeGeometry: v = 1 − z, растягиваем текстуру на всю ширину рулона
  sideTex.repeat.set(2, 1 / (L + 0.1));
  sideTex.offset.set(0, (L - 1 + 0.05) / (L + 0.1));
  const side = new THREE.MeshStandardMaterial({ map: sideTex, color: srgb(0xe2ddd3), bumpMap: sideTex, bumpScale: 0.022, roughness: 1 });
  const cap = new THREE.MeshStandardMaterial({ map: capTex, color: srgb(0xe2ddd3), bumpMap: capTex, bumpScale: 0.022, roughness: 1 });

  // спираль: средняя линия r = r0 + aθ, толщина полотна t, концы скруглены
  const turns = 3.1;
  const Rout = 0.46;
  const r0 = 0.07;
  const a = (Rout - r0) / (Math.PI * 2 * turns);
  const t = Math.PI * 2 * a * 0.66;
  const Th = Math.PI * 2 * turns;
  const at = (th, off) => {
    const r = r0 + a * th + off;
    return [r * Math.cos(th), r * Math.sin(th)];
  };
  const steps = Math.round(turns * 96);
  const s = new THREE.Shape();
  const start = at(0, t / 2);
  s.moveTo(start[0], start[1]);
  for (let k = 1; k <= steps; k += 1) s.lineTo(...at((Th * k) / steps, t / 2));
  const endCap = (th, from, to) => {
    const c = at(th, 0);
    const radial = [Math.cos(th), Math.sin(th)];
    const tangent = [-Math.sin(th), Math.cos(th)];
    for (let k = 1; k < 12; k += 1) {
      const f = from + ((to - from) * k) / 12;
      s.lineTo(c[0] + (t / 2) * (Math.cos(f) * radial[0] + Math.sin(f) * tangent[0]), c[1] + (t / 2) * (Math.cos(f) * radial[1] + Math.sin(f) * tangent[1]));
    }
  };
  endCap(Th, 0, Math.PI);
  for (let k = steps; k >= 0; k -= 1) s.lineTo(...at((Th * k) / steps, -t / 2));
  endCap(0, Math.PI, Math.PI * 2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: L, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.014, bevelSegments: 4, curveSegments: 4 });
  geo.translate(0, 0, -L / 2);
  const roll = new THREE.Mesh(geo, [cap, side]);
  roll.rotation.y = Math.PI / 2;
  const g = new THREE.Group();
  const lift = new THREE.Group();
  lift.add(roll);
  lift.position.y = Rout + 0.02;
  lift.rotation.z = 0.04;
  g.add(lift);
  g.scale.setScalar(1.05);

  // пар: мягкие клубы, которые поднимаются и тают
  // пар: мягкие изогнутые струйки, собранные из размытых точек вдоль синусоиды
  const wisp = (phase) =>
    canvasTexture(128, 256, (ctx, w, h) => {
      for (let k = 0; k <= 60; k += 1) {
        const f = k / 60;
        const x = w / 2 + Math.sin(f * Math.PI * 2.2 + phase) * w * 0.16;
        const y = h * (0.94 - f * 0.88);
        const r = w * (0.07 + f * 0.1);
        const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, "rgba(150,170,161,0.11)");
        gr.addColorStop(1, "rgba(150,170,161,0)");
        ctx.fillStyle = gr;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    });
  const wisps = [wisp(0), wisp(2.1), wisp(4.2)];
  const steam = new THREE.Group();
  const puffs = Array.from({ length: 5 }, (_, i) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: wisps[i % 3], transparent: true, depthWrite: false, opacity: 0 }));
    steam.add(sp);
    return { sp, phase: i / 5, x: [-0.3, 0.12, -0.08, 0.32, -0.42][i] };
  });
  const update = (time) => {
    puffs.forEach((p) => {
      const k = (time * 0.16 + p.phase) % 1;
      p.sp.position.set(p.x + Math.sin(time * 0.8 + p.phase * 9) * 0.06, 1.12 + k * 0.32, 0.1);
      p.sp.scale.set(0.36 + k * 0.16, 0.66 + k * 0.26, 1);
      p.sp.material.opacity = Math.sin(Math.PI * k) ** 1.4 * 0.5;
    });
  };
  return { object: g, tiltX: 0.12, fixed: steam, update };
}

/** Глина для укладки: керамическая банка, приоткрытая медная крышка с гравировкой и фактура средства. */
function buildJar() {
  const ceramic = new THREE.MeshPhysicalMaterial({ color: srgb(0x3e6556), roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 });
  const copper = new THREE.MeshStandardMaterial({ color: srgb(0xc58052), metalness: 1, roughness: 0.3 });
  const clayMat = new THREE.MeshStandardMaterial({ color: srgb(0xd8cdbf), roughness: 0.92 });
  const engraving = labelTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#c58052";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(70,36,16,0.55)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(70,36,16,0.7)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "italic 500 132px Lora, Georgia, serif";
    ctx.fillText("Onix", w / 2, h / 2 - 18);
    ctx.font = "600 30px Manrope, 'Segoe UI', sans-serif";
    ctx.letterSpacing = "8px";
    ctx.fillText("MATTE CLAY", w / 2, h / 2 + 82);
  });

  const jar = new THREE.Group();
  jar.add(
    new THREE.Mesh(
      lathe(
        [
          [0, 0],
          [0.44, 0],
          [0.49, 0.02],
          [0.5, 0.06],
          [0.5, 0.25],
          [0.5, 0.42],
          [0.488, 0.46],
          [0.462, 0.472],
          [0.462, 0.53],
          [0.452, 0.546],
          [0.432, 0.546],
          [0.432, 0.5],
          [0.432, 0.47],
        ],
        128,
      ),
      ceramic,
    ),
  );
  // поверхность глины с завитком от пальца
  const clayGeo = new THREE.RingGeometry(0.001, 0.432, 96, 24);
  const pos = clayGeo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const r = Math.hypot(x, y);
    const th = Math.atan2(y, x);
    const edge = 1 - (r / 0.432) ** 6;
    const swirl = 0.5 + 0.5 * Math.cos(2 * th - r * 16);
    const scoop = Math.exp(-((x - 0.1) ** 2 + (y + 0.06) ** 2) / 0.02);
    pos.setZ(i, edge * (0.03 * swirl - 0.05 * scoop));
  }
  clayGeo.computeVertexNormals();
  const clay = new THREE.Mesh(clayGeo, clayMat);
  clay.rotation.x = -Math.PI / 2;
  clay.position.y = 0.49;
  jar.add(clay);

  const lid = new THREE.Group();
  lid.add(
    new THREE.Mesh(
      lathe(
        [
          [0, 0.02],
          [0.44, 0.02],
          [0.462, 0.0],
          [0.512, 0.0],
          [0.522, 0.02],
          [0.524, 0.07],
          [0.524, 0.13],
          [0.51, 0.155],
          [0.485, 0.162],
          [0, 0.162],
        ],
        128,
      ),
      copper,
    ),
  );
  const plate = new THREE.Mesh(new THREE.CircleGeometry(0.44, 96), new THREE.MeshStandardMaterial({ map: engraving, metalness: 0.5, roughness: 0.42 }));
  plate.rotation.x = -Math.PI / 2;
  plate.position.y = 0.164;
  lid.add(plate);
  // светлый вкладыш с изнанки крышки
  const liner = new THREE.Mesh(new THREE.CircleGeometry(0.44, 96), new THREE.MeshStandardMaterial({ color: srgb(0xebe4d8), roughness: 0.7 }));
  liner.rotation.x = Math.PI / 2;
  liner.position.y = 0.017;
  lid.add(liner);
  // крышка не вращается вместе с банкой: она всегда повёрнута гравировкой к зрителю и медленно крутится вокруг своей оси
  const tiltLid = new THREE.Group();
  tiltLid.add(lid);
  tiltLid.rotation.set(0.62, 0, -0.14);
  tiltLid.position.set(0.06, 0.94, 0);
  const lidFixed = new THREE.Group();
  lidFixed.add(tiltLid);
  lidFixed.scale.setScalar(1.18);

  const g = new THREE.Group();
  g.add(jar);
  g.scale.setScalar(1.18);
  const update = (time) => {
    tiltLid.position.y = 0.94 + Math.sin(time * 1.3) * 0.035;
    lid.rotation.y = time * 0.35;
  };
  return { object: g, tiltX: 0.18, fixed: lidFixed, update };
}

const RITUAL_PROPS = [buildMirror, buildBottle, buildClipper, buildTowel, buildJar];

/* ───────────────────────────── Ритуал (GSAP pin) ────────────────── */

const RITUAL_TOTAL = RITUAL.reduce((sum, r) => sum + r.min, 0);
const RITUAL_START = RITUAL.map((_, i) => RITUAL.slice(0, i).reduce((sum, r) => sum + r.min, 0));
const hmm = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;

/**
 * Один WebGL-рендерер на все карточки ритуала: сцена рисуется по очереди для каждой видимой карточки
 * и копируется в её собственный 2D-холст. Так карточки свободно крутятся GSAP-ом в 3D, а контекст WebGL один.
 */
function useRitualStage(canvases, reduced) {
  const [webgl, setWebgl] = useState(true);
  const tilt = useRef(RITUAL.map(() => ({ x: 0, y: 0, tx: 0, ty: 0 })));

  useEffect(() => {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setWebgl(false);
      return undefined;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    scene.environment = studioEnvironment(renderer);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c6, 0.4));
    const key = new THREE.DirectionalLight(0xfff6ea, 1.05);
    key.position.set(3, 5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xdfeee6, 0.6);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    const pedestal = buildPedestal();
    const TOP = -1.02;
    pedestal.object.position.y = TOP;
    scene.add(pedestal.object);
    const contact = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.5),
      new THREE.MeshBasicMaterial({ map: softSpot(0.5), transparent: true, depthWrite: false }),
    );
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = TOP + 0.003;
    scene.add(contact);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 1.5),
      new THREE.MeshBasicMaterial({ map: softSpot(0.34), transparent: true, depthWrite: false }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = TOP - pedestal.height - 0.004;
    scene.add(ground);

    const BASE = TOP + 0.2;
    const props = RITUAL_PROPS.map((build) => {
      const p = build();
      const spin = new THREE.Group();
      spin.rotation.order = "YXZ";
      spin.add(p.object);
      spin.position.y = BASE;
      scene.add(spin);
      if (p.fixed) {
        p.fixed.position.y = BASE;
        scene.add(p.fixed);
      }
      return { ...p, spin };
    });
    const only = (i) =>
      props.forEach((p, j) => {
        p.spin.visible = j === i;
        if (p.fixed) p.fixed.visible = j === i;
      });

    const camera = new THREE.PerspectiveCamera(24, 1.4, 0.1, 60);
    const fit = (aspect) => {
      const half = Math.tan(deg(camera.fov / 2));
      const dist = Math.max(1.34 / half, 1.15 / (half * aspect)) + 0.3;
      camera.aspect = aspect;
      camera.position.set(0, -0.2 + dist * Math.sin(deg(9)), dist * Math.cos(deg(9)));
      camera.lookAt(0, -0.24, 0);
      camera.updateProjectionMatrix();
    };
    fit(1.4);
    // шейдеры всех предметов компилируем сразу, чтобы первая карточка не дёрнулась
    props.forEach((p) => {
      p.spin.visible = true;
      if (p.fixed) p.fixed.visible = true;
    });
    renderer.compile(scene, camera);

    const visible = new Set();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const i = Number(e.target.dataset.prop);
          if (e.isIntersecting) visible.add(i);
          else visible.delete(i);
        }),
      { rootMargin: "120px" },
    );
    const contexts = [];
    canvases.current.forEach((c, i) => {
      if (!c) return;
      contexts[i] = c.getContext("2d");
      io.observe(c);
    });

    let size = { w: 0, h: 0 };
    let raf = 0;
    let t = 0;
    const clock = new THREE.Clock();
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible.size) return;
      if (!reduced) t += dt;
      const wide = window.innerWidth >= 1024;
      visible.forEach((i) => {
        const c = canvases.current[i];
        const ctx = contexts[i];
        if (!c || !ctx) return;
        const w = c.clientWidth;
        const h = c.clientHeight;
        if (!w || !h) return;
        const pw = Math.round(w * dpr);
        const ph = Math.round(h * dpr);
        if (c.width !== pw || c.height !== ph) {
          c.width = pw;
          c.height = ph;
        }
        if (size.w !== w || size.h !== h) {
          renderer.setSize(w, h, false);
          size = { w, h };
        }
        fit(w / h);
        // предмет доворачивается, пока карточка проезжает по экрану
        const r = c.getBoundingClientRect();
        const off = reduced ? 0 : wide ? (r.left + r.width / 2) / window.innerWidth - 0.5 : (r.top + r.height / 2) / window.innerHeight - 0.5;
        const tl = tilt.current[i];
        tl.x += (tl.tx - tl.x) * 0.06;
        tl.y += (tl.ty - tl.y) * 0.06;
        const p = props[i];
        only(i);
        p.spin.rotation.y = (reduced ? 0.55 : 0.25) + t * 0.42 + off * 1.6 + tl.y;
        p.spin.rotation.x = p.tiltX + tl.x;
        const bob = reduced ? 0 : Math.sin(t * 1.15 + i) * 0.045;
        p.spin.position.y = BASE + bob;
        p.update?.(t);
        contact.scale.setScalar(1 - bob * 1.4);
        contact.material.opacity = 0.9 - bob * 4;
        renderer.render(scene, camera);
        ctx.clearRect(0, 0, pw, ph);
        ctx.drawImage(renderer.domElement, 0, 0, pw, ph);
      });
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((m) => {
          ["map", "emissiveMap", "bumpMap"].forEach((k) => m[k]?.dispose());
          m.dispose();
        });
      });
      scene.environment?.dispose();
      renderer.dispose();
    };
  }, [canvases, reduced]);

  const pointer = useCallback((i, px, py) => {
    const tl = tilt.current[i];
    tl.tx = py * 0.3;
    tl.ty = px * 0.7;
  }, []);

  return { webgl, pointer };
}

function RitualTimeline({ index }) {
  const step = RITUAL[index];
  const start = RITUAL_START[index];
  return (
    <div className="mt-6">
      <div className="flex h-[3px] gap-[3px]" aria-hidden="true">
        {RITUAL.map((r, j) => (
          <span
            key={r.n}
            className={`h-full rounded-full ${j === index ? "bg-[#4F7A68]" : j < index ? "bg-[#4F7A68]/30" : "bg-[#26332D]/10"}`}
            style={{ flexGrow: r.min, flexBasis: 0 }}
          />
        ))}
      </div>
      <div className="f-label mt-3 flex items-center justify-between text-[10.5px] uppercase tracking-[0.14em] text-[#26332D]/50">
        <span className="tabular-nums">
          {hmm(start)} — {hmm(start + step.min)}
        </span>
        <span>из {RITUAL_TOTAL} минут</span>
      </div>
    </div>
  );
}

function Ritual() {
  const section = useRef(null);
  const track = useRef(null);
  const canvases = useRef([]);
  const reduced = useReducedMotion();
  const { webgl, pointer } = useRitualStage(canvases, reduced);

  useIsoLayoutEffect(() => {
    if (reduced) return undefined;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const distance = () => Math.max(0, track.current.scrollWidth - window.innerWidth);
      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      const cards = gsap.utils.toArray(".rt-card", track.current);
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { rotateY: -38, z: -160, opacity: 0.35, transformPerspective: 1200, transformOrigin: "0% 50%" },
          {
            rotateY: 0,
            z: 0,
            opacity: 1,
            ease: "none",
            // последняя карточка до центра не доезжает — она доворачивается, пока её правый край входит в экран
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left right",
              end: i === cards.length - 1 ? "right 94%" : "center 60%",
              scrub: true,
            },
          },
        );
        gsap.fromTo(
          card.querySelector(".rt-num"),
          { xPercent: 30 },
          { xPercent: -25, ease: "none", scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true } },
        );
      });
      gsap.fromTo(
        ".rt-progress",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top top", end: () => `+=${distance()}`, scrub: true, invalidateOnRefresh: true },
        },
      );
    });
    mm.add("(max-width: 1023px)", () => {
      gsap.utils.toArray(".rt-card", track.current).forEach((card) => {
        gsap.fromTo(
          card,
          { rotateX: 32, y: 60, opacity: 0.3, transformPerspective: 900, transformOrigin: "50% 0%" },
          { rotateX: 0, y: 0, opacity: 1, ease: "power2.out", scrollTrigger: { trigger: card, start: "top 95%", end: "top 60%", scrub: 0.6 } },
        );
      });
    });
    return () => mm.revert();
  }, [reduced]);

  return (
    <div>
      <section id="ritual" ref={section} className="relative scroll-mt-20 overflow-hidden py-24 lg:flex lg:h-screen lg:items-center lg:py-0">
        <div className="absolute inset-x-0 top-0 hidden h-px bg-[#26332D]/10 lg:block">
          <div className="rt-progress h-px origin-left bg-[#4F7A68]" />
        </div>
        <div ref={track} className="flex flex-col gap-5 px-4 sm:px-8 lg:w-max lg:flex-row lg:items-stretch lg:gap-6 lg:px-12">
          <div className="flex flex-col justify-center pb-8 lg:w-[36vw] lg:max-w-[560px] lg:pb-0 lg:pr-10">
            <p className="f-label text-[12px] uppercase tracking-[0.14em] text-[#4F7A68]">
              <span className="mr-2.5 inline-block h-1.5 w-1.5 rounded-full bg-[#4F7A68] align-middle" aria-hidden="true" />
              Стрижка «Onix» · {RITUAL_TOTAL} минут
            </p>
            <h2 aria-label="Ритуал визита" className="f-display mt-5 text-[clamp(2.8rem,9vw,6.2rem)] font-medium leading-[0.98] tracking-[-0.01em]">
              <SplitLetters text="Ритуал" trigger="view" />{" "}
              <span className="italic text-[#4F7A68]">
                <SplitLetters text="визита" trigger="view" delay={0.18} />
              </span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[#26332D]/70">
              Пять этапов, которые проходит каждый гость. Порядок не меняется, меняется только то, что мастер делает с вашими волосами.
            </p>
            <p className="f-label mt-8 hidden items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55 lg:flex">
              Листайте вниз
              <ArrowDown size={12} className="-rotate-90" />
            </p>
          </div>
          {RITUAL.map((step, i) => {
            const Icon = step.icon;
            return (
              <article
                key={step.n}
                className="rt-card relative flex flex-col overflow-hidden rounded-[28px] border border-white/80 bg-[#FAFBF8]/85 p-6 shadow-[0_30px_60px_-40px_rgba(38,51,45,0.35)] backdrop-blur-xl sm:p-8 lg:h-[74vh] lg:max-h-[680px] lg:w-[min(30vw,460px)]"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <span className="f-label text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55">
                    Этап {step.n}
                    <span className="text-[#26332D]/30"> / 0{RITUAL.length}</span>
                  </span>
                  <span className="f-label inline-flex items-center gap-1.5 rounded-full border border-[#26332D]/10 bg-white/70 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-[#4F7A68]">
                    <Clock size={12} strokeWidth={1.8} aria-hidden="true" />
                    {step.min} мин
                  </span>
                </div>
                <div
                  className="relative -mx-6 h-[260px] shrink-0 sm:-mx-8 sm:h-[300px] lg:h-auto lg:min-h-[220px] lg:flex-1"
                  onPointerMove={(e) => {
                    if (e.pointerType !== "mouse") return;
                    const r = e.currentTarget.getBoundingClientRect();
                    pointer(i, (e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
                  }}
                  onPointerLeave={() => pointer(i, 0, 0)}
                >
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-[46%] aspect-square h-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(220,230,223,0.95)_0%,rgba(220,230,223,0.45)_42%,rgba(220,230,223,0)_70%)]"
                  />
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="rt-num f-display -mt-6 text-[9rem] italic leading-none text-[#26332D]/[0.045] sm:text-[12rem]">{step.n}</span>
                  </div>
                  {webgl ? (
                    <canvas
                      ref={(el) => {
                        canvases.current[i] = el;
                      }}
                      data-prop={i}
                      role="img"
                      aria-label={`3D: ${step.prop}`}
                      className="absolute inset-0 block h-full w-full"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="grid h-24 w-24 place-items-center rounded-full bg-[#DCE6DF] text-[#4F7A68]">
                        <Icon size={34} strokeWidth={1.2} />
                      </span>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <h3 className="f-display text-[2rem] font-medium leading-tight sm:text-[2.3rem]">{step.title}</h3>
                  <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-[#26332D]/70">{step.text}</p>
                  <RitualTimeline index={i} />
                </div>
              </article>
            );
          })}
          <div aria-hidden="true" className="hidden w-[6vw] shrink-0 lg:block" />
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────────── Мастера ──────────────────────────── */

function MasterCard({ m, index, onBook }) {
  const [hovered, setHovered] = useState(false);
  const fine = useFinePointer();
  const imageRef = useRef(null);
  // на тач-экранах карточка «оживает», когда доезжает до центра экрана
  const centred = useInView(imageRef, { amount: 0.7 });
  const hover = fine ? hovered : centred;
  return (
    <motion.article
      initial={{ opacity: 0, y: 100, rotateX: -16 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...springSoft, delay: index * 0.1 }}
      style={{ transformPerspective: 1100 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={index % 2 ? "lg:mt-16" : ""}
    >
      <div ref={imageRef} className="relative aspect-[3/4] overflow-hidden rounded-b-[28px] rounded-t-[999px] bg-[#E1E8E2]" data-cursor="view">
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{
            scale: hover ? 1.1 : 1.02,
            rotate: hover ? 2 : 0,
            filter: hover ? "saturate(1.15) brightness(1)" : "saturate(0.7) brightness(1.03)",
          }}
          transition={{ type: "spring", stiffness: 55, damping: 18 }}
        >
          {m.photo ? <img src={m.photo} alt={m.name} className="h-full w-full object-cover" /> : <SoftPortrait seed={index} />}
        </motion.div>
        {m.photo ? null : (
          <div aria-hidden="true" className="absolute inset-x-0 top-[44%] flex h-0 items-center justify-center">
            <motion.span
              className="f-display text-[clamp(2.6rem,6vw,4rem)] font-medium italic leading-none"
              animate={{ scale: hover ? 0.88 : 1, color: hover ? "#6E9A86" : "#26332D" }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
            >
              {m.mark}
            </motion.span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#EEF1EC] via-[#EEF1EC]/10 to-transparent" />

        <motion.p
          className="f-display absolute inset-x-0 bottom-0 p-6 text-xl italic leading-snug text-[#26332D]"
          initial={false}
          animate={{ y: hover ? "0%" : "105%", opacity: hover ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          «{m.quote}»
        </motion.p>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="f-display text-[1.75rem] font-medium leading-tight">{m.name}</h3>
          <p className="f-label mt-2 text-[11px] uppercase tracking-[0.14em] text-[#4F7A68]">{m.role}</p>
          <p className="f-label mt-1 text-[11px] uppercase tracking-[0.1em] text-[#26332D]/55">
            {m.years} лет · {m.tool}
          </p>
        </div>
        <Magnetic strength={0.4}>
          <motion.button
            type="button"
            onClick={() => onBook(m.id)}
            aria-label={`Записаться к мастеру: ${m.name}`}
            whileHover={{ backgroundColor: "#4F7A68", color: "#FAFBF8", rotate: 45 }}
            whileTap={{ scale: 0.9 }}
            transition={springSnappy}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#4F7A68]/60 text-[#4F7A68]"
          >
            <ArrowUpRight size={18} strokeWidth={1.5} />
          </motion.button>
        </Magnetic>
      </div>
    </motion.article>
  );
}

function Masters({ onBook }) {
  return (
    <section id="masters" className="relative scroll-mt-20 py-24 sm:py-32">
      <Container>
        <SectionHead
          eyebrow="Четыре мастера"
          title="Мастера"
          italic="своего дела"
          aside="У каждого мастера своё клеймо и свой главный инструмент. Наведите на карточку, чтобы прочитать, как он работает."
        />
        <div className="mt-14 grid gap-x-5 gap-y-12 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
          {MASTERS.map((m, i) => (
            <MasterCard key={m.id} m={m} index={i} onBook={onBook} />
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ───────────────────────────── Запись ───────────────────────────── */

function Chip({ active, onClick, children, group, disabled = false }) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      whileHover={disabled || active ? undefined : { borderColor: "rgba(79,122,104,0.7)", y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={springSnappy}
      className={`f-label relative isolate rounded-full border px-4 py-2 text-[13px] tracking-[0.02em] ${
        active ? "border-[#4F7A68] text-[#FAFBF8]" : "border-[#26332D]/20 text-[#26332D]/80"
      } ${disabled ? "cursor-not-allowed text-[#26332D]/35 line-through" : ""}`}
    >
      {active ? (
        <motion.span
          layoutId={`pill-${group}`}
          className="absolute inset-0 -z-10 rounded-full bg-[#4F7A68]"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      ) : null}
      {children}
    </motion.button>
  );
}

function Field({ step, label, error, children }) {
  return (
    <fieldset className="min-w-0">
      <legend className="f-label mb-3 flex w-full items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55">
        <span className="text-[#4F7A68]">{step}</span>
        {label}
      </legend>
      {children}
      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="f-label mt-2 text-[12px] tracking-[0.06em] text-[#B4432F]"
            role="alert"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </fieldset>
  );
}

function MiniMap() {
  return (
    <svg viewBox="0 0 320 190" className="h-auto w-full" role="img" aria-label="Схема: Onix Barbershop рядом с дворцовым парком и рекой Сож">
      <rect width="320" height="190" fill="#E1E8E2" />
      <path d="M 300 -10 C 276 50 322 100 292 150 S 276 200 294 210" fill="none" stroke="#AFC3CA" strokeWidth="22" />
      <text x="304" y="128" className="f-label" fontSize="7" letterSpacing="1.4" fill="#4F6E79" transform="rotate(-80 304 128)">
        Р. СОЖ
      </text>
      <g stroke="#FFFFFF" strokeWidth="7" fill="none" strokeLinecap="square">
        <path d="M -10 40 L 330 110" />
        <path d="M 60 -10 L 110 200" />
        <path d="M 230 -10 L 205 200" />
      </g>
      <g stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="3.5" fill="none">
        <path d="M -10 150 L 330 175" />
        <path d="M 150 -10 L 160 200" />
      </g>
      <rect x="118" y="100" width="70" height="44" fill="#C7D6C8" stroke="#4F7A68" strokeOpacity="0.3" />
      <g fill="#4F7A68" fillOpacity="0.35">
        {Array.from({ length: 18 }, (_, i) => (
          <circle key={i} cx={127 + (i % 6) * 10.4 + (Math.floor(i / 6) % 2) * 5} cy={110 + Math.floor(i / 6) * 11} r="2.2" />
        ))}
      </g>
      <text x="153" y="158" textAnchor="middle" className="f-label" fontSize="7" letterSpacing="1.4" fill="#26332D" fillOpacity="0.55">
        ДВОРЦОВЫЙ ПАРК
      </text>
      <text x="22" y="36" className="f-label" fontSize="7" letterSpacing="1.4" fill="#26332D" fillOpacity="0.5" transform="rotate(11.6 22 36)">
        РУМЯНЦЕВСКАЯ
      </text>
      <motion.circle
        cx="214"
        cy="86"
        r="6"
        fill="none"
        stroke="#4F7A68"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: [1, 3.4], opacity: [0.8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
      />
      <circle cx="214" cy="86" r="5" fill="#4F7A68" />
      <circle cx="214" cy="86" r="1.8" fill="#FAFBF8" />
      <text x="226" y="74" className="f-label" fontSize="8" letterSpacing="1.4" fill="#4F7A68">
        ONIX · 21
      </text>
    </svg>
  );
}

function ContactRow({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-4 border-t border-[#26332D]/15 py-5">
      <Icon size={18} strokeWidth={1.4} className="mt-0.5 shrink-0 text-[#4F7A68]" />
      <div className="min-w-0 flex-1">
        <p className="f-label text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55">{label}</p>
        <div className="mt-1.5 text-[16px] text-[#26332D]">{children}</div>
      </div>
    </div>
  );
}

function Booking({ sectionRef, service, setService, master, setMaster }) {
  const days = useMemo(buildDays, []);
  const masterKey = Math.max(0, MASTERS.findIndex((m) => m.id === master) + 1);
  const [dayIdx, setDayIdx] = useState(() => (TIMES.every((_, i) => isBusy(0, i, 0)) ? 1 : 0));
  const [time, setTime] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [ticket, setTicket] = useState(null);
  const [copied, setCopied] = useState(false);
  const phoneRef = useRef(null);
  const svc = SERVICES.find((s) => s.id === service) ?? SERVICES[0];
  const slots = useMemo(() => TIMES.map((t, i) => ({ t, busy: isBusy(dayIdx, i, masterKey) })), [dayIdx, masterKey]);

  useEffect(() => {
    if (time && slots.find((s) => s.t === time)?.busy) setTime(null);
  }, [slots, time]);

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(PHONE.replace(/[^\d+]/g, ""));
      setCopied("ok");
    } catch {
      const range = document.createRange();
      range.selectNodeContents(phoneRef.current);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      setCopied("select");
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!time) next.time = "Выберите свободное время";
    if (name.trim().length < 2) next.name = "Укажите имя";
    if (phone.replace(/\D/g, "").length !== 12) next.phone = "Введите номер полностью: +375 и 9 цифр";
    setErrors(next);
    if (Object.keys(next).length) return;
    setTicket({
      no: String(1000 + Math.floor(Math.random() * 9000)),
      svc,
      master: MASTERS.find((m) => m.id === master)?.name ?? "Любой свободный мастер",
      day: days[dayIdx].long,
      time,
      name: name.trim(),
      phone,
    });
  };

  return (
    <section id="booking" ref={sectionRef} className="relative scroll-mt-20 py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute right-[10%] top-[20%] h-[36vmax] w-[36vmax] rounded-full bg-[#4F7A68]/10 blur-[120px]" />
      <Container className="grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal y={30}>
            <p className="f-label text-[12px] uppercase tracking-[0.14em] text-[#4F7A68]">
              <span className="mr-2.5 inline-block h-1.5 w-1.5 rounded-full bg-[#4F7A68] align-middle" aria-hidden="true" />
              Запись и контакты
            </p>
          </Reveal>
          <h2 aria-label="Займите кресло" className="f-display mt-5 text-[clamp(2.8rem,9vw,6.2rem)] font-medium leading-[0.98] tracking-[-0.01em]">
            <SplitLetters text="Займите" trigger="view" />{" "}
            <span className="italic text-[#4F7A68]">
              <SplitLetters text="кресло" trigger="view" delay={0.2} />
            </span>
          </h2>
          <Reveal delay={0.1} y={40}>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[#26332D]/70">
              Выберите услугу, мастера и время. Администратор перезвонит в течение 15 минут, чтобы подтвердить визит.
            </p>
          </Reveal>
          <Reveal delay={0.15} y={50} className="mt-10">
            <ContactRow icon={MapPin} label="Адрес">
              {ADDRESS}
              <span className="f-label mt-1 block text-[12px] uppercase tracking-[0.1em] text-[#26332D]/55">5 минут пешком до дворцового парка</span>
            </ContactRow>
            <ContactRow icon={Clock} label="Часы работы">
              Ежедневно, 10:00–22:00
            </ContactRow>
            <ContactRow icon={Phone} label="Телефон">
              <div className="flex flex-wrap items-center gap-3">
                <span ref={phoneRef} className="select-all tabular-nums">
                  {PHONE}
                </span>
                <motion.button
                  type="button"
                  onClick={copyPhone}
                  whileTap={{ scale: 0.92 }}
                  className="f-label inline-flex items-center gap-1.5 rounded-full border border-[#26332D]/20 px-3 py-1 text-[11px] uppercase tracking-[0.1em] text-[#26332D]/70"
                >
                  {copied === "ok" ? <Check size={12} className="text-[#4F7A68]" /> : <Copy size={12} />}
                  {copied === "ok" ? "Скопировано" : copied === "select" ? "Выделено" : "Копировать"}
                </motion.button>
              </div>
            </ContactRow>
            <ContactRow icon={Send} label="Telegram">
              {TELEGRAM}
            </ContactRow>
            <div className="mt-2 overflow-hidden rounded-[24px] border border-white/80 shadow-[0_20px_50px_-35px_rgba(38,51,45,0.4)]">
              <MiniMap />
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal y={80} delay={0.1}>
            <div
              className="relative rounded-[32px] border border-white/80 bg-[#FAFBF8]/80 p-5 shadow-[0_40px_120px_-50px_rgba(38,51,45,0.35)] backdrop-blur-2xl sm:p-8 lg:p-10"
              style={{ perspective: 1400 }}
            >
              {/* Форма остаётся смонтированной: пилюли с layoutId блокируют exit у AnimatePresence. */}
              <motion.form
                onSubmit={submit}
                noValidate
                className="grid gap-9"
                initial={false}
                animate={ticket ? { opacity: 0, rotateX: -10, y: -24 } : { opacity: 1, rotateX: 0, y: 0 }}
                transition={ticket ? { duration: 0.35, ease: [0.4, 0, 1, 1] } : springSoft}
                aria-hidden={ticket ? true : undefined}
                inert={ticket ? "" : undefined}
              >
                <Field step="01" label="Услуга">
                  <div className="flex flex-wrap gap-2">
                    {SERVICES.map((s) => (
                      <Chip key={s.id} group="svc" active={service === s.id} onClick={() => setService(s.id)}>
                        {s.title}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field step="02" label="Мастер">
                  <div className="flex flex-wrap gap-2">
                    <Chip group="master" active={master === "any"} onClick={() => setMaster("any")}>
                      Любой мастер
                    </Chip>
                    {MASTERS.map((m) => (
                      <Chip key={m.id} group="master" active={master === m.id} onClick={() => setMaster(m.id)}>
                        {m.name}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field step="03" label="День">
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {days.map((d, i) => (
                      <Chip key={d.key} group="day" active={dayIdx === i} onClick={() => setDayIdx(i)}>
                        <span className="block text-[9px] uppercase tracking-[0.16em] opacity-70">{d.label}</span>
                        <span className="f-display block text-2xl font-medium leading-tight">{d.day}</span>
                        <span className="block text-[9px] uppercase tracking-[0.16em] opacity-70">{d.month}</span>
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field step="04" label="Время" error={errors.time}>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {slots.map((s) => (
                      <Chip key={s.t} group="time" active={time === s.t} disabled={s.busy} onClick={() => setTime(s.t)}>
                        <span className="tabular-nums">{s.t}</span>
                      </Chip>
                    ))}
                  </div>
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field step="05" label="Имя" error={errors.name}>
                    <input
                      id="bk-name"
                      name="name"
                      autoComplete="given-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Как к вам обращаться"
                      aria-label="Имя"
                      className="w-full rounded-2xl border border-[#26332D]/15 bg-white/70 px-4 py-3 text-[16px] text-[#26332D] outline-none focus:border-[#4F7A68]"
                    />
                  </Field>
                  <Field step="06" label="Телефон" error={errors.phone}>
                    <input
                      id="bk-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="+375 (__) ___-__-__"
                      aria-label="Телефон"
                      className="w-full rounded-2xl border border-[#26332D]/15 bg-white/70 px-4 py-3 text-[16px] tabular-nums text-[#26332D] outline-none focus:border-[#4F7A68]"
                    />
                  </Field>
                </div>
                <div className="flex flex-col gap-6 border-t border-[#26332D]/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="f-label text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55">Итого</p>
                    <motion.p
                      key={svc.id}
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={springSnappy}
                      className="f-display mt-1 text-5xl font-medium"
                    >
                      {fmtPrice(svc.price)}
                      <span className="f-label ml-3 text-[12px] font-normal uppercase tracking-[0.1em] text-[#26332D]/55">{svc.time} мин</span>
                    </motion.p>
                  </div>
                  <PrimaryButton type="submit">Подтвердить запись</PrimaryButton>
                </div>
              </motion.form>
              <AnimatePresence>
                {ticket ? (
                  <div key="ticket" className="absolute inset-0 flex items-center p-5 sm:p-8 lg:p-10">
                    <Ticket ticket={ticket} onEdit={() => setTicket(null)} />
                  </div>
                ) : null}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function Ticket({ ticket, onEdit }) {
  const rows = [
    ["Услуга", ticket.svc.title],
    ["Мастер", ticket.master],
    ["Дата", ticket.day],
    ["Время", ticket.time],
    ["Гость", ticket.name],
    ["Телефон", ticket.phone],
  ];
  return (
    <motion.div
      initial={{ opacity: 0, rotateX: -70, y: -40 }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      exit={{ opacity: 0, rotateX: 40, y: 30, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }}
      transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.2 }}
      style={{ transformOrigin: "50% 0%" }}
      className="w-full"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="f-label text-[11px] uppercase tracking-[0.14em] text-[#4F7A68]">Запись сформирована</p>
          <h3 className="f-display mt-2 text-5xl font-medium leading-none">Талон № {ticket.no}</h3>
        </div>
        <motion.span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#4F7A68] text-[#FAFBF8]"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.25 }}
        >
          <Check size={24} />
        </motion.span>
      </div>
      <div className="relative my-8 h-px border-t border-dashed border-[#26332D]/25">
        <span className="absolute -left-8 -top-3 h-6 w-6 rounded-full bg-[#EEF1EC] sm:-left-11 lg:-left-[3.25rem]" />
        <span className="absolute -right-8 -top-3 h-6 w-6 rounded-full bg-[#EEF1EC] sm:-right-11 lg:-right-[3.25rem]" />
      </div>
      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {rows.map(([k, v], i) => (
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springSnappy, delay: 0.2 + i * 0.06 }}
            className="min-w-0"
          >
            <dt className="f-label text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55">{k}</dt>
            <dd className="mt-1 break-words text-[17px] text-[#26332D]">{v}</dd>
          </motion.div>
        ))}
      </dl>
      <div className="mt-8 flex flex-col gap-6 border-t border-[#26332D]/15 pt-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="f-label text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55">К оплате в барбершопе</p>
          <p className="f-display mt-1 text-5xl font-medium">{fmtPrice(ticket.svc.price)}</p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="f-label self-start rounded-full border border-[#26332D]/25 px-5 py-3 text-[12px] uppercase tracking-[0.14em] text-[#26332D]/80 sm:self-auto"
        >
          Изменить запись
        </button>
      </div>
      <p className="f-label mt-6 text-[11px] uppercase leading-relaxed tracking-[0.1em] text-[#26332D]/50">Демо-страница: заявка никуда не отправляется.</p>
    </motion.div>
  );
}

/* ───────────────────────────── Подвал ───────────────────────────── */

function Footer({ onNav }) {
  return (
    <footer className="relative overflow-hidden border-t border-[#26332D]/15 pt-20">
      <Container className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="f-display text-3xl font-medium">Onix Barbershop</p>
          <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-[#26332D]/60">
            Мужской барбершоп в центре Гомеля, рядом с дворцовым парком. Стрижки, бритьё и уход за бородой по записи.
          </p>
        </div>
        <div>
          <p className="f-label text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55">Адрес</p>
          <p className="mt-2 text-[15px] text-[#26332D]/85">{ADDRESS}</p>
        </div>
        <div>
          <p className="f-label text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55">Часы</p>
          <p className="mt-2 text-[15px] text-[#26332D]/85">Ежедневно, 10:00–22:00</p>
        </div>
        <div>
          <p className="f-label text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55">Связь</p>
          <p className="mt-2 select-all text-[15px] tabular-nums text-[#26332D]/85">{PHONE}</p>
          <p className="text-[15px] text-[#26332D]/85">{TELEGRAM}</p>
        </div>
      </Container>
      <div className="f-display mt-16 select-none text-center text-[24vw] font-medium leading-[0.9] tracking-[0.03em]" aria-hidden="true">
        <SplitLetters text="ONIX" trigger="view" stagger={0.07} letterClassName="accent-text" />
      </div>
      <Container className="f-label flex flex-col gap-4 border-t border-[#26332D]/15 py-6 text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 Onix Barbershop</span>
        <span>Сделано с точностью до 0,5 мм</span>
        <motion.button
          type="button"
          onClick={() => onNav("top")}
          whileHover={{ y: -3, color: "#4F7A68" }}
          transition={springSnappy}
          className="inline-flex items-center gap-2 self-start uppercase sm:self-auto"
        >
          Наверх
          <ArrowDown size={12} className="rotate-180" />
        </motion.button>
      </Container>
    </footer>
  );
}

/* ─────────────────────── Плавающий бейдж «Записаться» ───────────── */

function BookBadge({ hidden, onClick }) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness: 300, damping: 50 });
  const rotate = useMotionValue(0);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 150, damping: 12 });
  const smy = useSpring(my, { stiffness: 150, damping: 12 });
  const ref = useRef(null);
  const bounds = useRef(null);
  const dragged = useRef(false);
  const [past, setPast] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setPast(v > window.innerHeight * 0.45));
  const off = hidden || !past;

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const v = smooth.get();
    const speed = 16 + Math.min(Math.abs(v), 4000) * 0.07;
    rotate.set(rotate.get() + (v < -5 ? -1 : 1) * speed * (delta / 1000));
  });

  useEffect(() => {
    const onMove = (e) => {
      if (e.pointerType !== "mouse" || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < 170;
      mx.set(near ? dx * 0.3 : 0);
      my.set(near ? dy * 0.3 : 0);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  return (
    <>
      <div ref={bounds} aria-hidden="true" className="pointer-events-none fixed inset-3" style={{ bottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }} />
      <motion.div
        ref={ref}
        drag
        dragConstraints={bounds}
        dragElastic={0.2}
        dragTransition={{ bounceStiffness: 260, bounceDamping: 16 }}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={() => {
          setTimeout(() => {
            dragged.current = false;
          }, 60);
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: off ? 0 : 1, opacity: off ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="fixed right-4 z-[60] h-20 w-20 sm:right-6 sm:h-28 sm:w-28"
        style={{ bottom: "calc(20px + env(safe-area-inset-bottom, 0px))", touchAction: "none", pointerEvents: off ? "none" : "auto" }}
        data-cursor="drag"
      >
        <motion.button
          type="button"
          onClick={() => {
            if (!dragged.current) onClick();
          }}
          aria-label="Записаться онлайн"
          style={{ x: smx, y: smy }}
          initial="rest"
          animate="rest"
          whileHover="hover"
          whileTap={{ scale: 0.92 }}
          className="relative grid h-full w-full place-items-center rounded-full"
        >
          <motion.span
            className="absolute inset-0 rounded-full border bg-[#FAFBF8]/70 backdrop-blur-md"
            variants={{
              rest: { borderColor: "rgba(79,122,104,0.4)", boxShadow: "0 0 0px rgba(79,122,104,0)" },
              hover: { borderColor: "rgba(79,122,104,1)", boxShadow: "0 0 40px rgba(79,122,104,0.45)" },
            }}
          />
          <motion.svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ rotate }} aria-hidden="true">
            <path id="gr-badge-path" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" fill="none" />
            <text className="f-label" fontSize="8" letterSpacing="0.15" fill="#4F7A68">
              <textPath href="#gr-badge-path" textLength="236" lengthAdjust="spacing">
                ЗАПИСАТЬСЯ · BOOK NOW · ЗАПИСАТЬСЯ · BOOK NOW ·
              </textPath>
            </text>
          </motion.svg>
          <motion.span
            className="relative grid h-9 w-9 place-items-center rounded-full bg-[#4F7A68] text-[#FAFBF8] sm:h-12 sm:w-12"
            variants={{ rest: { scale: 1, rotate: 0 }, hover: { scale: 1.12, rotate: -30 } }}
            transition={{ type: "spring", stiffness: 300, damping: 12 }}
          >
            <Scissors size={18} strokeWidth={1.6} />
          </motion.span>
        </motion.button>
      </motion.div>
    </>
  );
}

/* ───────────────────────────── Страница ─────────────────────────── */

export default function BarbershopLanding() {
  const [loading, setLoading] = useState(() => typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [service, setService] = useState("signature");
  const [master, setMaster] = useState("any");
  const bookingRef = useRef(null);
  const bookingInView = useInView(bookingRef, { amount: 0.2 });
  const finishLoading = useCallback(() => setLoading(false), []);

  const go = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  }, []);
  const pickService = useCallback(
    (id) => {
      if (id) setService(id);
      go("booking");
    },
    [go],
  );

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = loading ? "hidden" : "";
    if (!loading) requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [loading]);

  return (
    <MotionConfig reducedMotion="user">
      <GlobalStyles />
      <div className="f-body relative min-h-screen overflow-x-clip bg-[#EEF1EC] text-[#26332D]">
        <div className="grain" aria-hidden="true" />
        <AnimatePresence>{loading ? <Loader key="loader" onDone={finishLoading} /> : null}</AnimatePresence>
        <Cursor />
        <Nav ready={!loading} onNav={go} />
        <main>
          <Hero ready={!loading} onNav={go} />
          <Manifesto />
          <Services onSelect={pickService} />
          <Works onPick={pickService} />
          <Ritual />
          <Masters
            onBook={(id) => {
              setMaster(id);
              go("booking");
            }}
          />
          <Booking sectionRef={bookingRef} service={service} setService={setService} master={master} setMaster={setMaster} />
        </main>
        <Footer onNav={go} />
        <BookBadge hidden={loading || bookingInView} onClick={() => go("booking")} />
      </div>
    </MotionConfig>
  );
}
