document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.querySelector(".add");
  const pdfButton = document.querySelector(".pdf");
  const blocksContainer = document.getElementById("blocks");
  const template = document.querySelector(".training-block.template");

  if (!addButton || !pdfButton) return;

  function setupBlock(block) {
    setupImagePreview(block);
    setupDeleteButton(block);
  }

  function setupImagePreview(block) {
    const fileInput = block.querySelector('input[type="file"]');
    const preview = block.querySelector(".preview");

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }

  function setupDeleteButton(block) {
    const deleteBtn = block.querySelector(".delete");
    if (!deleteBtn) return;
    deleteBtn.addEventListener("click", () => {
      if (blocksContainer.children.length > 1) block.remove();
    });
  }

  setupBlock(template);

  addButton.addEventListener("click", () => {
    const newBlock = template.cloneNode(true);
    newBlock.classList.remove("template");
    newBlock.querySelectorAll("input, textarea").forEach(el => el.value = "");
    const preview = newBlock.querySelector(".preview");
    preview.src = "";
    preview.style.display = "none";
    setupBlock(newBlock);
    blocksContainer.appendChild(newBlock);
  });

  pdfButton.addEventListener("click", () => {
    // 1. Сначала объявляем все переменные
    const element = document.getElementById("pdf-content");
    const container = document.body; 
    const nameInput = document.querySelector(".name-input");
    const name = nameInput?.value.trim() || "Trainingsplan";
    const safeName = name.replace(/[/\\?%*:|"<>]/g, '-');

    if (typeof html2pdf === 'undefined') {
      alert("Библиотека html2pdf не загружена!");
      return;
    }

    // 2. Включаем режим подготовки PDF (скрываем кнопки через CSS)
    container.classList.add("is-generating-pdf");

    // 3. Синхронизируем значения полей (чтобы текст попал в PDF)
    element.querySelectorAll('input, textarea').forEach(el => {
      el.setAttribute('value', el.value);
      if (el.tagName === 'TEXTAREA') el.textContent = el.value;
    });

    const opt = {
      margin: 10,
      filename: `${safeName}_Trainingsplan.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    // 4. Запускаем генерацию ОДИН раз
    html2pdf().set(opt).from(element).save()
      .then(() => {
        // Убираем режим подготовки после сохранения
        container.classList.remove("is-generating-pdf");
      })
      .catch(err => {
        console.error("Ошибка генерации:", err);
        container.classList.remove("is-generating-pdf");
      });
  });
});
