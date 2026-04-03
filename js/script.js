let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || ['Food', 'Transport', 'Fun'];
let expenseChart;

async function initHeader() {
    const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', dateOptions);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
                const data = await res.json();
                document.getElementById('user-location').innerText = data.city || data.locality || "Jakarta";
            } catch { document.getElementById('user-location').innerText = "Jakarta"; }
        }, () => { document.getElementById('user-location').innerText = "Jakarta"; });
    }
}

function syncCategories() {
    const select = document.getElementById('category-select');
    const miniList = document.getElementById('custom-category-list');
    select.innerHTML = '';
    miniList.innerHTML = '';

    categories.forEach((cat, index) => {
        const opt = document.createElement('option');
        opt.value = cat; opt.innerText = cat;
        select.appendChild(opt);

        const li = document.createElement('li');
        li.className = 'category-item';
        li.innerHTML = `<span>${cat}</span><button class="delete-cat-btn" onclick="removeCategory(${index})">Delete</button>`;
        miniList.appendChild(li);
    });
    localStorage.setItem('categories', JSON.stringify(categories));
    renderApp();
}

document.getElementById('add-category-btn').addEventListener('click', () => {
    const input = document.getElementById('new-category-name');
    const val = input.value.trim();
    if (val && !categories.includes(val)) {
        categories.push(val);
        input.value = '';
        syncCategories();
    }
});

function removeCategory(idx) {
    if (categories.length > 1) {
        categories.splice(idx, 1);
        syncCategories();
    }
}

function renderApp() {
    const list = document.getElementById('transaction-list');
    const summaryList = document.getElementById('monthly-summary-list');
    list.innerHTML = '';
    summaryList.innerHTML = '';

    let totalBalance = 0;
    const catTotals = {};
    const monthTotals = {};
    const today = new Date().toDateString();
    let todayItems = 0;

    categories.forEach(c => catTotals[c] = 0);

    transactions.sort((a, b) => b.id - a.id).forEach(t => {
        totalBalance += t.amount;
        if (catTotals[t.category] !== undefined) catTotals[t.category] += t.amount;

        const date = new Date(t.id);
        const mY = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        monthTotals[mY] = (monthTotals[mY] || 0) + t.amount;

        if (date.toDateString() === today) todayItems++;

        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
            <div><strong>${t.name}</strong><br><small>${t.category} • $${t.amount.toLocaleString()}</small></div>
            <button class="delete-btn" onclick="removeTransaction(${t.id})">Delete</button>
        `;
        list.appendChild(li);
    });

    document.getElementById('total-balance').innerText = `$${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('today-count').innerText = `${todayItems} Items`;
    updateChart(catTotals);

    Object.keys(monthTotals).forEach(month => {
        const li = document.createElement('li');
        li.className = 'summary-item';
        li.innerHTML = `<span class="summary-month">${month}</span><span class="summary-amount">$${monthTotals[month].toLocaleString()}</span>`;
        summaryList.appendChild(li);
    });

    localStorage.setItem('transactions', JSON.stringify(transactions));
}

document.getElementById('transaction-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('item-name').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category-select').value;
    transactions.push({ id: Date.now(), name, amount, category });
    renderApp();
    e.target.reset();
});

function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    renderApp();
}

function updateChart(dataValues) {
    const ctx = document.getElementById('expense-chart').getContext('2d');
    if (expenseChart) expenseChart.destroy();
    const isLight = document.body.classList.contains('light-mode');

    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(dataValues),
            datasets: [{
                data: Object.values(dataValues),
                backgroundColor: ['#ff6600', '#00cc66', '#5577ff', '#ff3333', '#ffcc00', '#9933ff', '#00cccc'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: isLight ? '#333' : '#fff', font: { family: "'Libre Baskerville', serif", size: 11 } } }
            }
        }
    });
}

const themeBtn = document.getElementById('theme-toggle');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeBtn.innerText = isLight ? 'dark mode' : 'light mode';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    renderApp();
});

if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    themeBtn.innerText = 'dark mode';
}

initHeader();
syncCategories();