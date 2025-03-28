document.getElementById('searchButton').addEventListener('click', async function() {
    const searchValue = document.getElementById('searchInput').value.trim();

    if (!searchValue) {
        alert("아이템 이름을 입력해 주세요.");
        return;
    }

    // XML 파일 로드 및 파싱
    try {
        // KMS.XML과 GMS.XML 불러오기
        const kmsResponse = await fetch('KMS.XML');
        const gmsResponse = await fetch('GMS.XML');

        // 응답 상태 확인
        if (!kmsResponse.ok) {
            throw new Error(`KMS.XML 로드 실패: ${kmsResponse.status}`);
        }
        if (!gmsResponse.ok) {
            throw new Error(`GMS.XML 로드 실패: ${gmsResponse.status}`);
        }

        const kmsXML = await kmsResponse.text();
        const gmsXML = await gmsResponse.text();

        // XML 파싱
        const parser = new DOMParser();
        const kmsDoc = parser.parseFromString(kmsXML, "application/xml");
        const gmsDoc = parser.parseFromString(gmsXML, "application/xml");

        // KMS.XML에서 한글 명으로 ID 찾기
        const itemDetails = [];
        const dirElements = kmsDoc.querySelectorAll("dir[name]");

        dirElements.forEach(dir => {
            const stringElement = dir.querySelector("string[name='name']");
            if (stringElement && stringElement.getAttribute("value").includes(searchValue)) {
                itemDetails.push({
                    id: dir.getAttribute("name"),
                    fullName: stringElement.getAttribute("value")
                });
            }
        });

        // GMS.XML에서 해당 ID로 영문 명 찾기
        const results = [];
        itemDetails.forEach(({ id, fullName }) => {
            const gmsElement = gmsDoc.querySelector(`dir[name='${id}'] > string[name='name']`);
            if (gmsElement) {
                const englishName = gmsElement.getAttribute("value");
                results.push(`${fullName} - ${englishName}`);
            }
        });

        // 결과 출력
        const resultsContainer = document.getElementById('results');
        if (results.length > 0) {
            resultsContainer.innerHTML = results.map(result => `<p>${result}</p>`).join('');
        } else {
            resultsContainer.innerHTML = `<p>결과를 찾을 수 없습니다.</p>`;
        }
    } catch (error) {
        console.error("XML 처리 중 오류 발생:", error);
        alert("XML 파일을 처리하는 중 문제가 발생했습니다.");
    }
});
