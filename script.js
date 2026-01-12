document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.querySelector(".add");
  const pdfButton = document.querySelector(".pdf");
  const blocksContainer = document.getElementById("blocks");
  const template = document.querySelector(".training-block.template");
  const nameInput = document.querySelector(".name-input");

  if (!addButton || !pdfButton) return;

  // --- 1. ФУНКЦИЯ СОХРАНЕНИЯ (полный сбор данных) ---
  function saveData() {
    console.log("Сохранение данных...");
    const data = {
      userName: nameInput.value,
      blocks: []
    };

    // Находим все блоки, которые НЕ являются скрытым шаблоном
    const allBlocks = document.querySelectorAll(".training-block:not(.template)");
    
    allBlocks.forEach(block => {
      const preview = block.querySelector(".preview");
      // Ищем инпуты именно внутри текущего блока
      const inputName = block.querySelector('.center .field:nth-child(1) input');
      const inputWeight = block.querySelector('.center .field:nth-child(2) input');
      const inputDuration = block.querySelector('.center .field:nth-child(3) input');
      const textarea = block.querySelector("textarea");

      data.blocks.push({
        imgData: preview.src || "",
        imgVisible: preview.style.display,
        name: inputName ? inputName.value : "",
        weight: inputWeight ? inputWeight.value : "",
        duration: inputDuration ? inputDuration.value : "",
        notes: textarea ? textarea.value : ""
      });
    });

    localStorage.setItem("trainingPlan", JSON.stringify(data));
  }

  // --- 2. ФУНКЦИЯ ЗАГРУЗКИ ---
  function loadData() {
    const saved = localStorage.getItem("trainingPlan");
    if (!saved) {
      setupBlock(template);
      return;
    }

    const data = JSON.parse(saved);
    nameInput.value = data.userName || "";

    if (data.blocks && data.blocks.length > 0) {
      // Очищаем контейнер от старых видимых блоков, оставляем только шаблон
      const oldBlocks = document.querySelectorAll(".training-block:not(.template)");
      oldBlocks.forEach(b => b.remove());

      data.blocks.forEach(blockData => {
        const newBlock = createNewBlock(blockData);
        blocksContainer.appendChild(newBlock);
      });
      
      template.style.display = "none"; // Прячем исходный шаблон
    } else {
      setupBlock(template);
    }
  }

  function createNewBlock(data = null) {
    const newBlock = template.cloneNode(true);
    newBlock.classList.remove("template");
    newBlock.style.display = "flex";

    const preview = newBlock.querySelector(".preview");
    const inputName = newBlock.querySelector('.center .field:nth-child(1) input');
    const inputWeight = newBlock.querySelector('.center .field:nth-child(2) input');
    const inputDuration = newBlock.querySelector('.center .field:nth-child(3) input');
    const textarea = newBlock.querySelector("textarea");

    if (data) {
      if (data.imgData && data.imgData.startsWith("data:image")) {
        preview.src = data.imgData;
        preview.style.display = "block";
      }
      if (inputName) inputName.value = data.name || "";
      if (inputWeight) inputWeight.value = data.weight || "";
      if (inputDuration) inputDuration.value = data.duration || "";
      if (textarea) textarea.value = data.notes || "";
    }

    setupBlock(newBlock);
    return newBlock;
  }

  function setupBlock(block) {
    setupImagePreview(block);
    setupDeleteButton(block);
    
    // ВАЖНО: Вешаем сохранение на каждое поле
    block.querySelectorAll("input, textarea").forEach(el => {
      el.addEventListener("input", () => {
        saveData();
      });
    });
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
        saveData(); // Сохраняем сразу после загрузки картинки
      };
      reader.readAsDataURL(file);
    });
  }

  function setupDeleteButton(block) {
    const deleteBtn = block.querySelector(".delete");
    if (!deleteBtn) return;
    deleteBtn.addEventListener("click", () => {
      const allVisible = document.querySelectorAll(".training-block:not(.template)");
      if (allVisible.length > 1) {
        block.remove();
        saveData();
      } else {
        // Если это последний блок, просто очищаем его поля
        block.querySelectorAll("input, textarea").forEach(i => i.value = "");
        block.querySelector(".preview").src = "";
        block.querySelector(".preview").style.display = "none";
        saveData();
      }
    });
  }

  addButton.addEventListener("click", () => {
    const newBlock = createNewBlock();
    blocksContainer.appendChild(newBlock);
    saveData();
  });

  nameInput.addEventListener("input", saveData);

  // Логика PDF
  pdfButton.addEventListener("click", () => {
    const element = document.getElementById("pdf-content");
    const container = document.body;

    container.classList.add("is-generating-pdf");

    // Синхронизация для корректного отображения в PDF
    element.querySelectorAll('input, textarea').forEach(el => {
      el.setAttribute('value', el.value);
      if (el.tagName === 'TEXTAREA') el.textContent = el.value;
    });

    const safeName = (nameInput.value.trim() || "Trainingsplan").replace(/[/\\?%*:|"<>]/g, '-');

    html2pdf().set({
      margin: 10,
      filename: `${safeName}_Trainingsplan.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'], 
        avoid: '.training-block' 
      }
    }).from(element).save().then(() => {
      container.classList.remove("is-generating-pdf");
    });
  });

  // Запуск загрузки
  loadData();
});

