(function () {
    const PDF_JS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    const PDF_JS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    let pdfJsPromise;

    function currentLanguage() {
        return document.body.classList.contains('lang-kr') ? 'kr' : 'en';
    }

    function message(en, kr) {
        return currentLanguage() === 'kr' ? kr : en;
    }

    function loadPdfJs() {
        if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_JS_WORKER;
            return Promise.resolve(window.pdfjsLib);
        }

        if (!pdfJsPromise) {
            pdfJsPromise = new Promise(function (resolve, reject) {
                const script = document.createElement('script');
                script.src = PDF_JS_CDN;
                script.onload = function () {
                    if (!window.pdfjsLib) {
                        reject(new Error('pdf.js failed to initialize.'));
                        return;
                    }
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_JS_WORKER;
                    resolve(window.pdfjsLib);
                };
                script.onerror = function () {
                    reject(new Error('Unable to load pdf.js.'));
                };
                document.head.appendChild(script);
            });
        }

        return pdfJsPromise;
    }

    function createStatus(text, isError) {
        const status = document.createElement('p');
        status.className = isError ? 'pdf-status pdf-status-error' : 'pdf-status';
        status.textContent = text;
        return status;
    }

    async function renderPdf(root) {
        const src = root.dataset.pdfSrc;
        if (!src) return;

        root.replaceChildren(createStatus(
            message('Loading document...', '문서를 불러오는 중입니다...')
        ));

        try {
            const pdfjsLib = await loadPdfJs();
            const pdf = await pdfjsLib.getDocument(encodeURI(src)).promise;
            const fragment = document.createDocumentFragment();

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                const page = await pdf.getPage(pageNumber);
                const baseViewport = page.getViewport({ scale: 1 });
                const availableWidth = Math.max(root.clientWidth - 32, 320);
                const scale = availableWidth / baseViewport.width;
                const viewport = page.getViewport({ scale: scale });
                const outputScale = window.devicePixelRatio || 1;

                const pageCard = document.createElement('section');
                pageCard.className = 'pdf-page';

                const label = document.createElement('div');
                label.className = 'pdf-page-label';
                label.textContent = message(
                    'Page ' + pageNumber + ' of ' + pdf.numPages,
                    '페이지 ' + pageNumber + ' / ' + pdf.numPages
                );

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                canvas.width = Math.floor(viewport.width * outputScale);
                canvas.height = Math.floor(viewport.height * outputScale);
                canvas.style.width = viewport.width + 'px';
                canvas.style.height = viewport.height + 'px';

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                    transform: outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0]
                }).promise;

                pageCard.appendChild(label);
                pageCard.appendChild(canvas);
                fragment.appendChild(pageCard);
            }

            root.replaceChildren(fragment);
        } catch (error) {
            root.replaceChildren(createStatus(
                message(
                    'Inline preview is unavailable in this browser. Use the buttons above to open the PDF directly.',
                    '이 브라우저에서는 인라인 미리보기를 표시할 수 없습니다. 위 버튼으로 PDF를 직접 열어 주세요.'
                ),
                true
            ));
            console.error('PDF rendering failed:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.pdf-viewer-root[data-pdf-src]').forEach(function (root) {
            renderPdf(root);
        });
    });
})();
