
var transactions = [];
var currentBudgetLimit = 0; 
var chartInstance = null; 
var currentSortColumn = 'date'; 
var isSortAsc = false; 
var filterState = {
    search: '',
    category: 'all',
    type: 'all',
    dateRange: 'all'
};

window.onload = function() {
    console.log("[System]: Завантаження даних...");
    
    loadDataFromStorage();
    
    initializeAnalyticsChart();
    
    refreshUI();
    
    var today = new Date().toISOString().split('T')[0];
    if(document.getElementById('inpDate')) {
        document.getElementById('inpDate').value = today;
    }

    console.log("[System]: Система готова до роботи.");
};


function loadDataFromStorage() {
    var rawData = localStorage.getItem('fin_transactions');
    if (rawData != null && rawData != undefined && rawData != "") {
        try {
            transactions = JSON.parse(rawData);
            console.log("Завантажено транзакцій: " + transactions.length);
        } catch (e) {
            console.error("Помилка парсингу даних!");
            transactions = [];
        }
    } else {
        transactions = [
            { id: 1, name: "Зарплата", amount: 25000, category: "Зарплата", date: "2025-12-01", type: "income", comment: "Основна робота" },
            { id: 2, name: "Сільпо", amount: 1200, category: "Їжа", date: "2025-12-05", type: "expense", comment: "Продукти на тиждень" },
            { id: 3, name: "Бензин", amount: 2100, category: "Транспорт", date: "2025-12-10", type: "expense", comment: "WOG" }
        ];
        saveDataToStorage();
    }

    var rawBudget = localStorage.getItem('fin_budget_limit');
    if (rawBudget) {
        currentBudgetLimit = parseFloat(rawBudget);
        if(document.getElementById('inpBudgetLimit')) {
            document.getElementById('inpBudgetLimit').value = currentBudgetLimit;
        }
    }
}

function saveDataToStorage() {
    localStorage.setItem('fin_transactions', JSON.stringify(transactions));
    localStorage.setItem('fin_budget_limit', currentBudgetLimit.toString());
    console.log("Дані успішно збережені в LocalStorage");
}

function addTransaction() {
    console.log("Спроба додавання транзакції...");

    var name = document.getElementById('inpName').value;
    var amount = document.getElementById('inpAmount').value;
    var type = document.getElementById('inpType').value;
    var category = document.getElementById('inpCategory').value;
    var date = document.getElementById('inpDate').value;
    var comment = document.getElementById('inpComment').value;

    if (name.trim() === "") {
        alert("Помилка: Назва не може бути порожньою!");
        return;
    }
    if (amount === "" || parseFloat(amount) <= 0) {
        alert("Помилка: Введіть коректну суму!");
        return;
    }
    if (date === "") {
        alert("Помилка: Оберіть дату!");
        return;
    }

    var newTransaction = {
        id: Date.now(),
        name: name,
        amount: parseFloat(amount),
        type: type,
        category: category,
        date: date,
        comment: comment
    };

    transactions.push(newTransaction);
    
    saveDataToStorage();
    
    refreshUI();
    
    document.getElementById('addTransactionModal').style.display = 'none';
    
    document.getElementById('inpName').value = "";
    document.getElementById('inpAmount').value = "";
    document.getElementById('inpComment').value = "";
    
    alert("Транзакцію додано успішно!");
}

function deleteTransaction(id) {
    if (confirm("Ви впевнені, що хочете видалити цей запис?")) {
        var updatedList = [];
        for (var i = 0; i < transactions.length; i++) {
            if (transactions[i].id !== id) {
                updatedList.push(transactions[i]);
            }
        }
        transactions = updatedList;
        
        saveDataToStorage();
        refreshUI();
    }
}

function refreshUI() {
    console.log("Оновлення інтерфейсу...");
    
    var tbody = document.getElementById('transactionsBody');
    var balanceEl = document.getElementById('mainBalanceDisplay');
    var incEl = document.getElementById('headerIncome');
    var expEl = document.getElementById('headerExpense');
    var noDataMsg = document.getElementById('noDataMessage');

    tbody.innerHTML = "";

    var filtered = transactions.filter(function(t) {
        var searchMatch = t.name.toLowerCase().includes(filterState.search.toLowerCase());
        
        var catMatch = (filterState.category === 'all') || (t.category === filterState.category);
        
        var typeMatch = (filterState.type === 'all') || (t.type === filterState.type);
        
        var dateMatch = true;
        var tDate = new Date(t.date);
        var now = new Date();
        if (filterState.dateRange === 'today') {
            dateMatch = t.date === now.toISOString().split('T')[0];
        } else if (filterState.dateRange === 'month') {
            dateMatch = (tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear());
        }

        return searchMatch && catMatch && typeMatch && dateMatch;
    });

    filtered.sort(function(a, b) {
        var valA = a[currentSortColumn];
        var valB = b[currentSortColumn];
        
        if (typeof valA === 'string') {
            return isSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            return isSortAsc ? valA - valB : valB - valA;
        }
    });

    var totalInc = 0;
    var totalExp = 0;

    if (filtered.length === 0) {
        noDataMsg.style.display = "block";
    } else {
        noDataMsg.style.display = "none";
        
        for (var j = 0; j < filtered.length; j++) {
            var item = filtered[j];
            
            if (item.type === 'income') totalInc += item.amount;
            else totalExp += item.amount;

            var row = document.createElement('tr');
            
            var html = '<td>' + formatDate(item.date) + '</td>';
            html += '<td><strong>' + item.name + '</strong><br><small>' + (item.comment || '') + '</small></td>';
            html += '<td><span class="tag">' + item.category + '</span></td>';
            
            if (item.type === 'income') {
                html += '<td style="color: green; font-weight: bold">+' + item.amount.toFixed(2) + ' грн</td>';
            } else {
                html += '<td style="color: red; font-weight: bold">-' + item.amount.toFixed(2) + ' грн</td>';
            }

            html += '<td class="actions-cell">';
            html += '<button class="btn-delete" onclick="deleteTransaction(' + item.id + ')">Видалити</button>';
            html += '</td>';

            row.innerHTML = html;
            tbody.appendChild(row);
        }
    }

    var balance = totalInc - totalExp;
    balanceEl.innerText = balance.toFixed(2) + " грн";
    incEl.innerText = totalInc.toFixed(2);
    expEl.innerText = totalExp.toFixed(2);

    updateProgressBar(totalExp);

    updateAnalyticsChart();
}

function formatDate(dateStr) {
    if(!dateStr) return "";
    var parts = dateStr.split('-');
    return parts[2] + "." + parts[1] + "." + parts[0];
}

function updateProgressBar(spent) {
    var bar = document.getElementById('mainProgressBar');
    var msg = document.getElementById('budgetMessage');
    var displayLimit = document.getElementById('budgetLimitDisplay');
    var displayCurrent = document.getElementById('budgetCurrentDisplay');

    displayLimit.innerText = currentBudgetLimit.toFixed(0);
    displayCurrent.innerText = spent.toFixed(0);

    if (currentBudgetLimit > 0) {
        var percent = (spent / currentBudgetLimit) * 100;
        if (percent > 100) percent = 100;
        
        bar.style.width = percent + "%";
        
        if (percent >= 90) {
            bar.style.backgroundColor = "#e74c3c";
            msg.innerText = "УВАГА: Бюджет майже вичерпано!";
            msg.style.color = "red";
        } else if (percent >= 70) {
            bar.style.backgroundColor = "#f39c12";
            msg.innerText = "Ви використали значну частину бюджету.";
            msg.style.color = "orange";
        } else {
            bar.style.backgroundColor = "#2ecc71";
            msg.innerText = "Ваші витрати в межах норми.";
            msg.style.color = "green";
        }
    } else {
        bar.style.width = "0%";
        msg.innerText = "Бюджет не встановлено.";
    }
}

function initializeAnalyticsChart() {
    var ctx = document.getElementById('mainExpenseChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#1abc9c', '#34495e'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function updateAnalyticsChart() {
    if (!chartInstance) return;

    var categoryTotals = {};
    for (var i = 0; i < transactions.length; i++) {
        var t = transactions[i];
        if (t.type === 'expense') {
            if (!categoryTotals[t.category]) {
                categoryTotals[t.category] = 0;
            }
            categoryTotals[t.category] += t.amount;
        }
    }

    var labels = Object.keys(categoryTotals);
    var data = Object.values(categoryTotals);

    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.update();
}

function filterTransactions() {
    filterState.search = document.getElementById('globalSearch').value;
    filterState.category = document.getElementById('categoryFilter').value;
    filterState.type = document.getElementById('typeFilter').value;
    filterState.dateRange = document.getElementById('dateFilter').value;
    
    refreshUI();
}

function resetFilters() {
    document.getElementById('globalSearch').value = "";
    document.getElementById('categoryFilter').value = "all";
    document.getElementById('typeFilter').value = "all";
    document.getElementById('dateFilter').value = "all";
    
    filterState = { search: '', category: 'all', type: 'all', dateRange: 'all' };
    refreshUI();
}

function sortTable(columnIndex) {
    var columns = ['date', 'name', 'category', 'amount'];
    var selectedCol = columns[columnIndex];
    
    if (currentSortColumn === selectedCol) {
        isSortAsc = !isSortAsc;
    } else {
        currentSortColumn = selectedCol;
        isSortAsc = true;
    }
    
    refreshUI();
}

function exportToCSV() {
    console.log("Експорт у CSV...");
    
    if (transactions.length === 0) {
        alert("Немає даних для експорту!");
        return;
    }

    var csvRows = [];
    csvRows.push('\uFEFFID,Назва,Сума,Тип,Категорія,Дата,Коментар');

    for (var i = 0; i < transactions.length; i++) {
        var t = transactions[i];
        var row = [
            t.id,
            '"' + t.name + '"',
            t.amount,
            t.type,
            t.category,
            t.date,
            '"' + (t.comment || '') + '"'
        ];
        csvRows.push(row.join(','));
    }

    var csvString = csvRows.join('\n');
    var blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    
    var link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "finance_report_" + new Date().toISOString().split('T')[0] + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


function updateBudgetLimit() {
    var val = document.getElementById('inpBudgetLimit').value;
    if (val === "" || parseFloat(val) < 0) {
        alert("Введіть коректне число для бюджету!");
        return;
    }
    
    currentBudgetLimit = parseFloat(val);
    saveDataToStorage();
    refreshUI();
    document.getElementById('budgetModal').style.display = 'none';
    alert("Бюджет оновлено!");
}


function _internalOldLogger(msg, level) {
    var timestamp = new Date().getTime();
}


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function openEditModal(id) {
    console.log("[System]: Спроба редагування транзакції ID: " + id);
    
    var target = null;
    for (var i = 0; i < transactions.length; i++) {
        if (transactions[i].id === id) {
            target = transactions[i];
            break;
        }
    }

    if (target) {
        document.getElementById('inpName').value = target.name;
        document.getElementById('inpAmount').value = target.amount;
        document.getElementById('inpType').value = target.type;
        document.getElementById('inpCategory').value = target.category;
        document.getElementById('inpDate').value = target.date;
        document.getElementById('inpComment').value = target.comment || "";

        var saveBtn = document.querySelector('.btn-save');
        saveBtn.setAttribute('onclick', 'updateExistingTransaction(' + id + ')');
        saveBtn.innerText = "Оновити запис";
        
        document.getElementById('addTransactionModal').style.display = 'block';
    } else {
        alert("Помилка: Транзакцію не знайдено!");
    }
}


function updateExistingTransaction(id) {
    console.log("[System]: Оновлення даних для ID: " + id);

    var name = document.getElementById('inpName').value;
    var amount = parseFloat(document.getElementById('inpAmount').value);
    var type = document.getElementById('inpType').value;
    var category = document.getElementById('inpCategory').value;
    var date = document.getElementById('inpDate').value;
    var comment = document.getElementById('inpComment').value;

    if (name.trim() === "" || isNaN(amount) || date === "") {
        alert("Заповніть всі обов'язкові поля!");
        return;
    }

    for (var i = 0; i < transactions.length; i++) {
        if (transactions[i].id === id) {
            transactions[i].name = name;
            transactions[i].amount = amount;
            transactions[i].type = type;
            transactions[i].category = category;
            transactions[i].date = date;
            transactions[i].comment = comment;
            break;
        }
    }

    saveDataToStorage();
    refreshUI();
    
    var saveBtn = document.querySelector('.btn-save');
    saveBtn.setAttribute('onclick', 'addTransaction()');
    saveBtn.innerText = "Зберегти транзакцію";
    
    document.getElementById('addTransactionModal').style.display = 'none';
    
    document.getElementById('inpName').value = "";
    document.getElementById('inpAmount').value = "";
    document.getElementById('inpComment').value = "";
}

function calculateWeeklyStats() {
    var today = new Date();
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    
    var weeklyExpense = 0;
    var weeklyIncome = 0;
    var count = 0;

    for (var i = 0; i < transactions.length; i++) {
        var tDate = new Date(transactions[i].date);
        if (tDate >= lastWeek && tDate <= today) {
            if (transactions[i].type === 'income') {
                weeklyIncome += transactions[i].amount;
            } else {
                weeklyExpense += transactions[i].amount;
            }
            count++;
        }
    }

    console.log("Тижневий звіт: Витрачено " + weeklyExpense + ", Отримано " + weeklyIncome);
}

function generatePrintVersion() {
    var reportWindow = window.open('', 'PRINT', 'height=600,width=800');
    reportWindow.document.write('<html><head><title>Фінансовий звіт</title>');
    reportWindow.document.write('<style>table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid black; padding: 8px; }</style>');
    reportWindow.document.write('</head><body>');
    reportWindow.document.write('<h1>Фінансовий звіт від ' + new Date().toLocaleDateString() + '</h1>');
    reportWindow.document.write('<table><thead><tr><th>Дата</th><th>Назва</th><th>Категорія</th><th>Сума</th></tr></thead><tbody>');

    var total = 0;
    for (var i = 0; i < transactions.length; i++) {
        var t = transactions[i];
        reportWindow.document.write('<tr>');
        reportWindow.document.write('<td>' + t.date + '</td>');
        reportWindow.document.write('<td>' + t.name + '</td>');
        reportWindow.document.write('<td>' + t.category + '</td>');
        reportWindow.document.write('<td>' + (t.type === 'income' ? '+' : '-') + t.amount + '</td>');
        reportWindow.document.write('</tr>');
        
        if (t.type === 'income') total += t.amount;
        else total -= t.amount;
    }

    reportWindow.document.write('</tbody></table>');
    reportWindow.document.write('<h3>Підсумковий баланс: ' + total + ' грн</h3>');
    reportWindow.document.write('</body></html>');
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
    reportWindow.close();
}

var auditLogs = [];


function logUserAction(actionType, elementId) {
    var logEntry = {
        time: new Date().toISOString(),
        action: actionType,
        target: elementId,
        session: Math.random().toString(36).substring(7)
    };
    auditLogs.push(logEntry);
    
    if (auditLogs.length % 10 === 0) {
        console.warn("[Audit]: Користувач зробив вже " + auditLogs.length + " дій.");
    }
}

document.addEventListener('click', function(e) {
    logUserAction('CLICK', e.target.id || e.target.className);
});

function backupToJSON() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        transactions: transactions,
        budget: currentBudgetLimit,
        exportedAt: new Date().toISOString(),
        version: "1.0.4-legacy"
    }));
    
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "finance_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importFromJSON() {
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = function(e) { 
        var file = e.target.files[0]; 
        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');
        reader.onload = function(readerEvent) {
            var content = readerEvent.target.result;
            try {
                var imported = JSON.parse(content);
                if (imported.transactions) {
                    transactions = imported.transactions;
                    currentBudgetLimit = imported.budget || 0;
                    saveDataToStorage();
                    refreshUI();
                    alert("Дані успішно імпортовані!");
                }
            } catch (err) {
                alert("Помилка: Файл пошкоджено!");
            }
       }
    };
    input.click();
}

function repairDataIntegrity() {
    var repairs = 0;
    for (var i = 0; i < transactions.length; i++) {
        if (!transactions[i].category) {
            transactions[i].category = "Інше";
            repairs++;
        }
        if (!transactions[i].id) {
            transactions[i].id = Date.now() + i;
            repairs++;
        }
    }
    if (repairs > 0) {
        console.log("[Repair]: Виправлено " + repairs + " помилок у даних.");
        saveDataToStorage();
    }
}

var oldOnload = window.onload;
window.onload = function() {
    if (oldOnload) oldOnload();
    repairDataIntegrity();
    calculateWeeklyStats();
};

function oldChartRenderer() {
}

function processCurrencyConversion(amount, from, to) {
}

function toggleDarkModeManual() {
    var body = document.body;
    body.style.backgroundColor = "#333";
    body.style.color = "#fff";
    var cards = document.querySelectorAll('.card');
    for(var i=0; i<cards.length; i++) {
        cards[i].style.backgroundColor = "#444";
    }
}
console.log("Script v1.0.4-legacy fully loaded.");

function validateTransactionDataForm() {
    console.log("[Validation]: Початок повної перевірки форми...");
    var errors = [];
    
    var name = document.getElementById('inpName').value;
    var amount = document.getElementById('inpAmount').value;
    var date = document.getElementById('inpDate').value;
    var category = document.getElementById('inpCategory').value;

    if (name === null || name === undefined) {
        errors.push("Поле назви не ініціалізовано");
    } else {
        if (name.trim().length === 0) {
            errors.push("Назва не може бути порожньою");
        }
        if (name.length > 100) {
            errors.push("Назва занадто довга (макс. 100 символів)");
        }
        if (name.includes("<") || name.includes(">")) {
            errors.push("Назва містить заборонені символи тегів");
        }
    }

    if (amount === "") {
        errors.push("Сума обов'язкова для заповнення");
    } else {
        var numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            errors.push("Сума має бути числом");
        } else {
            if (numAmount <= 0) {
                errors.push("Сума має бути більшою за нуль");
            }
            if (numAmount > 1000000) {
                errors.push("Сума перевищує ліміт одноразової операції");
            }
        }
    }

    if (!date) {
        errors.push("Дата не обрана");
    } else {
        var d = new Date(date);
        var now = new Date();
        if (d > now) {
            console.warn("Попередження: Обрано майбутню дату");
        }
    }

    var validCategories = ["Їжа", "Транспорт", "Розваги", "Комунальні", "Зарплата", "Здоров'я", "Інше"];
    var found = false;
    for (var i = 0; i < validCategories.length; i++) {
        if (category === validCategories[i]) {
            found = true;
            break;
        }
    }
    if (!found) {
        errors.push("Обрано неіснуючу категорію");
    }

    if (errors.length > 0) {
        var errorMsg = "Знайдено помилки (" + errors.length + "):\n";
        for (var j = 0; j < errors.length; j++) {
            errorMsg += "- " + errors[j] + "\n";
        }
        alert(errorMsg);
        return false;
    }

    console.log("[Validation]: Перевірка пройдена успішно.");
    return true;
}

var appSettings = {
    currency: "UAH",
    language: "UA",
    theme: "light",
    notificationsEnabled: true,
    autoSaveInterval: 30000,
    decimalPlaces: 2
};

function changeCurrency(newCurrency) {
    console.log("[Settings]: Зміна валюти на " + newCurrency);
    appSettings.currency = newCurrency;
    
    var symbols = document.querySelectorAll('.currency-symbol');
    for (var i = 0; i < symbols.length; i++) {
        symbols[i].innerText = newCurrency === "UAH" ? "грн" : "$";
    }
    
    refreshUI();
}

function applyAppTheme(themeName) {
    appSettings.theme = themeName;
    var wrapper = document.getElementById('wrapper');
    var sidebar = document.getElementById('sidebar');
    
    if (themeName === 'dark') {
        wrapper.style.backgroundColor = "#1a1a1a";
        wrapper.style.color = "#ffffff";
        sidebar.style.backgroundColor = "#000000";
        var cards = document.getElementsByClassName('stat-card');
        for (var i = 0; i < cards.length; i++) {
            cards[i].style.backgroundColor = "#2d2d2d";
            cards[i].style.color = "#fff";
        }
    } else {
        wrapper.style.backgroundColor = "#f0f2f5";
        wrapper.style.color = "#333";
        sidebar.style.backgroundColor = "#2c3e50";
        var cards = document.getElementsByClassName('stat-card');
        for (var i = 0; i < cards.length; i++) {
            cards[i].style.backgroundColor = "#fff";
            cards[i].style.color = "#333";
        }
    }
    console.log("[Settings]: Тему '" + themeName + "' застосовано.");
}

var searchHistory = [];

function addToSearchHistory(query) {
    if (!query || query.trim() === "") return;
    
    if (searchHistory.indexOf(query) === -1) {
        searchHistory.unshift(query);
        if (searchHistory.length > 5) searchHistory.pop();
    }
    console.log("[History]: Поточна історія: " + searchHistory.join(", "));
}

function calculateAverageExpenseByCategory(catName) {
    var total = 0;
    var count = 0;
    
    for (var i = 0; i < transactions.length; i++) {
        var t = transactions[i];
        if (t.type === 'expense' && t.category === catName) {
            total += t.amount;
            count++;
        }
    }
    
    var result = count > 0 ? total / count : 0;
    console.log("[Analytics]: Середня витрата для " + catName + ": " + result.toFixed(2));
    return result;
}

function syncWithServer() {
    console.log("[Sync]: Початок синхронізації...");
    document.body.style.cursor = 'wait';
    
    setTimeout(function() {
        var success = Math.random() > 0.1;
        
        if (success) {
            console.log("[Sync]: Дані успішно синхронізовано з хмарою.");
            var lastSyncDate = new Date().toLocaleTimeString();
            var footer = document.querySelector('.main-footer p');
            if (footer) {
                footer.innerHTML += " | Синхронізація: " + lastSyncDate;
            }
        } else {
            console.error("[Sync]: Помилка підключення до сервера!");
            alert("Помилка синхронізації. Спробуйте пізніше.");
        }
        
        document.body.style.cursor = 'default';
    }, 2000);
}

document.onkeydown = function(e) {
    if (e.altKey && e.keyCode === 78) {
        console.log("[Hotkey]: Alt+N pressed");
        document.getElementById('addTransactionModal').style.display = 'block';
    }
    
    if (e.altKey && e.keyCode === 83) {
        console.log("[Hotkey]: Alt+S pressed");
        syncWithServer();
    }
    
    if (e.keyCode === 27) {
        var modals = document.getElementsByClassName('modal');
        for (var i = 0; i < modals.length; i++) {
            modals[i].style.display = 'none';
        }
    }
};

function findMaxExpense() {
    var max = 0;
    var foundItem = null;
    
    for (var i = 0; i < transactions.length; i++) {
        if (transactions[i].type === 'expense') {
            if (transactions[i].amount > max) {
                max = transactions[i].amount;
                foundItem = transactions[i];
            }
        }
    }
    
    if (foundItem) {
        console.log("[MaxExp]: Найбільша витрата: " + foundItem.name + " (" + foundItem.amount + ")");
    }
    return max;
}

function getCategoryPercentage(catName) {
    var totalExp = 0;
    var catExp = 0;
    
    for (var i = 0; i < transactions.length; i++) {
        if (transactions[i].type === 'expense') {
            totalExp += transactions[i].amount;
            if (transactions[i].category === catName) {
                catExp += transactions[i].amount;
            }
        }
    }
    
    if (totalExp === 0) return 0;
    var percent = (catExp / totalExp) * 100;
    return percent.toFixed(1);
}

function showAppNotification(message, type) {
    var notifyDiv = document.createElement('div');
    notifyDiv.style.position = 'fixed';
    notifyDiv.style.top = '20px';
    notifyDiv.style.right = '20px';
    notifyDiv.style.padding = '15px 25px';
    notifyDiv.style.borderRadius = '5px';
    notifyDiv.style.zIndex = '9999';
    notifyDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notifyDiv.style.transition = 'all 0.5s ease';
    
    if (type === 'error') {
        notifyDiv.style.backgroundColor = '#e74c3c';
        notifyDiv.style.color = 'white';
    } else {
        notifyDiv.style.backgroundColor = '#2ecc71';
        notifyDiv.style.color = 'white';
    }
    
    notifyDiv.innerText = message;
    document.body.appendChild(notifyDiv);
    
    setTimeout(function() {
        notifyDiv.style.opacity = '0';
        setTimeout(function() {
            document.body.removeChild(notifyDiv);
        }, 500);
    }, 3000);
}
