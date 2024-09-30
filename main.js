// main.js

// HTML Elementlerini Seçme
const canvas = document.querySelector("canvas"),
  toolBtns = document.querySelectorAll(".tool"),
  fillColor = document.querySelector("#fill-color"),
  sizeSlider = document.querySelector("#size-slider"),
  colorBtns = document.querySelectorAll(".colors .option"),
  colorPicker = document.querySelector("#color-picker"),
  clearCanvasBtn = document.querySelector(".clear-canvas"),
  saveImgBtn = document.querySelector(".save-img"),
  loadImageBtn = document.querySelector("#load-image"),
  imageLoader = document.querySelector("#image-loader"),
  textToolBtn = document.querySelector("#text-tool"),
  textModal = document.querySelector("#text-modal"),
  textInput = document.querySelector("#text-input"),
  addTextBtn = document.querySelector("#add-text"),
  closeModalBtn = document.querySelector("#close-modal");

const boldStyleCheckbox = document.querySelector("#bold-style");
const italicStyleCheckbox = document.querySelector("#italic-style");
const underlineStyleCheckbox = document.querySelector("#underline-style");
const strikethroughStyleCheckbox = document.querySelector("#strikethrough-style");

// Canvas ve Çizim Ayarları
const ctx = canvas.getContext("2d");
let isDrawing = false,
  brushWidth = 5,
  selectedTool = "brush",
  selectedColor = "#000",
  prevMouseX,
  prevMouseY,
  snapshot,
  draggingText = null,
  textPosition = { x: 0, y: 0 },
  textSize = 20,
  addedTexts = [],
  shapes = [];

// Canvas Arka Planını Ayarlama
const setCanvasBackground = () => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = selectedColor;
};

// Sayfa Yüklendiğinde Canvas Boyutunu Ayarla
window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCanvasBackground();
});

// Canvas'ı Temizleme Fonksiyonu
const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setCanvasBackground();
  addedTexts = [];
  shapes = [];
};

clearCanvasBtn.addEventListener("click", clearCanvas);

// Şekil Çizim Fonksiyonu
const drawShape = (x, y, type) => {
  ctx.beginPath();
  const width = x - prevMouseX;
  const height = y - prevMouseY;

  if (type === "rectangle") {
    if (fillColor.checked) {
      ctx.fillStyle = selectedColor;
      ctx.fillRect(prevMouseX, prevMouseY, width, height);
    }
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushWidth;
    ctx.strokeRect(prevMouseX, prevMouseY, width, height);
  } else if (type === "circle") {
    const radius = Math.sqrt(width * width + height * height);
    ctx.arc(prevMouseX, prevMouseY, radius, 0, Math.PI * 2, false);
    if (fillColor.checked) {
      ctx.fillStyle = selectedColor;
      ctx.fill();
    }
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushWidth;
    ctx.stroke();
  } else if (type === "triangle") {
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(x, y);
    ctx.lineTo(prevMouseX * 2 - x, y);
    ctx.closePath();
    if (fillColor.checked) {
      ctx.fillStyle = selectedColor;
      ctx.fill();
    }
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushWidth;
    ctx.stroke();
  } else if (type === "heart") {
    // Kalp Şekli Çizimi
    const topCurveHeight = height / 2; // Üst kavis yüksekliği
    const bottomPointHeight = prevMouseY + height; // Kalbin alt sivri noktası
    const halfWidth = width / 2; // Kalbin yarı genişliği

    ctx.beginPath(); // Yeni bir yol başlat
    ctx.moveTo(prevMouseX, prevMouseY + topCurveHeight);

    // Sol üst kavis
    ctx.bezierCurveTo(
        prevMouseX, prevMouseY - topCurveHeight, // Sol üst kontrol noktası
        prevMouseX - halfWidth, prevMouseY - topCurveHeight, // Sol üst köşe
        prevMouseX - halfWidth, prevMouseY + topCurveHeight // Sol alt köşe
    );

    // Alt kısmı sivriltmek için kontrol noktaları
    ctx.bezierCurveTo(
        prevMouseX - halfWidth, bottomPointHeight, // Sol alt kontrol noktası
        prevMouseX, bottomPointHeight + topCurveHeight, // Alt orta nokta (sivri nokta)
        prevMouseX + halfWidth, bottomPointHeight // Sağ alt kontrol noktası
    );

    // Sağ üst kavis
    ctx.bezierCurveTo(
        prevMouseX + halfWidth, prevMouseY + topCurveHeight, // Sağ alt köşe
        prevMouseX + halfWidth, prevMouseY - topCurveHeight, // Sağ üst kontrol noktası
        prevMouseX, prevMouseY + topCurveHeight // Sağ üst köşe
    );

    ctx.closePath(); // Yolu kapat
    if (fillColor.checked) {
        ctx.fillStyle = selectedColor;
        ctx.fill(); // İçini doldur
    }
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushWidth;
    ctx.stroke(); // Çizgiyi çiz
}



};

// Araç Seçim İşlevi
toolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .active")?.classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id;

    if (selectedTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = selectedColor;
    }
  });
});

// Çizime Başlama
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (selectedTool === "brush" || selectedTool === "eraser") {
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.lineCap = "round";
    if (selectedTool === "brush") {
      ctx.strokeStyle = selectedColor;
    } else if (selectedTool === "eraser") {
      ctx.strokeStyle = "rgba(0,0,0,1)";
    }
    ctx.moveTo(prevMouseX, prevMouseY);
  }
});

// Çizim Yapma veya Şekil Çizme
canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  const x = e.offsetX;
  const y = e.offsetY;
  ctx.putImageData(snapshot, 0, 0);

  if (selectedTool === "brush" || selectedTool === "eraser") {
    ctx.lineTo(x, y);
    ctx.stroke();
  } else if (
    selectedTool === "rectangle" ||
    selectedTool === "circle" ||
    selectedTool === "triangle" ||
    selectedTool === "heart"
  ) {
    drawShape(x, y, selectedTool);
  }
});

// Çizimi Bitirme
canvas.addEventListener("mouseup", () => {
  if (isDrawing) {
    isDrawing = false;
    if (
      selectedTool !== "brush" &&
      selectedTool !== "eraser"
    ) {
      shapes.push({
        tool: selectedTool,
        x: prevMouseX,
        y: prevMouseY,
        color: selectedColor,
        width: brushWidth,
        filled: fillColor.checked,
      });
    }
  }
});

// Fırça Kalınlığını Güncelleme
sizeSlider.addEventListener("change", () => {
  brushWidth = sizeSlider.value;
});

// Renk Seçimini Güncelleme
colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".colors .selected")?.classList.remove("selected");
    btn.classList.add("selected");
    selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    if (selectedTool !== "eraser") {
      ctx.strokeStyle = selectedColor;
    }
  });
});

// Renk Seçici ile Renk Seçme
colorPicker.addEventListener("change", () => {
  colorPicker.parentElement.style.backgroundColor = colorPicker.value;
  colorPicker.parentElement.click();
  selectedColor = colorPicker.value;
  if (selectedTool !== "eraser") {
    ctx.strokeStyle = selectedColor;
  }
});

// Metni çizme fonksiyonunu güncelle
const drawText = (text, x, y, font = "20px Poppins") => {
    ctx.font = font;
    ctx.fillStyle = selectedColor; // Metin rengini güncelle
  
    // Metin stilini uygula
    let fontWeight = boldStyleCheckbox.checked ? "bold" : "normal";
    let fontStyle = italicStyleCheckbox.checked ? "italic" : "normal";
    ctx.font = `${fontStyle} ${fontWeight} ${textSize}px Poppins`;
  
    ctx.fillText(text, x, y);
  
    // Eğer altı çizili veya üstü çizili ise çizgi ekle
    if (underlineStyleCheckbox.checked) {
      ctx.beginPath();
      ctx.moveTo(x, y + 5); // Altı çizili mesafesi
      ctx.lineTo(x + ctx.measureText(text).width, y + 5);
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  
    if (strikethroughStyleCheckbox.checked) {
      ctx.beginPath();
      ctx.moveTo(x, y - textSize / 3); // Üstü çizili mesafesi
      ctx.lineTo(x + ctx.measureText(text).width, y - textSize / 3);
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };
  
  // Metni ekleme işlemi (stil ile birlikte)
  addTextBtn.addEventListener("click", () => {
    const text = textInput.value;
    if (text) {
      textPosition.x = canvas.width / 2 - 50;
      textPosition.y = canvas.height / 2;
      addedTexts.push({ text: text, x: textPosition.x, y: textPosition.y });
      
      // Metni seçilen stillerle çiz
      drawText(text, textPosition.x, textPosition.y);
      
      textModal.style.display = "none";
      textInput.value = "";
    }
  });

// Metin Ekleme
addTextBtn.addEventListener("click", () => {
  const text = textInput.value.trim();
  if (text) {
    textPosition.x = canvas.width / 2 - 50;
    textPosition.y = canvas.height / 2;
    addedTexts.push({ text, x: textPosition.x, y: textPosition.y });
    drawText(text, textPosition.x, textPosition.y);
    textModal.style.display = "none";
    textInput.value = "";
  }
});

// Metin Aracına Tıklanınca Modalı Açma
textToolBtn.addEventListener("click", () => {
  textModal.style.display = "block";
});

// Metin Modalını Kapatma
closeModalBtn.addEventListener("click", () => {
  textModal.style.display = "none";
});

// Metin Sürükleme İşlevi
canvas.addEventListener("mousedown", (e) => {
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;

  addedTexts.forEach((textObj) => {
    const textWidth = ctx.measureText(textObj.text).width;
    const textHeight = textSize;

    if (
      mouseX >= textObj.x &&
      mouseX <= textObj.x + textWidth &&
      mouseY >= textObj.y - textHeight &&
      mouseY <= textObj.y
    ) {
      draggingText = textObj;
    }
  });
});

canvas.addEventListener("mousemove", (e) => {
  if (draggingText) {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    draggingText.x = mouseX;
    draggingText.y = mouseY;

    // Canvas'ı Yeniden Çizme
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();

    // Eklenen Tüm Metinleri Çizme
    addedTexts.forEach((textObj) => {
      drawText(textObj.text, textObj.x, textObj.y);
    });

    // Çizilen Tüm Şekilleri Çizme
    shapes.forEach((shape) => {
      drawShape(shape.x, shape.y, shape.tool);
    });
  }
});

canvas.addEventListener("mouseup", () => {
  draggingText = null;
});

// Metni Çift Tıklayarak Düzenleme
canvas.addEventListener("dblclick", (e) => {
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;

  addedTexts.forEach((textObj) => {
    const textWidth = ctx.measureText(textObj.text).width;
    const textHeight = textSize;

    if (
      mouseX >= textObj.x &&
      mouseX <= textObj.x + textWidth &&
      mouseY >= textObj.y - textHeight &&
      mouseY <= textObj.y
    ) {
      textModal.style.display = "block";
      textInput.value = textObj.text;

      // Mevcut Metni Güncelleme
      addTextBtn.onclick = () => {
        const newText = textInput.value.trim();
        if (newText) {
          textObj.text = newText;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setCanvasBackground();

          addedTexts.forEach((txt) => {
            drawText(txt.text, txt.x, txt.y);
          });

          shapes.forEach((shape) => {
            drawShape(shape.x, shape.y, shape.tool);
          });

          textModal.style.display = "none";
          textInput.value = "";
        }
      };
    }
  });
});

// Silgi (Eraser) İşlevi
// Silgi aracı seçildiğinde, globalCompositeOperation 'destination-out' olarak ayarlanır.
// Bu, çizilen her şeyin mevcut içerikten silinmesini sağlar.

// Resim Yükleme
loadImageBtn.addEventListener("click", () => {
  imageLoader.click();
});

imageLoader.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.src = event.target.result;
    img.onload = function () {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };
  reader.readAsDataURL(file);
});

// Fotoğrafı Kaydetme
saveImgBtn.addEventListener("click", () => {
  const dataURL = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = "canvas.png";
  a.click();
});
