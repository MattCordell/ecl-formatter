// Access the bundled formatter
const { formatEcl, defaultOptions } = window.EclFormatter;

// Example ECL expressions (from samples/test.ecl)
const examples = [
  {
    name: "Simple concept",
    code: "404684003 |Clinical finding|"
  },
  {
    name: "Descendant operator",
    code: "<< 73211009 |Diabetes mellitus|"
  },
  {
    name: "Logical AND",
    code: "<< 19829001 |Disorder of lung| AND << 301867009 |Edema of trunk|"
  },
  {
    name: "Refinement",
    code: "<< 404684003 |Clinical finding|: 363698007 |Finding site| = << 39057004 |Pulmonary valve|"
  },
  {
    name: "Attribute group",
    code: "<< 404684003 |Clinical finding|: { 363698007 |Finding site| = << 39057004 |Pulmonary valve| }"
  },
  {
    name: "Multiple attributes",
    code: "<< 404684003 |Clinical finding|:363698007 |Finding site| = << 39057004 |Pulmonary valve|, 116676008 |Associated morphology| = << 55641003 |Infarct|"
  },
  {
    name: "Description filter",
    code: '<< 404684003 |Clinical finding| {{ term = "heart" }}'
  },
  {
    name: "Complex example",
    code: '(<< 404684003 |Clinical finding|: { 363698007 |Finding site| = << 39057004 |Pulmonary valve|, 116676008 |Associated morphology| = << 55641003 |Infarct| } ) {{ term = "heart", dialect = en-US }}'
  }
];

// DOM elements
const inputEl = document.getElementById('input');
const outputEl = document.getElementById('output');
const errorEl = document.getElementById('error-display');
const formatBtn = document.getElementById('format-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const exampleBtn = document.getElementById('example-btn');
const examplesList = document.getElementById('examples-list');

// Populate examples list
examples.forEach((example, index) => {
  const li = document.createElement('li');
  const button = document.createElement('button');
  button.textContent = example.code;
  button.title = example.name;
  button.addEventListener('click', () => loadExample(index));
  li.appendChild(button);
  examplesList.appendChild(li);
});

// Format handler
function handleFormat() {
  const input = inputEl.value;

  // Clear previous error
  errorEl.classList.add('hidden');
  errorEl.textContent = '';

  if (!input.trim()) {
    showError('Please enter an ECL expression');
    return;
  }

  try {
    const result = formatEcl(input, defaultOptions);

    if (result.error) {
      showError(result.error);
      outputEl.value = '';
      // Track format errors
      if (window.goatcounter) {
        window.goatcounter.count({ path: 'event-format-error', title: 'Format Error', event: true });
      }
    } else {
      outputEl.value = result.formatted;
      // Track successful format
      if (window.goatcounter) {
        window.goatcounter.count({ path: 'event-format-success', title: 'Format Success', event: true });
      }
    }
  } catch (error) {
    showError(`Unexpected error: ${error.message}`);
    // Track unexpected errors
    if (window.goatcounter) {
      window.goatcounter.count({ path: 'event-format-exception', title: 'Format Exception', event: true });
    }
  }
}

// Copy handler
async function handleCopy() {
  const text = outputEl.value;

  if (!text) {
    showError('Nothing to copy');
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showSuccess('Copied to clipboard!');
    // Track copy action
    if (window.goatcounter) {
      window.goatcounter.count({ path: 'event-copy', title: 'Copy to Clipboard', event: true });
    }
  } catch (err) {
    // Fallback for older browsers
    outputEl.select();
    document.execCommand('copy');
    showSuccess('Copied to clipboard!');
    // Track copy action
    if (window.goatcounter) {
      window.goatcounter.count({ path: 'event-copy', title: 'Copy to Clipboard', event: true });
    }
  }
}

// Clear handler
function handleClear() {
  inputEl.value = '';
  outputEl.value = '';
  errorEl.classList.add('hidden');
  errorEl.textContent = '';
  inputEl.focus();
  // Track clear action
  if (window.goatcounter) {
    window.goatcounter.count({ path: 'event-clear', title: 'Clear Input', event: true });
  }
}

// Load example handler
function loadExample(index) {
  if (index !== undefined) {
    inputEl.value = examples[index].code;
    // Track specific example load
    if (window.goatcounter) {
      window.goatcounter.count({
        path: `event-example-${examples[index].name.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Example: ${examples[index].name}`,
        event: true
      });
    }
  } else {
    // Random example
    const randomIndex = Math.floor(Math.random() * examples.length);
    inputEl.value = examples[randomIndex].code;
    // Track random example load
    if (window.goatcounter) {
      window.goatcounter.count({ path: 'event-example-random', title: 'Example: Random', event: true });
    }
  }
  handleFormat();
}

// Show error
function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

// Show success (temporary toast)
function showSuccess(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--color-success);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 1000;
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Event listeners
formatBtn.addEventListener('click', handleFormat);
copyBtn.addEventListener('click', handleCopy);
clearBtn.addEventListener('click', handleClear);
exampleBtn.addEventListener('click', () => loadExample());

// Format on Enter (Ctrl+Enter in textarea)
inputEl.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    handleFormat();
  }
});

// Auto-focus input on load
inputEl.focus();
