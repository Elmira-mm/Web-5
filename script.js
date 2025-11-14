// ===================== 0. INITIAL DOM CREATION (X, Y, FORMS) =======================

const block3 = document.querySelector(".block3");

block3.insertAdjacentHTML("beforeend", `
    <h3>Circle Area</h3>
    Radius: <input id="radiusInput" type="number" min="0"> 
    <button id="calcCircleBtn">Compute area</button>
    <div id="circleResult"></div>

    <h3>Max Numbers</h3>
    <form id="numbersForm">
        ${Array.from({length:10}, (_,i)=>`<input type="number" class="numInput" placeholder="${i+1}">`).join("")}
        <button type="submit">Process Numbers</button>
    </form>
`);


// ========================= 1. SWAP X AND Y =============================

function swapXY() {
    const xElem = document.querySelector(".slogan");
    const yElem = document.querySelector(".motto");

    const temp = xElem.innerHTML;
    xElem.innerHTML = yElem.innerHTML;
    yElem.innerHTML = temp;
}

swapXY();


// ========================= 2. AREA OF CIRCLE ===========================

document.getElementById("calcCircleBtn").onclick = function () {
    const r = parseFloat(document.getElementById("radiusInput").value);
    if (isNaN(r) || r <= 0) return alert("Enter valid radius");

    const area = Math.PI * r * r;
    document.getElementById("circleResult").textContent = 
        "Circle area = " + area.toFixed(3);
};

// ========================= 3. MAX NUMBERS + COOKIES ===========================

// --- COOKIES HELPERS ---
function setCookie(name, value, days = 365) {
    document.cookie = `${name}=${value};max-age=${days * 24 * 60 * 60}`;
}
function getCookie(name) {
    const m = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return m ? m[2] : null;
}
function deleteCookie(name) {
    document.cookie = `${name}=;max-age=0`;
}

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("numbersForm");
    // ==== Перевірка наявності cookies ====
    const saved = getCookie("maxCount");
    if (saved !== null) {

        form.style.display = "none";

        const ans = confirm(`Збережений результат: ${saved}. Видалити?`);

        if (ans) {
            deleteCookie("maxCount");
            location.reload();         
        } else {
            alert("Cookies існують. Якщо хочете повернути форму — перезавантажте сторінку.");
        }

        return; 
    }

    // ==== Обробка форми ====
    form.onsubmit = function (e) {
        e.preventDefault();

        const nums = [...document.querySelectorAll(".numInput")]
            .map(n => parseFloat(n.value))
            .filter(n => !isNaN(n));

        if (nums.length < 10)
            return alert("Введіть усі 10 чисел!");

        const max = Math.max(...nums);
        const count = nums.filter(n => n === max).length;

        alert("Кількість максимальних = " + count);
        setCookie("maxCount", count);
    };
});

// ========================= 4. BLUR → CHANGE COLOR OF BLOCK 2 =======================

const block2 = document.querySelector(".block2");

block2.insertAdjacentHTML("beforeend", `
    <div style="margin-top:10px;">
        <label>Enter color: </label>
        <input id="colorInput" type="text" placeholder="red, #aabbcc, rgb(255,0,0)">
        <br><br>
        <label>Pick color: </label>
        <input id="colorPicker" type="color">
    </div>
`);

const colorInput = document.getElementById("colorInput");
const colorPicker = document.getElementById("colorPicker");


// ---------------- Валідація кольору ----------------

function isValidColor(color) {
    const s = new Option().style;
    s.color = "";
    s.color = color;
    return s.color !== ""; 
}


// ---------------- Обробка blur для текстового поля ----------------

colorInput.addEventListener("blur", () => {
    const col = colorInput.value.trim();

    if (!col) return;

    if (!isValidColor(col)) {
        alert("Невірний формат кольору!");
        return;
    }

    block2.style.backgroundColor = col;
    colorPicker.value = rgbToHex(getComputedStyle(block2).backgroundColor);
    localStorage.setItem("block2Color", col);
});


// ---------------- Обробка вибору через color picker ----------------

colorPicker.addEventListener("input", () => {
    const col = colorPicker.value;

    block2.style.backgroundColor = col;
    colorInput.value = col;
    localStorage.setItem("block2Color", col);
});


// ---------------- Відновлення кольору з localStorage ----------------

const savedColor = localStorage.getItem("block2Color");
if (savedColor && isValidColor(savedColor)) {
    block2.style.backgroundColor = savedColor;

    colorInput.value = savedColor;
    const hex = rgbToHex(getComputedStyle(block2).backgroundColor);
    if (hex) colorPicker.value = hex;
}


// ---------------- Допоміжна функція: rgb → hex ----------------

function rgbToHex(rgb) {
    const m = rgb.match(/\d+/g);
    if (!m) return null;

    return (
        "#" +
        m
            .map(x => {
                let hex = parseInt(x).toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
    );
}

// ======================== 5. EDITABLE BLOCKS WITH LOCALSTORAGE ========================

// Всі блоки з датами
const blocks = document.querySelectorAll(".block");

blocks.forEach(block => {
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = " [Редагувати]";
    link.style.cursor = "pointer";

    block.firstElementChild.insertAdjacentElement("afterend", link);

    block.dataset.original = block.innerHTML;

    const saved = localStorage.getItem(block.dataset.id);
    if (saved) {
        block.innerHTML = saved + `<br><button class="deleteSavedBtn">Видалити збережене</button>`;
        attachDeleteSavedButton(block);
    }

    link.addEventListener("dblclick", () => startEdit(block));
});

// ------------------ Функція початку редагування ------------------
function startEdit(block) {
    const saved = localStorage.getItem(block.dataset.id);
    const currentContent = saved || block.dataset.original;

    block.innerHTML = `
        <textarea style="width:100%;height:150px;">${currentContent}</textarea>
        <br><br>
        <button class="saveBtn">Зберегти</button>
        <button class="restoreBtn">Відновити початковий</button>
    `;

    // Кнопка ЗБЕРЕГТИ
    block.querySelector(".saveBtn").onclick = () => {
        const newVal = block.querySelector("textarea").value;
        localStorage.setItem(block.dataset.id, newVal);

        block.innerHTML = newVal + `<br><button class="deleteSavedBtn">Видалити збережене</button>`;

        block.style.backgroundColor = randomColor();

        attachDeleteSavedButton(block);
    };

    // Кнопка ВІДНОВИТИ ПОЧАТКОВИЙ
    block.querySelector(".restoreBtn").onclick = () => {
        localStorage.removeItem(block.dataset.id);
        block.innerHTML = block.dataset.original;
    };
}


// ------------------  "Видалити збережене" ------------------
function attachDeleteSavedButton(block) {
    const btn = block.querySelector(".deleteSavedBtn");
    if (!btn) return;

    btn.onclick = () => {
        localStorage.removeItem(block.dataset.id);
        block.innerHTML = block.dataset.original; 
        block.style.backgroundColor = ""; 
    };
}


// ------------------ Генератор випадкового пастельного кольору ------------------
function randomColor() {
    return `hsl(${Math.random() * 360}, 70%, 85%)`;
}
