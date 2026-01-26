const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('captureButton');
const recognizedTextDisplay = document.getElementById('recognizedText');
const reSpeakButton = document.getElementById('reSpeak');
const loadingOverlay = document.getElementById('loadingOverlay');
const statusMsg = document.getElementById('status');

// 1. 카메라 시작 (후면 카메라 우선)
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
        video.srcObject = stream;
        statusMsg.textContent = "글자를 비추고 버튼을 눌러보세요!";
    })
    .catch(err => {
        statusMsg.textContent = "카메라를 켤 수 없어요.";
    });

// 2. 소리 읽어주기 기능 (TTS)
function speak(text) {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'ko-KR';
    speech.rate = 0.8;
    window.speechSynthesis.speak(speech);
}

// 3. 버튼 클릭 시 사진 찍고 글자 읽기
captureButton.addEventListener('click', () => {
    loadingOverlay.style.display = 'flex';
    
    // 현재 화면 캡처
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');

    // Tesseract로 글자 인식 시작
    Tesseract.recognize(dataUrl, 'kor', {
        logger: m => console.log(m.status)
    }).then(({ data: { text } }) => {
        loadingOverlay.style.display = 'none';
        const cleanText = text.replace(/[^가-힣a-zA-Z0-9\s]/g, "").trim();
        
        if (cleanText.length > 0) {
            recognizedTextDisplay.textContent = cleanText;
            speak(cleanText);
            reSpeakButton.style.display = 'inline-block';
        } else {
            recognizedTextDisplay.textContent = "글자가 안 보여요!";
            speak("글자가 보이지 않아요");
        }
    });
});

// 다시 듣기 버튼
reSpeakButton.addEventListener('click', () => {
    speak(recognizedTextDisplay.textContent);
});
