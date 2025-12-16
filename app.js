const EXAM_ROOT = "exam/";
const DATA_PATH = EXAM_ROOT + "data/";
const IMAGES_PATH = EXAM_ROOT + "images/";

const listEl = document.getElementById("question-list");
const viewer = document.getElementById("viewer");
const collapsedTopics = new Set();

let questions = [];
let currentIndex = null;
let activeTopic = null;

function resolveExamPath(path) {
    if (!path) return "";
    return EXAM_ROOT + path.replace(/^\/+/, "");
}

async function loadQuestions() {
    const res = await fetch(DATA_PATH + "index.json");
    const files = await res.json();

    for (const file of files) {
        const qRes = await fetch(DATA_PATH + file);
        const qData = await qRes.json();
        qData._file = file;
        questions.push(qData);
    }

    questions.sort(
        (a, b) => a.topic - b.topic || a.question_number - b.question_number
    );

    renderList();
}

function groupByTopic(questions) {
    const map = new Map();

    questions.forEach((q, index) => {
        if (!map.has(q.topic)) {
            map.set(q.topic, []);
        }

        map.get(q.topic).push({
            ...q,
            _globalIndex: index,
        });
    });

    return map;
}

function renderList() {
    listEl.innerHTML = "";

    const grouped = groupByTopic(questions);

    grouped.forEach((items, topic) => {
        const isCollapsed = collapsedTopics.has(topic);

        /* ===== Header del topic ===== */
        const topicLi = document.createElement("li");
        topicLi.className = "topic-header";
        topicLi.textContent = `Topic ${topic}`;
        topicLi.dataset.topic = topic;

        if (topic === activeTopic) {
            topicLi.classList.add("is-active-topic");
        }

        if (isCollapsed) {
            topicLi.classList.add("collapsed");
        }

        topicLi.addEventListener("click", () => {
            if (collapsedTopics.has(topic)) {
                collapsedTopics.delete(topic);
            } else {
                collapsedTopics.add(topic);
            }
            renderList();
        });

        listEl.appendChild(topicLi);

        /* ===== Preguntas del topic ===== */
        if (!isCollapsed) {
            items.forEach((q) => {
                const li = document.createElement("li");
                li.className = "q-item";
                li.textContent = `Q${q.question_number}`;
                li.dataset.index = q._globalIndex;

                li.addEventListener("click", () =>
                    selectQuestion(q._globalIndex)
                );

                li.addEventListener("click", () => {
                    renderList();
                });

                listEl.appendChild(li);
            });
        }
    });

    viewer.innerHTML =
        "<p class='placeholder'>Selecciona una pregunta para verla</p>";
}

function selectQuestion(index) {
    currentIndex = index;
    // Estado activo en la sidebar
    document
        .querySelectorAll(".q-item")
        .forEach((li) => li.classList.remove("is-active"));

    const active = document.querySelector(`.q-item[data-index="${index}"]`);
    if (active) active.classList.add("is-active");

    const q = questions[index];
    // ===== Topic activo =====
    activeTopic = q.topic;

    // Auto-expandir el topic activo
    collapsedTopics.delete(activeTopic);

    viewer.innerHTML = "";

    const article = document.createElement("article");
    article.className = "question";

    /* ===== Header de la pregunta ===== */
    const qHeader = document.createElement("header");
    qHeader.className = "question-header";

    const topic = document.createElement("span");
    topic.className = "question-topic";
    topic.textContent = `Topic ${q.topic}`;

    const number = document.createElement("span");
    number.className = "question-number";
    number.textContent = `Question ${q.question_number}`;

    const global = document.createElement("span");
    global.className = "question-global";
    global.textContent = `${index + 1} / ${questions.length}`;

    qHeader.appendChild(topic);
    qHeader.appendChild(number);
    qHeader.appendChild(global);

    article.appendChild(qHeader);

    /* ===== Enunciado ===== */
    const qt = document.createElement("div");
    qt.className = "question-text";
    qt.innerHTML =
        q.question_text?.replaceAll(
            'src="images',
            'src="' + EXAM_ROOT + "images"
        ) || "";
    article.appendChild(qt);

    // ✅ Enganchar zoom a las imágenes embebidas en el HTML del enunciado
    qt.querySelectorAll("img").forEach((img) => {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof openImageModal === "function") {
                openImageModal(img.src, img.alt || "Question image");
            } else {
                console.warn(
                    "openImageModal no está disponible (¿carga zoom.js?)"
                );
            }
        });
    });

    /* ===== Respuestas ===== */
    if (q.answers && Object.keys(q.answers).length) {
        const answersDiv = document.createElement("div");
        answersDiv.className = "answers";

        Object.entries(q.answers).forEach(([key, text]) => {
            const div = document.createElement("div");
            div.className = "answer";

            if (q.correct_answer?.includes(key)) {
                div.classList.add("correct");
            }

            div.innerHTML = `<strong>${key}.</strong> ${text}`;

            // Imágenes de respuesta
            q.answer_images?.[key]?.forEach((src) => {
                const img = document.createElement("img");
                img.src = resolveExamPath(src);
                img.alt = `Answer ${key} image`;
                img.addEventListener("click", () => {
                    openImageModal(img.src, img.alt);
                });
                div.appendChild(img);
            });

            answersDiv.appendChild(div);
        });

        article.appendChild(answersDiv);
    }

    /* ===== Respuesta correcta visual ===== */
    if (q.correct_answer_images?.length) {
        const correctImgBlock = document.createElement("div");
        correctImgBlock.className = "correct-answer-images";

        const title = document.createElement("strong");
        title.textContent = "Respuesta correcta (visual):";
        correctImgBlock.appendChild(title);

        q.correct_answer_images.forEach((src) => {
            const img = document.createElement("img");
            img.src = resolveExamPath(src);
            img.alt = "Correct answer image";
            img.addEventListener("click", () => {
                openImageModal(img.src, img.alt);
            });
            correctImgBlock.appendChild(img);
        });

        article.appendChild(correctImgBlock);
    }

    /* ===== Fuente ===== */
    if (q.url) {
        const source = document.createElement("div");
        source.className = "source";
        source.innerHTML = `
      <strong>Fuente:</strong><br>
      <a href="${q.url}" target="_blank" rel="noopener noreferrer">
        ${q.url}
      </a>
    `;
        article.appendChild(source);
    }

    /* ===== Navegación Anterior / Siguiente ===== */
    const nav = document.createElement("nav");
    nav.className = "question-nav";

    const prevBtn = document.createElement("button");
    prevBtn.className = "nav-btn prev";
    prevBtn.textContent = "← Anterior";
    prevBtn.disabled = index === 0;

    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            selectQuestion(currentIndex - 1);
        }
    });

    const nextBtn = document.createElement("button");
    nextBtn.className = "nav-btn next";
    nextBtn.textContent = "Siguiente →";
    nextBtn.disabled = index === questions.length - 1;

    nextBtn.addEventListener("click", () => {
        if (currentIndex < questions.length - 1) {
            selectQuestion(currentIndex + 1);
        }
    });

    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    article.appendChild(nav);

    viewer.appendChild(article);

    /* ===== UX móvil: cerrar sidebar ===== */
    if (window.innerWidth <= 900) {
        document.body.classList.remove("sidebar-open");
        document.body.classList.add("sidebar-closed");
    }

    viewer.scrollTo({ top: 0, behavior: "smooth" });
}

// 🚀 Arranque
loadQuestions();
