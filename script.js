document.addEventListener("DOMContentLoaded", () => {
    const blocksContainer = document.getElementById("blocks");
    const template = document.querySelector(".training-block.template");
    const nameInput = document.getElementById("userNameField");
    const jsonDataInput = document.getElementById("jsonData");

    function saveData() {
        const data = {
            userName: nameInput.value,
            blocks: []
        };
        document.querySelectorAll(".training-block:not(.template)").forEach(block => {
            data.blocks.push({
                name: block.querySelector(".u-name").value,
                weight: block.querySelector(".u-weight").value,
                duration: block.querySelector(".u-duration").value,
                notes: block.querySelector(".u-notes").value,
                imgData: block.querySelector(".preview").src // Base64 картинки
            });
        });
        localStorage.setItem("trainingPlan", JSON.stringify(data));
        // Подготавливаем скрытое поле для PHP
        jsonDataInput.value = JSON.stringify(data);
    }

    function createNewBlock(data = null) {
        const newBlock = template.cloneNode(true);
        newBlock.classList.remove("template");
        newBlock.style.display = "flex";

        if (data) {
            newBlock.querySelector(".u-name").value = data.name || "";
            newBlock.querySelector(".u-weight").value = data.weight || "";
            newBlock.querySelector(".u-duration").value = data.duration || "";
            newBlock.querySelector(".u-notes").value = data.notes || "";
            if (data.imgData && data.imgData.startsWith("data:image")) {
                newBlock.querySelector(".preview").src = data.imgData;
                newBlock.querySelector(".preview").style.display = "block";
            }
        }

        setupBlockEvents(newBlock);
        return newBlock;
    }

    function setupBlockEvents(block) {
        block.querySelector(".file-input").addEventListener("change", (e) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = block.querySelector(".preview");
                img.src = event.target.result;
                img.style.display = "block";
                saveData();
            };
            reader.readAsDataURL(e.target.files[0]);
        });

        block.querySelector(".delete").addEventListener("click", () => {
            if (document.querySelectorAll(".training-block:not(.template)").length > 1) {
                block.remove();
            } else {
                block.querySelectorAll("input, textarea").forEach(i => i.value = "");
                block.querySelector(".preview").style.display = "none";
            }
            saveData();
        });

        block.querySelectorAll("input, textarea").forEach(i => i.addEventListener("input", saveData));
    }

    document.querySelector(".add").addEventListener("click", () => {
        blocksContainer.appendChild(createNewBlock());
        saveData();
    });

    document.getElementById("clearAll").addEventListener("click", () => {
        if(confirm("Löschen?")) { localStorage.clear(); location.reload(); }
    });

    // Загрузка
    const saved = localStorage.getItem("trainingPlan");
    if (saved) {
        const data = JSON.parse(saved);
        nameInput.value = data.userName;
        data.blocks.forEach(b => blocksContainer.appendChild(createNewBlock(b)));
        template.style.display = "none";
    } else {
        setupBlockEvents(template);
    }
    saveData(); // Инициализация jsonData
});
