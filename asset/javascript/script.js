document.addEventListener("DOMContentLoaded", () => {
    //al caricamento della pagina, capiamo se ci troviamo nella home o in un'altra pagina
    if (document.getElementById("prodotto")) {
        paginationHTML();
    } else {
        listaHTML();
    }
});

const url = "https://striveschool-api.herokuapp.com/api/product/";
const authorization = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjY3MzI2NDdmNmI0YjAwMTU0MjhmYmEiLCJpYXQiOjE3MTgxMjYzNTAsImV4cCI6MTcxOTMzNTk1MH0.vMgE26mjIvWPngsd-CwWLIZEOmKRt9qYk5hNxB9Q2XI";

//funzione per leggere da API
async function read() {
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: authorization,
            }
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("Errore nel recupero dei prodotti");
        }
    } catch (error) {
        console.error("Errore:", error);
        return [];
    }
}
//funzione per creare i prodotti
async function create() {
    //prende i dati dal form
    const productData = getProductFormData();
    if (!productData) return;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: authorization,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            updateResultContainer(`Il prodotto ${productData.name} è stato aggiunto con successo`);
            // Svuota il form dopo aver aggiunto il prodotto e aggiorna la lista
            clearForm();
            listaHTML();
        } else {
            throw new Error("Errore nella creazione del prodotto");
        }
    } catch (error) {
        console.error("Errore:", error);
    }
}
//funzione per aggiornare i prodotti
async function updateProduct(id) {
    //prende i dati dal form
    const productData = getProductFormData();
    if (!productData) return;

    try {
        const response = await fetch(`${url}${id}`, {
            method: "PUT",
            headers: {
                Authorization: authorization,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            updateResultContainer(`Il prodotto ${productData.name} è stato aggiornato con successo`);
            // Svuota il form dopo aver aggiunto il prodotto e aggiorna la lista
            clearForm();
            listaHTML();
        } else {
            throw new Error("Errore nell'aggiornamento del prodotto");
        }
    } catch (error) {
        console.error("Errore:", error);
    }
}

// Funzione per gestire l'eliminazione del prodotto con conferma
async function deleteProduct(id) {
    //utilizzo il modal di bootstrap per poter fare apparire il messaggio
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'), {
        keyboard: false
    });

    deleteModal.show();

    //rimaniamo in attesa che venga premuto il tasto conferma
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    confirmDeleteBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(`${url}${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: authorization,
                }
            });

            if (response.ok) {
                updateResultContainer("Prodotto eliminato con successo");
                listaHTML();
            } else {
                throw new Error("Errore nell'eliminazione del prodotto");
            }
        } catch (error) {
            console.error("Errore:", error);
        } finally {
            deleteModal.hide();
        }
    });
}

//funzione per svuotare i form
function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("description").value = "";
    document.getElementById("brand").value = "";
    document.getElementById("imageUrl").value = "";
    document.getElementById("price").value = "";
}

//prende i dati dal form e fa un controllo dei campi
function getProductFormData() {
    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const imageUrl = document.getElementById("imageUrl").value.trim();
    const price = parseFloat(document.getElementById("price").value.trim());

    if (!name || typeof name !== 'string') {
        alert("Nome deve essere una stringa non vuota.");
        return null;
    }
    if (!description || typeof description !== 'string') {
        alert("Descrizione deve essere una stringa non vuota.");
        return null;
    }
    if (!brand || typeof brand !== 'string') {
        alert("Brand deve essere una stringa non vuota.");
        return null;
    }
    if (!imageUrl || typeof imageUrl !== 'string') {
        alert("Image URL deve essere una stringa non vuota.");
        return null;
    }
    if (isNaN(price) || price <= 0) {
        alert("Prezzo deve essere un numero positivo.");
        return null;
    }

    return { name, description, brand, imageUrl, price };
}

//riempie la pagina prodotto, con il prodotto selezionato
async function paginationHTML() {
    const data = await read();
    const container = document.getElementById("prodotto");
    container.innerHTML = "";
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    data.forEach(element => {
        if (productId === element._id) {
            container.innerHTML += `
                <div class="row">
                    <div class="col-md-6">
                        <img src="${element.imageUrl}" class="img-fluid product-imagePage" alt="Product Image">
                    </div>
                    <div class="col-md-6 text-white">
                        <h1 class="display-4">${element.name}</h1>
                        <p class="display-7 text-white">Brand: ${element.brand}</p>
                        <p class="lead">Descrizione: ${element.description}</p>
                        <h2 class="text-primary">${element.price} €</h2>
                        <button class="btn btn-success btn-lg">Compra</button>
                    </div>
                </div>`;
        }
    });
}

//crea la lista con le card di tutti i prodotti, guarda se siamo nella pagina home oppure se siamo nel backoffice(nel caso aggiunge i pulsanti per modificare e eliminare)
async function listaHTML() {
    const data = await read();
    if (document.getElementById("prodotti")) {
        const container = document.getElementById("prodotti");
        container.innerHTML = "";

        data.forEach(element => {
            container.innerHTML += `
                <div class="card col-5 bg-dark text-white" style="width: 18rem;">
                    <img src="${element.imageUrl}" class="card-img-top product-image" alt="${element.name}">
                    <div class="card-body">
                        <h5 class="card-title">${element.name}</h5>
                        <p class="card-text">${element.description}</p>
                        <p class="card-text">Marca: ${element.brand}</p>
                        <a href="product.html?id=${element._id}" class="btn btn-primary">${element.price} €</a>
                    </div>
                </div>`;
        });
    } else {
        const container = document.getElementById("dati");
        container.innerHTML = "";

        data.forEach(element => {
            container.innerHTML += `
            <div class="card col-5 bg-dark text-white" style="width: 18rem;">
                    <img src="${element.imageUrl}" class="card-img-top product-image" alt="${element.name}">
                    <div class="card-body">
                        <h5 class="card-title">Nome: ${element.name}</h5>
                        <p class="card-text">Descrizione: ${element.description}</p>
                        <p class="card-text">Brand: ${element.brand}</p>
                        <p class="card-text">Prezzo: ${element.price} €</p>
                        <p class="card-text">ID: ${element._ID}</p>
                        <p class="card-text">UserId: ${element.userId}</p>
                        <p class="card-text">Data Creazione: ${element.createdAt}</p>
                        <p class="card-text">Data aggiornamento: ${element.updateAt} </p>
                        <p class="card-text">__V: ${element.__V} </p>
                        <button class="btn btn-warning mt-2" onclick="populateUpdateForm('${element._id}')">Modifica</button>
                        <button class="btn btn-danger mt-2" onclick="deleteProduct('${element._id}')">Elimina</button>
                    </div>
            </div>`;
        });
    }
}

//popola il form con i dati del prodotto da modificare
function populateUpdateForm(id) {
    //quando si clicca sul pulsante modifica, scrolla verso il form
    document.getElementById("form-prodotti").scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

    read().then(products => {
        const product = products.find(product => product._id === id);
        if (product) {
            document.getElementById("name").value = product.name;
            document.getElementById("description").value = product.description;
            document.getElementById("brand").value = product.brand;
            document.getElementById("imageUrl").value = product.imageUrl;
            document.getElementById("price").value = product.price;
            const submitButton = document.querySelector('.btn-primary');
            submitButton.value = "Update";
            submitButton.onclick = () => updateProduct(id);
        }
    }).catch(error => console.error("Errore:", error));
}

//aggiorna il container dei messaggi
function updateResultContainer(message) {
    const container = document.getElementById("risultato");
    container.innerHTML = `<h4>${message}</h4>`;
}
