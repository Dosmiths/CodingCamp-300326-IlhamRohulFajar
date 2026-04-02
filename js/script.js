// 1. Inisialisasi Data dari Local Storage [cite: 52]
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let expenseChart;

const transactionForm = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');
const totalBalanceDisplay = document.getElementById('total-balance');

// 2. Fungsi untuk Menampilkan Semua Data (Render) [cite: 30, 31]
function renderApp() {
    // Kosongkan list sebelum diisi ulang
    transactionList.innerHTML = '';
    let total = 0;

    // Data untuk grafik 
    const categoryTotals = { Food: 0, Transport: 0, Fun: 0 };

    transactions.forEach((item) => {
        // Hitung total saldo 
        total += item.amount;
        
        // Hitung total per kategori untuk grafik [cite: 37]
        if (categoryTotals[item.category] !== undefined) {
            categoryTotals[item.category] += item.amount;
        }

        // Tambahkan item ke list UI [cite: 32]
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                <small>${item.category} - $${item.amount.toFixed(2)}</small>
            </div>
            <button class="delete-btn" onclick="deleteTransaction(${item.id})">Delete</button>
        `;
        transactionList.appendChild(li);
    });

    // Update tampilan saldo [cite: 35, 36]
    totalBalanceDisplay.innerText = `$${total.toFixed(2)}`;

    // Update grafik dan simpan data [cite: 38, 52]
    updateChart(categoryTotals);
    saveData();
}

// 3. Fungsi Menambah Transaksi Baru [cite: 24, 26]
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('item-name').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;

    // Validasi field [cite: 27]
    if (name && amount && category) {
        const newTransaction = {
            id: Date.now(),
            name,
            amount,
            category
        };

        transactions.push(newTransaction);
        renderApp();
        transactionForm.reset();
    }
});

// 4. Fungsi Menghapus Transaksi [cite: 33, 36]
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    renderApp();
}

// 5. Fungsi Simpan ke Local Storage 
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// 6. Fungsi Update Grafik (Chart.js) 
function updateChart(dataValues) {
    const ctx = document.getElementById('expense-chart').getContext('2d');

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Food', 'Transport', 'Fun'],
            datasets: [{
                data: [dataValues.Food, dataValues.Transport, dataValues.Fun],
                backgroundColor: ['#2ecc71', '#3498db', '#e67e22']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Jalankan aplikasi pertama kali
renderApp();