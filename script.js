const photoArea = document.getElementById('photoArea');
const fileInput = document.getElementById('fileInput');
const uploadedImage = document.getElementById('uploadedImage');
const hiddenCanvas = document.getElementById('hiddenCanvas');
const ctx = hiddenCanvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');
const captureArea = document.getElementById('captureArea');

// 영역 터치/클릭 시 파일 탐색기 열기
photoArea.addEventListener('click', () => {
    fileInput.click();
});

// 파일 선택 시 업로드 및 흑백 이미지 데이터 처리
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // 캔버스 크기를 불러온 이미지의 원본 해상도와 동일하게 설정
            hiddenCanvas.width = img.width;
            hiddenCanvas.height = img.height;

            // 원본 이미지를 캔버스에 드로잉
            ctx.drawImage(img, 0, 0);

            // 캔버스에서 픽셀 데이터 추출
            const imageData = ctx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
            const data = imageData.data;

            // 픽셀 단위로 흑백(Monochrome) Luma 알고리즘 적용
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // RGB 값을 가중치로 계산하여 회색조 도출
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                
                data[i] = gray;     // R
                data[i + 1] = gray; // G
                data[i + 2] = gray; // B
                // data[i + 3]은 Alpha(투명도)이므로 그대로 둠
            }

            // 변환된 흑백 픽셀 데이터를 캔버스에 덮어쓰기
            ctx.putImageData(imageData, 0, 0);

            // 흑백 처리된 캔버스 데이터를 Base64 이미지로 뽑아내어 화면에 출력
            // CSS 필터가 아닌 진짜 흑백 이미지 데이터가 생성되므로 다운로드 시에도 유지됨
            uploadedImage.src = hiddenCanvas.toDataURL('image/jpeg');
            uploadedImage.style.display = 'block'; 
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// 캡처 및 이미지 다운로드 로직
downloadBtn.addEventListener('click', () => {
    // 다운로드 중 로딩 텍스트 표시
    const originalText = downloadBtn.innerText;
    downloadBtn.innerText = '이미지 생성 중...';
    downloadBtn.disabled = true;

    // html2canvas로 신문 영역만 캡처
    html2canvas(captureArea, {
        scale: 3,                  // 고화질 캡처를 위해 배율 3배 적용
        useCORS: true,             // 크로스 도메인 이슈 방지
        backgroundColor: null      // 투명 배경 유지
    }).then(canvas => {
        // 캡처된 캔버스를 이미지 파일 링크로 변환하여 자동 다운로드 실행
        const link = document.createElement('a');
        link.download = 'newspaper_profile.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(err => {
        console.error('캡처 오류:', err);
        alert('이미지를 저장하는 중 문제가 발생했습니다.');
    }).finally(() => {
        // 다운로드 완료 후 버튼 상태 복구
        downloadBtn.innerText = originalText;
        downloadBtn.disabled = false;
    });
});
