const SEMESTERS = ["Winter", "Spring", "Fall"];
const DEFAULT_SPONSOR = 23200;
const DEFAULT_SEMESTERS = 12;

function $(id) { return document.getElementById(id); }
const AC = "byuh";
function fmt(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function checkCode() {
  const input = $("accessCode").value.trim();
  if (input === AC) {
    $("gate").style.display = "none";
    $("main").style.display = "flex";
    $("main").style.flexDirection = "column";
    $("main").style.alignItems = "center";
    $("main").style.width = "100%";
  } else {
    $("accessCode").classList.add("error");
    $("err-gate").style.display = "block";
    $("accessCode").value = "";
    $("accessCode").focus();
  }
}

function intVal(id) {
  const v = parseInt($(id).value, 10);
  return isNaN(v) ? null : v;
}

function clearErrors() {
  document.querySelectorAll(".err-msg").forEach(el => el.style.display = "none");
  document.querySelectorAll("input, select").forEach(el => el.classList.remove("error"));
}

function showError(fieldId, msgId) {
  $(fieldId).classList.add("error");
  $(msgId).style.display = "block";
}

function validate() {
  clearErrors();
  let ok = true;

  if (!$("startSem").value) { showError("startSem", "err-startSem"); ok = false; }
  const AC = "byuh";

  const yr = intVal("startYear");
  if (!yr || yr < 2000 || yr > 2100) { showError("startYear", "err-startYear"); ok = false; }

  const ns = intVal("numSemesters");
  if (!ns || ns < 1 || ns > 24) { showError("numSemesters", "err-numSemesters"); ok = false; }

  return ok;
}

function onReturningChange() {
  const isReturning = $("returningStudent").checked;
  const semInput = $("numSemesters");
  const badge = $("autoBadge");

  if (!isReturning) {
    // New student — lock to 12 semesters automatically
    semInput.value = DEFAULT_SEMESTERS;
    semInput.readOnly = true;
    semInput.style.opacity = "0.6";
    badge.classList.add("visible");
  } else {
    // Returning student — let them enter their own number
    semInput.value = "";
    semInput.readOnly = false;
    semInput.style.opacity = "1";
    badge.classList.remove("visible");
  }
}

function predictSemester(startSem, startYear, numSemesters) {
  const startIdx = SEMESTERS.indexOf(startSem);
  const list = [];
  for (let i = 0; i < numSemesters; i++) {
    const semIdx = (startIdx + i) % SEMESTERS.length;
    const year   = startYear + Math.floor((startIdx + i) / SEMESTERS.length);
    list.push(`${SEMESTERS[semIdx]} ${year}`);
  }
  return list;
}

function iworkYears(numSemesters) {
  if (numSemesters <= 3)  return 1;
  if (numSemesters <= 6)  return 2;
  if (numSemesters <= 9)  return 3;
  if (numSemesters <= 12) return 4;
  return Math.ceil(numSemesters / 3);
}

function calculate(numSemesters, coa, sponsorFunds, personalFunds) {
  const result1    = ((sponsorFunds * 4) / 12) * numSemesters;
  const result2    = personalFunds * iworkYears(numSemesters);
  const initialCal = ((coa * 4 / 12) * numSemesters) - result1;
  const result3    = initialCal - result2;
  return { sponsor: result1, personal: result2, iwork: result3 };
}

function copyVal(el, valId) {
  const text = $(valId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    el.classList.add("copied");
    setTimeout(() => el.classList.remove("copied"), 1500);
  });
}

function onSubmit() {
  if (!validate()) return;

  const startSem     = $("startSem").value;
  const startYear    = intVal("startYear");
  const numSemesters = intVal("numSemesters");
  const coa          = parseFloat($("costOfAttendance").value) || 0;
  const sponsor      = parseFloat($("prgSponFunds").value)     || 0;
  const personal     = parseFloat($("personalFunds").value)    || 0;

  // Timeline
  const semList = predictSemester(startSem, startYear, numSemesters);
  const gradSem = semList[semList.length - 1];

  // Financials
  const { sponsor: s, personal: p, iwork: iw } = calculate(numSemesters, coa, sponsor, personal);

  // Render results
  $("r-sponsor").textContent  = fmt(s);
  $("r-personal").textContent = fmt(p);
  $("r-iwork").textContent    = fmt(iw);
  $("r-grad").textContent     = gradSem;

  $("semesterList").innerHTML = semList.map((sem, i) =>
    i === semList.length - 1
      ? `<span class="last-sem">▸ ${sem} (graduation)</span>`
      : sem
  ).join("<br/>");

  $("results").classList.add("visible");
  $("results").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Initialize on load — default state is new student (unchecked)
onReturningChange();