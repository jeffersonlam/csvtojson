{
  const canUploadFile = window.File &&
                        window.FileReader &&
                        window.FileList &&
                        window.Blob;
  const csvInput = document.querySelector('[data-key=csvinput]');
  const fileInput = document.querySelector('[data-key=fileinput]');
  const jsonOutput = document.querySelector('.output');
  const copyBtn = document.querySelector('.copy');
  const dropZone = document.querySelector('.dropzone');
  const container = document.querySelector('.container');
  let fileStatus = document.querySelector('.file-status-text');
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

  container.dragEnteredEls = [];
  container.addEventListener('dragenter', function(e) {
    this.dragEnteredEls.push(e.target);
    dropZone.classList.add('active');
  });
  container.addEventListener('dragleave', function(e) {
    this.dragEnteredEls = this.dragEnteredEls.filter(el => {
      return el != e.target
    });
    if (this.dragEnteredEls.length === 0) {
      dropZone.classList.remove('active');
    }
  });
  container.addEventListener('drop', function(e) {
    dropZone.classList.remove('active');
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    parseFile(file);
  });

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
    if (this.value.length > 0) copyBtn.disabled = false;
    else copyBtn.disabled = true;
  }

  function handleFileInput() {
    const file = this.files[0];
    this.value = "";
    parseFile(file);
  }

  function parseFile(file) {
    if (file) {
      if (file.name.slice(-3) != 'csv') {
        fileStatus.textContent = "Please select a csv file";
        return;
      }
      fileStatus.textContent = file.name;
      const fileReader = new FileReader();

      fileReader.onload = e => {
        csvInput.value = e.target.result;
        csvInput.dispatchEvent(new Event('onchange'));
        jsonOutput.dispatchEvent(new Event('onchange'));
      };

      fileReader.onerror = e => {
        console.error('Failed to read file', e);
        fileStatus = updateStatus(fileStatus, "Failed to read file");
      };

      fileReader.readAsText(file);
    } else {
      console.error('Failed to read file');
      fileStatus = updateStatus(fileStatus, "Failed to read file");
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
    const regex = new RegExp(/,(?! )/);
    const dataRows = rows.map(row => row.split(regex));
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
        } else if (cell[0] == "\"" && cell[cell.length-1] == "\"") {
          const sub = cell.substr(1, cell.length - 2);
          obj[keys[i]] = sub;
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
