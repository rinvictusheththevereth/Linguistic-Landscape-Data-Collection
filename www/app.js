
axios.get('/listFoldersInBucket').then((res) => {
    let bucketId = document.getElementById('bucketName')
    res.data.forEach((item) => {
        console.log(item);
        item.replace(/\/$/, '');
        bucketId.innerHTML += `<option value="${item}">${item}</option>`
    })
})

document.getElementById('bucketName').addEventListener('change', (e) => {
    let folderId = document.getElementById('folderName')
    folderId.innerHTML = ''
    axios.get(`/listFilesInSpecificFolder?folderName=${e.target.value}`).then((res) => {
        res.data.forEach((item) => {
            folderId.innerHTML += `<option value="${item}">${item}</option>`
        })
    })
})