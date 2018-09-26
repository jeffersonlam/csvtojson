{
  const canUploadFile = window.File &&
                        window.FileReader &&
                        window.FileList &&
                        window.Blob;
  const csvInput = document.querySelector('[data-key=csvinput]');
  const fileInput = document.querySelector('[data-key=fileinput]');
  const fileName = document.querySelector('.filename');
  const jsonOutput = document.querySelector('.output');
  const copyBtn = document.querySelector('.copy');
  let jsonStatus = document.querySelector('.status-text');
  let copyStatus = document.querySelector('.copy-status-text');
  let debounce = null;

  if (!canUploadFile) {
    fileInput.style.display = 'none';
  }

  csvInput.addEventListener('keyup', handleCsvInput);
  csvInput.addEventListener('onchange', handleCsvInput);
  jsonOutput.addEventListener('onchange', handleJsonOutput);
  jsonOutput.addEventListener('keyup', handleJsonOutput);
  fileInput.addEventListener('change', handleFileInput);
  fileInput.addEventListener('onselect', handleFileInput);
  copyBtn.addEventListener('click', handleCopy);

  csvInput.dispatchEvent(new Event('onchange'));

  function handleCsvInput() {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const json = csvToJson(this.value);
      displayJson(json);
      jsonStatus = updateStatus(jsonStatus, "➜");
      jsonOutput.dispatchEvent(new Event('onchange'));
    }, 100);
  }

  function handleJsonOutput() {
    console.log(this.value);
    if (this.value.length > 0) copyBtn.disabled = false;
    else copyBtn.disabled = true;
  }

  function handleFileInput() {
    const file = this.files[0];
    this.value = "";
    if (file) {
      if (file.name.slice(-3) != 'csv') {
        fileName.textContent = "Please select a csv file";
        return;
      }
      fileName.textContent = file.name;
      const fileReader = new FileReader();

      fileReader.onload = e => {
        csvInput.value = e.target.result;
        csvInput.dispatchEvent(new Event('onchange'));
        jsonOutput.dispatchEvent(new Event('onchange'));
      };

      fileReader.onerror = e => {
        console.error('Failed to read file', e);
        jsonStatus = updateStatus(jsonStatus, "Failed to read file");
      };

      fileReader.readAsText(file);
    } else {
      console.error('Failed to read file');
      jsonStatus = updateStatus(jsonStatus, "Failed to read file");
    }
  }

  function updateStatus(element, text) {
    const newStatus = element.cloneNode();
    element.classList.remove('pop');
    const className = element.className;
    newStatus.className = `${className} pop`;
    newStatus.textContent = text;
    element.parentNode.replaceChild(newStatus, element);
    return newStatus;
  }

  function displayJson(data) {
    jsonOutput.value = JSON.stringify(data, undefined, 2);
  }

  function csvToJson(csv) {
    const rows = csv.split(/\n/);
    const keys = rows.shift().split(',');
    const dataRows = rows.map(row => row.split(','));
    const jsonArray = [];
    dataRows.forEach(row => {
      const obj = {};
      row.forEach((cell, i) => {
        if (cell.match(/true/i) && cell.toLowerCase() === "true") {
          obj[keys[i]] = true;
        } else if (cell.match(/false/i) && cell.toLowerCase() === "false") {
          obj[keys[i]] = false;
        } else if (cell.match(/null/i) && cell.toLowerCase() === "null") {
          obj[keys[i]] = null;
        } else {
          obj[keys[i]] = cell;
        }
      });
      // check incomplete row or newline at end of csv file
      if (Object.keys(obj).length != keys.length) return;
      jsonArray.push(obj);
    });
    return jsonArray;
  }

  function handleCopy(e) {
    jsonOutput.select();
    document.execCommand('copy');
    this.focus();
    copyStatus = updateStatus(copyStatus, "Copy'd");
  }
}
