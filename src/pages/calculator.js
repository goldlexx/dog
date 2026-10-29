import '../css/base.css';
import '../css/calculator.css';

// Standard maintenance formula for healthy adult dogs:
// RER = 70 * weight^0.75 (kcal/day), MER = RER * activity factor.
// Estimate only: the page tells the user to check the result with a vet.
const ACTIVITY = { calm: 1.2, normal: 1.6, active: 1.8 };

const form = document.getElementById('calcForm');
const steps = Array.from(form.querySelectorAll('[data-step]'));
const dots = Array.from(document.querySelectorAll('[data-step-dot]'));
const result = document.getElementById('result');
const blocked = document.getElementById('blocked');
let current = 1;

function reachGoal(name) {
  if (typeof window.ym === 'function') window.ym(113790002, 'reachGoal', name);
}

function scrollToCalculator() {
  const section = document.getElementById('calculator');
  if (!section) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

function showStep(n) {
  current = n;
  steps.forEach((s) => {
    const active = Number(s.dataset.step) === n;
    s.classList.toggle('is-active', active);
    s.setAttribute('aria-hidden', String(!active));
  });
  dots.forEach((d) => {
    const k = Number(d.dataset.stepDot);
    d.classList.toggle('is-active', k === n);
    d.classList.toggle('is-done', k < n);
    if (k === n) d.setAttribute('aria-current', 'step');
    else d.removeAttribute('aria-current');
  });
  const first = steps[n - 1].querySelector('input:not([type=hidden]), button');
  if (first && n > 1) first.focus({ preventScroll: true });
}

// explicit mapping: error text id -> input id (no DOM guessing)
const FIELD_FOR_ERROR = { weightErr: 'weight', kcalErr: 'kcal' };

function setError(errId, text) {
  const el = document.getElementById(errId);
  el.textContent = text || '';
  const field = document.getElementById(FIELD_FOR_ERROR[errId]);
  if (field) {
    if (text) {
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', errId);
    } else {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
  }
}

function isUnsuitable() {
  return form.age.value === 'young' || form.unsuitable.checked;
}

function parseDecimal(raw) {
  const value = String(raw).trim();
  // Accept either comma or dot, including values such as ,5; reject units and multiple separators.
  if (!/^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(value)) return NaN;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function readWeight() {
  const v = parseDecimal(form.weight.value);
  if (!Number.isFinite(v) || v < 0.5 || v > 90) {
    setError('weightErr', 'Укажите вес от 0,5 до 90 кг.');
    return null;
  }
  setError('weightErr', '');
  return v;
}

function readKcal() {
  const v = parseDecimal(form.kcal.value);
  if (!Number.isFinite(v) || v < 50 || v > 700) {
    setError('kcalErr', 'Укажите калорийность от 50 до 700 ккал на 100 г.');
    return null;
  }
  setError('kcalErr', '');
  return v;
}

function compute(weight, activity, kcalPer100g) {
  const rer = 70 * Math.pow(weight, 0.75);
  const mer = rer * ACTIVITY[activity];
  const grams = (mer / kcalPer100g) * 100;
  return {
    rer: Math.round(rer),
    mer: Math.round(mer),
    // Round the daily total first, then split it so the displayed portions add up.
    grams: Math.round(grams),
    // Half of an odd whole-gram total can be expressed to 0.5 g, avoiding a false mismatch.
    perMeal: Math.round(grams) / 2,
  };
}

// step 1: weight and age
form.querySelectorAll('[data-next]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (current === 1) {
      if (isUnsuitable()) {
        blocked.hidden = false;
        result.hidden = true;
        document.getElementById('resultPreview').hidden = false;
        document.querySelector('.calc-grid').classList.remove('has-result');
        return;
      }
      blocked.hidden = true;
      if (readWeight() === null) return;
    }
    showStep(current + 1);
  });
});

form.querySelectorAll('[data-back]').forEach((btn) => {
  btn.addEventListener('click', () => showStep(current - 1));
});

form.querySelectorAll('input[name="age"]').forEach((r) => {
  r.addEventListener('change', () => {
    blocked.hidden = !isUnsuitable();
    if (isUnsuitable()) {
      result.hidden = true;
      document.getElementById('resultPreview').hidden = false;
      document.querySelector('.calc-grid').classList.remove('has-result');
    }
  });
});

// step 3: submit shows the result
form.unsuitable.addEventListener('change', () => {
  blocked.hidden = !isUnsuitable();
  if (isUnsuitable()) {
    result.hidden = true;
    document.getElementById('resultPreview').hidden = false;
    document.querySelector('.calc-grid').classList.remove('has-result');
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (isUnsuitable()) {
    blocked.hidden = false;
    result.hidden = true;
    document.getElementById('resultPreview').hidden = false;
    document.querySelector('.calc-grid').classList.remove('has-result');
    return;
  }
  const weight = readWeight();
  if (weight === null) {
    showStep(1);
    return;
  }
  const kcal = readKcal();
  if (kcal === null) {
    showStep(3);
    return;
  }
  const activity = form.activity.value;
  const r = compute(weight, activity, kcal);
  reachGoal('calculator_result');
  document.getElementById('resGrams').textContent = r.grams;
  stayDaily.value = r.grams;
  updateStayEstimate();
  document.getElementById('resMeal').textContent = r.perMeal.toLocaleString('ru-RU', { maximumFractionDigits: 1 });
  document.getElementById('resKcal').textContent = r.mer;
  document.getElementById('resRer').textContent = r.rer;
  document.getElementById('seniorNote').hidden = form.age.value !== 'senior';
  result.hidden = false;
  document.getElementById('resultPreview').hidden = true;
  document.querySelector('.calc-grid').classList.add('has-result');
  // On phones the result follows the form; scroll to it only when it is not already visible.
  if (window.matchMedia('(max-width: 900px)').matches) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    result.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    result.focus({ preventScroll: true });
  }
});

// Changing values preserves the entered data; a full reset starts a fresh calculation.
document.getElementById('redo').addEventListener('click', () => {
  result.hidden = true;
  document.getElementById('resultPreview').hidden = false;
  document.querySelector('.calc-grid').classList.remove('has-result');
  showStep(1);
  scrollToCalculator();
  // Put the cursor in the weight field so the user can edit right away.
  document.getElementById('weight').focus({ preventScroll: true });
});

document.getElementById('resetCalc').addEventListener('click', () => {
  form.reset();
  setError('weightErr', '');
  setError('kcalErr', '');
  blocked.hidden = true;
  result.hidden = true;
  document.getElementById('resultPreview').hidden = false;
  document.getElementById('seniorNote').hidden = true;
  document.getElementById('resGrams').textContent = '0';
  document.getElementById('resMeal').textContent = '0';
  document.getElementById('resKcal').textContent = '0';
  document.getElementById('resRer').textContent = '0';
  document.querySelector('.calc-grid').classList.remove('has-result');
  stayDaily.value = '180';
  stayDays.value = '7';
  stayReserve.value = '10';
  stayMeals.value = '2';
  stayCopyStatus.textContent = '';
  updateStayEstimate();
  showStep(1);
  scrollToCalculator();
});

// Enter advances through the wizard instead of submitting the whole form from step 1 or 2.
form.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || e.isComposing || e.target.matches('button, a, textarea')) return;
  if (current < 3) {
    e.preventDefault();
    const next = form.querySelector(`[data-step="${current}"] [data-next]`);
    if (next) next.click();
  }
});

showStep(1);
setError('weightErr', '');
setError('kcalErr', '');

// Estimate how much of the dog's usual food to bring for a stay. This does not set a feeding norm.
const stayDaily = document.getElementById('stayDaily');
const stayDays = document.getElementById('stayDays');
const stayReserve = document.getElementById('stayReserve');
const stayMeals = document.getElementById('stayMeals');
const stayError = document.getElementById('stayError');
const stayTotal = document.getElementById('stayTotal');
const stayBreakdown = document.getElementById('stayBreakdown');
const stayPerMeal = document.getElementById('stayPerMeal');
const stayCopy = document.getElementById('stayCopy');
const stayCopyStatus = document.getElementById('stayCopyStatus');
let staySummary = '';

function updateStayEstimate() {
  const daily = parseDecimal(stayDaily.value);
  const days = Number(stayDays.value);
  const reserve = Number(stayReserve.value);
  const meals = Number(stayMeals.value);
  const valid = Number.isFinite(daily) && daily > 0 && daily <= 10000 && Number.isInteger(days) && days >= 1 && days <= 90;
  const validDaily = Number.isFinite(daily) && daily > 0 && daily <= 10000;
  const validDays = Number.isInteger(days) && days >= 1 && days <= 90;
  stayError.hidden = valid;
  stayDaily.setAttribute('aria-invalid', String(!validDaily));
  stayDays.setAttribute('aria-invalid', String(!validDays));
  stayCopy.disabled = !valid;
  if (!valid) {
    stayTotal.textContent = '—';
    stayBreakdown.textContent = 'Проверьте суточную порцию и срок передержки.';
    stayPerMeal.textContent = '—';
    staySummary = '';
    return;
  }
  const base = daily * days;
  const extra = Math.ceil(base * reserve / 100);
  const total = Math.ceil(base + extra);
  const fmt = (n) => Math.round(n).toLocaleString('ru-RU');
  stayTotal.textContent = (total / 1000).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const baseKg = (base / 1000).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  stayBreakdown.textContent = reserve > 0
    ? `${baseKg} кг на основной срок + ${reserve}% запаса (${fmt(extra)} г)`
    : `${baseKg} кг ровно на ${days} дн., без запаса`;
  stayPerMeal.textContent = `${fmt(Math.ceil(daily / meals))} г`;
  staySummary = `Корм на передержку: ${fmt(daily)} г в сутки × ${days} дн. = ${fmt(base)} г; запас ${reserve}% — ${fmt(extra)} г; всего ${fmt(total)} г (${(total / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} кг). ${fmt(Math.ceil(daily / meals))} г за кормление при ${meals} кормлениях в день.`;
  stayCopyStatus.textContent = '';
}
[stayDaily, stayDays, stayReserve, stayMeals].forEach((field) => {
  field.addEventListener('input', updateStayEstimate);
  field.addEventListener('change', updateStayEstimate);
});
stayCopy.addEventListener('click', async () => {
  if (!staySummary) return;
  try {
    await navigator.clipboard.writeText(staySummary);
    stayCopyStatus.textContent = 'Расчёт скопирован.';
  } catch (err) {
    stayCopyStatus.textContent = staySummary;
  }
});
updateStayEstimate();


// Track MAX contact clicks on the calculator page; analytics is optional.
document.querySelectorAll('a[href*="max.ru"]').forEach((link) => {
  link.addEventListener('click', () => reachGoal('click_max'));
});
