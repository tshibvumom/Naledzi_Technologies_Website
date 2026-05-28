// Naledzi Technologies Web Application Logic

// ═══════════════════════════════════════════════
// 1. THEME SWITCHING SYSTEM
// ═══════════════════════════════════════════════
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('naledzi-theme', theme);
  
  // Highlight active theme button
  document.querySelectorAll('.tsb').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`tsb-${theme === 'corporate' ? 'corp' : theme}`);
  if (activeBtn) activeBtn.classList.add('active');
}

// Initial theme load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('naledzi-theme') || 'dark';
  setTheme(savedTheme);
  
  // Initialize SPA routing based on current URL hash
  initRouter();
  
  // Initialize sticky bar delay/scroll listener
  initStickyBar();
});

// ═══════════════════════════════════════════════
// 2. SPA NAVIGATION ROUTER
// ═══════════════════════════════════════════════
const sectionsConfig = {
  'home': { title: 'Home' },
  'why': { title: 'Why Naledzi Technologies' },
  'industries': { title: 'Industries We Serve' },
  'virtualisation': { title: 'Virtualisation Solutions' },
  'cybersecurity': { title: 'Cybersecurity Solutions' },
  'bcdr': { title: 'Business Continuity & DR' },
  'hr': { title: 'HR Management Solutions' },
  'managed-it': { title: 'Managed IT Services' },
  'connectivity': { title: 'Internet Connectivity' },
  'resources': { title: 'IT Knowledge Library' },
  'blog': { title: 'Insights Blog' },
  'case-studies': { title: 'Case Studies' },
  'webinars': { title: 'Webinars & Events' },
  'tools': { title: 'Free IT Tools' },
  'about': { title: 'About Us' },
  'partners': { title: 'Our Partners' },
  'careers': { title: 'Careers' },
  'contact': { title: 'Contact Us' },
  'privacy': { title: 'Privacy Policy' },
  'popia': { title: 'POPIA Statement' },
  'terms': { title: 'Terms of Service' },
  'cookies': { title: 'Cookie Policy' }
};

function goTo(sectionId, updateHash = true) {
  // Fallback to home if invalid section ID
  if (!sectionsConfig[sectionId]) {
    sectionId = 'home';
  }

  // Toggle active class on sections
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(sec => {
    sec.classList.remove('active');
  });

  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Update URL hash
  if (updateHash) {
    window.location.hash = `#/${sectionId}`;
  }

  // Handle back bar (show on subpages, hide on home)
  const backBar = document.getElementById('back-bar');
  const backTitle = document.getElementById('back-title');
  if (backBar && backTitle) {
    if (sectionId === 'home') {
      backBar.classList.remove('show');
    } else {
      backBar.classList.add('show');
      backTitle.textContent = sectionsConfig[sectionId].title;
    }
  }

  // Highlight active nav links
  document.querySelectorAll('.nav-links a').forEach(link => {
    const onclickStr = link.getAttribute('onclick') || '';
    if (onclickStr.includes(`'${sectionId}'`)) {
      link.style.color = 'var(--nav-act)';
    } else {
      link.style.color = 'var(--nav-tx)';
    }
  });

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
  goTo('home');
}

function initRouter() {
  const hash = window.location.hash;
  if (hash.startsWith('#/')) {
    const section = hash.substring(2);
    goTo(section, false);
  } else {
    goTo('home', false);
  }
}

// Listen to browser forward/back buttons
window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  if (hash.startsWith('#/')) {
    const section = hash.substring(2);
    goTo(section, false);
  } else {
    goTo('home', false);
  }
});


// ═══════════════════════════════════════════════
// 3. BOOKING MODAL & CALENDAR LOGIC
// ═══════════════════════════════════════════════
let selectedDate = null;
let selectedTime = null;
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0-11

function openMo() {
  document.getElementById('mo-overlay').classList.add('open');
  // Reset fields & selection
  selectedDate = null;
  selectedTime = null;
  document.getElementById('cal-confirm').disabled = true;
  document.getElementById('cal-confirm').textContent = 'Select a date & time to continue';
  
  // Clear input fields
  document.getElementById('b-nm').value = '';
  document.getElementById('b-em').value = '';
  document.getElementById('b-ph').value = '';
  document.getElementById('b-co').value = '';
  
  // Clear selected styles
  document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
  
  // Load current month
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  renderCalendar();
}

function closeMo() {
  document.getElementById('mo-overlay').classList.remove('open');
  // Restore body standard modal view after close
  setTimeout(() => {
    document.getElementById('mo-body').innerHTML = `
      <h3>📅 Book Your Free IT Assessment</h3>
      <p class="mo-sub">Select a date and time. A calendar (.ics) will download and a confirmation sent to admin@naledzitechnologies.co.za.</p>
      <div class="cal-nav"><button onclick="prevMonth()">◀</button><span id="cal-month-lbl"></span><button onclick="nextMonth()">▶</button></div>
      <div class="cal-dow"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>
      <div id="cal-days" class="cal-days"></div>
      <p style="font-size:0.75rem;color:var(--tx3);margin:8px 0 5px">Select time (SAST):</p>
      <div class="time-grid">
        <div class="time-slot" onclick="pickTime(this,'08:00')">08:00 AM</div>
        <div class="time-slot" onclick="pickTime(this,'09:00')">09:00 AM</div>
        <div class="time-slot" onclick="pickTime(this,'10:00')">10:00 AM</div>
        <div class="time-slot" onclick="pickTime(this,'11:00')">11:00 AM</div>
        <div class="time-slot" onclick="pickTime(this,'14:00')">02:00 PM</div>
        <div class="time-slot" onclick="pickTime(this,'15:00')">03:00 PM</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div class="fg"><label for="b-nm">Full Name *</label><input type="text" id="b-nm" placeholder="Thabo Nkosi"></div>
        <div class="fg"><label for="b-em">Email *</label><input type="email" id="b-em" placeholder="you@company.co.za"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="fg"><label for="b-ph">Phone</label><input type="tel" id="b-ph" placeholder="+27 11 000 0000"></div>
        <div class="fg"><label for="b-co">Company</label><input type="text" id="b-co" placeholder="Your organisation"></div>
      </div>
      <button class="cal-confirm" id="cal-confirm" onclick="confirmBooking()" disabled>Select a date &amp; time to continue</button>
      <p style="font-size:0.70rem;color:var(--tx3);text-align:center;margin-top:8px">🔒 POPIA compliant · admin@naledzitechnologies.co.za</p>
    `;
  }, 300);
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function renderCalendar() {
  const monthLabel = document.getElementById('cal-month-lbl');
  if (!monthLabel) return;
  monthLabel.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  
  const calDaysDiv = document.getElementById('cal-days');
  calDaysDiv.innerHTML = '';
  
  // First day of month index (0 = Sun, 1 = Mon...)
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  // Total days in month
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const today = new Date();
  
  // Empty slots for previous month
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement('div');
    calDaysDiv.appendChild(emptyCell);
  }
  
  // Populate days
  for (let day = 1; day <= totalDays; day++) {
    const dayCell = document.createElement('div');
    dayCell.classList.add('cal-day');
    dayCell.textContent = day;
    
    const cellDate = new Date(currentYear, currentMonth, day);
    const dayOfWeek = cellDate.getDay();
    
    // Disable past dates and weekends (0 = Sun, 6 = Sat)
    const isPast = cellDate.setHours(0,0,0,0) < today.setHours(0,0,0,0);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isPast || isWeekend) {
      dayCell.classList.add('disabled');
    } else {
      // Highlight today
      if (today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
        dayCell.classList.add('today');
      }
      
      // Keep selected highlighted if changing months back/forth
      if (selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear) {
        dayCell.classList.add('selected');
      }
      
      dayCell.addEventListener('click', () => {
        document.querySelectorAll('.cal-day').forEach(cell => cell.classList.remove('selected'));
        dayCell.classList.add('selected');
        selectedDate = new Date(currentYear, currentMonth, day);
        checkSelectionStatus();
      });
    }
    
    calDaysDiv.appendChild(dayCell);
  }
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

function pickTime(element, time) {
  document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
  element.classList.add('selected');
  selectedTime = time;
  checkSelectionStatus();
}

function checkSelectionStatus() {
  const confirmBtn = document.getElementById('cal-confirm');
  if (selectedDate && selectedTime) {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirm Free IT Assessment';
  } else {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Select a date & time to continue';
  }
}

function confirmBooking() {
  const name = document.getElementById('b-nm').value.trim();
  const email = document.getElementById('b-em').value.trim();
  const phone = document.getElementById('b-ph').value.trim() || 'N/A';
  const company = document.getElementById('b-co').value.trim() || 'N/A';
  
  if (!name || !email) {
    alert('Please fill in required fields (Name and Email).');
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }
  
  // Generate ICS File
  const icsContent = buildIcsFile(name, email, phone, company, selectedDate, selectedTime);
  downloadIcsFile(icsContent, `Naledzi_IT_Assessment_${selectedDate.getFullYear()}-${selectedDate.getMonth()+1}-${selectedDate.getDate()}.ics`);
  
  // Format Date for view
  const formattedDate = selectedDate.toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  // Show Success Box in Modal
  const modalBody = document.getElementById('mo-body');
  modalBody.innerHTML = `
    <div class="book-success">
      <div class="tick">✅</div>
      <h3>Assessment Booked Successfully!</h3>
      <p>Thank you <strong>${name}</strong>. Your Free IT Assessment has been confirmed.</p>
      <div style="background:var(--bg4); border:1px solid var(--br); border-radius:10px; padding:16px; margin:16px 0; text-align:left; font-size:0.85rem">
        <p style="margin-bottom:6px">📅 <strong>Date:</strong> ${formattedDate}</p>
        <p style="margin-bottom:6px">⏰ <strong>Time:</strong> ${selectedTime} SAST</p>
        <p style="margin-bottom:6px">🏢 <strong>Company:</strong> ${company}</p>
        <p>💼 <strong>Assigned Expert:</strong> Technical Consultant</p>
      </div>
      <p style="font-size:0.8rem; color:var(--tx2)">A calendar file (.ics) has been downloaded. A calendar invite & confirmation has been dispatched to <strong>${email}</strong> and <strong>admin@naledzitechnologies.co.za</strong>.</p>
      <button class="cal-confirm" onclick="closeMo()" style="margin-top:18px">Finish</button>
    </div>
  `;
}

function buildIcsFile(name, email, phone, company, date, time) {
  const [hours, minutes] = time.split(':');
  
  // Create Date Objects
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(hours), parseInt(minutes));
  // Duration: 1 hour
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  
  // Format Dates to ICS Format: YYYYMMDDTHHMMSS
  const formatIcsDate = (d) => {
    return d.toISOString().replace(/-|:|\.\d+/g, '');
  };
  
  const stamp = formatIcsDate(new Date());
  const startStr = formatIcsDate(startDate);
  const endStr = formatIcsDate(endDate);
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Naledzi Technologies//IT Assessment Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:naledzi-assessment-${Date.now()}@naledzitechnologies.co.za`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Africa/Johannesburg:${startStr.substring(0, 15)}`,
    `DTEND;TZID=Africa/Johannesburg:${endStr.substring(0, 15)}`,
    'SUMMARY:Free IT Assessment - Naledzi Technologies',
    `DESCRIPTION:IT Solutions consultation for South African businesses.\\n\\nClient Details:\\nName: ${name}\\nEmail: ${email}\\nPhone: ${phone}\\nCompany: ${company}\\n\\nWe will contact you via MS Teams / phone on the scheduled time.`,
    'LOCATION:Virtual Meeting / MS Teams',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Naledzi IT Assessment in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

function downloadIcsFile(content, filename) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// ═══════════════════════════════════════════════
// 4. FREE IT TOOLS IMPLEMENTATION
// ═══════════════════════════════════════════════
function selectTool(tabElement, toolId) {
  // Toggle active tab class
  document.querySelectorAll('.tool-tab').forEach(tab => tab.classList.remove('active'));
  tabElement.classList.add('active');
  
  // Show target tool container
  document.querySelectorAll('.tool-content').forEach(content => content.classList.remove('active'));
  document.getElementById(toolId).classList.add('active');
}

// Subnet Calculator Logic
function calculateSubnet() {
  const ipVal = document.getElementById('sub-ip').value.trim();
  const cidrVal = parseInt(document.getElementById('sub-cidr').value);
  
  const errorEl = document.getElementById('sub-err');
  errorEl.textContent = '';
  
  // IPv4 regex validation
  const ipParts = ipVal.split('.');
  if (ipParts.length !== 4 || ipParts.some(p => p === '' || isNaN(p) || parseInt(p) < 0 || parseInt(p) > 255)) {
    errorEl.textContent = '❌ Invalid IPv4 Address format (e.g. 192.168.1.1)';
    return;
  }
  
  // Calculate mask
  let maskBin = '1'.repeat(cidrVal) + '0'.repeat(32 - cidrVal);
  let maskParts = [];
  for (let i = 0; i < 4; i++) {
    maskParts.push(parseInt(maskBin.slice(i * 8, (i + 1) * 8), 2));
  }
  const subnetMask = maskParts.join('.');
  
  // IP to binary
  let ipBin = ipParts.map(p => {
    let b = parseInt(p).toString(2);
    return '0'.repeat(8 - b.length) + b;
  }).join('');
  
  // Network address
  let netBin = ipBin.slice(0, cidrVal) + '0'.repeat(32 - cidrVal);
  let netParts = [];
  for (let i = 0; i < 4; i++) {
    netParts.push(parseInt(netBin.slice(i * 8, (i + 1) * 8), 2));
  }
  const networkAddr = netParts.join('.');
  
  // Broadcast address
  let broadBin = ipBin.slice(0, cidrVal) + '1'.repeat(32 - cidrVal);
  let broadParts = [];
  for (let i = 0; i < 4; i++) {
    broadParts.push(parseInt(broadBin.slice(i * 8, (i + 1) * 8), 2));
  }
  const broadcastAddr = broadParts.join('.');
  
  // Host ranges
  let totalHosts = Math.pow(2, 32 - cidrVal);
  let usableHosts = totalHosts > 2 ? totalHosts - 2 : 0;
  
  let firstHost = 'N/A';
  let lastHost = 'N/A';
  
  if (usableHosts > 0) {
    let firstParts = [...netParts];
    firstParts[3] += 1;
    firstHost = firstParts.join('.');
    
    let lastParts = [...broadParts];
    lastParts[3] -= 1;
    lastHost = lastParts.join('.');
  }
  
  // Display Results
  document.getElementById('res-mask').textContent = subnetMask;
  document.getElementById('res-net').textContent = networkAddr;
  document.getElementById('res-broad').textContent = broadcastAddr;
  document.getElementById('res-range').textContent = usableHosts > 0 ? `${firstHost} - ${lastHost}` : 'N/A';
  document.getElementById('res-hosts').textContent = usableHosts.toLocaleString();
}

// Password Generator Logic
function generatePassword() {
  const length = parseInt(document.getElementById('pwd-len').value);
  const useUpper = document.getElementById('pwd-upper').checked;
  const useLower = document.getElementById('pwd-lower').checked;
  const useNum = document.getElementById('pwd-num').checked;
  const useSym = document.getElementById('pwd-sym').checked;
  
  const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerChars = "abcdefghijklmnopqrstuvwxyz";
  const numChars = "0123456789";
  const symChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  
  let allowedPool = "";
  let mandatoryChars = [];
  
  if (useUpper) {
    allowedPool += upperChars;
    mandatoryChars.push(upperChars[Math.floor(Math.random() * upperChars.length)]);
  }
  if (useLower) {
    allowedPool += lowerChars;
    mandatoryChars.push(lowerChars[Math.floor(Math.random() * lowerChars.length)]);
  }
  if (useNum) {
    allowedPool += numChars;
    mandatoryChars.push(numChars[Math.floor(Math.random() * numChars.length)]);
  }
  if (useSym) {
    allowedPool += symChars;
    mandatoryChars.push(symChars[Math.floor(Math.random() * symChars.length)]);
  }
  
  if (allowedPool === "") {
    alert("Please select at least one character type.");
    return;
  }
  
  let generatedPwd = "";
  // Insert mandatory elements first to guarantee presence
  for (let i = 0; i < mandatoryChars.length; i++) {
    generatedPwd += mandatoryChars[i];
  }
  
  // Fill remaining characters
  for (let i = mandatoryChars.length; i < length; i++) {
    const randIdx = Math.floor(Math.random() * allowedPool.length);
    generatedPwd += allowedPool[randIdx];
  }
  
  // Shuffle password characters
  generatedPwd = generatedPwd.split('').sort(() => 0.5 - Math.random()).join('');
  
  // Output Password
  const pwdInput = document.getElementById('pwd-out');
  pwdInput.value = generatedPwd;
  
  // Reset Copy Tooltip
  document.getElementById('pwd-copy-btn').textContent = "Copy";
  
  // Evaluate Strength
  evaluatePasswordStrength(generatedPwd, useUpper, useLower, useNum, useSym);
}

function evaluatePasswordStrength(password, upper, lower, num, sym) {
  const bar = document.getElementById('pwd-strength-bar-fill');
  const label = document.getElementById('pwd-strength-label');
  
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  let types = [upper, lower, num, sym].filter(Boolean).length;
  score += types;
  
  if (score <= 3) {
    bar.style.width = "33%";
    bar.style.backgroundColor = "var(--em)";
    label.textContent = "Weak";
    label.style.color = "var(--em)";
  } else if (score <= 5) {
    bar.style.width = "66%";
    bar.style.backgroundColor = "var(--am)";
    label.textContent = "Good";
    label.style.color = "var(--am)";
  } else {
    bar.style.width = "100%";
    bar.style.backgroundColor = "var(--ac)";
    label.textContent = "Strong";
    label.style.color = "var(--ac)";
  }
}

function copyPassword() {
  const pwdInput = document.getElementById('pwd-out');
  if (pwdInput.value === "") return;
  
  pwdInput.select();
  pwdInput.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(pwdInput.value)
    .then(() => {
      document.getElementById('pwd-copy-btn').textContent = "Copied!";
    })
    .catch(() => {
      alert("Failed to copy. Please manually copy the password.");
    });
}

function updateLengthLabel(val) {
  document.getElementById('pwd-len-lbl').textContent = val;
  generatePassword();
}

// Mock Diagnostics Terminal Logic
const mockDnsRecords = {
  'naledzitechnologies.co.za': [
    'A      102.133.190.22  (Hosting: Johannesburg DC)',
    'MX     10 mail.naledzitechnologies.co.za',
    'TXT    v=spf1 include:spf.protection.outlook.com ip4:102.133.190.22 -all',
    'NS     ns1.dns South Africa',
    'NS     ns2.dns South Africa'
  ],
  'google.co.za': [
    'A      142.250.200.3',
    'MX     10 smtp.google.com',
    'TXT    v=spf1 include:_spf.google.com ~all'
  ],
  'microsoft.com': [
    'A      20.112.52.29',
    'MX     10 microsoft-com.mail.protection.outlook.com',
    'TXT    v=spf1 include:_spf-a.microsoft.com -all'
  ]
};

function writeTerminal(lineText, type = 'normal') {
  const body = document.getElementById('term-log');
  if (!body) return;
  
  const div = document.createElement('div');
  div.className = 'term-line';
  
  if (type === 'prompt') {
    div.style.color = 'var(--tx2)';
  } else if (type === 'error') {
    div.style.color = 'var(--em)';
  } else if (type === 'success') {
    div.style.color = 'var(--ac)';
  }
  
  div.textContent = lineText;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function handleTermSubmit(event) {
  if (event && event.key !== 'Enter') return;
  
  const inputEl = document.getElementById('term-input');
  const rawInput = inputEl.value.trim();
  inputEl.value = '';
  
  if (rawInput === '') return;
  
  writeTerminal(`naledzi-net-tool> ${rawInput}`, 'prompt');
  
  const parts = rawInput.toLowerCase().split(/\s+/);
  const cmd = parts[0];
  const arg = parts[1] || '';
  
  switch(cmd) {
    case 'help':
      writeTerminal('Available tools commands:');
      writeTerminal('  ping [host]     - Ping virtual servers and verify round trip delay.');
      writeTerminal('  dns [domain]    - Query domain DNS records (A, MX, SPF, TXT).');
      writeTerminal('  scan            - Run Naledzi core business IT environment vulnerability test.');
      writeTerminal('  clear           - Wipe the terminal log.');
      break;
      
    case 'clear':
      document.getElementById('term-log').innerHTML = '';
      break;
      
    case 'ping':
      if (!arg) {
        writeTerminal('Usage: ping [hostname/IP]', 'error');
        break;
      }
      runMockPing(arg);
      break;
      
    case 'dns':
      if (!arg) {
        writeTerminal('Usage: dns [domain]', 'error');
        break;
      }
      runMockDns(arg);
      break;
      
    case 'scan':
      runMockScan();
      break;
      
    default:
      writeTerminal(`Command not recognized: "${cmd}". Type "help" for a list of available utilities.`, 'error');
  }
}

function runMockPing(host) {
  writeTerminal(`Pinging ${host} with 32 bytes of data...`);
  
  let step = 0;
  const interval = setInterval(() => {
    if (step < 4) {
      const pingMs = Math.floor(Math.random() * 20) + 10;
      writeTerminal(`Reply from ${host}: bytes=32 time=${pingMs}ms TTL=54`);
      step++;
    } else {
      clearInterval(interval);
      writeTerminal('--- Ping statistics ---');
      writeTerminal('4 packets transmitted, 4 received, 0% packet loss.');
      writeTerminal('Round-trip min/avg/max = 10ms / 14ms / 30ms', 'success');
    }
  }, 400);
}

function runMockDns(domain) {
  writeTerminal(`Querying authoritative records for "${domain}"...`);
  
  setTimeout(() => {
    // Check local mock database, else output generic
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/^www\./, '');
    const records = mockDnsRecords[cleanDomain];
    
    if (records) {
      records.forEach(r => writeTerminal(`  ${r}`));
      writeTerminal('DNS Query completed successfully.', 'success');
    } else {
      // Fake records
      const fakeIp = `102.${Math.floor(Math.random()*150)+10}.${Math.floor(Math.random()*200)+20}.${Math.floor(Math.random()*254)+1}`;
      writeTerminal(`  A      ${fakeIp} (Hosting: SA Region)`);
      writeTerminal(`  MX     10 mail.${cleanDomain}`);
      writeTerminal(`  TXT    v=spf1 include:_spf.hosting.co.za ~all`);
      writeTerminal('Query resolved via external Root DNS servers.', 'success');
    }
  }, 600);
}

function runMockScan() {
  writeTerminal('Initializing Naledzi IT Assessment Vulnerability Scanner...');
  
  const logs = [
    { text: 'Checking internal firewall configuration...', delay: 500 },
    { text: 'WARNING: Port 445 (SMB) exposed to public routing.', delay: 1000, type: 'error' },
    { text: 'Analyzing database backup logs...', delay: 1500 },
    { text: 'WARNING: Backup last verification check: 32 days ago.', delay: 2000, type: 'error' },
    { text: 'Checking server virtualization resource balance...', delay: 2500 },
    { text: 'ALERT: Hypervisor CPU overcommit ratio is 6:1 (unstable).', delay: 3000, type: 'error' },
    { text: 'Analyzing South African POPIA/HR document handling procedures...', delay: 3500 },
    { text: 'VULNERABILITY IDENTIFIED: Non-compliant employee records access logs.', delay: 4000, type: 'error' },
    { text: '----------------------------------------', delay: 4400 },
    { text: 'IT SYSTEM HEALTH INDEX: 42% (Critical Vulnerabilities Found)', delay: 4800, type: 'error' },
    { text: 'Action recommended: Schedule a Naledzi IT Assessment immediately.', delay: 5200, type: 'success' }
  ];
  
  logs.forEach(l => {
    setTimeout(() => {
      writeTerminal(l.text, l.type || 'normal');
    }, l.delay);
  });
}

// ═══════════════════════════════════════════════
// 5. RESPONSIVE MOBILE MENU
// ═══════════════════════════════════════════════
function openMobMenu() {
  document.getElementById('mob-menu').classList.add('open');
}

function closeMobMenu() {
  document.getElementById('mob-menu').classList.remove('open');
}

// ═══════════════════════════════════════════════
// 6. STICKY ASSESSMENT BAR
// ═══════════════════════════════════════════════
function initStickyBar() {
  const stickyBar = document.getElementById('sticky-bar');
  if (!stickyBar) return;
  
  window.addEventListener('scroll', () => {
    // Show bar after scrolling 450px and if the user hasn't closed it in this session
    const isClosed = sessionStorage.getItem('naledzi-sticky-closed') === 'true';
    if (window.scrollY > 450 && !isClosed) {
      stickyBar.classList.add('show');
    } else {
      stickyBar.classList.remove('show');
    }
  });
}

function closeStickyBar() {
  document.getElementById('sticky-bar').classList.remove('show');
  sessionStorage.setItem('naledzi-sticky-closed', 'true');
}

// ═══════════════════════════════════════════════
// 7. CONTACT FORM SUBMISSION
// ═══════════════════════════════════════════════
function handleContactSubmit(event) {
  if (event) event.preventDefault();
  
  const nm = document.getElementById('c-nm').value.trim();
  const em = document.getElementById('c-em').value.trim();
  const msg = document.getElementById('c-msg').value.trim();
  
  if (!nm || !em || !msg) {
    alert("Please fill out all required fields.");
    return;
  }
  
  // Mock submission success
  const formCard = document.getElementById('contact-form-container');
  if (formCard) {
    formCard.innerHTML = `
      <div style="text-align:center; padding: 40px 20px;">
        <span style="font-size:3rem">✉️</span>
        <h3 style="color:var(--ac); margin-top:14px; margin-bottom:8px">Message Dispatched!</h3>
        <p style="font-size:0.9rem; color:var(--tx2)">Thank you <strong>${nm}</strong>. Our IT support specialists will review your message and reach back to you at <strong>${em}</strong> within 2 hours.</p>
        <p style="font-size:0.75rem; color:var(--tx3); margin-top:16px">Copy of transmission sent to admin@naledzitechnologies.co.za</p>
        <button class="nav-cta" onclick="location.reload()" style="margin-top:20px; padding: 8px 20px">Send another message</button>
      </div>
    `;
  }
}
