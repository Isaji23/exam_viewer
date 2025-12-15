const EXAM_ROOT = "exam/";
const DATA_PATH = EXAM_ROOT + "data/";
const IMAGES_PATH = EXAM_ROOT + "images/";

const listEl = document.getElementById("list");
const viewer = document.getElementById("viewer");

let questions = [];

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

function renderList() {
  listEl.innerHTML = "";
  questions.forEach((q, idx) => {
    const li = document.createElement("li");
    li.textContent = `Topic ${q.topic} · Q${q.question_number}`;
    li.onclick = () => selectQuestion(idx);
    listEl.appendChild(li);
  });

  viewer.innerHTML = "<p class='placeholder'>Selecciona una pregunta</p>";
}

function selectQuestion(index) {
  document
    .querySelectorAll("aside li")
    .forEach((li) => li.classList.remove("active"));
  document.querySelectorAll("aside li")[index].classList.add("active");

  const q = questions[index];
  viewer.innerHTML = "";

  // Enunciado
  const qt = document.createElement("div");
  qt.className = "question-text";
  qt.innerHTML = q.question_text.replaceAll("src=\"images", "src=\"exam/images") || "";
  viewer.appendChild(qt);

  // Imágenes adicionales del enunciado (hotspot, drag&drop, etc.)
  // if (q.question_images && q.question_images.length) {
  //   const imgContainer = document.createElement("div");
  //   imgContainer.className = "question-images";

  //   q.question_images.forEach(src => {
  //     const resolvedSrc = resolveExamPath(src);

  //     // Evita duplicar imágenes ya incluidas en el HTML
  //     if (!qt.innerHTML.includes(src)) {
  //       const img = document.createElement("img");
  //       img.src = resolvedSrc;
  //       img.alt = "Question image";
  //       imgContainer.appendChild(img);
  //     }
  //   });

  //   viewer.appendChild(imgContainer);
  // }


  // Respuestas
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

      q.answer_images?.[key]?.forEach(src => {
        const img = document.createElement("img");
        img.src = resolveExamPath(src);
        img.alt = `Answer ${key} image`;
        div.appendChild(img);
      });

      answersDiv.appendChild(div);
    });

    viewer.appendChild(answersDiv);
  }


  // Respuesta correcta visual (hotspot, etc.)
  if (q.correct_answer_images && q.correct_answer_images.length) {
    const correctImgBlock = document.createElement("div");
    correctImgBlock.className = "correct-answer-images";

    const title = document.createElement("strong");
    title.textContent = "Respuesta correcta (visual):";
    correctImgBlock.appendChild(title);

    q.correct_answer_images.forEach(src => {
      const img = document.createElement("img");
      img.src = resolveExamPath(src);
      img.alt = "Correct answer image";
      correctImgBlock.appendChild(img);
    });

    viewer.appendChild(correctImgBlock);
  }

  // Enlace fuente
  if (q.url) {
    const source = document.createElement("div");
    source.className = "source";

    source.innerHTML = `
		<strong>Fuente:</strong><br>
		<a href="${q.url}" target="_blank" rel="noopener noreferrer">
		${q.url}
		</a>
	`;

    viewer.appendChild(source);
  }
}

// 🚀 Arranque
loadQuestions();
