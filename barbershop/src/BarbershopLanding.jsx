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
  Rotate3d,
  ScanFace,
  Scissors,
  Send,
  Star,
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
    min: 5,
    text: "Мастер смотрит на форму головы, рост волос и то, как вы обычно укладываетесь. Результат обсуждаем до первого щелчка ножниц.",
  },
  {
    n: "02",
    icon: Droplets,
    title: "Мытьё и массаж",
    min: 10,
    text: "Шампунь под тип кожи головы и массаж. Чистые волосы ложатся по своему естественному направлению.",
  },
  { n: "03", icon: Scissors, title: "Стрижка", min: 35, text: "Ножницы, машинка, бритва по контуру. Работаем столько, сколько требует форма." },
  { n: "04", icon: Flame, title: "Горячее полотенце", min: 5, text: "Полотенце при 60 °C раскрывает поры и снимает раздражение после бритвы." },
  { n: "05", icon: Wind, title: "Укладка", min: 5, text: "Подбираем средство и показываем, как повторить укладку дома за две минуты." },
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
const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};
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

function Spark({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 0C12.6 7.2 16.8 11.4 24 12 16.8 12.6 12.6 16.8 12 24 11.4 16.8 7.2 12.6 0 12 7.2 11.4 11.4 7.2 12 0Z" fill="currentColor" />
    </svg>
  );
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
  const ex = { depth: 0.035, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.008, bevelSegments: 3, curveSegments: 40 };
  const face = ex.depth / 2 + ex.bevelThickness;

  // контур половинки: лезвие вправо от оси, хвостовик и кольцо — влево-вниз
  const halfShape = ({ c, ro, hole, tang }) => {
    const at = (a) => [c[0] + ro * Math.cos(deg(a)), c[1] + ro * Math.sin(deg(a))];
    const s = new THREE.Shape();
    s.moveTo(1.75, 0.012);
    s.quadraticCurveTo(1.0, 0.13, 0.15, 0.115);
    s.quadraticCurveTo(-0.05, 0.11, -0.2, 0.05);
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
    s.quadraticCurveTo(-0.4, -0.22, 0.0, -0.06);
    s.lineTo(0.45, -0.03);
    s.quadraticCurveTo(1.2, -0.01, 1.75, 0.012);
    const h = new THREE.Path();
    h.absellipse(c[0], c[1], hole[0], hole[1], 0, Math.PI * 2, true);
    s.holes.push(h);
    return s;
  };
  // полированная кромка вдоль режущей стороны
  const edgeShape = new THREE.Shape();
  edgeShape.moveTo(0.32, -0.03);
  edgeShape.quadraticCurveTo(1.2, -0.012, 1.72, 0.011);
  edgeShape.quadraticCurveTo(1.2, 0.012, 0.32, -0.004);
  edgeShape.lineTo(0.32, -0.03);

  const half = (sign, z, ring) => {
    const g = new THREE.Group();
    const geo = new THREE.ExtrudeGeometry(halfShape(ring), ex);
    geo.translate(0, 0, -ex.depth / 2);
    const body = new THREE.Mesh(geo, steel);
    const edge = new THREE.Mesh(new THREE.ShapeGeometry(edgeShape, 24), mirror);
    edge.position.z = face + 0.0006;
    const avg = (ring.hole[0] + ring.hole[1]) / 2;
    const insert = new THREE.Mesh(new THREE.TorusGeometry(avg - 0.012, 0.024, 16, 64), silicone);
    insert.scale.set(ring.hole[0] / avg, ring.hole[1] / avg, 1);
    insert.position.set(ring.c[0], ring.c[1], 0);
    const inner = new THREE.Group();
    inner.add(body, edge, insert);
    inner.scale.y = sign;
    g.add(inner);
    g.position.z = z;
    return g;
  };
  const a = half(1, 0.024, { c: [-0.98, -0.36], ro: 0.23, hole: [0.155, 0.135], tang: true });
  const b = half(-1, -0.024, { c: [-0.9, -0.3], ro: 0.2, hole: [0.13, 0.115], tang: false });

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
  inner.position.x = -0.19;
  const tilt = new THREE.Group();
  tilt.add(inner);
  tilt.rotation.z = 0.5;
  tilt.scale.setScalar(0.92);
  const snip = (d) => {
    const r = deg(d / 2);
    a.rotation.z = r;
    b.rotation.z = -r;
  };
  snip(10);
  return { object: tilt, tiltX: 0.28, snip };
}

/** Гребень для стрижки: черепаховый ацетат, утолщённый корпус, зубья с сужением, отверстие и сантиметровая шкала. */
function buildComb() {
  const tortoise = canvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = "#8A5636";
    ctx.fillRect(0, 0, w, h);
    const rand = mulberry32(77);
    for (let i = 0; i < 90; i += 1) {
      const x = rand() * w;
      const y = rand() * h;
      const r = 8 + rand() * 44;
      const dark = rand() > 0.4;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, dark ? "rgba(52,24,10,0.75)" : "rgba(214,150,86,0.6)");
      g.addColorStop(1, dark ? "rgba(52,24,10,0)" : "rgba(214,150,86,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.7, r, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  tortoise.wrapS = THREE.RepeatWrapping;
  tortoise.wrapT = THREE.RepeatWrapping;
  tortoise.repeat.set(0.42, 1.1);
  const acetate = new THREE.MeshPhysicalMaterial({ map: tortoise, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08 });

  const W = 2.5;
  const top = 0.34;
  const base = -0.02;
  const tipY = -0.48;
  const s = new THREE.Shape();
  s.moveTo(-W / 2, base);
  s.lineTo(-W / 2, top - 0.1);
  s.quadraticCurveTo(-W / 2, top, -W / 2 + 0.1, top);
  s.lineTo(W / 2 - 0.1, top);
  s.quadraticCurveTo(W / 2, top, W / 2, top - 0.1);
  s.lineTo(W / 2, tipY + 0.05);
  s.quadraticCurveTo(W / 2, tipY, W / 2 - 0.035, tipY);
  s.lineTo(W / 2 - 0.065, tipY + 0.02);
  let x = W / 2 - 0.065;
  // справа частые зубья, слева редкие; каждый зуб сужается к кончику, между зубьями — скруглённое основание
  while (x > -W / 2 + 0.22) {
    const fine = x > 0;
    const gap = fine ? 0.034 : 0.064;
    const tw = fine ? 0.032 : 0.05;
    const taper = tw * 0.22;
    s.lineTo(x, base);
    s.quadraticCurveTo(x - gap / 2, base + 0.035, x - gap, base);
    s.lineTo(x - gap - taper, tipY + 0.03);
    s.quadraticCurveTo(x - gap - tw / 2, tipY - 0.014, x - gap - tw + taper, tipY + 0.03);
    x -= gap + tw;
  }
  s.lineTo(x, base);
  s.lineTo(-W / 2 + 0.065, base);
  s.lineTo(-W / 2 + 0.065, tipY + 0.02);
  s.quadraticCurveTo(-W / 2, tipY, -W / 2, tipY + 0.05);
  const hole = new THREE.Path();
  hole.absarc(-W / 2 + 0.13, 0.16, 0.055, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 2, curveSegments: 6 });
  geo.translate(0, 0.07, -0.02);

  // утолщённый корпус-спинка
  const rib = new THREE.Shape();
  const rx0 = -W / 2 + 0.24;
  const rx1 = W / 2 - 0.02;
  rib.moveTo(rx0, base + 0.02);
  rib.lineTo(rx1 - 0.06, base + 0.02);
  rib.quadraticCurveTo(rx1, base + 0.02, rx1, base + 0.08);
  rib.lineTo(rx1, top - 0.08);
  rib.quadraticCurveTo(rx1, top - 0.02, rx1 - 0.06, top - 0.02);
  rib.lineTo(rx0, top - 0.02);
  rib.quadraticCurveTo(rx0 - 0.04, (top + base) / 2, rx0, base + 0.02);
  const ribGeo = new THREE.ExtrudeGeometry(rib, {
    depth: 0.07,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.012,
    bevelSegments: 4,
    curveSegments: 12,
  });
  ribGeo.translate(0, 0.07, -0.035);

  // сантиметровая шкала на спинке, как на настоящих гребнях
  const rulerW = rx1 - rx0 - 0.12;
  const ruler = canvasTexture(1024, 96, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(250,246,238,0.88)";
    const marks = 170;
    for (let i = 0; i <= marks; i += 1) {
      const px = 8 + (i * (w - 16)) / marks;
      const len = i % 10 === 0 ? 44 : i % 5 === 0 ? 30 : 18;
      ctx.fillRect(px - 1, 0, 2, len);
      if (i % 10 === 0 && i < marks) {
        ctx.font = "600 26px Manrope, Arial, sans-serif";
        ctx.fillText(String(i / 10), px + 5, 78);
      }
    }
  });
  const rulerMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(rulerW, rulerW * (96 / 1024)),
    new THREE.MeshStandardMaterial({ map: ruler, transparent: true, roughness: 0.5, depthWrite: false }),
  );
  rulerMesh.position.set((rx0 + rx1) / 2 + 0.02, top + 0.02 - (rulerW * (96 / 1024)) / 2, 0.05);

  const tilt = new THREE.Group();
  tilt.add(new THREE.Mesh(geo, acetate), new THREE.Mesh(ribGeo, acetate), rulerMesh);
  tilt.rotation.z = -0.14;
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

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 100, damping: 15 });
  const sry = useSpring(ry, { stiffness: 100, damping: 15 });

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

  const lateIn = (d) => ({
    initial: { opacity: 0, y: 16 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { type: "spring", stiffness: 80, damping: 16, delay: d },
  });
  const tool = SHOWCASE[active];

  return (
    <motion.div
      ref={wrapRef}
      onPointerMove={(e) => {
        const r = wrapRef.current.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        if (e.pointerType === "mouse") {
          ry.set(px * 8);
          rx.set(-py * 6);
          api.current?.pointer(px, py);
        }
        api.current?.dragMove(e.clientX);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
        api.current?.pointer(0, 0);
        api.current?.dragEnd();
      }}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1400 }}
      className="relative mx-auto aspect-[4/5] w-full max-w-[540px] lg:ml-auto lg:mr-0"
    >
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-b-[36px] rounded-t-[999px] border border-white/80 bg-[radial-gradient(ellipse_at_50%_42%,#FFFFFF_0%,#F4F7F3_45%,#DCE6DF_100%)] shadow-[0_50px_90px_-50px_rgba(38,51,45,0.45)]"
        initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
        animate={ready ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
        transition={{ duration: 1.1, ease: EASE_CUT, delay: 0.1 }}
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
        {webgl ? null : <div className="f-display absolute inset-0 grid place-items-center text-5xl italic text-[#26332D]/30">{tool.name}</div>}

        <motion.div
          {...lateIn(1.0)}
          className="f-label pointer-events-none absolute inset-x-0 top-[11%] flex flex-col items-center gap-1.5 text-center text-[11px] uppercase tracking-[0.14em] text-[#26332D]/65"
        >
          <span>Инструменты мастера</span>
          <span className="inline-flex items-center gap-1.5 normal-case tracking-normal text-[#4F7A68]">
            <Rotate3d size={14} strokeWidth={1.6} />
            Покрутите мышью или пальцем
          </span>
        </motion.div>

        <motion.div {...lateIn(1.2)} className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-6">
          <div className="pointer-events-auto flex shrink-0 gap-2">
            {SHOWCASE.map((t, i) => (
              <button
                key={t.key}
                type="button"
                onClick={() => api.current?.show(i)}
                aria-label={`Показать: ${t.name}`}
                aria-pressed={active === i}
                className="relative h-1.5 w-9 overflow-hidden bg-[#26332D]/15"
              >
                {active === i ? (
                  <motion.span
                    key={cycle}
                    className="absolute inset-0 origin-left bg-[#4F7A68]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: reduced ? 0 : SHOW_HOLD + 0.3, ease: "linear" }}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 40, rotate: 8 }}
        animate={ready ? { opacity: 1, x: 0, rotate: 3 } : undefined}
        transition={{ type: "spring", stiffness: 60, damping: 12, delay: 1.5 }}
        className="absolute -right-10 top-[14%] hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-[22px] border border-white/80 bg-[#FAFBF8]/80 px-4 py-3 shadow-[0_30px_60px_-24px_rgba(38,51,45,0.3)] backdrop-blur-xl sm:px-5 sm:py-4"
        >
          <div className="flex gap-0.5 text-[#B07A55]">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <div className="f-display mt-2 text-4xl font-medium leading-none sm:text-5xl">4,98</div>
          <div className="f-label mt-1 text-[11px] uppercase tracking-[0.1em] text-[#26332D]/60">1 240 отзывов</div>
        </motion.div>
      </motion.div>
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
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ y: bgY }}>
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

/* ───────────────────────────── Бегущая строка ───────────────────── */

function VelocityMarquee({ children, baseVelocity = -3 }) {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const skew = useTransform(smooth, [-2500, 2500], [10, -10]);
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    let moveBy = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    moveBy += dir.current * moveBy * f;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div className="flex w-max flex-nowrap" style={{ x, skewX: skew }}>
        {[0, 1, 2, 3].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden={k > 0 ? "true" : undefined}>
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function MarqueeBand() {
  const words = ["Стрижка", "Королевское бритьё", "Скин-фейд", "Борода", "Горячее полотенце", "Камуфляж седины", "Укладка"];
  return (
    <section aria-label="Направления барбершопа" className="relative py-14 sm:py-20">
      <div className="relative -ml-[5%] w-[110%] -rotate-[1.5deg] bg-[#E7D6C5] py-3 text-[#26332D] sm:py-4">
        <VelocityMarquee baseVelocity={-3}>
          {words.map((w) => (
            <span key={w} className="flex items-center">
              <span className="f-display px-6 text-[clamp(2rem,4.6vw,4rem)] font-medium italic leading-[1.15] sm:px-10">{w}</span>
              <Spark className="h-4 w-4 text-[#4F7A68] sm:h-6 sm:w-6" />
            </span>
          ))}
        </VelocityMarquee>
      </div>
      <div className="relative -ml-[5%] -mt-2 w-[110%] rotate-[1deg] bg-[#DCE6DF] py-3">
        <VelocityMarquee baseVelocity={2}>
          {words.map((w) => (
            <span key={w} className="f-label flex items-center gap-6 px-6 text-[13px] uppercase tracking-[0.14em] text-[#26332D]/70">
              {w}
              <span className="h-1.5 w-1.5 rounded-full bg-[#4F7A68]" />
            </span>
          ))}
        </VelocityMarquee>
      </div>
    </section>
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
        ".mf-seal",
        { rotate: -60, scale: 0.8 },
        { rotate: 200, scale: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.6 } },
      );
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={ref} aria-label="Манифест" className="relative py-24 sm:py-36">
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="flex items-center gap-8 lg:col-span-3 lg:flex-col lg:items-start">
          <p className="f-label text-[12px] uppercase tracking-[0.14em] text-[#4F7A68]">
            <span className="mr-2.5 inline-block h-1.5 w-1.5 rounded-full bg-[#4F7A68] align-middle" aria-hidden="true" />
            Манифест
          </p>
          <div className="mf-seal relative aspect-square w-28 overflow-hidden rounded-full sm:w-40 lg:w-48">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_28%,#FFFFFF_0%,#E7D6C5_38%,#DCE6DF_70%,#B9CFC2_100%)]" />
            <div className="absolute inset-[10%] rounded-full border border-dashed border-white/80" />
            <span className="f-display absolute inset-0 grid place-items-center text-3xl italic text-[#4F7A68] sm:text-4xl">O</span>
          </div>
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

/* ───────────────────────────── Ритуал (GSAP pin) ────────────────── */

function Ritual() {
  const section = useRef(null);
  const track = useRef(null);
  const reduced = useReducedMotion();

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
      gsap.utils.toArray(".rt-card", track.current).forEach((card) => {
        gsap.fromTo(
          card,
          { rotateY: -38, z: -160, opacity: 0.35, transformPerspective: 1200, transformOrigin: "0% 50%" },
          {
            rotateY: 0,
            z: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "center 60%", scrub: true },
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

  const total = RITUAL.reduce((sum, r) => sum + r.min, 0);

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
              Стрижка «Onix» · {total} минут
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
          {RITUAL.map((step) => {
            const Icon = step.icon;
            return (
              <article
                key={step.n}
                className="rt-card relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[28px] border border-white/80 bg-[#FAFBF8]/85 p-7 shadow-[0_30px_60px_-40px_rgba(38,51,45,0.35)] backdrop-blur-xl sm:p-9 lg:h-[64vh] lg:max-h-[600px] lg:w-[min(30vw,460px)]"
              >
                <span
                  className="rt-num f-display pointer-events-none absolute -right-2 -top-8 text-[10rem] italic leading-none text-[#DCE6DF] sm:text-[13rem]"
                  aria-hidden="true"
                >
                  {step.n}
                </span>
                <div className="relative flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#DCE6DF] text-[#4F7A68]">
                    <Icon size={20} strokeWidth={1.3} />
                  </span>
                  <span className="f-label text-[11px] uppercase tracking-[0.14em] text-[#26332D]/55">Этап {step.n}</span>
                </div>
                <div className="relative mt-16">
                  <span className="f-label text-[12px] uppercase tracking-[0.14em] text-[#4F7A68]">{step.min} мин</span>
                  <h3 className="f-display mt-2 text-[2.1rem] font-medium leading-tight sm:text-[2.4rem]">{step.title}</h3>
                  <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#26332D]/70">{step.text}</p>
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
          <MarqueeBand />
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
