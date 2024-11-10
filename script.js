document.addEventListener("DOMContentLoaded", () => {
    let rowCount = 0;
    let pageCount = 0;
    let pageRendered = [];
    let pagesContent = [];
    let selectedTemplate = null;
    let pageWidth, pageHeight;

    window.selectTemplate = (templateId) => {
        // Remove 'selected' class from any previously selected template
        document.querySelectorAll('.template-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Add 'selected' class to the selected template
        const selectedElement = document.getElementById(templateId);
        selectedElement.classList.add('selected');

        // Set the global variable to the selected template ID
        selectedTemplate = templateId;
        console.log("Selected template:", selectedTemplate);
    };

    function generateHeader(doc) {
        let headersRendered = 0;
        return new Promise((resolve) => {
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const logo = document.getElementById('brandLogo').files[0];
            const brandName = document.getElementById('brandName').value;
            for(let i=0; i<pagesContent.length; i++) {
                if(pagesContent[i]) {
                    doc.setPage(i + 1);
                    if(logo) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            doc.setPage(i + 1);
                            doc.addImage(e.target.result, "JPEG", 5, 5, 30, 30);
                            headersRendered++;
                        };
                        reader.readAsDataURL(logo);
                    } else {
                        headersRendered++;
                    }
                    if(brandName) {
                        doc.setFillColor(255, 255, 255);
                        doc.setFontSize(16);
                        doc.roundedRect((pageWidth / 2) - ((doc.getTextWidth(brandName) + 10) / 2), 10, doc.getTextWidth(brandName) + 10, 12, 3, 3, 'DF');
                        doc.text(brandName, (pageWidth / 2) - ((doc.getTextWidth(brandName) + 10) / 2) + 5, 17.5);
                    }
                    // add page number
                    doc.setFillColor(255, 255, 255);
                    doc.setFontSize(16);
                    doc.roundedRect(pageWidth - 15, 10, 10, 12, 3, 3, 'DF');
                    doc.text(i + 1 + '', pageWidth - 11.5, 17.5);
                }
            }
            const resolveHeaderInterval = setInterval(() => {
                if(headersRendered === pagesContent.length) {
                    clearInterval(resolveHeaderInterval);
                    resolve();
                }
            });
        })
    }

    function generateFooter(doc) {
        const facebook = document.getElementById('social-facebook').value;
        const youtube = document.getElementById('social-youtube').value;
        let socialText = '';
        if (facebook) socialText += `Facebook: ${facebook} `;
        if (youtube) socialText += `Youtube: ${youtube}`;
        for(let i=0; i<pagesContent.length; i++) {
            if(pagesContent[i]) {
                doc.setPage(i + 1);
                if(socialText) {
                    doc.setFillColor(255, 255, 255);
                    doc.setFontSize(10);

                    doc.roundedRect(5, pageHeight - 15, pageWidth - 10, 10, 3, 25, 'DF');
                    doc.text(socialText, 10, pageHeight - 9);
                }
            }
        }
    }

    function addBackgroundImages(doc) {
        let bgImagesRendered = 0;
        return new Promise((resolve) => {
            for(let i=0; i<pagesContent.length; i++) {
                doc.setPage(i + 1);
                if(pagesContent[i] && pagesContent[i].bgImage) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        doc.setPage(i + 1);
                        doc.addImage(e.target.result, "JPEG", 0, 0, pageWidth, pageHeight);
                        bgImagesRendered++
                    };
                    reader.readAsDataURL(pagesContent[i].bgImage);
                } else {
                    bgImagesRendered++;
                }
            }
            const resolveBackgroundImagesInterval = setInterval(() => {
                if(bgImagesRendered === pagesContent.length) {
                    clearInterval(resolveBackgroundImagesInterval);
                    resolve();
                }
            });
        });
    }

    function addText(doc) {
        for(let i=0; i<pagesContent.length; i++) {
            doc.setPage(i + 1);
            if(pagesContent[i] && pagesContent[i].text) {
                doc.setFillColor(255, 255, 255, 0.5 );
                doc.roundedRect(5, 45, pageWidth - 10, pageHeight - 90, 3, 5, 'DF');
                doc.text(pagesContent[i].text, 10, 55, { maxWidth: pageWidth - 30 });
            }
        }
    }

    // Rest of the code remains the same
    window.generatePDF = async () => {
        const doc = new jspdf.jsPDF('p', 'mm', 'a4');
        pageWidth = doc.internal.pageSize.getWidth();
        pageHeight = doc.internal.pageSize.getHeight();
        getContent(doc);
        addBackgroundImages(doc).then(() => {
            generateFooter(doc);
            generateHeader(doc).then(() => {
                addText(doc);
                doc.save('output.pdf');
            }).catch((e) => {
                console.log('error generating footer', e);
            });
        }).catch((e) => {
            console.log('error generating header', e);
        })

        // for(let i=0; i<pagesContent.length; i++) {
        //     // if(pageRendered[i].loaded) {
        //     doc.setPage(i + 1);

        //     if(pagesContent[i] && pagesContent[i].bgImage) {
        //         const reader = new FileReader();
        //         reader.onload = function (e) {
        //             doc.setPage(i + 1);
        //             doc.addImage(e.target.result, "JPEG", 0, 0, pageWidth, pageHeight);
        //             if(pagesContent[i] && pagesContent[i].text) {
        //                 doc.setFillColor(255, 255, 255);
        //                 doc.roundedRect(5, 45, pageWidth - 10, pageHeight - 90, 5, 5, 'DF');
        //                 doc.text(pagesContent[i].text, 10, 55, { maxWidth: pageWidth - 30 });
        //             }
        //             drawBrandLogo(doc);
        //         };
        //         reader.readAsDataURL(pagesContent[i].bgImage);
        //     } else if(pagesContent[i] && pagesContent[i].text) {
        //         doc.setFillColor(255, 255, 255);
        //         doc.roundedRect(5, 45, 190, 20, 5, 5, 'DF');
        //         doc.text(pagesContent[i].text, 15, 150);
        //     }
        //     socialLinks(i);
        // }
    };

    const getContent = (doc) => {
        const coverImage = document.getElementById("coverImage").files[0];
        if (coverImage) {
            doc.addPage();
            pagesContent.push({
                text: null,
                bgImage: coverImage
            });
        }
        document.querySelectorAll(".row").forEach((row, index) => {
            doc.addPage();
            const text = row.querySelector("textarea").value;
            const bgImage = row.querySelector("input[type='file']").files[0];
            pagesContent[index + 1] = {};
            if (text.length > 0) {
                pagesContent[index + 1].text = text;
            }
            if (bgImage) {
                pagesContent[index + 1].bgImage = bgImage;
            }
        });
    }

    window.addNewRow = () => {
        const rowsDiv = document.getElementById("rows");
        rowCount++;
        const newRow = document.createElement("div");
        newRow.className = "row";
        newRow.innerHTML = `
            <div class="row-number">
                <p><strong>Add text and select background image for page number ${rowCount}</strong></p>
                <div class="ui input">
                    <textarea id="text_${rowCount}" placeholder="Enter your poem here..."></textarea>
                </div>
                <div>
                    <label for="bgImage_${rowCount}">Background Image:</label>
                    <input type="file" id="bgImage_${rowCount}" accept="image/*" />
                </div>
                <div>
                    <p>How many pages for this text?</p>
                    <div class="ui buttons">
                        <button class="ui button" onclick="mergeText(${rowCount})">One Page</button>
                        <div class="or" data-text="or"></div>
                        <button class="ui button" onclick="splitText(${rowCount})">Two Pages</button>
                    </div>
                </div>
            </div>
        `;
        rowsDiv.appendChild(newRow);

        gsap.from(newRow, { duration: 1, y: 50, opacity: 0, ease: "power3.out" });
    };

    window.splitText = (id) => {
        const textArea = document.getElementById(`text_${id}`);
        const text = textArea.value;
        if (text.length > 0) {
            const splitPoint = Math.floor(text.length / 2);
            textArea.value = text.substring(0, splitPoint);
            addNewRow();
            const newTextArea = document.getElementById(`text_${rowCount}`);
            newTextArea.value = text.substring(splitPoint);
            textArea.dataset.pairedWith = `text_${rowCount}`;
            newTextArea.dataset.pairedWith = `text_${id}`;
        }
    };

    window.mergeText = (id) => {
        const currentTextArea = document.getElementById(`text_${id}`);
        const pairedId = currentTextArea.dataset.pairedWith;

        if (pairedId) {
            const pairedTextArea = document.getElementById(pairedId);
            if (pairedTextArea) {
                // Merge the text
                currentTextArea.value = currentTextArea.value + pairedTextArea.value;

                // Remove the paired row
                pairedTextArea.closest('.row').remove();

                // Clear the pairing data
                delete currentTextArea.dataset.pairedWith;
            }
        }
    };

    AOS.init();
});
