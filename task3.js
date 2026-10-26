const SOLD_OUT_DATES = ['2026-11-15', '2026-11-20'];

const ticketTypes = [
    { id: 'standard', name: 'Standard', price: 5000, seatsLeft: 6 },
    { id: 'vip', name: 'VIP', price: 10000, seatsLeft: 3 }
];

const PROMO_LIST = [
    { code: 'SALE10', discount: 10 },
    { code: 'VIP20', discount: 20 }
];

const form = document.getElementById('ticket-form');
form.noValidate = true;

const eventInput = document.getElementById('event-input');
const dateInput = document.getElementById('date-input');
const typeInput = document.getElementById('type-input');
const qtyInput = document.getElementById('qty-input');
const nameInput = document.getElementById('name-input');
const emailInput = document.getElementById('email-input');
const promoInput = document.getElementById('promo-input');
const summaryEl = document.getElementById('form-summary');
const resultEl = document.getElementById('ticket-result');

const fields = [eventInput, dateInput, typeInput, qtyInput, nameInput, emailInput, promoInput];
const touched = new Set();

function renderTicketOptions() {
    const saved = typeInput.value;
    typeInput.replaceChildren();

    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '-- Select type --';
    typeInput.appendChild(emptyOpt);

    for (const item of ticketTypes) {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = `${item.name} (${item.price} KZT, ${item.seatsLeft} left)`;
        typeInput.appendChild(opt);
    }
    typeInput.value = saved;
}

function validateField(field) {
    const val = field.value.trim();
    let msg = '';

    field.setCustomValidity('');

    if (field.validity.valueMissing) {
        msg = 'This field is required.';
    } else if (field.validity.typeMismatch) {
        msg = 'Please enter a valid email address with @.';
    } else if (field.validity.tooShort) {
        msg = 'Name must be at least 4 characters long.';
    } else if (field.validity.rangeUnderflow || field.validity.rangeOverflow) {
        msg = 'Value is out of the allowed range.';
    } else if (field === dateInput && SOLD_OUT_DATES.includes(val)) {
        msg = 'This date is sold out. Choose another date.';
    } else if (field === qtyInput) {
        const selected = ticketTypes.find((t) => t.id === typeInput.value);
        if (selected && Number(val) > selected.seatsLeft) {
            msg = `Only ${selected.seatsLeft} seats left for ${selected.name}.`;
        }
    } else if (field === nameInput && !val.includes(' ')) {
        msg = 'Enter both First and Last name separated by a space.';
    } else if (field === promoInput && val !== '') {
        const foundPromo = PROMO_LIST.find((p) => p.code === val.toUpperCase());
        if (!foundPromo) {
            msg = 'Invalid promo code. Use SALE10 or VIP20.';
        }
    }

    field.setCustomValidity(msg);

    const errEl = document.getElementById(`${field.id}-err`);
    if (touched.has(field)) {
        errEl.textContent = msg;
        field.setAttribute('aria-invalid', msg !== '' ? 'true' : 'false');
        field.classList.toggle('is-error', msg !== '');
        field.classList.toggle('is-success', msg === '' && val !== '');
    }

    return msg === '';
}

function updatePreview() {
    const selected = ticketTypes.find((t) => t.id === typeInput.value);
    const qty = Number(qtyInput.value) || 0;
    const promo = PROMO_LIST.find((p) => p.code === promoInput.value.trim().toUpperCase());

    let total = selected ? selected.price * qty : 0;
    if (promo) {
        total = total * (1 - promo.discount / 100);
    }

    document.getElementById('prev-event').textContent = eventInput.value || '—';
    document.getElementById('prev-date').textContent = dateInput.value || '—';
    document.getElementById('prev-type').textContent = selected ? selected.name : '—';
    document.getElementById('prev-qty').textContent = String(qty);
    document.getElementById('prev-name').textContent = nameInput.value.trim() || '—';
    document.getElementById('prev-email').textContent = emailInput.value.trim() || '—';
    document.getElementById('prev-total').textContent = `${total} KZT`;
}

for (const field of fields) {
    field.addEventListener('blur', () => {
        touched.add(field);
        validateField(field);
    });

    const onFieldUpdate = () => {
        if (touched.has(field)) {
            validateField(field);
        }
        if (field === typeInput && touched.has(qtyInput)) {
            validateField(qtyInput);
        }
        updatePreview();
    };

    field.addEventListener('input', onFieldUpdate);
    field.addEventListener('change', onFieldUpdate);
}

form.addEventListener('submit', (event) => {
    event.preventDefault();

    let errorCount = 0;
    let firstBadField = null;

    for (const field of fields) {
        touched.add(field);
        const ok = validateField(field);
        if (!ok) {
            errorCount += 1;
            if (!firstBadField) {
                firstBadField = field;
            }
        }
    }

    if (errorCount > 0) {
        summaryEl.textContent = `Form has ${errorCount} error(s). Please fix them.`;
        summaryEl.classList.remove('hidden');
        firstBadField.focus();
        return;
    }

    summaryEl.classList.add('hidden');

    const selected = ticketTypes.find((t) => t.id === typeInput.value);
    const qty = Number(qtyInput.value);
    selected.seatsLeft -= qty;

    const randomCode = 'BK-' + Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
    const card = document.createElement('div');
    card.className = 'panel is-success';

    const title = document.createElement('h3');
    title.textContent = `Ticket Confirmed! Code: ${randomCode}`;

    const details = document.createElement('p');
    details.textContent = `${eventInput.value} | ${selected.name} x${qty} | ${nameInput.value.trim()}`;

    card.appendChild(title);
    card.appendChild(details);
    resultEl.replaceChildren(card);

    form.reset();
    touched.clear();
    for (const field of fields) {
        field.setCustomValidity('');
        field.removeAttribute('aria-invalid');
        field.classList.remove('is-error', 'is-success');
        document.getElementById(`${field.id}-err`).textContent = '';
    }
    renderTicketOptions();
    updatePreview();
});

renderTicketOptions();
updatePreview();