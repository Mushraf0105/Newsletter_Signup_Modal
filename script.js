// DOM Elements
const modalOverlay = document.getElementById('modalOverlay');
const modalBox = document.querySelector('.modal-box');
const closeModalBtn = document.getElementById('closeModalBtn');
const triggerModalHero = document.getElementById('triggerModalHero');
const resetStorageBtn = document.getElementById('resetStorageBtn');

const newsletterForm = document.getElementById('newsletterForm');
const emailInput = document.getElementById('emailInput');
const submitBtn = document.getElementById('submitBtn');
const errorMessage = document.getElementById('errorMessage');

const modalFormView = document.getElementById('modalFormView');
const modalSuccessView = document.getElementById('modalSuccessView');
const userEmailDisplay = document.getElementById('userEmailDisplay');
const successCloseBtn = document.getElementById('successCloseBtn');

const statusNotice = document.getElementById('statusNotice');
const timerCountdown = document.getElementById('timerCountdown');

// State & Config
const DELAY_SECONDS = 3;
let timerId = null;
let countdownInterval = null;

// ==========================================
// 1. Modal Open & Close Functions
// ==========================================

// Function to open the modal
function openModal() {
  modalOverlay.classList.remove('hidden');
  modalOverlay.setAttribute('aria-hidden', 'false');
  emailInput.focus();
}

// Function to close the modal & remember dismissal
function closeModal(dismissPermanently = true) {
  modalOverlay.classList.add('hidden');
  modalOverlay.setAttribute('aria-hidden', 'true');

  if (dismissPermanently) {
    // Save to localStorage so modal doesn't repeatedly pop up
    localStorage.setItem('newsletter_dismissed', 'true');
    updateStatusDisplay();
  }
}

// ==========================================
// 2. Delayed Modal Trigger (setTimeout)
// ==========================================

function startTimer() {
  // Check if user has already dismissed or subscribed
  const isDismissed = localStorage.getItem('newsletter_dismissed');

  if (isDismissed) {
    updateStatusDisplay();
    return;
  }

  let timeLeft = DELAY_SECONDS;
  timerCountdown.textContent = timeLeft;
  statusNotice.innerHTML = `Modal will pop up in <span id="timerCountdown">${timeLeft}</span> seconds...`;

  // Countdown display
  countdownInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      const el = document.getElementById('timerCountdown');
      if (el) el.textContent = timeLeft;
    } else {
      clearInterval(countdownInterval);
    }
  }, 1000);

  // Trigger modal after DELAY_SECONDS using setTimeout
  timerId = setTimeout(() => {
    openModal();
    updateStatusDisplay();
  }, DELAY_SECONDS * 1000);
}

// ==========================================
// 3. Email Validation & Form Submission
// ==========================================

// Standard Email Regex
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

newsletterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const emailValue = emailInput.value.trim();

  // Validate email format
  if (!emailValue) {
    showError('Please enter your email address.');
    return;
  }

  if (!isValidEmail(emailValue)) {
    showError('Please enter a valid email format (e.g. name@domain.com).');
    return;
  }

  // If valid, clear error, disable input & button, and show only success view
  clearError();
  localStorage.setItem('newsletter_dismissed', 'true');
  userEmailDisplay.textContent = emailValue;

  // Disable controls as requested
  emailInput.disabled = true;
  submitBtn.disabled = true;

  // Hide form view and display only success view
  modalFormView.classList.add('hidden');
  modalSuccessView.classList.remove('hidden');
  updateStatusDisplay();
});

// Show error with shake effect
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  emailInput.classList.add('invalid');

  // Trigger shake animation
  modalBox.classList.remove('shake');
  void modalBox.offsetWidth; // Force reflow
  modalBox.classList.add('shake');
  emailInput.focus();
}

// Clear error state
function clearError() {
  errorMessage.textContent = '';
  errorMessage.classList.remove('show');
  emailInput.classList.remove('invalid');
}

// Real-time clearing of error as user types
emailInput.addEventListener('input', () => {
  if (emailInput.classList.contains('invalid')) {
    clearError();
  }
});

// ==========================================
// 4. Modal Dismissal Events
// ==========================================

// 1. Click Close Button (×)
closeModalBtn.addEventListener('click', () => {
  closeModal(true);
});

// 2. Click on Overlay (outside modal box)
modalOverlay.addEventListener('click', (event) => {
  if (event.target === modalOverlay) {
    closeModal(true);
  }
});

// 3. Press Escape key to close
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
    closeModal(true);
  }
});

// 4. Close from Success View
successCloseBtn.addEventListener('click', () => {
  closeModal(true);
});

// ==========================================
// 5. Manual Triggers & Reset Controls
// ==========================================

// Manual open button
triggerModalHero.addEventListener('click', () => openModal());

// Reset localStorage to easily test the delay again
resetStorageBtn.addEventListener('click', () => {
  localStorage.removeItem('newsletter_dismissed');

  // Clear existing timers
  clearTimeout(timerId);
  clearInterval(countdownInterval);

  // Reset form views and re-enable controls
  newsletterForm.reset();
  emailInput.disabled = false;
  submitBtn.disabled = false;
  clearError();
  modalFormView.classList.remove('hidden');
  modalSuccessView.classList.add('hidden');

  // Close modal if open
  closeModal(false);

  // Restart delayed timer
  startTimer();
});

// Helper to update status text on the page
function updateStatusDisplay() {
  const isDismissed = localStorage.getItem('newsletter_dismissed');
  if (isDismissed) {
    statusNotice.innerHTML = `Modal Status: <strong>Dismissed / Stored in localStorage</strong> (Click "Reset Modal" to test again)`;
  }
}

// Initialize on page load
startTimer();
