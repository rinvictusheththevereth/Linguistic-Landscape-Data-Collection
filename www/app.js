
axios.get('/listFoldersInBucket').then((res) => {
    let bucketId = document.getElementById('bucketName')
    res.data.forEach((i) => {
        let item = i.replace('/', '')
        bucketId.innerHTML += `<option value="${item}">${item}</option>`
    })
})

document.getElementById('bucketName').addEventListener('change', (e) => {
    let folderName = document.getElementById('bucketName').value;
    axios.get(`/numberOfFilesInSpecificFolder/${folderName}`).then((res) => {
        console.log(res.data.data);
        document.getElementById('imageLength').innerHTML = res.data.data + ' images'
    })
})

// hide the spinner div
$('#spinner').hide();
$('#result').hide();

document.getElementById('btnOk').addEventListener('click', (e) => {
    $('#spinner').show();
    let folderName = document.getElementById('bucketName').value;
    axios.get(`/detectText/${folderName}`).then((res) => {
        $('#spinner').hide();
        $('#result').show();
        console.log(res.data);
        if (res.data) {
            res.data.data.forEach((i, k) => {
                let ru = i.ru_count
                let uk = i.uk_count
                let other = i.other_count
                let panoramaid = i.panoramaid
                let folder = i.foldername
                document.getElementById('resulttb').innerHTML += `<tr><th scope="row">${k}</th><td>${folder}</td><td>${panoramaid}</td><td>${ru}</td><td>${uk}</td><td>${other}</td></tr>`
            })
        }
    })
})