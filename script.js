document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.querySelector(".add");
  const pdfButton = document.querySelector(".pdf");
  const blocksContainer = document.getElementById("blocks");
  const template = document.querySelector(".training-block.template");

  // Проверка: найдены ли кнопки
  if (!addButton || !pdfButton) {
    console.error("Кнопки не найдены! Проверьте классы .add и .pdf в HTML.");
    return;
  }

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

      if (preview.src) {
        URL.revokeObjectURL(preview.src);
      }

      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    });
  }

  function setupDeleteButton(block) {
    const deleteBtn = block.querySelector(".delete");
    if (!deleteBtn) return;

    deleteBtn.addEventListener("click", () => {
      if (blocksContainer.children.length > 1) {
        block.remove();
      }
    });
  }

  setupBlock(template);

  addButton.addEventListener("click", () => {
    const newBlock = template.cloneNode(true);
    newBlock.classList.remove("template");

    newBlock.querySelectorAll("input").forEach(input => input.value = "");
    newBlock.querySelectorAll("textarea").forEach(t => t.value = "");

    const preview = newBlock.querySelector(".preview");
    preview.src = "";
    preview.style.display = "none";

    setupBlock(newBlock);
    blocksContainer.appendChild(newBlock);
  });

  pdfButton.addEventListener("click", () => {
    const element = document.getElementById("pdf-content");
    
    // Проверка наличия библиотеки
    if (typeof html2pdf === 'undefined') {
      alert("Ошибка: Библиотека html2pdf не загружена!");
      return;
    }

    const nameInput = document.querySelector(".name-input");
    const name = nameInput?.value.trim() || "Trainingsplan";

    // Очищаем имя файла от запрещенных символов
    const safeName = name.replace(/[/\\?%*:|"<>]/g, '-');

    const opt = {
      margin: 10,
      filename: `${safeName}_Trainingsplan.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, // Важно для загрузки картинок
        logging: true  // Включает логи в консоли для отладки
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    // Запуск генерации
    html2pdf().set(opt).from(element).save()
      .catch(err => console.error("Ошибка генерации PDF:", err));
  });
});