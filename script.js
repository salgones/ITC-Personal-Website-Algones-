const $ = (id) => document.getElementById(id);
const peso = (n) => "P" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt = (n) => Number(n.toFixed(4)).toLocaleString("en-US", { maximumFractionDigits: 4 });

function show(el, html, isError) {
  el.innerHTML = html;
  el.classList.toggle("error", !!isError);
}

/* ---------- Assignment 1: Conversion ---------- */
$("convBtn").addEventListener("click", () => {
  const out = $("convResult");
  const raw = $("convValue").value;
  if (raw === "" || isNaN(raw)) return show(out, "Enter a valid number.", true);
  const v = parseFloat(raw);
  const type = $("convType").value;
  let r, text;
  if (type === "c2f")      { r = v * 9 / 5 + 32;  text = `${fmt(v)} &deg;C = <strong>${fmt(r)} &deg;F</strong>`; }
  else if (type === "f2c") { r = (v - 32) * 5 / 9; text = `${fmt(v)} &deg;F = <strong>${fmt(r)} &deg;C</strong>`; }
  else if (type === "m2ft"){ r = v * 3.28084;      text = `${fmt(v)} m = <strong>${fmt(r)} ft</strong>`; }
  else                     { r = v / 3.28084;      text = `${fmt(v)} ft = <strong>${fmt(r)} m</strong>`; }
  show(out, text);
});

/* ---------- Assignment 2: Income Tax ---------- */
const brackets = [
  { over: 0,       upTo: 250000,   base: 0,       rate: 0 },
  { over: 250000,  upTo: 400000,   base: 0,       rate: 0.20 },
  { over: 400000,  upTo: 800000,   base: 30000,   rate: 0.25 },
  { over: 800000,  upTo: 2000000,  base: 130000,  rate: 0.30 },
  { over: 2000000, upTo: 8000000,  base: 490000,  rate: 0.32 },
  { over: 8000000, upTo: Infinity, base: 2410000, rate: 0.35 }
];

function computeTax(income) {
  for (let i = 0; i < brackets.length; i++) {
    const b = brackets[i];
    if (income <= b.upTo) {
      return { tax: b.base + (income - b.over) * b.rate, row: i, b };
    }
  }
}

$("taxBtn").addEventListener("click", () => {
  const out = $("taxResult");
  const raw = $("taxIncome").value;
  document.querySelectorAll("#taxTable tbody tr").forEach(tr => tr.classList.remove("hit"));
  if (raw === "" || isNaN(raw) || parseFloat(raw) < 0) {
    return show(out, "Enter a taxable income of 0 or more.", true);
  }
  const income = parseFloat(raw);
  const { tax, row, b } = computeTax(income);
  document.querySelectorAll("#taxTable tbody tr")[row].classList.add("hit");
  const excess = Math.max(income - b.over, 0);
  const formula = b.rate === 0
    ? "Income is within the 0% bracket."
    : `${peso(b.base)} + ${b.rate * 100}% of ${peso(excess)} (the excess over ${peso(b.over)})`;
  show(out, `Taxable income: ${peso(income)}<br>${formula}<br>Income tax: <strong>${peso(tax)}</strong>`);
});

$("taxClear").addEventListener("click", () => {
  $("taxIncome").value = "";
  document.querySelectorAll("#taxTable tbody tr").forEach(tr => tr.classList.remove("hit"));
  show($("taxResult"), "Enter an amount to see the income tax.");
});

/* ---------- Assignment 3: Factorial / Sum / Average ---------- */
$("loopBtn").addEventListener("click", () => {
  const out = $("loopResult");
  const raw = $("loopN").value;
  const n = Number(raw);
  if (raw === "" || !Number.isInteger(n) || n < 1 || n > 170) {
    return show(out, "Enter a whole number from 1 to 170.", true);
  }

  // Factorial with a while loop
  let fact = 1, i = 1;
  while (i <= n) { fact *= i; i++; }

  // Sum with a do-while loop
  let sum = 0, j = 1;
  do { sum += j; j++; } while (j <= n);

  // Average with a for loop (running total, then divide by N)
  let total = 0;
  for (let k = 1; k <= n; k++) { total += k; }
  const avg = total / n;

  const factText = Number.isFinite(fact) && fact < 1e21
    ? fact.toLocaleString("en-US")
    : fact.toExponential(6);

  show(out,
    `Factorial of ${n} (while loop): <strong>${factText}</strong><br>` +
    `Sum of 1 to ${n} (do-while loop): <strong>${sum.toLocaleString("en-US")}</strong><br>` +
    `Average of 1 to ${n} (for loop): <strong>${fmt(avg)}</strong>`);
});

/* ---------- Assignment 4: Simple Payroll ---------- */
const payroll = [];

function renderPayroll() {
  const body = $("payBody"), foot = $("payFoot");
  if (payroll.length === 0) {
    body.innerHTML = '<tr><td colspan="7">No employees yet.</td></tr>';
    foot.innerHTML = "";
    return;
  }
  body.innerHTML = payroll.map((e, idx) => {
    const gross = e.days * e.rate;
    const net = gross - e.ded;
    return `<tr>
      <td>${idx + 1}</td>
      <td>${e.name}</td>
      <td class="num">${e.days}</td>
      <td class="num">${peso(e.rate)}</td>
      <td class="num">${peso(gross)}</td>
      <td class="num">${peso(e.ded)}</td>
      <td class="num">${peso(net)}</td>
    </tr>`;
  }).join("");
  const totalNet = payroll.reduce((s, e) => s + e.days * e.rate - e.ded, 0);
  foot.innerHTML = `<tr><td colspan="6">Total net pay</td><td class="num">${peso(totalNet)}</td></tr>`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

$("addBtn").addEventListener("click", () => {
  const msg = $("payMsg");
  const name = $("empName").value.trim();
  const days = parseFloat($("empDays").value);
  const rate = parseFloat($("empRate").value);
  const ded = $("empDed").value === "" ? 0 : parseFloat($("empDed").value);

  if (!name) return show(msg, "Enter the employee name.", true);
  if (isNaN(days) || days < 0) return show(msg, "Enter the days worked (0 or more).", true);
  if (isNaN(rate) || rate < 0) return show(msg, "Enter the daily rate (0 or more).", true);
  if (isNaN(ded) || ded < 0) return show(msg, "Enter the deduction amount (0 or more).", true);
  if (ded > days * rate) return show(msg, "The deduction is higher than the gross pay. Lower the deduction.", true);

  payroll.push({ name: escapeHtml(name), days, rate, ded });
  renderPayroll();
  show(msg, `Added <strong>${escapeHtml(name)}</strong> as line ${payroll.length}.`);
  $("empName").value = "";
  $("empDays").value = "";
  $("empRate").value = "";
  $("empDed").value = "0";
  $("empName").focus();
});

$("delBtn").addEventListener("click", () => {
  const msg = $("payMsg");
  const line = Number($("delLine").value);
  if ($("delLine").value === "" || !Number.isInteger(line) || line < 1 || line > payroll.length) {
    return show(msg, payroll.length === 0
      ? "The list is empty. Add an employee first."
      : `Enter a line number from 1 to ${payroll.length}.`, true);
  }
  const [removed] = payroll.splice(line - 1, 1);
  renderPayroll();
  show(msg, `Deleted line ${line} (<strong>${removed.name}</strong>). The list is renumbered.`);
  $("delLine").value = "";
});
